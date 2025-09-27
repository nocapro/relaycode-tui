import { useTransactionStore, type Transaction } from '../stores/transaction.store';
import { useNotificationStore } from '../stores/notification.store';
import { useReviewStore } from '../stores/review.store';
import { LoggerService } from './logger.service';
import clipboardy from 'clipboardy';

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

const MOCK_SYSTEM_PROMPT = `You are an expert AI programmer. To modify a file, you MUST use a code block with a specified patch strategy.

**Syntax:**
\`\`\`typescript // filePath {patchStrategy}
... content ...
\`\`\`
- \`filePath\`: The path to the file. **If the path contains spaces, it MUST be enclosed in double quotes.**
- \`patchStrategy\`: (Optional) One of \`standard-diff\`, \`search-replace\`. If omitted, the entire file is replaced (this is the \`replace\` strategy).
`;

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
                id: `${(Math.random() * 1000).toFixed(0)}-1`,
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

const copySystemPrompt = async () => {
    try {
        await clipboardy.write(MOCK_SYSTEM_PROMPT);
        LoggerService.info('System prompt copied to clipboard.');
        useNotificationStore.getState().actions.show({
            type: 'success',
            title: 'Clipboard Updated',
            message: 'System prompt has been copied to your clipboard.',
            duration: 2,
        });
    } catch (error) {
        LoggerService.error(`Failed to copy system prompt to clipboard: ${error}`);
        useNotificationStore.getState().actions.show({
            type: 'error',
            title: 'Clipboard Error',
            message: 'Could not copy system prompt to clipboard.',
            duration: 3,
        });
    }
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
    copySystemPrompt,
};