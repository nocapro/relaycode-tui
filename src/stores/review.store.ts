import { create } from 'zustand';

// --- Types ---

export type FileStatus = 'MODIFIED' | 'FAILED' | 'APPROVED' | 'REJECTED';
export interface FileItem {
    id: string;
    path: string;
    status: FileStatus;
    diff: string;
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

export type BodyView = 'diff' | 'reasoning' | 'script_output' | 'none';

interface ReviewState {
    // Transaction Info
    hash: string;
    message: string;
    prompt: string;
    reasoning: string;
    
    // File & Script Info
    files: FileItem[];
    scripts: ScriptResult[];
    
    // UI State
    selectedItemIndex: number; // Can be file or script
    bodyView: BodyView;
    isDiffExpanded: boolean;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        toggleDiffView: () => void;
        toggleReasoningView: () => void;
        toggleScriptView: (index: number) => void;
        expandDiff: () => void;
    };
}

// --- Mock Data ---

const mockFiles: FileItem[] = [
    { id: '1', path: 'src/core/clipboard.ts', status: 'APPROVED', diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';
+import { getErrorMessage } from '../utils';
 
 export const copy = async (text: string) => {
   try {
-    await copyToClipboard(text);
+    await copyToClipboard(String(text));
     return { success: true };
   } catch (error) {
-    return { success: false, error: error.message };
+    return { success: false, error: getErrorMessage(error) };
   }
 };`, strategy: 'replace' },
    { id: '2', path: 'src/utils/shell.ts', status: 'APPROVED', diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts
@@ -10,3 +10,11 @@
 export const executeCommand = async (command: string): Promise<string> => {
   // ... implementation
 };
+
+export const getErrorMessage = (error: unknown): string => {
+  if (error instanceof Error) {
+    return error.message;
+  }
+  return String(error);
+};
`, strategy: 'standard-diff' },
    { id: '3', path: 'src/components/Button.tsx', status: 'FAILED', diff: '', error: 'Hunk #1 failed to apply', strategy: 'standard-diff' },
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

export const useReviewStore = create<ReviewState>((set, get) => ({
    // Transaction Info
    hash: '4b9d8f03',
    message: 'refactor: simplify clipboard logic',
    prompt: 'Simplify the clipboard logic using an external library...',
    reasoning: mockReasoning,

    // File & Script Info
    files: mockFiles,
    scripts: mockScripts,

    // UI State
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none',
    isDiffExpanded: false,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: Math.max(0, state.selectedItemIndex - 1)
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: Math.min(state.files.length + state.scripts.length - 1, state.selectedItemIndex + 1)
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
        toggleDiffView: () => set(state => {
            const { bodyView } = state;
            if (state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: bodyView === 'diff' ? 'none' : 'diff',
                isDiffExpanded: false // Always start collapsed
            };
        }),
        toggleReasoningView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'reasoning' ? 'none' : 'reasoning'
            };
        }),
        toggleScriptView: (index: number) => set(state => {
            const { bodyView, selectedItemIndex } = state;
            if (bodyView === 'script_output' && selectedItemIndex === index) {
                return { bodyView: 'none' };
            }
            return { bodyView: 'script_output' };
        }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
    }
}));