import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import { useTransactionStore } from './transaction.store';
import type { FileChange as FileDetail } from '../types/file.types';
export type { FileChangeType } from '../types/file.types';
import type { NavigatorSection, DetailBodyView } from '../types/transaction-detail.types';

interface TransactionDetailState {
    // Data
    transactionId: string | null;

    // UI State
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: DetailBodyView;

    // Actions
    actions: {
        loadTransaction: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    }
}

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];

export const useTransactionDetailStore = create<TransactionDetailState>((set, get) => ({
    transactionId: null,

    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',

    actions: {
        loadTransaction: (transactionId) => set({
            transactionId,
            // Reset UI state
            navigatorFocus: 'PROMPT',
            expandedSection: null,
            selectedFileIndex: 0,
            bodyView: 'NONE',
        }),
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
            const { navigatorFocus, selectedFileIndex } = get();
            const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === get().transactionId);
            const files = transaction?.files || [];

            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.min(files.length - 1, selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ navigatorFocus: navigatorOrder[currentIndex + 1]! });
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
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        confirmRevert: () => {
            const { transactionId } = get();
            if (!transactionId) return;
            TransactionService.revertTransaction(transactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(transactionId, 'REVERTED');
            set({ bodyView: 'NONE' });
        },
    },
}));