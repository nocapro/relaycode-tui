import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';

export type NavigatorSection = 'PROMPT' | 'REASONING' | 'FILES';
export type DetailBodyView = 'PROMPT' | 'REASONING' | 'FILES_LIST' | 'DIFF_VIEW' | 'REVERT_CONFIRM' | 'NONE';
 
interface DetailState {
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: DetailBodyView;
    actions: {
        load: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    };
}

export const useDetailStore = create<DetailState>((set, get) => ({
    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',
    actions: {
        load: (transactionId) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                navigatorFocus: 'PROMPT',
                expandedSection: null,
                selectedFileIndex: 0,
                bodyView: 'NONE',
            });
        },
        navigateUp: () => {
            const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
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
            const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
            const { navigatorFocus, selectedFileIndex } = get();
            const { selectedTransactionId } = useViewStore.getState();
            const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === selectedTransactionId);
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
                set({ bodyView: 'DIFF_VIEW' });
                return;
            }
            if (expandedSection === navigatorFocus) {
                if (navigatorFocus === 'FILES') {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: 'FILES_LIST' });
                }
                return;
            }
            set({ expandedSection: navigatorFocus as NavigatorSection });
            if (navigatorFocus === 'PROMPT') set({ bodyView: 'PROMPT' });
            if (navigatorFocus === 'REASONING') set({ bodyView: 'REASONING' });
            if (navigatorFocus === 'FILES') set({ bodyView: 'FILES_LIST' });
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();
            if (bodyView === 'DIFF_VIEW') {
                set({ bodyView: 'FILES_LIST' });
                return;
            }
            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: 'FILES', bodyView: 'NONE' });
                return;
            }
            if (expandedSection) {
                set({ expandedSection: null, bodyView: 'NONE' });
            }
        },
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        confirmRevert: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (!selectedTransactionId) return;
            TransactionService.revertTransaction(selectedTransactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REVERTED');
            set({ bodyView: 'NONE' });
        },
    },
}));