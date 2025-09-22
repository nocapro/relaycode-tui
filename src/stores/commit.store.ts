import { create } from 'zustand';
import { useDashboardStore, type Transaction } from './dashboard.store';
import { CommitService } from '../services/commit.service';

interface CommitState {
    transactionsToCommit: Transaction[];
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

export const useCommitStore = create<CommitState>((set, get) => ({
    transactionsToCommit: [],
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const { transactions } = useDashboardStore.getState();
            const appliedTransactions = transactions.filter(tx => tx.status === 'APPLIED');
            
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);

            set({
                transactionsToCommit: appliedTransactions,
                finalCommitMessage,
            });
        },
        commit: async () => {
            set({ isCommitting: true });
            const { transactionsToCommit } = get();
            await CommitService.commit(transactionsToCommit);
            set({ isCommitting: false });
        },
    },
}));