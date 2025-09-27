# Directory Structure
```
src/
  components/
    layout/
      ScreenLayout.tsx
  hooks/
    useDashboardScreen.tsx
    useGlobalHotkeys.tsx
  services/
    clipboard.service.ts
    logger.service.ts
  stores/
    dashboard.store.ts
    notification.store.ts
    view.store.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/stores/notification.store.ts
```typescript
import { create } from 'zustand';
import { useViewStore } from './view.store';
import type { NotificationPayload } from '../types/notification.types';

interface NotificationState {
    isVisible: boolean;
    notification: NotificationPayload | null;
    actions: {
        show: (payload: NotificationPayload) => void;
        hide: () => void;
    };
}

export const useNotificationStore = create<NotificationState>((set) => ({
    isVisible: false,
    notification: null,
    actions: {
        show: (payload) => {
            set({ isVisible: true, notification: payload });
            useViewStore.getState().actions.setActiveOverlay('notification');
        },
        hide: () => {
            set({ isVisible: false, notification: null });
            useViewStore.getState().actions.setActiveOverlay('none');
        },
    },
}));
```

## File: src/services/clipboard.service.ts
```typescript
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
      'no-unused-vars': 'off', // Must be disabled to use the @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
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

    // Some stricter flags
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

## File: src/components/layout/ScreenLayout.tsx
```typescript
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Separator from '../Separator';
import { useViewStore } from '../../stores/view.store';
import { useDashboardStore } from '../../stores/dashboard.store';
import { DASHBOARD_STATUS } from '../../constants/dashboard.constants';

interface ScreenLayoutProps {
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
    contextInfo?: string;
}

const ScreenLayout = ({ title, footer, children, contextInfo }: ScreenLayoutProps) => {
    const headerStatus = useViewStore(s => s.headerStatus);
    const dashboardStatus = useDashboardStore(s => s.status);
    const [visibleStatus, setVisibleStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!headerStatus) return;

        setVisibleStatus(headerStatus.message);

        const timer = setTimeout(() => {
            setVisibleStatus(null);
        }, 2000);

        return () => clearTimeout(timer);
    }, [headerStatus]);

    const isListening = dashboardStatus === DASHBOARD_STATUS.LISTENING;

    return (
        <Box flexDirection="column" flexGrow={1}>
            <Box flexDirection="row">
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · {title} </Text>
                <Box flexGrow={1} />
                {contextInfo && <Text color="gray">{contextInfo} </Text>}
                <Text color={isListening ? 'green' : 'yellow'}> {isListening ? '●' : '||'} </Text>
                {visibleStatus && <Text color="yellow" bold> · {visibleStatus}</Text>}
            </Box>
            <Separator />
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {children}
            </Box>
            <Separator />
            <Box>
                {footer}
            </Box>
        </Box>
    );
};

export default ScreenLayout;
```

## File: src/stores/view.store.ts
```typescript
import { create } from 'zustand';
import { OVERLAYS } from '../constants/view.constants';

export type Overlay = (typeof OVERLAYS)[keyof typeof OVERLAYS];

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: Overlay;
    headerStatus: { message: string; timestamp: number } | null;
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
        setHeaderStatus: (message: string) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: OVERLAYS.NONE,
    headerStatus: null,
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
        setHeaderStatus: (message) => set({ headerStatus: { message, timestamp: Date.now() } }),
    },
}));
```

