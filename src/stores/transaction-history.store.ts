import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';
import type { HistoryViewMode } from '../types/transaction-history.types';

export type { Transaction as HistoryTransaction } from '../types/transaction.types';
export type { FileChange } from '../types/file.types';

// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<TransactionHistoryState, 'actions'>;

interface TransactionHistoryState {
    transactions: Transaction[];
    mode: HistoryViewMode;
    selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    expandedIds: Set<string>; // holds ids of expanded items
    filterQuery: string;
    selectedForAction: Set<string>; // set of transaction IDs

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
    }
}

export const getVisibleItemPaths = (transactions: Transaction[], expandedIds: Set<string>): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id) && tx.files) {
            for (const file of tx.files) {
                paths.push(`${tx.id}/${file.id}`);
            }
        }
    }
    return paths;
};

// --- Store ---
export const useTransactionHistoryStore = create<TransactionHistoryState>((set, get) => ({
    transactions: [],
    mode: 'LIST',
    selectedItemPath: 'tx-0',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),

    actions: {
        load: (initialState) => {
            const transactions = TransactionService.getAllTransactions();
            set({
                transactions,
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex > 0) {
                set({ selectedItemPath: visibleItems[currentIndex - 1] });
            }
        },
        navigateDown: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ selectedItemPath: visibleItems[currentIndex + 1] });
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
                // If it's expanded, collapse it
                newExpandedIds.delete(selectedItemPath);
                
                // Also collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }

                return { expandedIds: newExpandedIds };
            } else if (selectedItemPath.includes('/')) {
                // If it's a file, move selection to parent transaction
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
            // In a real app, this would filter `transactions`.
            // For the demo, we just go back to LIST mode.
            set({ mode: 'LIST' });
        },
        prepareDebugState: (stateName) => {
            switch (stateName) {
                case 'l1-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0']), selectedItemPath: 'tx-0' });
                    break;
                case 'l2-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0', 'tx-0/0-1']), selectedItemPath: 'tx-0/0-1' });
                    break;
                case 'filter':
                    get().actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:committed' });
                    break;
                case 'copy':
                    get().actions.load({
                        selectedForAction: new Set(['tx-0', 'tx-2']),
                    });
                    break;
                case 'bulk':
                    get().actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
            }
        },
    },
}));