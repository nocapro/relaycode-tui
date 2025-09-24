import { useReviewStore } from '../stores/review.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyStep, ApplyUpdate, ReviewBodyView } from '../types/view.types';
import type { FileItem } from '../types/domain.types';

const generateBulkRepairPrompt = (files: FileItem[]): string => {
    const failedFiles = files.filter(f => f.reviewStatus === 'FAILED');
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: ${file.reviewError}

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
    files: FileItem[],
): string => {
    const successfulFiles = files.filter(f => f.reviewStatus === 'APPROVED');
    const failedFiles = files.filter(f => f.reviewStatus === 'FAILED');

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
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${f.reviewError})`).join('\n')}

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

const loadTransactionForReview = (transactionId: string, initialState?: { bodyView: ReviewBodyView }) => {
    useReviewStore.getState().actions.load(transactionId, initialState);
};

const generateSingleFileRepairPrompt = (file: FileItem): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${file.reviewError}
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

const tryRepairFile = (file: FileItem): FileItem => {
    const repairPrompt = generateSingleFileRepairPrompt(file);
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

    // Mock: return the updated file
    return { ...file, reviewStatus: 'APPROVED' as const, reviewError: undefined, linesAdded: 5, linesRemoved: 2 };
};

const runBulkReapply = async (files: FileItem[]): Promise<FileItem[]> => {
    const failedFileIds = new Set(files.filter(f => f.reviewStatus === 'FAILED').map(f => f.id));
    if (failedFileIds.size === 0) {
        return files;
    }

    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    return files.map(file => {
        if (failedFileIds.has(file.id)) {
            if (first) {
                first = false;
                // The file coming in already has the 'RE_APPLYING' status from the store action
                return { ...file, reviewStatus: 'APPROVED' as const, strategy: 'replace' as const, reviewError: undefined, linesAdded: 9, linesRemoved: 2 };
            }
            return { ...file, reviewStatus: 'FAILED' as const, reviewError: "'replace' failed: markers not found" };
        }
        return file;
    });
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