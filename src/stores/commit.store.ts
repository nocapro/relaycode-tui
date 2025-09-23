import { create } from 'zustand';
import type { Transaction } from '../types/transaction.types';
import { CommitService } from '../services/commit.service';
import { useTransactionStore } from './transaction.store';

interface CommitState {
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

export const useCommitStore = create<CommitState>((set, get) => ({
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const { transactions } = useTransactionStore.getState();
            const appliedTransactions = transactions.filter(tx => tx.status === 'APPLIED');
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);
            set({ finalCommitMessage });
        },
        commit: async () => {
            set({ isCommitting: true });
            const { transactions } = useTransactionStore.getState();
            const appliedTransactions = transactions.filter(tx => tx.status === 'APPLIED');
            await CommitService.commit(appliedTransactions);
            set({ isCommitting: false });
        },
    },
}));