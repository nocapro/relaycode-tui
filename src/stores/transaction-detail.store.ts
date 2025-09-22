import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import { TransactionService } from '../services/transaction.service';
import { mockDetailedTransactionData } from '../data/mocks';
import type { Transaction } from '../types/transaction.types';
import type { FileChange as FileDetail } from '../types/file.types';
export type { FileChangeType } from '../types/file.types';
import type { NavigatorSection, DetailBodyView } from '../types/transaction-detail.types';

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
    bodyView: DetailBodyView;
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

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
const copyOptionsList = [
    'Git Message', 'Prompt', 'Reasoning', `All Diffs (${mockDetailedTransactionData.files.length} files)`, `Diff for: ${mockDetailedTransactionData.files[0]?.path}`, 'UUID', 'Full YAML representation',
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
                    ...mockDetailedTransactionData,
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
            TransactionService.revertTransaction(transaction.id);
            set({ bodyView: 'NONE' });
        },
    },
}));