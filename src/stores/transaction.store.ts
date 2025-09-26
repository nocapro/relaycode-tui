import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import { useViewStore } from './view.store';
import { useDashboardStore } from './dashboard.store';
import type { Transaction, TransactionStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
        addTransaction: (transaction: Transaction) => void;
        clearTransactions: () => void;
    };
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    actions: {
        loadTransactions: () => {
            const transactions = TransactionService.getAllTransactions();
            set({ transactions });
        },
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
        },
        addTransaction: (transaction) => {
            set(state => ({
                transactions: [transaction, ...state.transactions],
            }));
            useDashboardStore.getState().actions.setSelectedIndex(0);
        },
        clearTransactions: () => set({ transactions: [] }),
    },
}));

// --- Selectors ---

/** Selects transactions by their status. */
export const selectTransactionsByStatus = (status: TransactionStatus) => (state: TransactionState) =>
    state.transactions.filter(tx => tx.status === status);

/** Selects the transaction currently targeted by the view store. */
export const selectSelectedTransaction = (state: TransactionState): Transaction | undefined => {
    const { selectedTransactionId } = useViewStore.getState();
    return state.transactions.find(t => t.id === selectedTransactionId);
};