## File: src/services/logger.service.ts
```typescript
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

## File: src/hooks/useGlobalHotkeys.tsx
```typescript
import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { OVERLAYS } from '../constants/view.constants';
import { ClipboardService } from '../services/clipboard.service';
import { useDashboardStore } from '../stores/dashboard.store';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { navigateBack } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === OVERLAYS.DEBUG ? OVERLAYS.NONE : OVERLAYS.DEBUG);
            return;
        }
        if (key.ctrl && input === 'l') {
            setActiveOverlay(activeOverlay === OVERLAYS.LOG ? OVERLAYS.NONE : OVERLAYS.LOG);
            return;
        }
        if (key.ctrl && input === 's') {
            // This is a temporary location. In a real app, this might live elsewhere
            // or be disabled on certain screens.
            useAppStore.getState().actions.showSettingsScreen();
        }

        if (key.ctrl && input === 'c') {
            ClipboardService.copySystemPrompt();
            return;
        }

        if (key.ctrl && input === 'v') {
            ClipboardService.processClipboardContent();
            return;
        }

        if (input.toLowerCase() === 'p') {
            useDashboardStore.getState().actions.togglePause();
            return;
        }

        // If an overlay with its own input is open, stop here.
        if (activeOverlay === OVERLAYS.DEBUG || activeOverlay === OVERLAYS.LOG) {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === OVERLAYS.HELP) {
            if (key.escape || input === '?') {
                setActiveOverlay(OVERLAYS.NONE);
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay(OVERLAYS.HELP);
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q' || key.escape) {
            const screenBefore = useAppStore.getState().currentScreen;
            navigateBack();
            const screenAfter = useAppStore.getState().currentScreen;

            // If navigateBack did not change the screen, it means we are on a root screen.
            if (screenBefore === screenAfter) {
                exit();
            }
        }
    }, { isActive });
};
```

## File: src/hooks/useDashboardScreen.tsx
```typescript
import { useState, useEffect, useRef, useMemo } from 'react';
import { useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import type { LayoutConfig } from './useLayout';
import { DASHBOARD_STATUS } from '../constants/dashboard.constants';
import { useViewport } from './useViewport';
import { useListNavigator } from './useListNavigator';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const useDashboardScreen = ({ layoutConfig }: { layoutConfig: LayoutConfig }) => {
    const {
        status,
        selectedTransactionIndex,
        expandedTransactionId,
    } = useDashboardStore();
    const transactions = useTransactionStore(s => s.transactions);
    const [newTransactionIds, setNewTransactionIds] = useState(new Set<string>());
    const prevTransactionIds = useRef(new Set(transactions.map(t => t.id)));

    const pendingTransactions = useTransactionStore(selectTransactionsByStatus('PENDING'));
    const appliedTransactions = useTransactionStore(selectTransactionsByStatus('APPLIED'));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex: selectedTransactionIndex,
        itemCount: transactions.length,
        layoutConfig,
    });

    useEffect(() => {
        const currentIds = new Set(transactions.map(t => t.id));
        const newIds = new Set<string>();

        for (const id of currentIds) {
            if (!prevTransactionIds.current.has(id)) {
                newIds.add(id);
            }
        }

        if (newIds.size > 0) {
            setNewTransactionIds(current => new Set([...current, ...newIds]));
            newIds.forEach(id => {
                setTimeout(() => {
                    setNewTransactionIds(current => {
                        const next = new Set(current);
                        next.delete(id);
                        return next;
                    });
                }, 1000);
            });
        }

        prevTransactionIds.current = currentIds;
    }, [transactions]);

    const {
        startApproveAll,
        confirmAction,
        cancelAction,
        toggleExpand,
    } = useDashboardStore(s => s.actions);
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);

    const pendingApprovals = pendingTransactions.length;
    const pendingCommits = appliedTransactions.length;

    const isModal = status === DASHBOARD_STATUS.CONFIRM_APPROVE;
    const isProcessing = status === DASHBOARD_STATUS.APPROVING;

    const viewDetails = () => {
        const selectedTx = transactions[selectedTransactionIndex];
        if (!selectedTx) return;

        if (selectedTx.status === 'PENDING') {
            useReviewStore.getState().actions.load(selectedTx.id);
            appActions.showReviewScreen();
        } else {
            useDetailStore.getState().actions.load(selectedTx.id);
            appActions.showTransactionDetailScreen();
        }
    };

    useInput((_input, key) => {
        if (key.return) confirmAction();
        if (key.escape) cancelAction();
    }, { isActive: isModal });

    useListNavigator({
        itemCount: transactions.length,
        viewportHeight,
        selectedIndex: selectedTransactionIndex,
        onIndexChange: (index) => {
            useDashboardStore.getState().actions.setSelectedIndex(index);
            useDashboardStore.getState().actions.setExpandedTransactionId(null);
        },
        isActive: !isModal && !isProcessing,
        onKey: (input, key) => {
            if (key.leftArrow) {
                if (expandedTransactionId) toggleExpand();
                return;
            }
            if (key.rightArrow) {
                if (transactions[selectedTransactionIndex]) {
                    if (!expandedTransactionId) toggleExpand();
                    else viewDetails();
                }
                return;
            }
            if (key.return) viewDetails();
            if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
            if (input.toLowerCase() === 'c' && pendingCommits > 0) {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            }
            if (input.toLowerCase() === 'l') {
                useHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
            }
        },
    });

    const transactionsToConfirm = status === DASHBOARD_STATUS.CONFIRM_APPROVE ? pendingTransactions : [];

    const contextInfo = useMemo(() => {
        try {
            const cwd = process.cwd();
            const parentDir = path.basename(path.dirname(cwd));
            const currentDir = path.basename(cwd);
            const shortCwd = `.../${parentDir}/${currentDir}`;
            const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            return `[${shortCwd} @ ${gitBranch}]`;
        } catch (error) {
            return '[Context unavailable]'; // Handle cases where not in a git repo, etc.
        }
    }, []);

    return {
        status,
        transactions,
        selectedTransactionIndex,
        expandedTransactionId,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        newTransactionIds,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
        contextInfo,
    };
};
```

## File: index.tsx
```typescript
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useViewStore } from './src/stores/view.store';
import { useDetailStore } from './src/stores/detail.store';
import { useHistoryStore } from './src/stores/history.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionStore } from './src/stores/transaction.store';
import { useCommitStore } from './src/stores/commit.store';
import { useNotificationStore } from './src/stores/notification.store';

