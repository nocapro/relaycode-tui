import { useDashboardStore } from '../stores/dashboard.store';
import { type HistoryTransaction, type FileChange, type TransactionStatus } from '../stores/transaction-history.store';

const revertTransaction = (transactionId: string) => {
    const { updateTransactionStatus } = useDashboardStore.getState().actions;
    updateTransactionStatus(transactionId, 'REVERTED');
};

const createMockTransactions = (): HistoryTransaction[] => {
    const now = Date.now();
    return Array.from({ length: 42 }, (_, i) => {
        const status: TransactionStatus = i % 5 === 2 ? 'Handoff' : i % 5 === 3 ? 'Reverted' : 'Committed';
        const files: FileChange[] = [
            { id: `${i}-1`, path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 25, linesRemoved: 8, diff: '--- a/src/core/transaction.ts\n+++ b/src/core/transaction.ts\n@@ -45,7 +45,9 @@\n-    for (const [filePath, content] of entries) {\n+    const restoreErrors: { path: string, error: unknown }[] = [];\n...\n...\n...\n...\n-    another line removed' },
            { id: `${i}-2`, path: 'src/utils/logger.ts', type: 'MOD', linesAdded: 10, linesRemoved: 2, diff: 'diff for logger' },
            { id: `${i}-3`, path: 'src/utils/old-helper.ts', type: 'DEL', linesAdded: 0, linesRemoved: 30, diff: 'diff for old-helper' },
        ];
        const linesAdded = files.reduce((sum, f) => sum + f.linesAdded, 0);
        const linesRemoved = files.reduce((sum, f) => sum + f.linesRemoved, 0);

        return {
            id: `tx-${i}`,
            hash: Math.random().toString(16).slice(2, 10),
            timestamp: now - i * 24 * 60 * 60 * 1000,
            status,
            message: `feat: commit message number ${42 - i}`,
            files,
            stats: { files: files.length, linesAdded, linesRemoved },
        };
    });
};

export const TransactionService = {
    revertTransaction,
    createMockTransactions,
};