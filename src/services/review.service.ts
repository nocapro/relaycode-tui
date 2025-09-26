import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import { useNotificationStore } from '../stores/notification.store';
import type { ApplyUpdate, PatchStatus } from '../stores/review.store';
import type { Transaction, FileItem, FileReviewStatus } from '../types/domain.types';

export interface SimulationResult {
    patchStatus: PatchStatus;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;
}

const mockSuccessFiles = [
    'src/components/Button.tsx',
    'src/components/Input.tsx',
    'src/components/Modal.tsx',
    'src/hooks/useForm.ts',
    'src/hooks/useDebounce.ts',
    'src/styles/theme.css',
    'src/utils/formatters.ts',
    'src/pages/HomePage.tsx',
    'src/pages/AboutPage.tsx',
    'src/services/api.ts',
    'src/stores/user.store.ts',
    'src/constants/routes.ts',
    'src/assets/logo.svg',
    'src/config/firebase.ts',
    'src/types/domain.ts',
    'src/features/auth/Login.tsx',
    'src/features/auth/Signup.tsx',
    'src/features/dashboard/Overview.tsx',
    'src/features/settings/Profile.tsx',
    'src/App.tsx',
];

const mockFailureFiles = [
    'src/services/payment.gateway.ts',
    'src/services/notification.service.ts',
    'src/components/UserProfile.tsx',
    'src/components/complex/DataTable.tsx',
    'src/hooks/useInfiniteScroll.ts',
    'src/hooks/useWebSocket.ts',
    'src/utils/crypto.ts',
    'src/utils/date.helper.ts',
    'src/pages/admin/UserManagement.tsx',
    'src/pages/admin/Analytics.tsx',
    'src/stores/cart.store.ts',
    'src/stores/products.store.ts',
    'src/constants/permissions.ts',
    'src/assets/icon-error.svg',
    'src/config/sentry.ts',
    'src/types/api.ts',
    'src/features/checkout/AddressForm.tsx',
    'src/features/checkout/PaymentForm.tsx',
    'src/features/product/ProductDetail.tsx',
    'src/features/product/ProductList.tsx',
];

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
    fileReviewStates: Map<
        string, { status: FileReviewStatus; error?: string; details?: string }
    >,
): string => {
    const successfulFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
    const failedFiles = (transaction.files || []).filter(f => ['FAILED', 'REJECTED'].includes(fileReviewStates.get(f.id)?.status || ''));

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

async function* runApplySimulation(
    files: FileItem[],
    scenario: 'success' | 'failure',
): AsyncGenerator<ApplyUpdate, SimulationResult> {
    if (scenario === 'success') {
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        if (files.length > 0) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's1', title: `write: ${files[0]!.path} (strategy: replace)`, status: 'pending' } } };
        }
        if (files.length > 1) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's2', title: `write: ${files[1]!.path} (strategy: standard-diff)`, status: 'pending' } } };
        }
        await sleep(50);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's1', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's2', status: 'active' } };
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            const file = mockSuccessFiles[i]!;
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: `s${i + 3}`, title: `write: ${file}`, status: 'pending' } } };
        }
        await sleep(50);
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'active' } };
            await sleep(50);
        }

        await sleep(200);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's1', status: 'done' } };
        await sleep(150);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's2', status: 'done' } };
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'done' } };
            await sleep(80);
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 1.8 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(1300);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done', duration: 2.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done', duration: 1.2 } };

        await sleep(500);

        const fileReviewStates = new Map<string, { status: FileReviewStatus }>();
        files.forEach(file => {
            fileReviewStates.set(file.id, { status: 'APPROVED' });
        });

        return { patchStatus: 'SUCCESS', fileReviewStates };

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        if (files.length > 0) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f1', title: `write: ${files[0]!.path} (strategy: replace)`, status: 'pending' } } };
        }
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f2', title: `write: ${(files[1] || { path: '...' }).path}`, status: 'pending' } } };
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f3', title: `write: ${(files[2] || { path: '...' }).path}`, status: 'pending' } } };
        await sleep(50);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f1', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f2', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f3', status: 'active' } };
        for (let i = 0; i < mockFailureFiles.length; i++) {
            const file = mockFailureFiles[i]!;
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: `f${i + 4}`, title: `write: ${file}`, status: 'pending' } } };
        }
        await sleep(50);
        for (let i = 0; i < mockFailureFiles.length; i++) {
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `f${i + 4}`, status: 'active' } };
            await sleep(50);
        }
        await sleep(150);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f1', status: 'done' } };
        await sleep(100);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f2', status: 'failed', title: `${(files[1] || { path: '...' }).path} (Hunk #1 failed to apply)` } };
        await sleep(100);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f3', status: 'failed', title: `${(files[2] || { path: '...' }).path} (Context mismatch at line 92)` } };
        for (let i = 0; i < mockFailureFiles.length; i++) {
            const file = mockFailureFiles[i]!;
            const shouldFail = i % 4 === 0 || i === mockFailureFiles.length - 1; // fail a few, including the last one
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `f${i + 4}`, status: shouldFail ? 'failed' : 'done', title: shouldFail ? `${file} (Could not find insertion point)` : undefined } };
            await sleep(80);
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 2.1 } };

        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped due to patch application failure' } };
        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to patch application failure' } };

        await sleep(500);

        const fileReviewStates = new Map<string, { status: FileReviewStatus; error?: string }>();
        files.forEach((file, index) => {
            const isFailedFile = index > 0; // Fail all but the first file
            const status = isFailedFile ? 'FAILED' : 'APPROVED';
            const error = isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined;
            fileReviewStates.set(file.id, { status, error });
        });

        return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
    }
}

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
    generateSingleFileRepairPrompt(file, error);
    // Mock clipboard write and show notification
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied Repair Prompt',
        message: `A repair prompt for ${file.path} has been copied to your clipboard.`,
    });
    return file;
};

const generateSingleFileInstructPrompt = (file: FileItem, transaction: Transaction): string => {
    return `The user REJECTED the last proposed change for the file \`${file.path}\`.

The original high-level goal was:
---
${transaction.prompt || transaction.message}
---

The rejected change was:
---
${file.diff || '// ... rejected diff would be here ...'}
---

Please provide an alternative solution for \`${file.path}\` that still accomplishes the original goal.
The response MUST be a complete, corrected patch for this file.`;
};

const tryInstructFile = (file: FileItem, transaction: Transaction): void => {
    generateSingleFileInstructPrompt(file, transaction);
    // Mock clipboard write and show notification
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied Instruction Prompt',
        message: `An instruction prompt for ${file.path} has been copied to your clipboard.`,
    });
};

const generateBulkInstructPrompt = (rejectedFiles: FileItem[], transaction: Transaction): string => {
    // Mock implementation for demo. In a real scenario, this would generate a more complex prompt.
    const fileList = rejectedFiles.map(f => `- ${f.path}`).join('\n');
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied to Clipboard',
        message: `Copied bulk instruction prompt for ${rejectedFiles.length} files.`,
        duration: 3,
    });
    return `The user has rejected changes in multiple files for the goal: "${transaction.message}".\n\nThe rejected files are:\n${fileList}\n\nPlease provide an alternative patch for all of them.`;
};

const runBulkReapply = async (
    failedFiles: FileItem[],
): Promise<{ id: string; status: FileReviewStatus; error?: string }[]> => {
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
    generateBulkRepairPrompt,
    generateBulkInstructPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    generateSingleFileInstructPrompt,
    tryInstructFile,
    runBulkReapply,
};