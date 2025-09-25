import { useLogStore } from '../stores/log.store';

let simulatorInterval: ReturnType<typeof setInterval> | null = null;

const mockClipboardContents = [
    'feat(dashboard): implement new UI components',
    'const clipboardy = require(\'clipboardy\');',
    'diff --git a/src/App.tsx b/src/App.tsx\nindex 12345..67890 100644\n--- a/src/App.tsx\n+++ b/src/App.tsx\n@@ -1,5 +1,6 @@\n import React from \'react\';',
    'All changes have been applied successfully. You can now commit them.',
    '{\n  "id": "123",\n  "status": "PENDING"\n}',
    'Can you refactor this to use a switch statement?',
];
let currentClipboardIndex = 0;

const startSimulator = () => {
    if (simulatorInterval) return;

    // Initial burst of logs to populate the view
    LoggerService.info('Log simulator started.');
    LoggerService.debug('Initializing clipboard watcher...');
    setTimeout(() => LoggerService.debug('Clipboard watcher active.'), 250);

    simulatorInterval = setInterval(() => {
        const random = Math.random();
        if (random < 0.6) {
            LoggerService.debug('Clipboard watcher polling...');
        } else if (random < 0.8) {
            LoggerService.debug('No clipboard change detected.');
        } else {
            const newContent = mockClipboardContents[currentClipboardIndex]!;
            currentClipboardIndex = (currentClipboardIndex + 1) % mockClipboardContents.length;
            const excerpt = newContent.replace(/\n/g, ' ').substring(0, 50).trim();
            LoggerService.info(`Clipboard content changed. Excerpt: "${excerpt}..."`);
        }
    }, 2000);
};

const stopSimulator = () => {
    if (simulatorInterval) {
        clearInterval(simulatorInterval);
        simulatorInterval = null;
        LoggerService.info('Log simulator stopped.');
    }
};

const debug = (message: string) => useLogStore.getState().actions.addLog('DEBUG', message);
const info = (message: string) => useLogStore.getState().actions.addLog('INFO', message);
const warn = (message: string) => useLogStore.getState().actions.addLog('WARN', message);
const error = (message: string) => useLogStore.getState().actions.addLog('ERROR', message);


export const LoggerService = {
    debug,
    info,
    warn,
    error,
    startSimulator,
    stopSimulator,
};