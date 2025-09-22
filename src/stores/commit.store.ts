import { create } from 'zustand';
import { useDashboardStore, type Transaction } from './dashboard.store';
import { sleep } from '../utils';

interface CommitState {
    transactionsToCommit: Transaction[];
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

const generateCommitMessage = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
        return '';
    }
    // Using a more complex aggregation for better demo, based on the readme
    const title = 'feat: implement new dashboard and clipboard logic';
    const bodyPoints = [
        '- Adds error handling to the core transaction module to prevent uncaught exceptions during snapshot restoration.',
        '- Refactors the clipboard watcher for better performance and cross-platform compatibility, resolving issue #42.',
    ];

    if (transactions.length === 1 && transactions[0]) {
        return transactions[0].message;
    }

    return `${title}\n\n${bodyPoints.join('\n\n')}`;
};

export const useCommitStore = create<CommitState>((set, get) => ({
    transactionsToCommit: [],
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const { transactions } = useDashboardStore.getState();
            const appliedTransactions = transactions.filter(tx => tx.status === 'APPLIED');
            
            const finalCommitMessage = generateCommitMessage(appliedTransactions);

            set({
                transactionsToCommit: appliedTransactions,
                finalCommitMessage,
            });
        },
        commit: async () => {
            set({ isCommitting: true });
            
            // In a real app, this would run git commands.
            // For simulation, we'll just update the dashboard store.
            const { updateTransactionStatus } = useDashboardStore.getState().actions;
            const { transactionsToCommit } = get();

            const txIds = transactionsToCommit.map(tx => tx.id);
            
            // A bit of simulation
            await sleep(500);

            txIds.forEach(id => {
                updateTransactionStatus(id, 'COMMITTED');
            });

            set({ isCommitting: false });
        },
    },
}));