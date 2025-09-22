# Directory Structure
```
src/
  data/
    mocks.ts
  hooks/
    useDashboardScreen.tsx
    useDebugMenu.tsx
    useGitCommitScreen.tsx
    useInitializationScreen.tsx
    useReviewScreen.tsx
    useSplashScreen.tsx
    useTransactionDetailScreen.tsx
    useTransactionHistoryScreen.tsx
  services/
    commit.service.ts
    dashboard.service.ts
    init.service.ts
    review.service.ts
    transaction.service.ts
  stores/
    app.store.ts
    commit.store.ts
    dashboard.store.ts
    init.store.ts
    review.store.ts
    transaction-detail.store.ts
    transaction-history.store.ts
  types/
    app.types.ts
    dashboard.types.ts
    debug.types.ts
    file.types.ts
    init.types.ts
    review.types.ts
    transaction-detail.types.ts
    transaction-history.types.ts
    transaction.types.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/data/mocks.ts
```typescript
import type { Transaction } from '../types/transaction.types';
import type { HistoryTransaction, HistoryTransactionStatus } from '../types/transaction.types';
import type { FileChange, ReviewFileItem } from '../types/file.types';
import type { ScriptResult } from '../types/review.types';

// From dashboard.store.ts
export const createDashboardTransactions = (): Transaction[] => [
    { id: '1', timestamp: Date.now() - 15 * 1000, status: 'PENDING', hash: 'e4a7c112', message: 'fix: add missing error handling' },
    { id: '2', timestamp: Date.now() - 2 * 60 * 1000, status: 'APPLIED', hash: '4b9d8f03', message: 'refactor: simplify clipboard logic' },
    { id: '3', timestamp: Date.now() - 5 * 60 * 1000, status: 'COMMITTED', hash: '8a3f21b8', message: 'feat: implement new dashboard UI' },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

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

// From transaction-detail.store.ts
export const mockDetailedTransactionData = {
    prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
    reasoning: `1. The primary goal was to make the rollback functionality in \`restoreSnapshot\` more robust. The previous implementation used a simple for-loop which would halt on the first error, leaving the project in a partially restored state.

2. I opted for a \`Promise.all\` approach to run file restorations in parallel. This improves performance slightly but, more importantly, ensures all restoration attempts are completed, even if some fail.

3. An \`restoreErrors\` array was introduced to collect any exceptions that occur during the process. If this array is not empty after the \`Promise.all\` completes, a comprehensive error is thrown, informing the user exactly which files failed to restore. This provides much better diagnostics.`,
    files: [
        { id: '1', path: 'src/core/transaction.ts', type: 'MOD' as const, linesAdded: 18, linesRemoved: 5, diff: `   export const restoreSnapshot = async (snapshot: FileSnapshot, ...): ... => {
     ...
-    for (const [filePath, content] of entries) {
-        if (content === null) {
-            await deleteFile(filePath, cwd);
-        }
-    }
+    const restoreErrors: { path: string, error: unknown }[] = [];
+
+    await Promise.all(entries.map(async ([filePath, content]) => {
+        try {
+          if (content === null) { ... }
+        } catch (error) {
+          restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) { ... }
   }` },
        { id: '2', path: 'src/utils/logger.ts', type: 'MOD' as const, linesAdded: 7, linesRemoved: 3, diff: '... diff content for logger.ts ...' },
        { id: '3', path: 'src/utils/old-helper.ts', type: 'DEL' as const, linesAdded: 0, linesRemoved: 0, diff: '... diff content for old-helper.ts ...' },
    ],
};

// From transaction.service.ts
export const createMockHistoryTransactions = (): HistoryTransaction[] => {
    const now = Date.now();
    return Array.from({ length: 42 }, (_, i) => {
        const status: HistoryTransactionStatus = i % 5 === 2 ? 'HANDOFF' : i % 5 === 3 ? 'REVERTED' : 'COMMITTED';
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
```

## File: src/hooks/useDashboardScreen.tsx
```typescript
import { useMemo, useState, useEffect } from 'react';
import { useApp, useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useTransactionHistoryStore } from '../stores/transaction-history.store';
import { useStdoutDimensions } from '../utils';

export const useDashboardScreen = () => {
    const [, rows] = useStdoutDimensions();
    const [viewOffset, setViewOffset] = useState(0);
    const NON_EVENT_STREAM_HEIGHT = 9; // Header, separators, status, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_EVENT_STREAM_HEIGHT);
    const { status, transactions, selectedTransactionIndex, showHelp } = useDashboardStore();
    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        confirmAction,
        cancelAction,
        toggleHelp,
    } = useDashboardStore(s => s.actions);
    const { exit } = useApp();
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const detailActions = useTransactionDetailStore(s => s.actions);
    const historyActions = useTransactionHistoryStore(s => s.actions);

    const pendingApprovals = useMemo(() => transactions.filter(t => t.status === 'PENDING').length, [transactions]);
    const pendingCommits = useMemo(() => transactions.filter(t => t.status === 'APPLIED').length, [transactions]);

    const isModal = status === 'CONFIRM_APPROVE';
    const isProcessing = status === 'APPROVING';

    useEffect(() => {
        if (selectedTransactionIndex < viewOffset) {
            setViewOffset(selectedTransactionIndex);
        } else if (selectedTransactionIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedTransactionIndex - viewportHeight + 1);
        }
    }, [selectedTransactionIndex, viewOffset, viewportHeight]);

    useInput((input, key) => {
        if (input === '?') {
            toggleHelp();
            return;
        }

        if (showHelp) {
            if (key.escape || input === '?') toggleHelp();
            return;
        }

        if (isModal) {
            if (key.return) confirmAction();
            if (key.escape) cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing
        
        if (input.toLowerCase() === 'q') exit();

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        
        if (key.return) {
            const selectedTx = transactions[selectedTransactionIndex];
            if (selectedTx?.status === 'PENDING') {
                // For PENDING transactions, we still go to the review screen.
                appActions.showReviewScreen();
            } else if (selectedTx) {
                detailActions.loadTransaction(selectedTx.id);
                appActions.showTransactionDetailScreen();
            }
        }
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) {
            commitActions.prepareCommitScreen();
            appActions.showGitCommitScreen();
        }
        if (input.toLowerCase() === 'l') {
            historyActions.load();
            appActions.showTransactionHistoryScreen();
        }
    });
    
    const transactionsToConfirm = useMemo(() => {
        if (status === 'CONFIRM_APPROVE') return transactions.filter(t => t.status === 'PENDING');
        return [];
    }, [status, transactions]);

    return {
        status,
        transactions,
        selectedTransactionIndex,
        showHelp,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    };
};
```

## File: src/hooks/useGitCommitScreen.tsx
```typescript
import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';

export const useGitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useCommitStore();
    const { commit } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    useInput((input, key) => {
        if (isCommitting) return;

        if (key.escape) {
            showDashboardScreen();
        }
        if (key.return) {
            commit().then(() => {
                showDashboardScreen();
            });
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting };
};
```

## File: src/hooks/useReviewScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, useApp } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';

export const useReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        selectedItemIndex, bodyView,
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval,
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff,
        startApplySimulation,
        rejectAllFiles, approve,
        toggleCopyMode, moveCopySelectionUp, moveCopySelectionDown, copySelectedItem,
        copyUUID, copyMessage, copyPrompt, copyReasoning, copyFileDiff, copyAllDiffs,
        tryRepairFile, showBulkRepair, executeBulkRepairOption, confirmHandoff,
        scrollReasoningUp, scrollReasoningDown, navigateScriptErrorUp, navigateScriptErrorDown,
    } = store.actions;

    const {
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useMemo(() => {
        const approvedFiles = files.filter(f => f.status === 'APPROVED');
        return {
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
            approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
            approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files]);

    useInput((input, key) => {
        // For demo purposes: Pressing 1 or 2 triggers the processing screen simulation.
        if (input === '1') {
            startApplySimulation('success');
            return;
        }
        if (input === '2') {
            // The store's default is failure, but to re-trigger the processing screen
            startApplySimulation('failure');
            return;
        }

        if (input.toLowerCase() === 'q') exit();

        // Handle Escape key - context-sensitive behavior
        if (key.escape) {
            if (bodyView === 'copy_mode') {
                toggleCopyMode();
            } else if (bodyView === 'confirm_handoff') {
                // Pressing Esc on confirm handoff goes back to the main view
                toggleReasoningView(); // Toggles any view off
            } else if (bodyView === 'bulk_repair') {
                showBulkRepair(); // Close bulk repair modal
            } else if (bodyView !== 'none') {
                if (bodyView === 'diff') toggleDiffView();
                if (bodyView === 'reasoning') toggleReasoningView();
                if (bodyView === 'script_output') toggleScriptView();
            } else {
                showDashboardScreen();
            }
            return;
        }

        // Copy Mode Navigation
        if (bodyView === 'copy_mode') {
            if (key.upArrow) moveCopySelectionUp();
            if (key.downArrow) moveCopySelectionDown();
            if (key.return) copySelectedItem();
            
            // Hotkey shortcuts
            if (input.toLowerCase() === 'u') copyUUID();
            if (input.toLowerCase() === 'm') copyMessage();
            if (input.toLowerCase() === 'p') copyPrompt();
            if (input.toLowerCase() === 'r') copyReasoning();
            if (input.toLowerCase() === 'f') copyFileDiff();
            if (input.toLowerCase() === 'a') copyAllDiffs();
            if (input.toLowerCase() === 'c') toggleCopyMode();
            return;
        }

        // Handoff Confirmation
        if (bodyView === 'confirm_handoff') {
            if (key.return) {
                confirmHandoff();
            }
            return;
        }

        // Bulk Repair Navigation
        if (bodyView === 'bulk_repair') {
            if (input >= '1' && input <= '4') {
                executeBulkRepairOption(parseInt(input));
            }
            return;
        }

        // Reasoning Scroll Navigation
        if (bodyView === 'reasoning') {
            if (key.upArrow) scrollReasoningUp();
            if (key.downArrow) scrollReasoningDown();
            if (input.toLowerCase() === 'r') toggleReasoningView();
            return;
        }

        // Script Output Navigation
        if (bodyView === 'script_output') {
            if (input.toLowerCase() === 'j') navigateScriptErrorDown();
            if (input.toLowerCase() === 'k') navigateScriptErrorUp();
            if (key.return) toggleScriptView();
            if (input.toLowerCase() === 'c') {
                // Copy script output
                const scriptIndex = selectedItemIndex - numFiles;
                const selectedScript = scripts[scriptIndex];
                if (selectedScript) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
                }
            }
            return;
        }

        // Diff View Navigation
        if (bodyView === 'diff') {
            if (input.toLowerCase() === 'x') expandDiff();
            if (input.toLowerCase() === 'd') toggleDiffView();
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleReasoningView();

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.status !== 'FAILED') {
                    toggleFileApproval();
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleDiffView();
            }
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleScriptView();
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            toggleCopyMode();
        }

        // Handle T for single repair and Shift+T for bulk repair
        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = files.some(f => f.status === 'FAILED');
                if (hasFailedFiles) {
                    showBulkRepair();
                }
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    if (file && file.status === 'FAILED') {
                        tryRepairFile();
                    }
                }
            }
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    return { ...store, numFiles, approvedFilesCount, approvedLinesAdded, approvedLinesRemoved };
};
```

## File: src/hooks/useSplashScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState(5);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput(() => {
        handleSkip();
    });

    useEffect(() => {
        if (countdown === 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showInitScreen]);

    return { countdown };
};
```

## File: src/hooks/useTransactionDetailScreen.tsx
```typescript
import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useTransactionDetailStore();
    const {
        transaction,
        files,
        bodyView,
    } = store;

    const {
        // Main nav
        navigateUp, navigateDown, handleEnterOrRight, handleEscapeOrLeft,
        toggleCopyMode, toggleRevertConfirm,
        // Copy mode nav
        copyModeNavigateUp,
        copyModeNavigateDown,
        copyModeToggleSelection,
        copyModeExecuteCopy,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    useInput((input, key) => {
        if (bodyView === 'COPY_MODE') {
            if (key.upArrow) copyModeNavigateUp();
            if (key.downArrow) copyModeNavigateDown();
            if (input === ' ') copyModeToggleSelection();
            if (key.return) copyModeExecuteCopy();
            if (key.escape || input.toLowerCase() === 'c') toggleCopyMode();
            return;
        }
        
        if (bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }

        // Main view input
        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
        if (input.toLowerCase() === 'c') {
            toggleCopyMode();
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) handleEnterOrRight();
        if (key.escape || key.leftArrow) handleEscapeOrLeft();
    });

    const copyOptions = [
        { key: 'M', label: 'Git Message' },
        { key: 'P', label: 'Prompt' },
        { key: 'R', label: 'Reasoning' },
        { key: 'A', label: `All Diffs (${files.length} files)` },
        { key: 'F', label: `Diff for: ${files[store.selectedFileIndex]?.path || 'No file selected'}` },
        { key: 'U', label: 'UUID' },
        { key: 'Y', label: 'Full YAML representation' },
    ];

    return {
        ...store,
        copyOptions,
        actions: {
            ...store.actions,
            showDashboardScreen,
        },
    };
};
```

## File: src/services/dashboard.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import { sleep } from '../utils';

const approveAll = async () => {
    // Find pending transactions and mark them as in-progress
    const pendingTxIds: string[] = [];
    useDashboardStore.setState(state => {
        const newTxs = state.transactions.map(tx => {
            if (tx.status === 'PENDING') {
                pendingTxIds.push(tx.id);
                return { ...tx, status: 'IN-PROGRESS' as const };
            }
            return tx;
        });
        return { transactions: newTxs };
    });

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    useDashboardStore.setState(state => {
        const newTxs = state.transactions.map(tx => {
            if (pendingTxIds.includes(tx.id)) {
                return { ...tx, status: 'APPLIED' as const };
            }
            return tx;
        });
        return { transactions: newTxs };
    });
};

export const DashboardService = {
    approveAll,
};
```

## File: src/services/init.service.ts
```typescript
import { useInitStore, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import { sleep } from '../utils';

const runInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    actions.resetInit();

    actions.setPhase('ANALYZE');
    for (const task of initialAnalyzeTasks) {
        actions.updateAnalyzeTask(task.id, 'active');
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    const configTasksUntilInteractive = initialConfigureTasks.slice(0, 2);
    for (const task of configTasksUntilInteractive) {
        actions.updateConfigureTask(task.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(task.id, 'done');
    }
    await sleep(500);

    actions.setPhase('INTERACTIVE');
};

const resumeInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    
    actions.setPhase('CONFIGURE');
    const lastTask = initialConfigureTasks[2];
    if (lastTask) {
        actions.updateConfigureTask(lastTask.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(lastTask.id, 'done');
        await sleep(500);

        actions.setPhase('FINALIZE');
    }
};

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};
```

## File: src/types/app.types.ts
```typescript
export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review' | 'review-processing' | 'git-commit' | 'transaction-detail' | 'transaction-history';
```

## File: src/types/dashboard.types.ts
```typescript
export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
```

## File: src/types/debug.types.ts
```typescript
export interface MenuItem {
    title: string;
    action: () => void;
}
```

## File: src/types/file.types.ts
```typescript
// From transaction-detail.store.ts and transaction-history.store.ts
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileChange {
    id: string;
    path: string;
    type: FileChangeType;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

// From review.store.ts
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';
export interface ReviewFileItem {
    id: string;
    path: string;
    status: FileReviewStatus;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}
```

## File: src/types/init.types.ts
```typescript
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';

export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}
```

## File: src/types/review.types.ts
```typescript
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}

export type ReviewBodyView = 'diff' | 'reasoning' | 'script_output' | 'copy_mode' | 'bulk_repair' | 'confirm_handoff' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';
```

## File: src/types/transaction-detail.types.ts
```typescript
export type NavigatorSection = 'PROMPT' | 'REASONING' | 'FILES';
export type DetailBodyView = 'PROMPT' | 'REASONING' | 'FILES_LIST' | 'DIFF_VIEW' | 'COPY_MODE' | 'REVERT_CONFIRM' | 'NONE';
```

## File: src/types/transaction-history.types.ts
```typescript
export type HistoryViewMode = 'LIST' | 'FILTER' | 'COPY' | 'BULK_ACTIONS';
```

## File: src/types/transaction.types.ts
```typescript
import type { FileChange } from './file.types';

export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'FAILED' | 'REVERTED' | 'IN-PROGRESS' | 'HANDOFF';
export type HistoryTransactionStatus = 'COMMITTED' | 'HANDOFF' | 'REVERTED';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
}

// From transaction-history.store.ts
export interface HistoryTransaction {
    id: string;
    hash: string;
    timestamp: number;
    status: HistoryTransactionStatus;
    message: string;
    files: FileChange[];
    stats: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
```

## File: eslint.config.js
```javascript
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-uses-react': 'off', // Not needed with React 17+ JSX transform
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'off', // Often not needed in Ink components

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'indent': 'off', // Disabled due to stack overflow issues
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'coverage/**',
    ],
  },
];
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

## File: src/hooks/useDebugMenu.tsx
```typescript
import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useInitStore } from '../stores/init.store';
import { useReviewStore } from '../stores/review.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useTransactionHistoryStore } from '../stores/transaction-history.store';
import type { MenuItem } from '../types/debug.types';

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const appActions = useAppStore(s => s.actions);
    const dashboardActions = useDashboardStore(s => s.actions);
    const initActions = useInitStore(s => s.actions);
    const reviewActions = useReviewStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const detailActions = useTransactionDetailStore(s => s.actions);
    const historyActions = useTransactionHistoryStore(s => s.actions);

    const menuItems: MenuItem[] = [
        {
            title: 'Splash Screen',
            action: () => appActions.showSplashScreen(),
        },
        {
            title: 'Init: Analyze Phase',
            action: () => {
                initActions.setPhase('ANALYZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Interactive Phase',
            action: () => {
                initActions.setPhase('INTERACTIVE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Finalize Phase',
            action: () => {
                initActions.setPhase('FINALIZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Dashboard: Listening',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Confirm Approve',
            action: () => {
                dashboardActions.setStatus('CONFIRM_APPROVE');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Approving',
            action: () => {
                dashboardActions.setStatus('APPROVING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                reviewActions.simulateFailureScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.simulateSuccessScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleDiffView();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleReasoningView();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleCopyMode();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                reviewActions.simulateSuccessScenario();
                reviewActions.toggleScriptView();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.showBulkRepair();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.executeBulkRepairOption(3); // Option 3 is Handoff
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => appActions.showReviewProcessingScreen(),
        },
        {
            title: 'Git Commit Screen',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            },
        },
        {
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                detailActions.loadTransaction('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Transaction History Screen',
            action: () => {
                historyActions.load();
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L1 Drilldown',
            action: () => {
                historyActions.prepareDebugState('l1-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Diff)',
            action: () => {
                historyActions.prepareDebugState('l2-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Filter Mode',
            action: () => {
                historyActions.prepareDebugState('filter');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Copy Mode',
            action: () => {
                historyActions.prepareDebugState('copy');
                appActions.showTransactionHistoryScreen();
            },
        },
    ];

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => Math.max(0, i - 1));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => Math.min(menuItems.length - 1, i + 1));
            return;
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                appActions.toggleDebugMenu();
            }
            return;
        }
        if (key.escape || (key.ctrl && input === 'b')) {
            appActions.toggleDebugMenu();
            return;
        }

        // No ctrl/meta keys for selection shortcuts, and only single characters
        if (key.ctrl || key.meta || input.length !== 1) return;

        if (input >= '1' && input <= '9') {
            const targetIndex = parseInt(input, 10) - 1;
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        } else if (input.toLowerCase() >= 'a' && input.toLowerCase() <= 'z') {
            const targetIndex = 9 + (input.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        }
    });

    return {
        selectedIndex,
        menuItems,
    };
};
```

## File: src/hooks/useInitializationScreen.tsx
```typescript
import React, { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { InitService } from '../services/init.service';

export const useInitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const actions = useInitStore(s => s.actions);
    const showDashboardScreen = useAppStore(s => s.actions.showDashboardScreen);
    const { exit } = useApp();

    useInput((input, key) => {
        if (phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (phase === 'FINALIZE') {
            if (input.toLowerCase() === 'q') {
                exit();
            } else if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
        }
    });

    useEffect(() => {
        InitService.runInitializationProcess();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            InitService.resumeInitializationProcess();
        }
    }, [interactiveChoice, phase]);

    const {
        analyzeTasks,
        configureTasks,
        projectId,
    } = useInitStore();

    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    };
};
```

## File: src/hooks/useTransactionHistoryScreen.tsx
```typescript
import { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import { useTransactionHistoryStore, getVisibleItemPaths } from '../stores/transaction-history.store';
import { useAppStore } from '../stores/app.store';
import { useStdoutDimensions } from '../utils';

export const useTransactionHistoryScreen = () => {
    const [, rows] = useStdoutDimensions();
    const store = useTransactionHistoryStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const [viewOffset, setViewOffset] = useState(0);
    
    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(store.transactions, store.expandedIds),
        [store.transactions, store.expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(store.selectedItemPath);

    const NON_CONTENT_HEIGHT = 8; // Header, filter, separators, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_CONTENT_HEIGHT);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);
    
    useInput((input, key) => {
        if (store.mode === 'FILTER') {
            if (key.escape) store.actions.setMode('LIST');
            if (key.return) store.actions.applyFilter();
            return;
        }
        if (store.mode === 'COPY') {
            if (key.escape || input.toLowerCase() === 'c') store.actions.setMode('LIST');
            if (key.return) store.actions.executeCopy();
            if (input.toLowerCase() === 'm') store.actions.toggleCopySelection('Git Messages');
            if (input.toLowerCase() === 'r') store.actions.toggleCopySelection('Reasonings');
            // Add other toggles here if needed for other copyFields
            return;
        }
        if (store.mode === 'BULK_ACTIONS') {
            if (key.escape) store.actions.setMode('LIST');
            // Add number handlers...
            return;
        }

        // LIST mode inputs
        if (key.upArrow) store.actions.navigateUp();
        if (key.downArrow) store.actions.navigateDown();
        if (key.rightArrow) store.actions.expandOrDrillDown();
        if (key.leftArrow) store.actions.collapseOrBubbleUp();
        if (input === ' ') store.actions.toggleSelection();

        if (input.toLowerCase() === 'f') store.actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && store.selectedForAction.size > 0) store.actions.setMode('COPY');
        if (input.toLowerCase() === 'b' && store.selectedForAction.size > 0) store.actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => store.transactions.filter(tx => txIdsInView.has(tx.id)),
        [store.transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatus = store.filterQuery ? store.filterQuery : '(none)';
    const showingStatus = `Showing ${viewOffset + 1}-${viewOffset + itemsInView.length} of ${visibleItemPaths.length} items`;
    
    const copyFields = [
        { key: 'M', name: 'Git Messages' }, { key: 'P', name: 'Prompts' }, { key: 'R', name: 'Reasonings' },
        { key: 'D', name: 'Diffs' }, { key: 'U', name: 'UUIDs' }, { key: 'Y', name: 'Full YAML' },
    ];

    return {
        store,
        viewOffset,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
        
        // For CopyMode sub-component
        selectedFields: store.copyModeSelections,
        copyFields,
    };
};
```

## File: src/services/commit.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import type { Transaction } from '../types/transaction.types';
import { sleep } from '../utils';

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
    // For simulation, we'll just update the dashboard store.
    const { updateTransactionStatus } = useDashboardStore.getState().actions;

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
```

## File: src/services/review.service.ts
```typescript
import { useReviewStore } from '../stores/review.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyStep } from '../types/review.types';
import type { ReviewFileItem } from '../types/file.types';

const generateBulkRepairPrompt = (files: ReviewFileItem[]): string => {
    const failedFiles = files.filter(f => f.status === 'FAILED');
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: ${file.error}

ORIGINAL CONTENT:
---
// ... original content of ${file.path} ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff ...'}
---
`).join('\n')}

Please analyze all failed files and provide a complete, corrected response.`;
};

const generateHandoffPrompt = (
    hash: string,
    message: string,
    reasoning: string,
    files: ReviewFileItem[],
): string => {
    const successfulFiles = files.filter(f => f.status === 'APPROVED');
    const failedFiles = files.filter(f => f.status === 'FAILED');

    return `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${message}
Reasoning:
${reasoning}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${f.error})`).join('\n')}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.`;
};

const performHandoff = (hash: string) => {
    // This is a bit of a hack to find the right transaction to update in the demo
    const txToUpdate = useDashboardStore.getState().transactions.find(tx => tx.hash === hash);
    if (txToUpdate) {
        useDashboardStore.getState().actions.updateTransactionStatus(txToUpdate.id, 'HANDOFF');
    }

    useAppStore.getState().actions.showDashboardScreen();
};

const runApplySimulation = async (scenario: 'success' | 'failure') => {
    const { actions } = useReviewStore.getState();
    const { _updateApplyStep, _addApplySubstep, simulateSuccessScenario, simulateFailureScenario } = actions;

    if (scenario === 'success') {
        simulateSuccessScenario();
        
        _updateApplyStep('snapshot', 'active'); await sleep(100);
        _updateApplyStep('snapshot', 'done', 0.1);

        _updateApplyStep('memory', 'active'); await sleep(100);
        _addApplySubstep('memory', { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' });
        await sleep(100);
        _addApplySubstep('memory', { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' });
        _updateApplyStep('memory', 'done', 0.3);

        _updateApplyStep('post-command', 'active'); await sleep(1300);
        _addApplySubstep('post-command', { id: 's3', title: '`bun run test` ... Passed', status: 'done' });
        _updateApplyStep('post-command', 'done', 2.3);

        _updateApplyStep('linter', 'active'); await sleep(1200);
        _addApplySubstep('linter', { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' });
        _updateApplyStep('linter', 'done', 1.2);

        await sleep(500);

    } else { // failure scenario
        simulateFailureScenario();
        
        _updateApplyStep('snapshot', 'active'); await sleep(100);
        _updateApplyStep('snapshot', 'done', 0.1);

        _updateApplyStep('memory', 'active'); await sleep(100);
        _addApplySubstep('memory', { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' });
        await sleep(100);
        _addApplySubstep('memory', { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' });
        await sleep(100);
        _addApplySubstep('memory', { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' });
        _updateApplyStep('memory', 'done', 0.5);

        await sleep(100);
        _updateApplyStep('post-command', 'skipped', undefined, 'Skipped due to patch application failure');
        await sleep(100);
        _updateApplyStep('linter', 'skipped', undefined, 'Skipped due to patch application failure');
        
        await sleep(500);
    }
};

const generateSingleFileRepairPrompt = (file: ReviewFileItem): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${file.error}
Strategy: ${file.strategy}

ORIGINAL CONTENT:
---
// ... original file content would be here ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff would be here ...'}
---

Please provide a corrected patch that addresses the error.`;
};

const tryRepairFile = (file: ReviewFileItem, selectedIndex: number): void => {
    const repairPrompt = generateSingleFileRepairPrompt(file);
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

    // Mock: Update file status to show it's being repaired
    useReviewStore.setState(state => {
        const newFiles = [...state.files];
        newFiles[selectedIndex] = { ...file, status: 'APPROVED' as const, error: undefined, linesAdded: 5, linesRemoved: 2 };
        return { files: newFiles, copyModeLastCopied: 'Repair prompt copied to clipboard' };
    });
};

const runBulkReapply = async (): Promise<void> => {
    const { files } = useReviewStore.getState();
    const failedFileIds = new Set(files.filter(f => f.status === 'FAILED').map(f => f.id));
    if (failedFileIds.size === 0) {
        return;
    }

    useReviewStore.setState(state => ({
        files: state.files.map(file =>
            failedFileIds.has(file.id)
                ? { ...file, status: 'RE_APPLYING' as const }
                : file,
        ),
    }));

    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    useReviewStore.setState(state => ({
        files: state.files.map(file => {
            if (failedFileIds.has(file.id)) {
                if (first) {
                    first = false;
                    return { ...file, status: 'APPROVED' as const, strategy: 'replace' as const, error: undefined, linesAdded: 9, linesRemoved: 2 };
                }
                return { ...file, status: 'FAILED' as const, error: "'replace' failed: markers not found" };
            }
            return file;
        }),
    }));
};

export const ReviewService = {
    generateBulkRepairPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    runBulkReapply,
};
```

## File: src/services/transaction.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import { createMockHistoryTransactions } from '../data/mocks';
import type { HistoryTransaction, HistoryTransactionStatus } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';

const revertTransaction = (transactionId: string) => {
    const { updateTransactionStatus } = useDashboardStore.getState().actions;
    updateTransactionStatus(transactionId, 'REVERTED');
};

export const TransactionService = {
    revertTransaction,
    createMockTransactions: createMockHistoryTransactions,
};
```

## File: src/utils.ts
```typescript
import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState({ columns: 80, rows: 24 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            });
        };

        updateDimensions();
        process.stdout.on('resize', updateDimensions);

        return () => {
            process.stdout.off('resize', updateDimensions);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};
```

## File: src/stores/commit.store.ts
```typescript
import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import type { Transaction } from '../types/transaction.types';
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
```

## File: src/stores/init.store.ts
```typescript
import { create } from 'zustand';
import type { Task, TaskStatus, InitPhase, GitignoreChoice } from '../types/init.types';

// Initial State definitions from README
export const initialAnalyzeTasks: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

export const initialConfigureTasks: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];

// Store Interface
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (_phase: InitPhase) => void;
        updateAnalyzeTask: (_id: string, _status: TaskStatus) => void;
        setAnalysisResults: (_projectId: string, _gitignoreFound: boolean) => void;
        updateConfigureTask: (_id: string, _status: TaskStatus) => void;
        setInteractiveChoice: (_choice: GitignoreChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: initialAnalyzeTasks,
    projectId: null,
    gitignoreFound: null,
    configureTasks: initialConfigureTasks,
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setInteractiveChoice: (choice) => set({ interactiveChoice: choice }),
        resetInit: () => set({
            phase: 'ANALYZE',
            analyzeTasks: JSON.parse(JSON.stringify(initialAnalyzeTasks)),
            projectId: null,
            gitignoreFound: null,
            configureTasks: JSON.parse(JSON.stringify(initialConfigureTasks)),
            interactiveChoice: null,
        }),
    },
}));
```

## File: src/stores/transaction-detail.store.ts
```typescript
import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import { TransactionService } from '../services/transaction.service';
import { mockDetailedTransactionData } from '../data/mocks';
import type { Transaction } from '../types/transaction.types';
import type { FileChange as FileDetail } from '../types/file.types';
import type { NavigatorSection, DetailBodyView } from '../types/transaction-detail.types';

interface TransactionDetailState {
    // Data
    transaction: Transaction | null;
    prompt: string;
    reasoning: string;
    files: FileDetail[];

    // UI State
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: DetailBodyView;
    copyModeSelectionIndex: number;
    copyModeSelections: Record<string, boolean>;
    copyModeLastCopied: string | null;

    // Actions
    actions: {
        loadTransaction: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleCopyMode: () => void;
        toggleRevertConfirm: () => void;
        copyModeNavigateUp: () => void;
        copyModeNavigateDown: () => void;
        copyModeToggleSelection: () => void;
        copyModeExecuteCopy: () => void;
        confirmRevert: () => void;
    }
}

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
const copyOptionsList = [
    'Git Message', 'Prompt', 'Reasoning', `All Diffs (${mockDetailedTransactionData.files.length} files)`, `Diff for: ${mockDetailedTransactionData.files[0]?.path}`, 'UUID', 'Full YAML representation',
];

export const useTransactionDetailStore = create<TransactionDetailState>((set, get) => ({
    transaction: null,
    prompt: '',
    reasoning: '',
    files: [],

    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',
    copyModeSelectionIndex: 0,
    copyModeSelections: { 'Git Message': true, 'Reasoning': true }, // Default selections from readme
    copyModeLastCopied: null,

    actions: {
        loadTransaction: (transactionId) => {
            const { transactions } = useDashboardStore.getState();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                set({
                    transaction,
                    ...mockDetailedTransactionData,
                    // Reset UI state
                    navigatorFocus: 'PROMPT',
                    expandedSection: null,
                    selectedFileIndex: 0,
                    bodyView: 'NONE',
                });
            }
        },
        navigateUp: () => {
            const { navigatorFocus, selectedFileIndex } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.max(0, selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ navigatorFocus: navigatorOrder[currentIndex - 1] });
                }
            }
        },
        navigateDown: () => {
            const { navigatorFocus, selectedFileIndex, files } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.min(files.length - 1, selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ navigatorFocus: navigatorOrder[currentIndex + 1] });
                }
            }
        },
        handleEnterOrRight: () => {
            const { navigatorFocus, expandedSection } = get();

            if (navigatorFocus === 'FILES_LIST') {
                // Already in file list, now show diff
                set({ bodyView: 'DIFF_VIEW' });
                return;
            }

            if (expandedSection === navigatorFocus) {
                // Section is already expanded, handle nested navigation
                if (navigatorFocus === 'FILES') {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: 'FILES_LIST' });
                }
                return;
            }

            // Expand the focused section
            set({ expandedSection: navigatorFocus });

            switch(navigatorFocus) {
                case 'PROMPT':
                    set({ bodyView: 'PROMPT' });
                    break;
                case 'REASONING':
                    set({ bodyView: 'REASONING' });
                    break;
                case 'FILES':
                    set({ bodyView: 'FILES_LIST' });
                    break;
            }
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();

            if (bodyView === 'DIFF_VIEW') {
                set({ bodyView: 'FILES_LIST' }); // Go back from diff to file list
                return;
            }

            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: 'FILES', bodyView: 'NONE' }); // Go back from file list to files section
                return;
            }

            // If a section is expanded, collapse it
            if (expandedSection) {
                set({ expandedSection: null, bodyView: 'NONE' });
                return;
            }
        },
        toggleCopyMode: () => set(state => {
            if (state.bodyView === 'COPY_MODE') {
                return { bodyView: 'NONE' };
            }
            return {
                bodyView: 'COPY_MODE',
                copyModeSelectionIndex: 0,
                copyModeLastCopied: null,
            };
        }),
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        copyModeNavigateUp: () => set(state => ({
            copyModeSelectionIndex: Math.max(0, state.copyModeSelectionIndex - 1),
        })),
        copyModeNavigateDown: () => set(state => ({
            copyModeSelectionIndex: Math.min(copyOptionsList.length - 1, state.copyModeSelectionIndex + 1),
        })),
        copyModeToggleSelection: () => set(state => {
            const currentOption = copyOptionsList[state.copyModeSelectionIndex];
            if (!currentOption) return {};

            const newSelections = { ...state.copyModeSelections };
            newSelections[currentOption] = !newSelections[currentOption];
            return { copyModeSelections: newSelections };
        }),
        copyModeExecuteCopy: () => {
            // Mock copy to clipboard
            const { copyModeSelections } = get();
            const selectedItems = Object.keys(copyModeSelections).filter(key => copyModeSelections[key]);
            const message = `Copied ${selectedItems.length} items to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Mock copy: ${selectedItems.join(', ')}`);
            set({ copyModeLastCopied: message });
        },
        confirmRevert: () => {
            const { transaction } = get();
            if (!transaction) return;
            TransactionService.revertTransaction(transaction.id);
            set({ bodyView: 'NONE' });
        },
    },
}));
```

## File: src/stores/transaction-history.store.ts
```typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { HistoryTransaction } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';
import type { HistoryViewMode } from '../types/transaction-history.types';

// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<TransactionHistoryState, 'actions'>;

interface TransactionHistoryState {
    transactions: HistoryTransaction[];
    mode: HistoryViewMode;
    selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    expandedIds: Set<string>; // holds ids of expanded items
    filterQuery: string;
    selectedForAction: Set<string>; // set of transaction IDs
    copyModeSelections: Set<string>;
    lastCopiedMessage: string | null;

    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        toggleCopySelection: (field: string) => void;
        executeCopy: () => void;
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    }
}

export const getVisibleItemPaths = (transactions: HistoryTransaction[], expandedIds: Set<string>): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id)) {
            for (const file of tx.files) {
                paths.push(`${tx.id}/${file.id}`);
            }
        }
    }
    return paths;
};

