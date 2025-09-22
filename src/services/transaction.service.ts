import { useDashboardStore } from '../stores/dashboard.store';
import { createMockHistoryTransactions } from '../data/mocks';
import type { Transaction } from '../types/transaction.types';

const revertTransaction = (transactionId: string) => {
    const { updateTransactionStatus } = useDashboardStore.getState().actions;
    updateTransactionStatus(transactionId, 'REVERTED');
};

export const TransactionService = {
    revertTransaction,
    createMockTransactions: createMockHistoryTransactions,
};