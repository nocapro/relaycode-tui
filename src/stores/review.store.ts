import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { useDashboardStore } from './dashboard.store';

// --- Types ---

export type FileStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';
export interface FileItem {
    id: string;
    path: string;
    status: FileStatus;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}

export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}

const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

export type BodyView = 'diff' | 'reasoning' | 'script_output' | 'copy_mode' | 'bulk_repair' | 'confirm_handoff' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';

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
    files: FileItem[];
    scripts: ScriptResult[];

    // UI State
    applySteps: ApplyStep[];
    selectedItemIndex: number; // Can be file or script
    bodyView: BodyView;
    isDiffExpanded: boolean;
    
    // Copy Mode State
    copyModeSelectedIndex: number;
    copyModeLastCopied: string | null;
    
    // Reasoning Scroll State
    reasoningScrollIndex: number;
    
    // Script Navigation State
    scriptErrorIndex: number;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        toggleDiffView: () => void;
        toggleReasoningView: () => void;
        toggleScriptView: () => void;
        expandDiff: () => void;
        approve: () => void;
        simulateSuccessScenario: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        simulateFailureScenario: () => void;
        
        // Copy Mode Actions
        toggleCopyMode: () => void;
        moveCopySelectionUp: () => void;
        moveCopySelectionDown: () => void;
        copySelectedItem: () => void;
        copyUUID: () => void;
        copyMessage: () => void;
        copyPrompt: () => void;
        copyReasoning: () => void;
        copyFileDiff: () => void;
        copyAllDiffs: () => void;
        
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
    };
}

// --- Mock Data ---

const mockFiles: FileItem[] = [
    { 
        id: '1', 
        path: 'src/core/transaction.ts', 
        status: 'APPROVED', 
        linesAdded: 18, 
        linesRemoved: 5, 
        diff: `--- a/src/core/transaction.ts
+++ b/src/core/transaction.ts
@@ -15,7 +15,7 @@ export class Transaction {
   }
 
-  calculateChanges(): ChangeSet {
+  computeDelta(): ChangeSet {
     return this.changes;
   }
 }`, 
        strategy: 'replace', 
    },
    { 
        id: '2', 
        path: 'src/utils/logger.ts', 
        status: 'FAILED', 
        linesAdded: 0, 
        linesRemoved: 0, 
        diff: '', 
        error: 'Hunk #1 failed to apply', 
        strategy: 'standard-diff', 
    },
    { 
        id: '3', 
        path: 'src/commands/apply.ts', 
        status: 'FAILED', 
        linesAdded: 0, 
        linesRemoved: 0, 
        diff: '', 
        error: 'Context mismatch at line 92', 
        strategy: 'standard-diff', 
    },
];

const mockScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

const mockReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

// --- Store Implementation ---

