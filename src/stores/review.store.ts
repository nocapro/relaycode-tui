import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { ReviewService } from '../services/review.service';
import { useTransactionStore, type Transaction } from './transaction.store';
import { moveIndex } from './navigation.utils';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult, ApplyStep, ReviewBodyView, PatchStatus, ApplyUpdate } from '../types/review.types';

export type { ReviewFileItem } from '../types/file.types';
export type { ScriptResult, ApplyStep } from '../types/review.types';

export const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

interface ReviewState {
    // Transaction Info
    transactionId: string | null;
    patchStatus: PatchStatus;

    // File & Script Info
    files: ReviewFileItem[];
    scripts: ScriptResult[];

    // UI State
    applySteps: ApplyStep[];
    selectedItemIndex: number; // Can be file or script
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;

    // Reasoning Scroll State
    reasoningScrollIndex: number;

    // Script Navigation State
    scriptErrorIndex: number;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        expandDiff: () => void;
        toggleBodyView: (view: Extract<ReviewBodyView, 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'>) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;

        // Repair Actions
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;

        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;

        // "Private" actions for service layer
        load: (transactionId: string, initialState?: { bodyView: ReviewBodyView }) => void;
        _updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        _addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
    };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    // Transaction Info
    transactionId: null,
    patchStatus: 'SUCCESS', // This will be set on load

    // File & Script Info
    files: [],
    scripts: [],

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0,
    bodyView: 'none' as const,
    isDiffExpanded: false,

    // Reasoning Scroll State
    reasoningScrollIndex: 0,

