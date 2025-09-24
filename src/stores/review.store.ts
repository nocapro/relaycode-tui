import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { ReviewService } from '../services/review.service';
import { useTransactionStore } from './transaction.store';
import { moveIndex } from './navigation.utils';
import type { FileItem, ScriptResult, FileReviewStatus } from '../types/domain.types';
import type { ApplyStep, ReviewBodyView, PatchStatus, ApplyUpdate } from '../types/view.types';

export type { ScriptResult, ApplyStep };

export const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

type FileReviewState = { status: FileReviewStatus; error?: string };

interface ReviewState {
    // Transaction Info
    transactionId: string | null;
    patchStatus: PatchStatus;
    fileReviewStates: Record<string, FileReviewState>; // Keyed by FileItem ID

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
    fileReviewStates: {},
    
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
        moveSelectionUp: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', listSize) };
        }),
        moveSelectionDown: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', listSize) };
        }),
        toggleFileApproval: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            const file = tx?.files?.[state.selectedItemIndex];
            if (!file) return {};

            const currentState = state.fileReviewStates[file.id];
            if (!currentState) return {};

            const newStatus = currentState.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';

            return {
                fileReviewStates: {
                    ...state.fileReviewStates,
                    [file.id]: { ...currentState, status: newStatus },
                },
            };
        }),
        rejectAllFiles: () => set(state => {
            const newFileReviewStates = { ...state.fileReviewStates };
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            tx?.files?.forEach(file => {
                const current = newFileReviewStates[file.id];
                if (current?.status === 'APPROVED') {
                    newFileReviewStates[file.id] = { ...current, status: 'REJECTED' };
                }
            });
            return { fileReviewStates: newFileReviewStates };
        }),
        toggleBodyView: (view) => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.selectedItemIndex >= files.length) return {}; // Can't show diff for scripts
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
                // In a real app, you'd persist the fileReviewStates back into the transaction
                // For this simulation, we just mark the whole transaction.
                useTransactionStore.getState().actions.updateTransactionStatus(transactionId, 'APPLIED');
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

            // This would now update file statuses based on the result of the apply
            // For now, just return to the screen
            showReviewScreen();
        },

        // Repair Actions
        tryRepairFile: () => {
            set(state => {
                const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
                const file = tx?.files?.[state.selectedItemIndex];
                if (!file) return {};
                
                const currentReviewState = state.fileReviewStates[file.id];
                if (currentReviewState?.status !== 'FAILED') return {};

                // The service returns a new FileItem, but we only update the review state
                // to avoid re-introducing a copy of the data. The UI for stats won't update.
                const repairedFile = ReviewService.tryRepairFile(file);

                return {
                    fileReviewStates: {
                        ...state.fileReviewStates,
                        [file.id]: { status: repairedFile.reviewStatus || 'AWAITING', error: undefined },
                    },
                };
            });
        },
        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option: number) => {
            const { transactionId } = get();
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.files) return;

            switch (option) {
                case 1: { // Generate & Copy Bulk Repair Prompt
                    const bulkPrompt = ReviewService.generateBulkRepairPrompt(tx.files);
                    const failedFiles = tx.files.filter(f => f.reviewStatus === 'FAILED');
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} file(s).`);
                    set({ bodyView: 'none' as const });
                    break;
                }

                case 2: { // Attempt Bulk Re-apply
                    set({ bodyView: 'none' as const });

                    const failedFileIds = new Set(tx.files.filter(f => f.reviewStatus === 'FAILED').map(f => f.id));
                    if (failedFileIds.size === 0) break;

                    // Set intermediate state
                    set(state => {
                        const newStates = { ...state.fileReviewStates };
                        failedFileIds.forEach(id => {
                            if (newStates[id]) newStates[id]!.status = 'RE_APPLYING';
                        });
                        return { fileReviewStates: newStates };
                    });

                    // The service takes files, but returns updated files. We need to merge this back.
                    const finalFiles = await ReviewService.runBulkReapply(tx.files);
                    set(state => {
                        const newStates = { ...state.fileReviewStates };
                        finalFiles.forEach(file => {
                            if (newStates[file.id]) {
                                newStates[file.id] = {
                                    status: file.reviewStatus || 'AWAITING',
                                    error: file.reviewError,
                                };
                            }
                        });
                        return { fileReviewStates: newStates };
                    });
                    break;
                }

                case 3: { // Handoff to Human
                    get().actions.setBodyView('confirm_handoff');
                    break;
                }

                case 4: { // Reject All Failed
                    set(state => {
                        const newStates = { ...state.fileReviewStates };
                        Object.keys(newStates).forEach(fileId => {
                            if (newStates[fileId]?.status === 'FAILED') {
                                newStates[fileId]!.status = 'REJECTED';
                            }
                        });
                        return { fileReviewStates: newStates, bodyView: 'none' as const };
                    });
                    break;
                }

                default: // Close modal
                    set({ bodyView: 'none' as const });
            }
        },
        confirmHandoff: () => {
            const { transactionId } = get();
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction?.files) return;

            const handoffPrompt = ReviewService.generateHandoffPrompt(transaction.hash, transaction.message, transaction.reasoning || '', transaction.files);

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
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.transactionId);
            if (!tx?.scripts || !tx?.files) return {};

            const selectedScript = tx.scripts[state.selectedItemIndex - tx.files.length];
            if (selectedScript?.output) {
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
            const patchStatus = isFailureCase ? 'PARTIAL_FAILURE' : ('SUCCESS' as PatchStatus);

            const newFileReviewStates: Record<string, FileReviewState> = {};
            (transaction.files || []).forEach((file, index) => {
                if (isFailureCase) {
                    const isFailedFile = index > 0;
                    newFileReviewStates[file.id] = {
                        status: isFailedFile ? 'FAILED' : 'APPROVED',
                        error: isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined,
                    };
                } else {
                    newFileReviewStates[file.id] = { status: 'APPROVED' };
                }
            });

            set({
                transactionId: transaction.id,
                patchStatus,
                fileReviewStates: newFileReviewStates,
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