import { create } from 'zustand';
import { sleep } from '../utils';

// --- Types ---
export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'FAILED' | 'REVERTED' | 'IN-PROGRESS';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
}

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'CONFIRM_COMMIT' | 'APPROVING' | 'COMMITTING';

// --- Initial State (for simulation) ---
const createInitialTransactions = (): Transaction[] => [
    { id: '1', timestamp: Date.now() - 15 * 1000, status: 'PENDING', hash: 'e4a7c112', message: 'fix: add missing error handling' },
    { id: '2', timestamp: Date.now() - 2 * 60 * 1000, status: 'APPLIED', hash: '4b9d8f03', message: 'refactor: simplify clipboard logic' },
    { id: '3', timestamp: Date.now() - 5 * 60 * 1000, status: 'COMMITTED', hash: '8a3f21b8', message: 'feat: implement new dashboard UI' },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    transactions: Transaction[];
    selectedTransactionIndex: number;
    showHelp: boolean;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        startCommitAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: createInitialTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        startCommitAll: () => set(state => ({
            status: 'CONFIRM_COMMIT',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                // Find pending transactions and mark them as in-progress
                const pendingTxIds: string[] = [];
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (tx.status === 'PENDING') {
                            pendingTxIds.push(tx.id);
                            return { ...tx, status: 'IN-PROGRESS' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs };
                });

                await sleep(2000); // Simulate approval process

                // Mark them as applied
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (pendingTxIds.includes(tx.id)) {
                            return { ...tx, status: 'APPLIED' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs, status: previousStatus };
                });
            } else if (status === 'CONFIRM_COMMIT') {
                set({ status: 'COMMITTING' });
                 // Find applied transactions and mark them as in-progress
                 const appliedTxIds: string[] = [];
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (tx.status === 'APPLIED') {
                            appliedTxIds.push(tx.id);
                             return { ...tx, status: 'IN-PROGRESS' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs };
                 });
 
                 await sleep(2000); // Simulate commit process
 
                 // Mark them as committed
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (appliedTxIds.includes(tx.id)) {
                             return { ...tx, status: 'COMMITTED' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs, status: previousStatus };
                 });
            }
        },
    },
}));