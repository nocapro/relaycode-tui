import { useTransactionStore, type Transaction } from '../stores/transaction.store';
import { useNotificationStore } from '../stores/notification.store';
import { useReviewStore } from '../stores/review.store';
import { LoggerService } from './logger.service';

const MOCK_VALID_PATCH = `diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 12345..67890 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,5 +1,6 @@
-import React from 'react';
+import React, { useState } from 'react';

 const Button = () => <button>Click Me</button>;

 export default Button;
`;

const MOCK_INVALID_TEXT = 'This is just some regular text, not a patch.';

const createTransactionFromPatch = (patchContent: string): Transaction => {
    // In a real app, we would parse this. For demo, we'll create a mock.
    const lines = patchContent.split('\n');
    const linesAdded = lines.filter(l => l.startsWith('+')).length;
    const linesRemoved = lines.filter(l => l.startsWith('-')).length;
    const filePath = lines.find(l => l.startsWith('--- a/'))?.split(' a/')[1] || 'unknown/file.ts';

    return {
        id: (Math.random() * 1000).toFixed(0),
        timestamp: Date.now(),
        status: 'PENDING',
        hash: Math.random().toString(16).substring(2, 10),
        message: 'feat: apply patch from clipboard',
        prompt: 'A patch was manually pasted into the application.',
        reasoning: 'The user pasted clipboard content which was identified as a valid patch and processed into a new transaction.',
        files: [
            {
                id: (Math.random() * 1000).toFixed(0) + '-1',
                type: 'MOD',
                path: filePath,
                linesAdded,
                linesRemoved,
                diff: patchContent,
                strategy: 'standard-diff',
            },
        ],
        stats: {
            files: 1,
            linesAdded,
            linesRemoved,
        },
    };
};

/**
 * Simulates processing the clipboard content.
 * @param forceValidPatch For debug purposes, force the outcome. If undefined, it will be random.
 */
const processClipboardContent = async (forceValidPatch?: boolean) => {
    LoggerService.info('Manual paste detected. Processing clipboard content...');
    
    // Simulate reading from clipboardy
    const isActuallyValid = forceValidPatch === true || (forceValidPatch === undefined && Math.random() > 0.5);
    const clipboardContent = isActuallyValid ? MOCK_VALID_PATCH : MOCK_INVALID_TEXT;

    // Simulate checking if it's a valid patch
    if (clipboardContent.includes('diff --git')) {
        LoggerService.debug('Valid patch detected in clipboard. Creating transaction.');
        const newTransaction = createTransactionFromPatch(clipboardContent);

        // Add to store so it exists for the review process
        useTransactionStore.getState().actions.addTransaction(newTransaction);

        // Immediately start the review simulation
        LoggerService.debug(`Starting apply simulation for new transaction ${newTransaction.id}`);
        // Forcing 'success' scenario for pasted patches. The simulation itself can
        // result in a failure state which is then handled by the review screen.
        useReviewStore.getState().actions.startApplySimulation(newTransaction.id, 'success');

        useNotificationStore.getState().actions.show({
            type: 'info',
            title: 'Processing Pasted Patch',
            message: `Applying new transaction "${newTransaction.hash}"...`,
            duration: 2,
        });
    } else {
        LoggerService.debug('No valid patch detected in clipboard content.');
        useNotificationStore.getState().actions.show({
            type: 'info',
            title: 'Clipboard Ignored',
            message: 'Pasted content was not a valid patch.',
            duration: 3,
        });
    }
};

export const ClipboardService = {
    processClipboardContent,
};