export const useReviewStore = create<ReviewState>((set) => ({
    // Transaction Info
    hash: 'e4a7c112',
    message: 'refactor: rename core utility function',
    prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
    reasoning: mockReasoning,
    linesAdded: 18,
    linesRemoved: 5,
    duration: 0.6,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockFiles,
    scripts: [], // Empty for partial failure scenario

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none',
    isDiffExpanded: false,
    
    // Copy Mode State
    copyModeSelectedIndex: 0,
    copyModeLastCopied: null,
    
    // Reasoning Scroll State
    reasoningScrollIndex: 0,
    
    // Script Navigation State
    scriptErrorIndex: 0,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: Math.max(0, state.selectedItemIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: Math.min(state.files.length + state.scripts.length - 1, state.selectedItemIndex + 1),
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
        toggleDiffView: () => set(state => {
            const { bodyView } = state;
            if (state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: bodyView === 'diff' ? 'none' : 'diff',
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        toggleReasoningView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'reasoning' ? 'none' : 'reasoning',
            };
        }),
        toggleScriptView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'script_output' ? 'none' : 'script_output',
            };
        }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            
            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();
            
            const updateStep = (id: string, status: ApplyStep['status'], duration?: number, details?: string) => {
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
            };
    
            const addSubstep = (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => {
                 set(state => ({
                    applySteps: state.applySteps.map(s => {
                        if (s.id === parentId) {
                            const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                            return { ...s, substeps: newSubsteps };
                        }
                        return s;
                    }),
                }));
            };
    
            if (scenario === 'success') {
                useReviewStore.getState().actions.simulateSuccessScenario();
                
                updateStep('snapshot', 'active'); await sleep(100);
                updateStep('snapshot', 'done', 0.1);
    
                updateStep('memory', 'active'); await sleep(100);
                addSubstep('memory', { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' });
                await sleep(100);
                addSubstep('memory', { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' });
                updateStep('memory', 'done', 0.3);
    
                updateStep('post-command', 'active'); await sleep(1300);
                addSubstep('post-command', { id: 's3', title: '`bun run test` ... Passed', status: 'done' });
                updateStep('post-command', 'done', 2.3);
    
                updateStep('linter', 'active'); await sleep(1200);
                addSubstep('linter', { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' });
                updateStep('linter', 'done', 1.2);
    
                await sleep(500);
    
            } else { // failure scenario
                useReviewStore.getState().actions.simulateFailureScenario();
                
                updateStep('snapshot', 'active'); await sleep(100);
                updateStep('snapshot', 'done', 0.1);
    
                updateStep('memory', 'active'); await sleep(100);
                addSubstep('memory', { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' });
                await sleep(100);
                addSubstep('memory', { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' });
                await sleep(100);
                addSubstep('memory', { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' });
                updateStep('memory', 'done', 0.5);
    
                await sleep(100);
                updateStep('post-command', 'skipped', undefined, 'Skipped due to patch application failure');
                await sleep(100);
                updateStep('linter', 'skipped', undefined, 'Skipped due to patch application failure');
                
                await sleep(500);
            }
    
            showReviewScreen();
        },
        simulateSuccessScenario: () => set(() => ({
            hash: '4b9d8f03',
            message: 'refactor: simplify clipboard logic',
            prompt: 'Simplify the clipboard logic using an external library...',
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
            scripts: mockScripts,
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        })),
        simulateFailureScenario: () => set(() => ({
            hash: 'e4a7c112',
            message: 'refactor: rename core utility function',
            prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
            linesAdded: 18,
            linesRemoved: 5,
            duration: 0.6,
            patchStatus: 'PARTIAL_FAILURE' as const,
            files: mockFiles,
            scripts: [],
            // Reset UI state
            bodyView: 'none',
            isDiffExpanded: false,
            reasoningScrollIndex: 0,
            scriptErrorIndex: 0,
            selectedItemIndex: 0,
        })),
        
        // Copy Mode Actions
        toggleCopyMode: () => set(state => ({
            bodyView: state.bodyView === 'copy_mode' ? 'none' : 'copy_mode',
            copyModeSelectedIndex: 0,
            copyModeLastCopied: null,
        })),
        moveCopySelectionUp: () => set(state => ({
            copyModeSelectedIndex: Math.max(0, state.copyModeSelectedIndex - 1),
        })),
        moveCopySelectionDown: () => set(state => ({
            copyModeSelectedIndex: Math.min(5, state.copyModeSelectedIndex + 1), // 6 total options (U,M,P,R,F,A)
        })),
        copySelectedItem: () => set(state => {
            const { copyModeSelectedIndex, hash, message, prompt, reasoning, files, selectedItemIndex } = state;
            let content = '';
            let label = '';
            
            switch (copyModeSelectedIndex) {
                case 0: // UUID
                    content = `${hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
                    label = 'UUID';
                    break;
                case 1: // Git Message
                    content = message;
                    label = 'Git Message';
                    break;
                case 2: // Prompt
                    content = prompt;
                    label = 'Prompt';
                    break;
                case 3: // Reasoning
                    content = reasoning;
                    label = 'Reasoning';
                    break;
                case 4: // Diff for current file
                    if (selectedItemIndex < files.length) {
                        const file = files[selectedItemIndex];
                        if (file) {
                            content = file.diff;
                            label = `Diff for ${file.path}`;
                        }
                    }
                    break;
                case 5: // All Diffs
                    content = files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
                    label = 'All Diffs';
                    break;
            }
            
            // Mock clipboard operation (TUI environment - no real clipboard)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied ${label}: ${content.substring(0, 100)}...`);
            
            return { copyModeLastCopied: label };
        }),
        copyUUID: () => set(state => {
            const content = `${state.hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied UUID: ${content}`);
            return { copyModeLastCopied: 'UUID' };
        }),
        copyMessage: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Git Message: ${state.message}`);
            return { copyModeLastCopied: 'Git Message' };
        }),
        copyPrompt: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Prompt: ${state.prompt.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Prompt' };
        }),
        copyReasoning: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Reasoning: ${state.reasoning.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Reasoning' };
        }),
        copyFileDiff: () => set(state => {
            if (state.selectedItemIndex < state.files.length) {
                const file = state.files[state.selectedItemIndex];
                if (file) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied diff for: ${file.path}`);
                    return { copyModeLastCopied: `Diff for ${file.path}` };
                }
            }
            return {};
        }),
        copyAllDiffs: () => set(state => {
            const content = state.files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied all diffs: ${state.files.length} files`);
            return { copyModeLastCopied: 'All Diffs' };
        }),
        
        // Repair Actions
        tryRepairFile: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    // Generate repair prompt and copy to clipboard
                    const repairPrompt = `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${file.error}
Strategy: ${file.strategy}

ORIGINAL CONTENT:
---
// ... original file content would be here ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff would be here ...'}
---

Please provide a corrected patch that addresses the error.`;

                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

                    // Mock: Update file status to show it's being repaired
                    const newFiles = [...files];
                    newFiles[selectedItemIndex] = { ...file, status: 'APPROVED' as const, error: undefined, linesAdded: 5, linesRemoved: 2 };

                    return { files: newFiles, copyModeLastCopied: 'Repair prompt copied to clipboard' };
                }
            }
            return {};
        }),
        showBulkRepair: () => set(() => ({
            bodyView: 'bulk_repair' as const,
        })),
        executeBulkRepairOption: async (option: number) => {
            switch (option) {
                case 1: {
                    set(state => {
                        // Copy Bulk Re-apply Prompt
                        const failedFiles = state.files.filter(f => f.status === 'FAILED');
                        const bulkPrompt = `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: ${file.error}

ORIGINAL CONTENT:
---
// ... original content of ${file.path} ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff ...'}
---
`).join('\n')}

Please analyze all failed files and provide a complete, corrected response.`;

                        // eslint-disable-next-line no-console
                        console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files`);

                        const newFiles = state.files.map(file =>
                            file.status === 'FAILED'
                                ? { ...file, status: 'AWAITING' as const }
                                : file,
                        );

                        return { files: newFiles, bodyView: 'none' as const, copyModeLastCopied: 'Bulk repair prompt copied' };
                    });
                    break;
                }
                    
                case 2: {
                    const failedFileIds = new Set(useReviewStore.getState().files.filter(f => f.status === 'FAILED').map(f => f.id));

                    set(state => ({
                        files: state.files.map(file =>
                            failedFileIds.has(file.id)
                                ? { ...file, status: 'RE_APPLYING' as const }
                                : file,
                        ),
                        bodyView: 'none' as const,
                    }));

                    await sleep(1500); // Simulate re-apply

                    // Mock a mixed result
                    let first = true;
                    set(state => ({
                        files: state.files.map(file => {
                            if (failedFileIds.has(file.id)) {
                                if (first) {
                                    first = false;
                                    return { ...file, status: 'APPROVED' as const, strategy: 'replace' as const, error: undefined, linesAdded: 9, linesRemoved: 2 };
                                }
                                return { ...file, status: 'FAILED' as const, error: "'replace' failed: markers not found" };
                            }
                            return file;
                        }),
                    }));
                    break;
                }
                    
                case 3: {
                    set({ bodyView: 'confirm_handoff' as const });
                    break;
                }
                    
                case 4: {
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
                    
                default:
                    set({ bodyView: 'none' as const });
            }
        },
        confirmHandoff: () => {
            const { hash, message, reasoning, files } = useReviewStore.getState();
            const { updateTransactionStatus } = useDashboardStore.getState().actions;
            const { showDashboardScreen } = useAppStore.getState().actions;

            const successfulFiles = files.filter(f => f.status === 'APPROVED');
            const failedFiles = files.filter(f => f.status === 'FAILED');

            const handoffPrompt = `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${message}
Reasoning:
${reasoning}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${f.error})`).join('\n')}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.`;

            // eslint-disable-next-line no-console
            console.log('[CLIPBOARD] Copied Handoff Prompt.');

            // This is a bit of a hack to find the right transaction to update in the demo
            const txToUpdate = useDashboardStore.getState().transactions.find(tx => tx.hash === hash);
            if (txToUpdate) {
                updateTransactionStatus(txToUpdate.id, 'HANDOFF');
            }

            showDashboardScreen();
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
    },
}));