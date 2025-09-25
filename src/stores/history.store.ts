import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { getVisibleItemPaths } from './navigation.utils';

export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';
 
// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<HistoryState, 'actions'>;

interface HistoryState {
    mode: HistoryViewMode;
    selectedItemPath: string;
    expandedIds: Set<string>;
    filterQuery: string;
    selectedForAction: Set<string>;
    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    mode: 'LIST',
    selectedItemPath: '',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    actions: {
        load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex > 0) {
                set({ selectedItemPath: visibleItems[currentIndex - 1]! });
            }
        },
        navigateDown: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ selectedItemPath: visibleItems[currentIndex + 1]! });
            }
        },
        expandOrDrillDown: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (!newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.add(selectedItemPath);
            }
            return { expandedIds: newExpandedIds };
        }),
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.delete(selectedItemPath);
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { expandedIds: newExpandedIds };
            } else if (selectedItemPath.includes('/')) {
                const parentId = selectedItemPath.split('/')[0];
                return { selectedItemPath: parentId || '' };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = selectedItemPath.split('/')[0];
            if (!txId) return {};
            const newSelection = new Set(selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { selectedForAction: newSelection };
        }),
        setMode: (mode) => set({ mode }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            set({ mode: 'LIST' });
        },
        prepareDebugState: (stateName) => {
            const { actions } = get();
            switch (stateName) {
                case 'l1-drill':
                    actions.load({ expandedIds: new Set(['3']), selectedItemPath: '3' });
                    break;
                case 'l2-drill':
                    actions.load({ expandedIds: new Set(['3', '3/3-1']), selectedItemPath: '3/3-1' });
                    break;
                case 'filter':
                    actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:COMMITTED' });
                    break;
                case 'copy':
                    actions.load({ selectedForAction: new Set(['3', '6']) });
                    break;
                case 'bulk':
                    actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['3', '6']) });
                    break;
            }
        },
    },
}));