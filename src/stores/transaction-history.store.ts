import { create } from 'zustand';

// --- Types ---

export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileChange {
    id: string;
    path: string;
    type: FileChangeType;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

export type TransactionStatus = 'Committed' | 'Handoff' | 'Reverted';
export interface HistoryTransaction {
    id: string;
    hash: string;
    timestamp: number;
    status: TransactionStatus;
    message: string;
    files: FileChange[];
    stats: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
export type HistoryViewMode = 'LIST' | 'FILTER' | 'COPY' | 'BULK_ACTIONS';

// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<TransactionHistoryState, 'actions'>;

interface TransactionHistoryState {
    transactions: HistoryTransaction[];
    mode: HistoryViewMode;
    selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    expandedIds: Set<string>; // holds ids of expanded items
    filterQuery: string;
    selectedForAction: Set<string>; // set of transaction IDs
    lastCopiedMessage: string | null;

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
        executeCopy: (selections: string[]) => void;
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    }
}

// --- Mock Data ---
const createMockTransactions = (): HistoryTransaction[] => {
    const now = Date.now();
    return Array.from({ length: 42 }, (_, i) => {
        const status: TransactionStatus = i % 5 === 2 ? 'Handoff' : i % 5 === 3 ? 'Reverted' : 'Committed';
        const files: FileChange[] = [
            { id: `${i}-1`, path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 25, linesRemoved: 8, diff: '--- a/src/core/transaction.ts\n+++ b/src/core/transaction.ts\n@@ -45,7 +45,9 @@\n-    for (const [filePath, content] of entries) {\n+    const restoreErrors: { path: string, error: unknown }[] = [];\n...\n...\n...\n...\n-    another line removed' },
            { id: `${i}-2`, path: 'src/utils/logger.ts', type: 'MOD', linesAdded: 10, linesRemoved: 2, diff: 'diff for logger' },
            { id: `${i}-3`, path: 'src/utils/old-helper.ts', type: 'DEL', linesAdded: 0, linesRemoved: 30, diff: 'diff for old-helper' },
        ];
        const linesAdded = files.reduce((sum, f) => sum + f.linesAdded, 0);
        const linesRemoved = files.reduce((sum, f) => sum + f.linesRemoved, 0);

        return {
            id: `tx-${i}`,
            hash: Math.random().toString(16).slice(2, 10),
            timestamp: now - i * 24 * 60 * 60 * 1000,
            status,
            message: `feat: commit message number ${42 - i}`,
            files,
            stats: { files: files.length, linesAdded, linesRemoved },
        };
    });
};

const getVisibleItemPaths = (transactions: HistoryTransaction[], expandedIds: Set<string>): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id)) {
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
    lastCopiedMessage: null,

    actions: {
        load: (initialState) => {
            const transactions = createMockTransactions();
            set({
                transactions,
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                lastCopiedMessage: null,
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
        setMode: (mode) => set({ mode, lastCopiedMessage: null }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            // In a real app, this would filter `transactions`.
            // For the demo, we just go back to LIST mode.
            set({ mode: 'LIST' });
        },
        executeCopy: (selections) => {
             // Mock copy
            const { selectedForAction } = get();
            const message = `Copied ${selections.join(' & ')} from ${selectedForAction.size} transactions to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD MOCK] ${message}`);
            set({ lastCopiedMessage: message });
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
                    get().actions.load({ mode: 'COPY', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
                case 'bulk':
                    get().actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
            }
        },
    },
}));