import { create } from 'zustand';
import { useDashboardStore, type Transaction } from './dashboard.store';

// Types from README
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileDetail {
    id: string;
    path: string;
    type: FileChangeType;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

export type NavigatorSection = 'PROMPT' | 'REASONING' | 'FILES';
export type BodyView = 'PROMPT' | 'REASONING' | 'FILES_LIST' | 'DIFF_VIEW' | 'COPY_MODE' | 'REVERT_CONFIRM' | 'NONE';

interface TransactionDetailState {
    // Data
    transaction: Transaction | null;
    prompt: string;
    reasoning: string;
    files: FileDetail[];
    
    // UI State
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: BodyView;
    copyModeSelectionIndex: number;
    copyModeSelections: Record<string, boolean>;
    copyModeLastCopied: string | null;

    // Actions
    actions: {
        loadTransaction: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleCopyMode: () => void;
        toggleRevertConfirm: () => void;
        copyModeNavigateUp: () => void;
        copyModeNavigateDown: () => void;
        copyModeToggleSelection: () => void;
        copyModeExecuteCopy: () => void;
        confirmRevert: () => void;
    }
}

// Mock data based on README
const mockTransactionData = {
    prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
    reasoning: `1. The primary goal was to make the rollback functionality in \`restoreSnapshot\` more robust. The previous implementation used a simple for-loop which would halt on the first error, leaving the project in a partially restored state.

2. I opted for a \`Promise.all\` approach to run file restorations in parallel. This improves performance slightly but, more importantly, ensures all restoration attempts are completed, even if some fail.

3. An \`restoreErrors\` array was introduced to collect any exceptions that occur during the process. If this array is not empty after the \`Promise.all\` completes, a comprehensive error is thrown, informing the user exactly which files failed to restore. This provides much better diagnostics.`,
    files: [
        { id: '1', path: 'src/core/transaction.ts', type: 'MOD' as const, linesAdded: 18, linesRemoved: 5, diff: `   export const restoreSnapshot = async (snapshot: FileSnapshot, ...): ... => {
     ...
-    for (const [filePath, content] of entries) {
-        if (content === null) {
-            await deleteFile(filePath, cwd);
-        }
-    }
+    const restoreErrors: { path: string, error: unknown }[] = [];
+
+    await Promise.all(entries.map(async ([filePath, content]) => {
+        try {
+          if (content === null) { ... }
+        } catch (error) {
+          restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) { ... }
   }` },
        { id: '2', path: 'src/utils/logger.ts', type: 'MOD' as const, linesAdded: 7, linesRemoved: 3, diff: '... diff content for logger.ts ...' },
        { id: '3', path: 'src/utils/old-helper.ts', type: 'DEL' as const, linesAdded: 0, linesRemoved: 0, diff: '... diff content for old-helper.ts ...' },
    ],
};

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
const copyOptionsList = [
    'Git Message', 'Prompt', 'Reasoning', `All Diffs (${mockTransactionData.files.length} files)`, `Diff for: ${mockTransactionData.files[0]?.path}`, 'UUID', 'Full YAML representation',
];

export const useTransactionDetailStore = create<TransactionDetailState>((set, get) => ({
    transaction: null,
    prompt: '',
    reasoning: '',
    files: [],
    
    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',
    copyModeSelectionIndex: 0,
    copyModeSelections: { 'Git Message': true, 'Reasoning': true }, // Default selections from readme
    copyModeLastCopied: null,

    actions: {
        loadTransaction: (transactionId) => {
            const { transactions } = useDashboardStore.getState();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                set({
                    transaction,
                    ...mockTransactionData,
                    // Reset UI state
                    navigatorFocus: 'PROMPT',
                    expandedSection: null,
                    selectedFileIndex: 0,
                    bodyView: 'NONE',
                });
            }
        },
        navigateUp: () => {
            const { navigatorFocus, selectedFileIndex } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.max(0, selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ navigatorFocus: navigatorOrder[currentIndex - 1] });
                }
            }
        },
        navigateDown: () => {
            const { navigatorFocus, selectedFileIndex, files } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.min(files.length - 1, selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ navigatorFocus: navigatorOrder[currentIndex + 1] });
                }
            }
        },
        handleEnterOrRight: () => {
            const { navigatorFocus, expandedSection } = get();

            if (navigatorFocus === 'FILES_LIST') {
                // Already in file list, now show diff
                set({ bodyView: 'DIFF_VIEW' });
                return;
            }

            if (expandedSection === navigatorFocus) {
                // Section is already expanded, handle nested navigation
                if (navigatorFocus === 'FILES') {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: 'FILES_LIST' });
                }
                return;
            }

            // Expand the focused section
            set({ expandedSection: navigatorFocus });

            switch(navigatorFocus) {
                case 'PROMPT':
                    set({ bodyView: 'PROMPT' });
                    break;
                case 'REASONING':
                    set({ bodyView: 'REASONING' });
                    break;
                case 'FILES':
                    set({ bodyView: 'FILES_LIST' });
                    break;
            }
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();

            if (bodyView === 'DIFF_VIEW') {
                set({ bodyView: 'FILES_LIST' }); // Go back from diff to file list
                return;
            }

            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: 'FILES', bodyView: 'NONE' }); // Go back from file list to files section
                return;
            }

            // If a section is expanded, collapse it
            if (expandedSection) {
                set({ expandedSection: null, bodyView: 'NONE' });
                return;
            }
        },
        toggleCopyMode: () => set(state => {
            if (state.bodyView === 'COPY_MODE') {
                return { bodyView: 'NONE' };
            }
            return {
                bodyView: 'COPY_MODE',
                copyModeSelectionIndex: 0,
                copyModeLastCopied: null,
            };
        }),
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        copyModeNavigateUp: () => set(state => ({
            copyModeSelectionIndex: Math.max(0, state.copyModeSelectionIndex - 1),
        })),
        copyModeNavigateDown: () => set(state => ({
            copyModeSelectionIndex: Math.min(copyOptionsList.length - 1, state.copyModeSelectionIndex + 1),
        })),
        copyModeToggleSelection: () => set(state => {
            const currentOption = copyOptionsList[state.copyModeSelectionIndex];
            if (!currentOption) return {};

            const newSelections = { ...state.copyModeSelections };
            newSelections[currentOption] = !newSelections[currentOption];
            return { copyModeSelections: newSelections };
        }),
        copyModeExecuteCopy: () => {
            // Mock copy to clipboard
            const { copyModeSelections } = get();
            const selectedItems = Object.keys(copyModeSelections).filter(key => copyModeSelections[key]);
            const message = `Copied ${selectedItems.length} items to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Mock copy: ${selectedItems.join(', ')}`);
            set({ copyModeLastCopied: message });
        },
        confirmRevert: () => {
            const { transaction } = get();
            if (!transaction) return;
            // In a real app, this would create a new transaction. Here we'll just update status.
            const { updateTransactionStatus } = useDashboardStore.getState().actions;
            updateTransactionStatus(transaction.id, 'REVERTED');
            set({ bodyView: 'NONE' });
        },
    },
}));