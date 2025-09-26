import { create } from 'zustand';
import { CommitService } from '../services/commit.service';
import { useTransactionStore, selectTransactionsByStatus } from './transaction.store';

interface CommitState {
    finalCommitMessage: string;
    isCommitting: boolean;
    commitError: string | null;
    actions: {
        prepareCommitScreen: () => void;
        commit: (forceFailure?: boolean) => Promise<{ success: boolean }>;
        resetCommitState: () => void;
    }
}

export const useCommitStore = create<CommitState>((set) => ({
    finalCommitMessage: '',
    isCommitting: false,
    commitError: null,
    actions: {
        prepareCommitScreen: () => {
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);
            set({ finalCommitMessage });
        },
        commit: async (forceFailure) => {
            set({ isCommitting: true, commitError: null });
            try {
                const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
                await CommitService.commit(appliedTransactions, forceFailure);
                set({ isCommitting: false });
                return { success: true };
            } catch (e) {
                set({ isCommitting: false, commitError: (e as Error).message });
                return { success: false };
            }
        },
        resetCommitState: () => {
            set({ isCommitting: false, commitError: null });
        },
    },
}));