// --- Store ---
export const useTransactionHistoryStore = create<TransactionHistoryState>((set, get) => ({
    transactions: [],
    mode: 'LIST',
    selectedItemPath: 'tx-0',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    copyModeSelections: new Set(['Git Messages', 'Reasonings']),
    lastCopiedMessage: null,

    actions: {
        load: (initialState) => {
            const transactions = TransactionService.createMockTransactions();
            set({
                transactions,
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                copyModeSelections: new Set(['Git Messages', 'Reasonings']),
                lastCopiedMessage: null,
                ...initialState,
            });
        },
        navigateUp: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex > 0) {
                set({ selectedItemPath: visibleItems[currentIndex - 1] });
            }
        },
        navigateDown: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ selectedItemPath: visibleItems[currentIndex + 1] });
            }
        },
        expandOrDrillDown: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (!newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.add(selectedItemPath);
            }
            return { expandedIds: newExpandedIds };
        }),
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                // If it's expanded, collapse it
                newExpandedIds.delete(selectedItemPath);
                
                // Also collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }

                return { expandedIds: newExpandedIds };
            } else if (selectedItemPath.includes('/')) {
                // If it's a file, move selection to parent transaction
                const parentId = selectedItemPath.split('/')[0];
                return { selectedItemPath: parentId || '' };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = selectedItemPath.split('/')[0];
            if (!txId) return {};

            const newSelection = new Set(selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { selectedForAction: newSelection };
        }),
        setMode: (mode) => set({ mode, lastCopiedMessage: null }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            // In a real app, this would filter `transactions`.
            // For the demo, we just go back to LIST mode.
            set({ mode: 'LIST' });
        },
        toggleCopySelection: (field) => set(state => {
            const newSelections = new Set(state.copyModeSelections);
            if (newSelections.has(field)) {
                newSelections.delete(field);
            } else {
                newSelections.add(field);
            }
            return { copyModeSelections: newSelections };
        }),
        executeCopy: () => {
             // Mock copy
            const { selectedForAction, copyModeSelections } = get();
            const message = `Copied ${Array.from(copyModeSelections).join(' & ')} from ${selectedForAction.size} transactions to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD MOCK] ${message}`);
            set({ lastCopiedMessage: message });
        },
        prepareDebugState: (stateName) => {
            switch (stateName) {
                case 'l1-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0']), selectedItemPath: 'tx-0' });
                    break;
                case 'l2-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0', 'tx-0/0-1']), selectedItemPath: 'tx-0/0-1' });
                    break;
                case 'filter':
                    get().actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:committed' });
                    break;
                case 'copy':
                    get().actions.load({
                        mode: 'COPY',
                        selectedForAction: new Set(['tx-0', 'tx-2']),
                        copyModeSelections: new Set(['Git Messages', 'Diffs', 'UUIDs']),
                    });
                    break;
                case 'bulk':
                    get().actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
            }
        },
    },
}));
```

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useCommitStore } from './src/stores/commit.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionDetailStore } from './src/stores/transaction-detail.store';
import { useTransactionHistoryStore } from './src/stores/transaction-history.store';

const main = () => {
    const args = process.argv.slice(2);

    if (args[0] === 'debug-screen' && args[1]) {
        const screenName = args[1].replace(/\.tsx$/, '');
        const { actions: appActions } = useAppStore.getState();

        switch (screenName) {
            case 'DashboardScreen':
                appActions.showDashboardScreen();
                break;
            case 'GitCommitScreen':
                useCommitStore.getState().actions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                break;
            case 'ReviewProcessingScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useTransactionDetailStore.getState().actions.loadTransaction('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useTransactionHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
```

