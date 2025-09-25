import { create } from 'zustand';
import type { Transaction } from '../types/domain.types';
import { CommitService } from '../services/commit.service';
import { useTransactionStore, selectTransactionsByStatus } from './transaction.store';

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
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);
            set({ finalCommitMessage });
        },
        commit: async () => {
            set({ isCommitting: true });
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            await CommitService.commit(appliedTransactions);
            set({ isCommitting: false });
        },
    },
}));