import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';
import { NAVIGATOR_SECTIONS, DETAIL_BODY_VIEWS } from '../constants/detail.constants';

type ObjectValues<T> = T[keyof T];

export type NavigatorSection = ObjectValues<typeof NAVIGATOR_SECTIONS>;
export type DetailBodyView = ObjectValues<typeof DETAIL_BODY_VIEWS>;
 
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
    navigatorFocus: NAVIGATOR_SECTIONS.PROMPT,
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: DETAIL_BODY_VIEWS.NONE,
    actions: {
        load: (transactionId) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                navigatorFocus: NAVIGATOR_SECTIONS.PROMPT,
                expandedSection: null,
                selectedFileIndex: 0,
                bodyView: DETAIL_BODY_VIEWS.NONE,
            });
        },
        navigateUp: () => {
            const navigatorOrder: NavigatorSection[] = [
                NAVIGATOR_SECTIONS.PROMPT,
                NAVIGATOR_SECTIONS.REASONING,
                NAVIGATOR_SECTIONS.FILES,
            ];
            const { navigatorFocus, selectedFileIndex } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.max(0, selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ navigatorFocus: navigatorOrder[currentIndex - 1]! });
                }
            }
        },
        navigateDown: () => {
            const navigatorOrder: NavigatorSection[] = [
                NAVIGATOR_SECTIONS.PROMPT,
                NAVIGATOR_SECTIONS.REASONING,
                NAVIGATOR_SECTIONS.FILES,
            ];
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
                set({ bodyView: DETAIL_BODY_VIEWS.DIFF_VIEW });
                return;
            }
            if (expandedSection === navigatorFocus) {
                if (navigatorFocus === NAVIGATOR_SECTIONS.FILES) {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: DETAIL_BODY_VIEWS.FILES_LIST });
                }
                return;
            }
            set({ expandedSection: navigatorFocus as NavigatorSection });
            if (navigatorFocus === NAVIGATOR_SECTIONS.PROMPT) set({ bodyView: DETAIL_BODY_VIEWS.PROMPT });
            if (navigatorFocus === NAVIGATOR_SECTIONS.REASONING) set({ bodyView: DETAIL_BODY_VIEWS.REASONING });
            if (navigatorFocus === NAVIGATOR_SECTIONS.FILES) set({ bodyView: DETAIL_BODY_VIEWS.FILES_LIST });
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                set({ bodyView: DETAIL_BODY_VIEWS.FILES_LIST });
                return;
            }
            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: NAVIGATOR_SECTIONS.FILES, bodyView: DETAIL_BODY_VIEWS.NONE });
                return;
            }
            if (expandedSection) {
                set({ expandedSection: null, bodyView: DETAIL_BODY_VIEWS.NONE });
            }
        },
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM
                ? DETAIL_BODY_VIEWS.NONE
                : DETAIL_BODY_VIEWS.REVERT_CONFIRM,
        })),
        confirmRevert: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (!selectedTransactionId) return;
            TransactionService.revertTransaction(selectedTransactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REVERTED');
            set({ bodyView: DETAIL_BODY_VIEWS.NONE });
        },
    },
}));