## File: package.json
```json
{
  "name": "relaycode-tui",
  "module": "index.tsx",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "bun run index.tsx",
    "dev": "bun run --watch index.tsx",
    "debug-screen": "bun run index.tsx debug-screen",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "clipboardy": "^4.0.0",
    "ink": "^6.3.1",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "react": "^19.1.1",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.19.17",
    "@types/react": "^18.3.24",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "typescript": "^5.9.2"
  }
}
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/app.types';

interface AppState {
    isDebugMenuOpen: boolean;
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        toggleDebugMenu: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    isDebugMenuOpen: false,
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showGitCommitScreen: () => set({ currentScreen: 'git-commit' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        showTransactionHistoryScreen: () => set({ currentScreen: 'transaction-history' }),
        showTransactionDetailScreen: () => set({ currentScreen: 'transaction-detail' }),
        toggleDebugMenu: () => set(state => ({ isDebugMenuOpen: !state.isDebugMenuOpen })),
    },
}));
```

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { createDashboardTransactions } from '../data/mocks';
import type { Transaction, TransactionStatus } from '../types/transaction.types';
import type { DashboardStatus } from '../types/dashboard.types';

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    transactions: Transaction[];
    selectedTransactionIndex: number;
    showHelp: boolean;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: createDashboardTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
        setStatus: (status) => set({ status }),
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
            // After updating, move selection to the updated transaction
            const index = get().transactions.findIndex(tx => tx.id === id);
            if (index !== -1) set({ selectedTransactionIndex: index });
        },

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                await DashboardService.approveAll();

                set({ status: previousStatus });
            }
        },
    },
}));
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { useDashboardStore } from './dashboard.store';
import { ReviewService } from '../services/review.service';
import { mockReviewFiles, mockReviewScripts, mockReviewReasoning } from '../data/mocks';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult, ApplyStep, ReviewBodyView, PatchStatus } from '../types/review.types';

