import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';
import { NAVIGATOR_SECTIONS, DETAIL_BODY_VIEWS } from '../constants/detail.constants';
import { findNextPath, findPrevPath, getParentPath } from './navigation.utils';

type ObjectValues<T> = T[keyof T];

export type NavigatorSection = ObjectValues<typeof NAVIGATOR_SECTIONS>;
export type DetailBodyView = ObjectValues<typeof DETAIL_BODY_VIEWS>;

// Omit 'actions' from state type for partial updates
type DetailStateData = Omit<DetailState, 'actions'>;
 
interface DetailState {
    focusedItemPath: string; // e.g., 'PROMPT', 'FILES', 'FILES/1-1'
    expandedItemPaths: Set<string>;
    bodyView: DetailBodyView;
    actions: {
        load: (transactionId: string, initialState?: Partial<DetailStateData>) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    };
}

const getVisibleItemPaths = (expandedItemPaths: Set<string>): string[] => {
    const { selectedTransactionId } = useViewStore.getState();
    const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === selectedTransactionId);
    if (!transaction) return [];

    const paths: string[] = [NAVIGATOR_SECTIONS.PROMPT, NAVIGATOR_SECTIONS.REASONING, NAVIGATOR_SECTIONS.FILES];
    if (expandedItemPaths.has(NAVIGATOR_SECTIONS.FILES) && transaction.files) {
        for (const file of transaction.files) {
            paths.push(`${NAVIGATOR_SECTIONS.FILES}/${file.id}`);
        }
    }
    return paths;
};

export const useDetailStore = create<DetailState>((set, get) => ({
    focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
    expandedItemPaths: new Set(),
    bodyView: DETAIL_BODY_VIEWS.NONE,
    actions: {
        load: (transactionId, initialState) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
                expandedItemPaths: new Set(),
                bodyView: DETAIL_BODY_VIEWS.NONE,
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findPrevPath(focusedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findNextPath(focusedItemPath, visibleItems) });
        },
        expandOrDrillDown: () => set(state => {
            const { focusedItemPath, expandedItemPaths } = state;
            const newExpandedPaths = new Set(expandedItemPaths);
            
            if (focusedItemPath.includes('/')) { // Is a file
                return { bodyView: DETAIL_BODY_VIEWS.DIFF_VIEW };
            }

            // Is a section header
            if (newExpandedPaths.has(focusedItemPath)) {
                // Already expanded, drill in if it's FILES
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) {
                    const visibleItems = getVisibleItemPaths(newExpandedPaths);
                    const firstFile = visibleItems.find(item => item.startsWith(`${NAVIGATOR_SECTIONS.FILES}/`));
                    if (firstFile) {
                        return { focusedItemPath: firstFile, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
                    }
                }
                return {}; // No-op for PROMPT/REASONING if already expanded
            } else {
                // Not expanded, so expand it
                newExpandedPaths.add(focusedItemPath);
                let newBodyView: DetailBodyView = DETAIL_BODY_VIEWS.NONE;
                if (focusedItemPath === NAVIGATOR_SECTIONS.PROMPT) newBodyView = DETAIL_BODY_VIEWS.PROMPT;
                if (focusedItemPath === NAVIGATOR_SECTIONS.REASONING) newBodyView = DETAIL_BODY_VIEWS.REASONING;
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) newBodyView = DETAIL_BODY_VIEWS.FILES_LIST;
                return { expandedItemPaths: newExpandedPaths, bodyView: newBodyView };
            }
        }),
        collapseOrBubbleUp: () => set(state => {
            const { focusedItemPath, expandedItemPaths, bodyView } = state;
            
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return { bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }

            if (getParentPath(focusedItemPath)) { // Is a file
                return { focusedItemPath: NAVIGATOR_SECTIONS.FILES, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }
            
            // Is a section header
            if (expandedItemPaths.has(focusedItemPath)) {
                const newExpandedPaths = new Set(expandedItemPaths);
                newExpandedPaths.delete(focusedItemPath);
                return { expandedItemPaths: newExpandedPaths, bodyView: DETAIL_BODY_VIEWS.NONE };
            }
            
            return {}; // No-op if not expanded (global back will handle)
        }),
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