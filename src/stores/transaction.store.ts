import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction, TransactionStatus } from '../types/transaction.types';

export type { Transaction } from '../types/transaction.types';

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

// Initialize the store with data on load.
useTransactionStore.getState().actions.loadTransactions();