    // Script Navigation State
    scriptErrorIndex: 0,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', state.files.length + state.scripts.length),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', state.files.length + state.scripts.length),
        })),
        toggleFileApproval: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex >= files.length) return {}; // Not a file

            const newFiles = [...files];
            const file = newFiles[selectedItemIndex];
            if (file) {
                if (file.status === 'APPROVED') {
                    file.status = 'REJECTED';
                } else if (file.status === 'REJECTED') {
                    file.status = 'APPROVED';
                }
            }
            return { files: newFiles };
        }),
        rejectAllFiles: () => set(state => {
            const newFiles = state.files.map(file => {
                if (file.status === 'APPROVED') {
                    return { ...file, status: 'REJECTED' as const };
                }
                return file;
            });
            return { files: newFiles };
        }),
        toggleBodyView: (view) => set(state => {
            if (view === 'diff' && state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: state.bodyView === view ? 'none' : view,
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        setBodyView: (view) => set({ bodyView: view }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => {
            const { transactionId } = get();
            if (transactionId) {
                // Update transaction status to COMMITTED
                useTransactionStore.getState().actions.updateTransactionStatus(transactionId, 'COMMITTED');
                // Navigate back to dashboard
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            const { _updateApplyStep, _addApplySubstep } = get().actions;

            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();

            const simulationGenerator = ReviewService.runApplySimulation(scenario);
            for await (const update of simulationGenerator) {
                switch (update.type) {
                    case 'UPDATE_STEP':
                        _updateApplyStep(update.payload.id, update.payload.status, update.payload.duration, update.payload.details);
                        break;
                    case 'ADD_SUBSTEP':
                        _addApplySubstep(update.payload.parentId, update.payload.substep);
                        break;
                }
            }

            showReviewScreen();
        },

        // Repair Actions
        tryRepairFile: () => {
            set(state => {
                const { selectedItemIndex, files } = state;
                if (selectedItemIndex >= files.length) return {};

                const file = files[selectedItemIndex];
                if (file?.status === 'FAILED') {
                    const updatedFile = ReviewService.tryRepairFile(file);
                    const newFiles = [...files];
                    newFiles[selectedItemIndex] = updatedFile;
                    return { files: newFiles };
                }
                return {};
            });
        },
        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option: number) => {
            const { files } = get();

            switch (option) {
                case 1: { // Generate & Copy Bulk Repair Prompt
                    const bulkPrompt = ReviewService.generateBulkRepairPrompt(files);
                    const failedFiles = files.filter(f => f.status === 'FAILED');
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} file(s).`); // eslint-disable-line no-console
                    // In a real app, this would use clipboardy.writeSync(bulkPrompt),
                    set({ bodyView: 'none' as const });
                    break;
                }

                case 2: { // Attempt Bulk Re-apply
                    set({ bodyView: 'none' as const });

                    const failedFileIds = new Set(files.filter(f => f.status === 'FAILED').map(f => f.id));
                    if (failedFileIds.size === 0) {
                        break;
                    }

                    // Set intermediate state
                    set(state => ({
                        files: state.files.map(file =>
                            failedFileIds.has(file.id)
                                ? { ...file, status: 'RE_APPLYING' as const }
                                : file
                        ),
                    }));

                    const finalFiles = await ReviewService.runBulkReapply(get().files);
                    set({ files: finalFiles });
                    break;
                }

                case 3: { // Handoff to Human
                    get().actions.setBodyView('confirm_handoff');
                    break;
                }

                case 4: { // Reject All Failed
                    set(state => ({
                        files: state.files.map(file =>
                            file.status === 'FAILED'
                                ? { ...file, status: 'REJECTED' as const }
                                : file,
                        ),
                        bodyView: 'none' as const,
                    }));
                    break;
                }

                default: // Close modal
                    set({ bodyView: 'none' as const });
            }
        },
        confirmHandoff: () => {
            const { transactionId, files } = get();
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;

            const handoffPrompt = ReviewService.generateHandoffPrompt(transaction.hash, transaction.message, transaction.reasoning || '', files);

            // eslint-disable-next-line no-console
            console.log('[CLIPBOARD] Copied Handoff Prompt.'); // In real app: clipboardy.writeSync(handoffPrompt)
            ReviewService.performHandoff(transaction.hash);
        },

        // Navigation Actions
        scrollReasoningUp: () => set(state => ({
            reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1),
        })),
        scrollReasoningDown: () => set(state => {
            const { transactionId } = state;
            if (!transactionId) return {};

            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction?.reasoning) return {};

            const maxLines = transaction.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({
            scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1),
        })),
        navigateScriptErrorDown: () => set(state => {
            const selectedScript = state.scripts[state.selectedItemIndex - state.files.length];
            if (selectedScript && selectedScript.output) {
                const errorLines = selectedScript.output.split('\n').filter(line =>
                    line.includes('Error') || line.includes('Warning'),
                );
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),

        // "Private" actions for service layer
        load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;

            // This simulates the backend determining which files failed or succeeded.
            // For this demo, tx '1' is the failure case, any other is success.
            const isFailureCase = transaction.id === '1';
            const patchStatus = isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS';

            const reviewFiles: ReviewFileItem[] = (transaction.files || []).map((file, index) => {
                if (isFailureCase) {
                    return {
                        ...file,
                        status: index === 0 ? 'APPROVED' : 'FAILED',
                        error: index > 0 ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined,
                        strategy: file.strategy || 'standard-diff',
                    };
                }
                return { ...file, status: 'APPROVED', strategy: file.strategy || 'standard-diff' };
            });

            set({
                transactionId: transaction.id,
                patchStatus,
                files: reviewFiles,
                scripts: transaction.scripts || [],
                selectedItemIndex: 0,
                bodyView: initialState?.bodyView ?? 'none',
                isDiffExpanded: false,
                reasoningScrollIndex: 0,
                scriptErrorIndex: 0,
                applySteps: JSON.parse(JSON.stringify(initialApplySteps)), // Reset apply steps
            });
        },
        _updateApplyStep: (id, status, duration, details) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep = { ...s, status };
                        if (duration !== undefined) newStep.duration = duration;
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                }),
            }));
        },
        _addApplySubstep: (parentId, substep) => {
             set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
    },
}));