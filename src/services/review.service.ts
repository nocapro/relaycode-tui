import { useReviewStore, type ReviewFileItem } from '../stores/review.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyStep } from '../types/review.types';

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
    const txToUpdate = useTransactionStore.getState().transactions.find(tx => tx.hash === hash);
    if (txToUpdate) {
        useTransactionStore.getState().actions.updateTransactionStatus(txToUpdate.id, 'HANDOFF');
    }

    useAppStore.getState().actions.showDashboardScreen();
};

const runApplySimulation = async (scenario: 'success' | 'failure') => {
    const { actions } = useReviewStore.getState();
    const { _updateApplyStep, _addApplySubstep } = actions;

    if (scenario === 'success') {
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

const loadTransactionForReview = (transactionId: string) => {
    useReviewStore.getState().actions.load(transactionId);
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
    loadTransactionForReview,
    generateBulkRepairPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    runBulkReapply,
};