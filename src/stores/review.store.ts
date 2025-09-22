import { create } from 'zustand';

// --- Types ---

export type FileStatus = 'FAILED' | 'APPROVED' | 'REJECTED';
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

export type BodyView = 'diff' | 'reasoning' | 'script_output' | 'copy_mode' | 'bulk_repair' | 'none';
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
        executeBulkRepairOption: (option: number) => void;
        
        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;
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
            selectedItemIndex: 0,
            bodyView: 'none' as const,
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
                        content = files[selectedItemIndex].diff;
                        label = `Diff for ${files[selectedItemIndex].path}`;
                    }
                    break;
                case 5: // All Diffs
                    content = files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
                    label = 'All Diffs';
                    break;
            }
            
            // Mock clipboard operation (TUI environment - no real clipboard)
            console.log(`[CLIPBOARD] Copied ${label}: ${content.substring(0, 100)}...`);
            
            return { copyModeLastCopied: label };
        }),
        copyUUID: () => set(state => {
            const content = `${state.hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
            console.log(`[CLIPBOARD] Copied UUID: ${content}`);
            return { copyModeLastCopied: 'UUID' };
        }),
        copyMessage: () => set(state => {
            console.log(`[CLIPBOARD] Copied Git Message: ${state.message}`);
            return { copyModeLastCopied: 'Git Message' };
        }),
        copyPrompt: () => set(state => {
            console.log(`[CLIPBOARD] Copied Prompt: ${state.prompt.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Prompt' };
        }),
        copyReasoning: () => set(state => {
            console.log(`[CLIPBOARD] Copied Reasoning: ${state.reasoning.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Reasoning' };
        }),
        copyFileDiff: () => set(state => {
            if (state.selectedItemIndex < state.files.length) {
                const file = state.files[state.selectedItemIndex];
                console.log(`[CLIPBOARD] Copied diff for: ${file.path}`);
                return { copyModeLastCopied: `Diff for ${file.path}` };
            }
            return {};
        }),
        copyAllDiffs: () => set(state => {
            const content = state.files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
            console.log(`[CLIPBOARD] Copied all diffs: ${state.files.length} files`);
            return { copyModeLastCopied: 'All Diffs' };
        }),
        
        // Repair Actions
        tryRepairFile: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file.status === 'FAILED') {
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
        executeBulkRepairOption: (option: number) => set(state => {
            switch (option) {
                case 1: {
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
                    
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files`);
                    return { bodyView: 'none' as const, copyModeLastCopied: 'Bulk repair prompt copied' };
                }
                    
                case 2: {
                    // Bulk Change Strategy & Re-apply
                    // Mock: Change all failed files to 'replace' strategy and mark as successful
                    const newFiles = state.files.map(file => 
                        file.status === 'FAILED' 
                            ? { ...file, status: 'APPROVED' as const, strategy: 'replace' as const, error: undefined, linesAdded: 3, linesRemoved: 1 }
                            : file,
                    );
                    return { files: newFiles, bodyView: 'none' as const };
                }
                    
                case 3: {
                    // Handoff to External Agent
                    // Mock: Generate handoff prompt
                    const failedFiles = state.files.filter(f => f.status === 'FAILED');
                    const handoffPrompt = `# Relaycode Handoff: Failed Patch Application

The following files failed to apply and require manual intervention:

${failedFiles.map(file => `## ${file.path}
- Error: ${file.error}
- Strategy: ${file.strategy}
`).join('\n')}

Please resolve these issues and provide updated patches.`;
                    
                    console.log(`[CLIPBOARD] Copied handoff prompt for ${failedFiles.length} files`);
                    return { bodyView: 'none' as const, copyModeLastCopied: 'Handoff prompt copied' };
                }
                    
                case 4: {
                    // Bulk Abandon All Failed Files
                    const abandonedFiles = state.files.map(file => 
                        file.status === 'FAILED' 
                            ? { ...file, status: 'REJECTED' as const }
                            : file,
                    );
                    return { files: abandonedFiles, bodyView: 'none' as const };
                }
                    
                default:
                    return { bodyView: 'none' as const };
            }
        }),
        
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