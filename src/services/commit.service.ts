import type { Transaction } from '../types/domain.types';
import { sleep } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';
import { LoggerService } from './logger.service';

const generateCommitMessage = (transactions: Transaction[]): string => {
    LoggerService.info(`Generating commit message for ${transactions.length} transactions.`);
    if (transactions.length === 0) {
        LoggerService.warn('generateCommitMessage called with 0 transactions.');
        return '';
    }
    // Using a more complex aggregation for better demo, based on the readme
    const title = 'feat: implement new dashboard and clipboard logic';
    const bodyPoints = [
        '- Adds error handling to the core transaction module to prevent uncaught exceptions during snapshot restoration.',
        '- Refactors the clipboard watcher for better performance and cross-platform compatibility, resolving issue #42.',
    ];

    if (transactions.length === 1 && transactions[0]) {
        LoggerService.debug('Using single transaction message for commit.');
        return transactions[0].message;
    }

    LoggerService.debug('Using aggregated message for commit.');
    return `${title}\n\n${bodyPoints.join('\n\n')}`;
};

const getGitCommitCommand = (commitMessage: string): string => {
    const subject = commitMessage.split('\n')[0] || '';
    return `git add . && git commit -m "${subject.replace(/"/g, '\\"')}"`;
};

const commit = async (transactionsToCommit: Transaction[], forceFailure?: boolean): Promise<void> => {
    LoggerService.info(`Committing ${transactionsToCommit.length} transactions to git...`);
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    const txIds = transactionsToCommit.map(tx => tx.id);

    // Phase 1: Mark as 'COMMITTING'
    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTING');
    });

    await sleep(500);

    if (forceFailure) {
        LoggerService.error('Mock git error: commit failed due to pre-commit hook failure.');
        // Revert status back to APPLIED on failure to allow retry
        txIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
        throw new Error('Mock git error: commit failed due to pre-commit hook failure.');
    }

    // In a real app, this would run git commands.
    // Phase 2: Mark as 'COMMITTED'
    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTED');
    });
    LoggerService.info('Commit successful.');
};

export const CommitService = {
    generateCommitMessage,
    getGitCommitCommand,
    commit,
};