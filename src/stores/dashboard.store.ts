import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { TransactionService } from '../services/transaction.service';
import type { Transaction, TransactionStatus } from '../types/transaction.types';
import type { DashboardStatus } from '../types/dashboard.types';
import { moveIndex } from './navigation.utils';

export type { Transaction, TransactionStatus } from '../types/transaction.types';
export type { DashboardStatus } from '../types/dashboard.types';

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
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: TransactionService.getAllTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', state.transactions.length),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', state.transactions.length),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
        setStatus: (status) => set({ status }),
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
            // After updating, move selection to the updated transaction
            const index = get().transactions.findIndex(tx => tx.id === id);
            if (index !== -1) set({ selectedTransactionIndex: index });
        },

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                await DashboardService.approveAll();

                set({ status: previousStatus });
            }
        },
    },
}));