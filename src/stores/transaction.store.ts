import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction, TransactionStatus, FileReviewStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
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
    },
}));

// --- Selectors ---

/** Selects transactions by their status. */
export const selectTransactionsByStatus = (status: TransactionStatus) => (state: TransactionState) =>
    state.transactions.filter(tx => tx.status === status);

/** Selects statistics for the review screen for a given transaction. */
export const selectReviewStats = (transactionId: string | null) => (state: TransactionState) => {
    // This selector is now dependent on the review store.
    // It's better to compute these stats inside the useReviewScreen hook
    // where both transaction data and review state are available.
    // We will select the transaction here and the hook will do the rest.
    const transaction = state.transactions.find(t => t.id === transactionId);
    return { transaction };
};
