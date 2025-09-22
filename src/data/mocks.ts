import type { Transaction } from '../types/transaction.types';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult } from '../types/review.types';

const mockReasoning1 = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

const mockReasoning2 = `1. The primary goal was to make the rollback functionality in \`restoreSnapshot\` more robust. The previous implementation used a simple for-loop which would halt on the first error, leaving the project in a partially restored state.

2. I opted for a \`Promise.all\` approach to run file restorations in parallel. This improves performance slightly but, more importantly, ensures all restoration attempts are completed, even if some fail.

3. An \`restoreErrors\` array was introduced to collect any exceptions that occur during the process. If this array is not empty after the \`Promise.all\` completes, a comprehensive error is thrown, informing the user exactly which files failed to restore. This provides much better diagnostics.`;

export const allMockTransactions: Transaction[] = [
    {
        id: '1',
        timestamp: Date.now() - 15 * 1000,
        status: 'PENDING',
        hash: 'e4a7c112',
        message: 'fix: add missing error handling',
        prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
        reasoning: mockReasoning1,
        files: [
            { id: '1-1', path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
        ],
        stats: { files: 1, linesAdded: 18, linesRemoved: 5 },
    },
    {
        id: '2',
        timestamp: Date.now() - 2 * 60 * 1000,
        status: 'APPLIED',
        hash: '4b9d8f03',
        message: 'refactor: simplify clipboard logic',
        prompt: 'Simplify the clipboard logic using an external library...',
        reasoning: 'The existing clipboard logic was complex and platform-dependent. Using the `clipboardy` library simplifies the code and improves reliability across different operating systems.',
        files: [
            { id: '2-1', path: 'src/core/clipboard.ts', type: 'MOD', linesAdded: 15, linesRemoved: 8, diff: '... diff ...' },
            { id: '2-2', path: 'src/utils/shell.ts', type: 'MOD', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
        ],
        stats: { files: 2, linesAdded: 22, linesRemoved: 11 },
    },
    {
        id: '3',
        timestamp: Date.now() - 5 * 60 * 1000,
        status: 'COMMITTED',
        hash: '8a3f21b8',
        message: 'feat: implement new dashboard UI',
        prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
        reasoning: mockReasoning2,
        files: [
            { id: '3-1', path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
            { id: '3-2', path: 'src/utils/logger.ts', type: 'MOD', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
            { id: '3-3', path: 'src/utils/old-helper.ts', type: 'DEL', linesAdded: 0, linesRemoved: 30, diff: '... diff ...' },
        ],
        stats: { files: 3, linesAdded: 25, linesRemoved: 38 },
    },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

/**
 * Creates a deep copy of the mock transactions to prevent state mutations.
 */
export const createMockTransactions = (): Transaction[] => {
    return JSON.parse(JSON.stringify(allMockTransactions));
};


// From review.store.ts
export const mockReviewFiles: ReviewFileItem[] = [
    {
        id: '1',
        path: 'src/core/transaction.ts',
        status: 'APPROVED',
        linesAdded: 18,
        linesRemoved: 5,
        diff: `--- a/src/core/transaction.ts
+++ b/src/core/transaction.ts
@@ -15,7 +15,7 @@ export class Transaction {
   }

-  calculateChanges(): ChangeSet {
+  computeDelta(): ChangeSet {
     return this.changes;
   }
 }`,
        strategy: 'replace',
    },
    {
        id: '2',
        path: 'src/utils/logger.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Hunk #1 failed to apply',
        strategy: 'standard-diff',
    },
    {
        id: '3',
        path: 'src/commands/apply.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Context mismatch at line 92',
        strategy: 'standard-diff',
    },
];

export const mockReviewScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

export const mockReviewReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;