export const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

interface ReviewState {
    // Transaction Info
    hash: string;
    message: string;
    prompt: string;
    reasoning: string;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
    patchStatus: PatchStatus;

    // File & Script Info
    files: ReviewFileItem[];
    scripts: ScriptResult[];

    // UI State
    applySteps: ApplyStep[];
    selectedItemIndex: number; // Can be file or script
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;

    // Copy Mode State
    copyModeSelectedIndex: number;
    copyModeLastCopied: string | null;

    // Reasoning Scroll State
    reasoningScrollIndex: number;

    // Script Navigation State
    scriptErrorIndex: number;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        toggleDiffView: () => void;
        toggleReasoningView: () => void;
        toggleScriptView: () => void;
        expandDiff: () => void;
        approve: () => void;
        simulateSuccessScenario: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        simulateFailureScenario: () => void;

        // Copy Mode Actions
        toggleCopyMode: () => void;
        moveCopySelectionUp: () => void;
        moveCopySelectionDown: () => void;
        copySelectedItem: () => void;
        copyUUID: () => void;
        copyMessage: () => void;
        copyPrompt: () => void;
        copyReasoning: () => void;
        copyFileDiff: () => void;
        copyAllDiffs: () => void;

        // Repair Actions
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;

        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void,

        // "Private" actions for service layer
        _updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        _addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
    };
}