const main = () => {
    // Initialize stores
    useTransactionStore.getState().actions.loadTransactions();
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
                useReviewStore.getState().actions.load('1'); // Tx '1' is failure case
                useReviewStore.getState().actions.startApplySimulation('1', 'failure');
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.load('1');
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useDetailStore.getState().actions.load('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            case 'DebugMenu':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('debug');
                break;
            case 'DebugLogScreen':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('log');
                break;
            case 'NotificationScreen':
                appActions.showDashboardScreen();
                useNotificationStore.getState().actions.show({
                    type: 'success', title: 'DEBUG', message: 'This is a test notification.',
                });
                break;
            case 'SettingsScreen':
                appActions.showSettingsScreen();
                break;
            case 'AiProcessingScreen':
                useReviewStore.getState().actions.load('1'); // load failure case
                useReviewStore.getState().actions.startAiAutoFix();
                break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        // eslint-disable-next-line no-console
        console.clear();
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
```

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { DASHBOARD_STATUS } from '../constants/dashboard.constants';
import { useViewStore } from './view.store';

export type DashboardStatus = (typeof DASHBOARD_STATUS)[keyof typeof DASHBOARD_STATUS];
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    expandedTransactionId: string | null;
    actions: {
        togglePause: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
        toggleExpand: () => void;
        setExpandedTransactionId: (id: string | null) => void;
        setSelectedIndex: (index: number) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: DASHBOARD_STATUS.LISTENING,
    previousStatus: DASHBOARD_STATUS.LISTENING,
    selectedTransactionIndex: 0,
    expandedTransactionId: null,
    actions: {
        togglePause: () => {
            const newStatus = get().status === DASHBOARD_STATUS.LISTENING
                ? DASHBOARD_STATUS.PAUSED
                : DASHBOARD_STATUS.LISTENING;

            set({ status: newStatus });

            const message = newStatus === DASHBOARD_STATUS.PAUSED
                ? 'CLIPBOARD PAUSED'
                : 'CLIPBOARD LISTENING';
            useViewStore.getState().actions.setHeaderStatus(message);
        },
        startApproveAll: () => set(state => ({
            status: DASHBOARD_STATUS.CONFIRM_APPROVE,
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => { // The `if` is redundant as this is only called from that state.
            const previousStatus = get().previousStatus;
            set({ status: DASHBOARD_STATUS.APPROVING });
            await DashboardService.approveAll();
            set({ status: previousStatus });
        },
        toggleExpand: () => {
            const { selectedTransactionIndex, expandedTransactionId } = get();
            const { transactions } = useTransactionStore.getState();
            const selectedTx = transactions[selectedTransactionIndex];
            if (!selectedTx) return;

            if (expandedTransactionId === selectedTx.id) {
                set({ expandedTransactionId: null });
            } else {
                set({ expandedTransactionId: selectedTx.id });
            }
        },
        setExpandedTransactionId: (id) => set({ expandedTransactionId: id }),
        setSelectedIndex: (index) => set({ selectedTransactionIndex: index }),
    },
}));
```
