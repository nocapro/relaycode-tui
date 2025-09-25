import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyUpdate, PatchStatus } from '../stores/review.store';
import type { Transaction, FileItem, FileReviewStatus } from '../types/domain.types';

const generateBulkRepairPrompt = (failedFiles: FileItem[]): string => {
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: Hunk #1 failed to apply // This is a mock error

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
    transaction: Transaction,
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>,
): string => {
    const successfulFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
    const failedFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'FAILED');

    return `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${transaction.hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${transaction.message}
Reasoning:
${transaction.reasoning || ''}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${fileReviewStates.get(f.id)?.error})`).join('\n')}

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

async function* runApplySimulation(scenario: 'success' | 'failure'): AsyncGenerator<ApplyUpdate> {
    if (scenario === 'success') {
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(1300);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done', duration: 2.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done', duration: 1.2 } };

        await sleep(500);

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.5 } };

        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped due to patch application failure' } };
        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to patch application failure' } };

        await sleep(500);
    }
}

const prepareTransactionForReview = (transaction: Transaction): {
    patchStatus: PatchStatus;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;
} => {
    // This simulates the backend determining which files failed or succeeded and sets it ONCE on load.
    // For this demo, tx '1' is the failure case, any other is success.
    const isFailureCase = transaction.id === '1';
    const fileReviewStates = new Map<string, { status: FileReviewStatus; error?: string }>();

    (transaction.files || []).forEach((file, index) => {
        if (isFailureCase) {
            const isFailedFile = index > 0;
            const status = isFailedFile ? 'FAILED' : 'APPROVED';
            const error = isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined;
            fileReviewStates.set(file.id, { status, error });
        } else {
            fileReviewStates.set(file.id, { status: 'APPROVED' });
        }
    });
    return { patchStatus: isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS', fileReviewStates };
};

const generateSingleFileRepairPrompt = (file: FileItem, error?: string): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${error || 'Unknown error'}
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

const tryRepairFile = (file: FileItem, error?: string): FileItem => {
    const repairPrompt = generateSingleFileRepairPrompt(file, error);
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

    return file;
};

const runBulkReapply = async (failedFiles: FileItem[]): Promise<{ id: string; status: FileReviewStatus; error?: string }[]> => {
    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    return failedFiles.map(file => {
        if (first) {
            first = false;
            return { id: file.id, status: 'APPROVED' as const };
        } else {
            return {
                id: file.id,
                status: 'FAILED' as const,
                error: "'replace' failed: markers not found",
            };
        }
    });
};

export const ReviewService = {
    prepareTransactionForReview,
    generateBulkRepairPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    runBulkReapply,
};