// --- Store Implementation ---

export const useReviewStore = create<ReviewState>((set, get) => ({
    // Transaction Info
    hash: 'e4a7c112',
    message: 'refactor: rename core utility function',
    prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
    reasoning: mockReviewReasoning,
    linesAdded: 18,
    linesRemoved: 5,
    duration: 0.6,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockReviewFiles,
    scripts: [], // Empty for partial failure scenario

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none' as const,
    isDiffExpanded: false,

    // Copy Mode State
    copyModeSelectedIndex: 0,
    copyModeLastCopied: null,

    // Reasoning Scroll State
    reasoningScrollIndex: 0,

    // Script Navigation State
    scriptErrorIndex: 0,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: Math.max(0, state.selectedItemIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: Math.min(state.files.length + state.scripts.length - 1, state.selectedItemIndex + 1),
        })),
        toggleFileApproval: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex >= files.length) return {}; // Not a file

            const newFiles = [...files];
            const file = newFiles[selectedItemIndex];
            if (file) {
                if (file.status === 'APPROVED') {
                    file.status = 'REJECTED';
                } else if (file.status === 'REJECTED') {
                    file.status = 'APPROVED';
                }
            }
            return { files: newFiles };
        }),
        rejectAllFiles: () => set(state => {
            const newFiles = state.files.map(file => {
                if (file.status === 'APPROVED') {
                    return { ...file, status: 'REJECTED' as const };
                }
                return file;
            });
            return { files: newFiles };
        }),
        toggleDiffView: () => set(state => {
            const { bodyView } = state;
            if (state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: bodyView === 'diff' ? 'none' : 'diff',
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        toggleReasoningView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'reasoning' ? 'none' : 'reasoning',
            };
        }),
        toggleScriptView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'script_output' ? 'none' : 'script_output',
            };
        }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;

            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();

            await ReviewService.runApplySimulation(scenario);

            showReviewScreen();
        },
        simulateSuccessScenario: () => set(() => ({
            hash: '4b9d8f03',
            message: 'refactor: simplify clipboard logic',
            prompt: 'Simplify the clipboard logic using an external library...',
            linesAdded: 22,
            linesRemoved: 11,
            duration: 3.9,
            patchStatus: 'SUCCESS' as const,
            files: [
                {
                    id: '1',
                    path: 'src/core/clipboard.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 15,
                    linesRemoved: 8,
                    diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';`,
                    strategy: 'replace' as const,
                },
                {
                    id: '2',
                    path: 'src/utils/shell.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 7,
                    linesRemoved: 3,
                    diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts`,
                    strategy: 'standard-diff' as const,
                },
            ],
            scripts: mockReviewScripts,
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        })),
        simulateFailureScenario: () => set(() => ({
            hash: 'e4a7c112',
            message: 'refactor: rename core utility function',
            prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
            linesAdded: 18,
            linesRemoved: 5,
            duration: 0.6,
            patchStatus: 'PARTIAL_FAILURE' as const,
            files: mockReviewFiles,
            scripts: [],
            // Reset UI state
            bodyView: 'none',
            isDiffExpanded: false,
            reasoningScrollIndex: 0,
            scriptErrorIndex: 0,
            selectedItemIndex: 0,
        })),

        // Copy Mode Actions
        toggleCopyMode: () => set(state => ({
            bodyView: state.bodyView === 'copy_mode' ? 'none' as const : 'copy_mode' as const,
            copyModeSelectedIndex: 0,
            copyModeLastCopied: null,
        })),
        moveCopySelectionUp: () => set(state => ({
            copyModeSelectedIndex: Math.max(0, state.copyModeSelectedIndex - 1),
        })),
        moveCopySelectionDown: () => set(state => ({
            copyModeSelectedIndex: Math.min(5, state.copyModeSelectedIndex + 1), // 6 total options (U,M,P,R,F,A)
        })),
        copySelectedItem: () => set(state => {
            const { copyModeSelectedIndex, hash, message, prompt, reasoning, files, selectedItemIndex } = state;
            let content = '';
            let label = '';

            switch (copyModeSelectedIndex) {
                case 0: // UUID
                    content = `${hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
                    label = 'UUID';
                    break;
                case 1: // Git Message
                    content = message;
                    label = 'Git Message';
                    break;
                case 2: // Prompt
                    content = prompt;
                    label = 'Prompt';
                    break;
                case 3: // Reasoning
                    content = reasoning;
                    label = 'Reasoning';
                    break;
                case 4: // Diff for current file
                    if (selectedItemIndex < files.length) {
                        const file = files[selectedItemIndex];
                        if (file) {
                            content = file.diff;
                            label = `Diff for ${file.path}`;
                        }
                    }
                    break;
                case 5: // All Diffs
                    content = files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
                    label = 'All Diffs';
                    break;
            }

            // Mock clipboard operation (TUI environment - no real clipboard)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied ${label}: ${content.substring(0, 100)}...`);

            return { copyModeLastCopied: label };
        }),
        copyUUID: () => set(state => {
            const content = `${state.hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied UUID: ${content}`);
            return { copyModeLastCopied: 'UUID' };
        }),
        copyMessage: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Git Message: ${state.message}`);
            return { copyModeLastCopied: 'Git Message' };
        }),
        copyPrompt: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Prompt: ${state.prompt.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Prompt' };
        }),
        copyReasoning: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Reasoning: ${state.reasoning.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Reasoning' };
        }),
        copyFileDiff: () => set(state => {
            if (state.selectedItemIndex < state.files.length) {
                const file = state.files[state.selectedItemIndex];
                if (file) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied diff for: ${file.path}`);
                    return { copyModeLastCopied: `Diff for ${file.path}` };
                }
            }
            return {};
        }),
        copyAllDiffs: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied all diffs: ${state.files.length} files`);
            return { copyModeLastCopied: 'All Diffs' };
        }),

        // Repair Actions
        tryRepairFile: () => {
            const { selectedItemIndex, files } = get();
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    ReviewService.tryRepairFile(file, selectedItemIndex);
                }
            }
        },
        showBulkRepair: () => set(() => ({
            bodyView: 'bulk_repair' as const,
        })),
        executeBulkRepairOption: async (option: number) => {
            const { files } = get();

            switch (option) {
                case 1: { // Generate & Copy Bulk Repair Prompt
                    const bulkPrompt = ReviewService.generateBulkRepairPrompt(files);
                    const failedFiles = files.filter(f => f.status === 'FAILED');
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files.`);
                    // In a real app, this would use clipboardy.writeSync(bulkPrompt),
                    set({ bodyView: 'none' as const, copyModeLastCopied: 'Bulk repair prompt copied.' });
                    break;
                }

                case 2: { // Attempt Bulk Re-apply
                    set({ bodyView: 'none' as const });
                    await ReviewService.runBulkReapply();
                    break;
                }

                case 3: { // Handoff to Human
                    set({ bodyView: 'confirm_handoff' as const });
                    break;
                }

                case 4: { // Reject All Failed
                    set(state => ({
                        files: state.files.map(file =>
                            file.status === 'FAILED'
                                ? { ...file, status: 'REJECTED' as const }
                                : file,
                        ),
                        bodyView: 'none' as const,
                    }));
                    break;
                }

                default: // Close modal
                    set({ bodyView: 'none' as const });
            }
        },
        confirmHandoff: () => {
            const { hash, message, reasoning, files } = get();
            const handoffPrompt = ReviewService.generateHandoffPrompt(hash, message, reasoning, files);

            // eslint-disable-next-line no-console
            console.log('[CLIPBOARD] Copied Handoff Prompt.'); // In real app: clipboardy.writeSync(handoffPrompt)
            ReviewService.performHandoff(hash);
        },

        // Navigation Actions
        scrollReasoningUp: () => set(state => ({
            reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1),
        })),
        scrollReasoningDown: () => set(state => {
            const maxLines = state.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({
            scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1),
        })),
        navigateScriptErrorDown: () => set(state => {
            const selectedScript = state.scripts[state.selectedItemIndex - state.files.length];
            if (selectedScript && selectedScript.output) {
                const errorLines = selectedScript.output.split('\n').filter(line =>
                    line.includes('Error') || line.includes('Warning'),
                );
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),

        // "Private" actions for service layer
        _updateApplyStep: (id, status, duration, details) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep = { ...s, status };
                        if (duration !== undefined) newStep.duration = duration;
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                }),
            }));
        },
        _addApplySubstep: (parentId, substep) => {
             set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
    },
}));
```

## File: src/App.tsx
```typescript
import React, { useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import GitCommitScreen from './components/GitCommitScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import DebugMenu from './components/DebugMenu';

const App = () => {
    const { currentScreen, isDebugMenuOpen, actions } = useAppStore(state => ({
        currentScreen: state.currentScreen,
        isDebugMenuOpen: state.isDebugMenuOpen,
        actions: state.actions,
    }));

    useInput((input, key) => {
        if (key.ctrl && input === 'b') {
            actions.toggleDebugMenu();
        }
    });

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen, isDebugMenuOpen]);

    if (isDebugMenuOpen) {
        return <DebugMenu />;
    }
    
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    if (currentScreen === 'dashboard') {
        return <DashboardScreen />;
    }

    if (currentScreen === 'review') {
        return <ReviewScreen />;
    }

    if (currentScreen === 'review-processing') {
        return <ReviewProcessingScreen />;
    }

    if (currentScreen === 'git-commit') {
        return <GitCommitScreen />;
    }

    if (currentScreen === 'transaction-detail') {
        return <TransactionDetailScreen />;
    }

    if (currentScreen === 'transaction-history') {
        return <TransactionHistoryScreen />;
    }

    return null;
};

export default App;
```
