import { create } from 'zustand';
import { CommitService } from '../services/commit.service';
import { useTransactionStore, selectTransactionsByStatus } from './transaction.store';
import { useNotificationStore } from './notification.store';

interface CommitState {
    finalCommitMessage: string;
    isCommitting: boolean;
    commitError: string | null;
    actions: {
        prepareCommitScreen: () => void;
        commit: (forceFailure?: boolean) => Promise<void>;
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
            } catch (e) {
                const errorMessage = (e as Error).message;
                set({ isCommitting: false, commitError: errorMessage });
                useNotificationStore.getState().actions.show({
                    type: 'error',
                    title: 'Commit Failed',
                    message: errorMessage,
                });
            }
        },
        resetCommitState: () => {
            set({ isCommitting: false, commitError: null });
        },
    },
}));