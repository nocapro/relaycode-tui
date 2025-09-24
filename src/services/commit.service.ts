import type { Transaction } from '../types/domain.types';
import { sleep } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';

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

const commit = async (transactionsToCommit: Transaction[]): Promise<void> => {
    // In a real app, this would run git commands.
    // For simulation, we'll just update the transaction store.
    const { updateTransactionStatus } = useTransactionStore.getState().actions;

    const txIds = transactionsToCommit.map(tx => tx.id);

    // A bit of simulation
    await sleep(500);

    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTED');
    });
};

export const CommitService = {
    generateCommitMessage,
    commit,
};