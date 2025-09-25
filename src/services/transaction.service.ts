import { createMockTransactions } from '../data/mocks';
import type { Transaction } from '../types/domain.types';

const revertTransaction = (_transactionId: string) => {
    // In a real app, this would perform the revert operation (e.g., API call).
    // The state update is now handled by the calling store.
    // This is a no-op for the simulation, we just need the id.
};

export const TransactionService = {
    revertTransaction,
    getAllTransactions: (): Transaction[] => createMockTransactions(),
};