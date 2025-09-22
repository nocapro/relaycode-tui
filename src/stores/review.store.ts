import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { useDashboardStore } from './dashboard.store';
import { ReviewService } from '../services/review.service';
import { mockReviewFiles, mockReviewScripts, allMockTransactions } from '../data/mocks';
import { moveIndex } from './navigation.utils';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult, ApplyStep, ReviewBodyView, PatchStatus } from '../types/review.types'; 

export type { ReviewFileItem as FileItem, ReviewFileItem } from '../types/file.types';
export type { ScriptResult, ApplyStep } from '../types/review.types';

export const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

interface ReviewState {
    // Transaction Info
    hash: string;
    message: string;
    prompt: string;
    reasoning: string;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
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
        simulateSuccessScenario: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        simulateFailureScenario: () => void;

        // Repair Actions
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;

        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void,

        // "Private" actions for service layer
        _updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        _addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
    };
}

const initialFailureTx = allMockTransactions[0]!;

export const useReviewStore = create<ReviewState>((set, get) => ({
    // Transaction Info
    hash: initialFailureTx.hash,
    message: initialFailureTx.message,
    prompt: initialFailureTx.prompt!,
    reasoning: initialFailureTx.reasoning!,
    linesAdded: 18,
    linesRemoved: 5,
    duration: 0.6,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockReviewFiles,
    scripts: [], // Empty for partial failure scenario

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0, // Start with first file
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
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;

            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();

            await ReviewService.runApplySimulation(scenario);

            showReviewScreen();
        },
        simulateSuccessScenario: () => {
            const tx = allMockTransactions[1]!;
            set(() => ({
            hash: tx.hash,
            message: tx.message,
            prompt: tx.prompt!,
            reasoning: tx.reasoning!,
            linesAdded: 22,
            linesRemoved: 11,
            duration: 3.9,
            patchStatus: 'SUCCESS' as const,
            files: [
                {
                    id: '1',
                    path: 'src/core/clipboard.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 15,
                    linesRemoved: 8,
                    diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';`,
                    strategy: 'replace' as const,
                },
                {
                    id: '2',
                    path: 'src/utils/shell.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 7,
                    linesRemoved: 3,
                    diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts`,
                    strategy: 'standard-diff' as const,
                },
            ],
            scripts: mockReviewScripts,
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        }));
    },
        simulateFailureScenario: () => {
            const tx = allMockTransactions[0]!;
            set(() => ({
            hash: tx.hash,
            message: tx.message,
            prompt: tx.prompt!,
            reasoning: tx.reasoning!,
            linesAdded: 18,
            linesRemoved: 5,
            duration: 0.6,
            patchStatus: 'PARTIAL_FAILURE' as const,
            files: mockReviewFiles,
            scripts: [],
            // Reset UI state
            bodyView: 'none',
            isDiffExpanded: false,
            reasoningScrollIndex: 0,
            scriptErrorIndex: 0,
            selectedItemIndex: 0,
        }));
    },

        // Repair Actions
        tryRepairFile: () => {
            const { selectedItemIndex, files } = get();
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    ReviewService.tryRepairFile(file, selectedItemIndex);
                }
            }
        },
        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option: number) => {
            const { files } = get();

            switch (option) {
                case 1: { // Generate & Copy Bulk Repair Prompt
                    const bulkPrompt = ReviewService.generateBulkRepairPrompt(files);
                    const failedFiles = files.filter(f => f.status === 'FAILED');
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files.`);
                    // In a real app, this would use clipboardy.writeSync(bulkPrompt),
                    set({ bodyView: 'none' as const });
                    break;
                }

                case 2: { // Attempt Bulk Re-apply
                    set({ bodyView: 'none' as const });
                    await ReviewService.runBulkReapply();
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
            const { hash, message, reasoning, files } = get();
            const handoffPrompt = ReviewService.generateHandoffPrompt(hash, message, reasoning, files);

            // eslint-disable-next-line no-console
            console.log('[CLIPBOARD] Copied Handoff Prompt.'); // In real app: clipboardy.writeSync(handoffPrompt)
            ReviewService.performHandoff(hash);
        },

        // Navigation Actions
        scrollReasoningUp: () => set(state => ({
            reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1),
        })),
        scrollReasoningDown: () => set(state => {
            const maxLines = state.reasoning.split('\n').length;
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