import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { getVisibleItemPaths, findNextPath, findPrevPath, getParentPath } from './navigation.utils';
import { sleep } from '../utils';

export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';
 
// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<HistoryState, 'actions'>;

interface HistoryState {
    mode: HistoryViewMode;
    selectedItemPath: string;
    expandedIds: Set<string>;
    loadingPaths: Set<string>;
    filterQuery: string;
    selectedForAction: Set<string>;
    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        navigatePageUp: (viewportHeight: number) => void;
        navigatePageDown: (viewportHeight: number) => void;
        expandOrDrillDown: () => Promise<void>;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        prepareDebugState: (stateName: 'l1-drill-content' | 'l2-drill-reasoning' | 'l2-drill-diff' | 'filter' | 'copy' | 'bulk') => void;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    mode: 'LIST',
    selectedItemPath: '',
    expandedIds: new Set(),
    loadingPaths: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    actions: {
        load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                loadingPaths: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findPrevPath(selectedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findNextPath(selectedItemPath, visibleItems) });
        },
        navigatePageUp: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.max(0, currentIndex - viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        navigatePageDown: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.min(visibleItems.length - 1, currentIndex + viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        expandOrDrillDown: async () => {
            const { selectedItemPath, expandedIds } = get();
            if (expandedIds.has(selectedItemPath)) return;

            // Files and content items with potentially large data can show a loading state
            const isLoadable = selectedItemPath.includes('/file/') ||
                               selectedItemPath.includes('/prompt') ||
                               selectedItemPath.includes('/reasoning');

            if (isLoadable) {
                set(state => ({ loadingPaths: new Set(state.loadingPaths).add(selectedItemPath) }));
                await sleep(250); // Simulate loading
                set(state => {
                    const newLoadingPaths = new Set(state.loadingPaths);
                    newLoadingPaths.delete(selectedItemPath);
                    const newExpandedIds = new Set(state.expandedIds).add(selectedItemPath);
                    return { loadingPaths: newLoadingPaths, expandedIds: newExpandedIds };
                });
            } else { // For transactions or simple items, expand immediately
                set(state => ({ expandedIds: new Set(state.expandedIds).add(selectedItemPath) }));
            }
        },
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.delete(selectedItemPath);
                // Recursively collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { expandedIds: newExpandedIds };
            }
            const parentId = getParentPath(selectedItemPath);
            if (parentId) {
                return { selectedItemPath: parentId };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = getParentPath(selectedItemPath) || selectedItemPath;
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
                case 'l1-drill-content':
                    actions.load({ expandedIds: new Set(['3']), selectedItemPath: '3' });
                    break;
                case 'l2-drill-reasoning':
                    actions.load({ expandedIds: new Set(['3', '3/reasoning']), selectedItemPath: '3/reasoning' });
                    break;
                case 'l2-drill-diff':
                    actions.load({ expandedIds: new Set(['3', '3/file/3-1']), selectedItemPath: '3/file/3-1' });
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