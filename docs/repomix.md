# Directory Structure
```
src/
  components/
    ActionFooter.tsx
    DiffScreen.tsx
    ReviewScreen.tsx
  constants/
    review.constants.ts
  hooks/
    useContentViewport.ts
    useReviewScreen.tsx
  stores/
    navigation.utils.ts
    review.store.ts
  types/
    actions.types.ts
    domain.types.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/types/actions.types.ts
```typescript
/**
 * Represents a single action item for display in a responsive footer.
 */
export interface ActionItem {
    key: string;
    label: string;
}
```

## File: src/hooks/useContentViewport.ts
```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';

interface ContentViewportConfig {
    contentLineCount: number;
    viewportHeight: number;
}

export interface ContentViewport {
    scrollIndex: number;
    canScrollUp: boolean;
    canScrollDown: boolean;
    actions: {
        scrollUp: (lines?: number) => void;
        scrollDown: (lines?: number) => void;
        pageUp: () => void;
        pageDown: () => void;
        resetScroll: () => void;
    };
}

/**
 * Manages the scrolling state (index) for a block of content within a fixed viewport.
 * @param config Configuration including total content lines and the height of the visible area.
 * @returns State and actions for controlling the scroll position.
 */
export const useContentViewport = ({
    contentLineCount,
    viewportHeight,
}: ContentViewportConfig): ContentViewport => {
    const [scrollIndex, setScrollIndex] = useState(0);

    const maxScrollIndex = useMemo(
        () => Math.max(0, contentLineCount - viewportHeight),
        [contentLineCount, viewportHeight],
    );

    const resetScroll = useCallback(() => {
        setScrollIndex(0);
    }, []);

    // Effect to reset scroll when content changes, which is a good default.
    useEffect(() => {
        resetScroll();
    }, [contentLineCount, resetScroll]);

    // Effect to clamp scrollIndex if content or viewport size changes
    useEffect(() => {
        if (scrollIndex > maxScrollIndex) {
            setScrollIndex(maxScrollIndex);
        }
    }, [scrollIndex, maxScrollIndex]);

    const canScrollUp = useMemo(() => scrollIndex > 0, [scrollIndex]);
    const canScrollDown = useMemo(() => scrollIndex < maxScrollIndex, [scrollIndex, maxScrollIndex]);

    const scrollUp = useCallback((lines = 1) => {
        setScrollIndex(i => Math.max(0, i - lines));
    }, []);

    const scrollDown = useCallback((lines = 1) => {
        setScrollIndex(i => Math.min(maxScrollIndex, i + lines));
    }, [maxScrollIndex]);

    const pageUp = useCallback(() => {
        setScrollIndex(i => Math.max(0, i - viewportHeight));
    }, [viewportHeight]);

    const pageDown = useCallback(() => {
        setScrollIndex(i => Math.min(maxScrollIndex, i + viewportHeight));
    }, [maxScrollIndex, viewportHeight]);

    return {
        scrollIndex,
        canScrollUp,
        canScrollDown,
        actions: {
            scrollUp,
            scrollDown,
            pageUp,
            pageDown,
            resetScroll,
        },
    };
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

## File: src/components/ActionFooter.tsx
```typescript
import { Box, Text } from 'ink';
import { useStdoutDimensions } from '../utils';
import { UI_CONFIG } from '../config/ui.config';
import type { ActionItem } from '../types/actions.types';

interface ActionFooterProps {
    actions: readonly ActionItem[];
}

const Action = ({ item }: { item: ActionItem }) => (
    <Text>
        (<Text color="cyan" bold>{item.key}</Text>) {item.label}
    </Text>
);

const ActionFooter = ({ actions }: ActionFooterProps) => {
    const [width] = useStdoutDimensions();
    const { horizontalPadding, actionSeparator } = UI_CONFIG.footer;
    const separatorWidth = actionSeparator.length;

    // Calculate required width for a single line
    const formattedActions = actions.map(a => `(${a.key}) ${a.label}`);
    const singleLineWidth = formattedActions.join(actionSeparator).length;

    // 1. Render horizontally if it fits
    if (singleLineWidth <= width - horizontalPadding * 2) {
        return (
            <Box>
                {actions.map((item, index) => (
                    <Text key={item.key}>
                        <Action item={item} />
                        {index < actions.length - 1 && <Text>{actionSeparator}</Text>}
                    </Text>
                ))}
            </Box>
        );
    }

    // 2. If it doesn't fit, calculate multi-column layout
    const itemWidths = formattedActions.map(a => a.length);
    const maxItemWidth = Math.max(...itemWidths);
    
    // Determine how many columns can fit, ensuring at least one
    const availableWidth = width - horizontalPadding * 2;
    // Calculate columns based on the widest item, ensuring we don't try to make more columns than items
    const numColumns = Math.min(
        actions.length,
        Math.max(1, Math.floor(availableWidth / (maxItemWidth + separatorWidth))),
    );
    
    const itemsPerColumn = Math.ceil(actions.length / numColumns);
    const columns: ActionItem[][] = Array.from({ length: numColumns }, () => []);

    actions.forEach((action, index) => {
        const columnIndex = Math.floor(index / itemsPerColumn);
        if (columns[columnIndex]) {
            columns[columnIndex].push(action);
        }
    });

    return (
        <Box flexDirection="row" width="100%">
            {columns.map((column, colIndex) => (
                <Box
                    key={colIndex}
                    flexDirection="column"
                    // Use a flex-basis approach for more even distribution if needed,
                    // but fixed width is better for alignment.
                    width={maxItemWidth + separatorWidth}
                >
                    {column.map(item => (
                        <Action key={item.key} item={item} />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default ActionFooter;
```

## File: src/constants/review.constants.ts
```typescript
import type { ApplyStep } from '../stores/review.store';
import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Review screen and process.
 */
export const INITIAL_APPLY_STEPS: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

export const REVIEW_BODY_VIEWS = {
    DIFF: 'diff',
    REASONING: 'reasoning',
    SCRIPT_OUTPUT: 'script_output',
    BULK_REPAIR: 'bulk_repair',
    CONFIRM_HANDOFF: 'confirm_handoff',
    BULK_INSTRUCT: 'bulk_instruct',
    NONE: 'none',
} as const;

export const PATCH_STATUS = {
    SUCCESS: 'SUCCESS',
    PARTIAL_FAILURE: 'PARTIAL_FAILURE',
} as const;

export const FILE_STATUS_UI = {
    APPROVED: { icon: '[✓]', color: 'green' },
    REJECTED: { icon: '[✗]', color: 'red' },
    FAILED: { icon: '[!]', color: 'red' },
    AWAITING: { icon: '[●]', color: 'yellow' },
    RE_APPLYING: { icon: '[●]', color: 'cyan' },
} as const;

export const BULK_REPAIR_OPTIONS = [
    '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
    '(2) Bulk Change Strategy & Re-apply',
    '(3) Handoff to External Agent',
    '(4) Bulk Abandon All Failed Files',
    '(Esc) Cancel',
] as const;

export const BULK_INSTRUCT_OPTIONS = [
    '(1) Copy Bulk Re-instruct Prompt (for single-shot AI)',
    '(2) Handoff to External Agent',
    '(3) Bulk Un-reject All Files (revert to original)',
    '(4) Cancel',
] as const;

interface ReviewFooterConfig {
    isFileSelected: boolean;
    fileStatus?: 'FAILED' | 'REJECTED' | 'OTHER';
    currentItemType?: 'file' | 'script' | 'reasoning' | 'prompt';
    hasFailedFiles: boolean;
    hasRejectedFiles: boolean;
    hasApprovedFiles: boolean;
}

export const REVIEW_FOOTER_ACTIONS = {
    DIFF_VIEW: [
        { key: '↑↓', label: 'Nav' },
        { key: 'X', label: 'Expand' },
        { key: 'D/Esc', label: 'Back' },
    ] as const,
    REASONING_VIEW: [
        { key: '↑↓', label: 'Scroll Text' },
        { key: 'R', label: 'Collapse View' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    SCRIPT_OUTPUT_VIEW: [
        { key: '↑↓', label: 'Nav' },
        { key: 'J↓/K↑', label: 'Next/Prev Error' },
        { key: 'C', label: 'Copy Output' },
        { key: 'Ent/Esc', label: 'Back' },
    ] as const,
    BULK_REPAIR_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    BULK_INSTRUCT_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    HANDOFF_CONFIRM_VIEW: [
        { key: 'Enter', label: 'Confirm Handoff' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    MAIN_VIEW: (config: ReviewFooterConfig): ActionItem[] => {
        const actions: ActionItem[] = [{ key: '↑↓', label: 'Nav' }];

        if (config.isFileSelected) {
            if (config.fileStatus !== 'FAILED') actions.push({ key: 'Spc', label: 'Toggle' });
            actions.push({ key: 'D', label: 'Diff' });
            if (config.fileStatus === 'FAILED') actions.push({ key: 'T', label: 'Try Repair' });
            if (config.fileStatus === 'REJECTED') actions.push({ key: 'I', label: 'Instruct' });
        } else if (config.currentItemType === 'script') {
            actions.push({ key: 'Ent', label: 'Expand Details' });
        } else {
            actions.push({ key: 'Ent', label: 'Expand' });
        }

        if (config.currentItemType !== 'reasoning') actions.push({ key: 'R', label: 'Reasoning' });
        if (config.hasFailedFiles) actions.push({ key: 'Shift+T', label: 'Bulk Repair' });
        if (config.hasRejectedFiles) actions.push({ key: 'Shift+I', label: 'Bulk Instruct' });

        actions.push({ key: 'C', label: 'Copy' });

        if (config.hasApprovedFiles) actions.push({ key: 'A', label: 'Approve' });
        actions.push({ key: 'Q', label: 'Quit' });
        return actions;
    },
};

export const getReviewProcessingFooterActions = (
    isSkippable: boolean,
): readonly ActionItem[] => {
    const actions: ActionItem[] = [{ key: 'Ctrl+C', label: 'Cancel Process' }];
    if (isSkippable) {
        actions.push({ key: 'S', label: 'Skip Script' });
    }
    return actions;
};
```

## File: src/types/domain.types.ts
```typescript
// --- Core Domain Models ---

/** The type of change applied to a file. */
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';

/** The review status of a file within a transaction. */
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';

/** The result of a script execution. */
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

/** The unified representation of a file change within a transaction. */
export interface FileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    type: FileChangeType;
    strategy?: 'replace' | 'standard-diff';
}

/** The lifecycle status of a transaction. */
export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTING'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

/** The central data model for a code modification transaction. */
export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    files?: FileItem[];
    scripts?: ScriptResult[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
```

## File: src/components/DiffScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { UI_CONFIG } from '../config/ui.config';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
    scrollIndex?: number;
    maxHeight?: number;
}
const DiffScreen = ({ filePath, diffContent, isExpanded, scrollIndex = 0, maxHeight }: DiffScreenProps) => {
    const lines = diffContent.split('\n');
    const COLLAPSE_THRESHOLD = UI_CONFIG.diffScreen.collapseThreshold;
    const COLLAPSE_SHOW_LINES = UI_CONFIG.diffScreen.collapseShowLines;

    const renderContent = () => {
        if (!isExpanded && lines.length > COLLAPSE_THRESHOLD) {
            const topLines = lines.slice(0, COLLAPSE_SHOW_LINES);
            const bottomLines = lines.slice(lines.length - COLLAPSE_SHOW_LINES);
            const hiddenLines = lines.length - (COLLAPSE_SHOW_LINES * 2);

            return (
                <>
                    {topLines.map((line, i) => renderLine(line, i))}
                    <Text color="gray">... {hiddenLines} lines hidden ...</Text>
                    {bottomLines.map((line, i) => renderLine(line, i + topLines.length + 1))}
                </>
            );
        }
        // Handle vertical scrolling for expanded view
        if (isExpanded && maxHeight) {
            const visibleLines = lines.slice(scrollIndex, scrollIndex + maxHeight);
            return visibleLines.map((line, i) => renderLine(line, scrollIndex + i));
        }
        return lines.map((line, i) => renderLine(line, i));
    };

    const renderLine = (line: string, key: number) => {
        let color = 'white';
        if (line.startsWith('+')) color = 'green';
        if (line.startsWith('-')) color = 'red';
        if (line.startsWith('@@')) color = 'cyan';
        return <Text key={key} color={color}>{line}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text>DIFF: {filePath}</Text>
            <Box flexDirection="column" marginTop={1}>
                {renderContent()}
            </Box>
        </Box>
    );
};

export default DiffScreen;
```

## File: src/stores/navigation.utils.ts
```typescript
import type { Transaction } from '../types/domain.types';

export const moveIndex = (
    currentIndex: number,
    direction: 'up' | 'down',
    listSize: number,
): number => {
    if (direction === 'up') {
        return Math.max(0, currentIndex - 1);
    }
    return Math.min(listSize - 1, currentIndex + 1);
};

export const findNextPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex < visiblePaths.length - 1) {
        return visiblePaths[currentIndex + 1]!;
    }
    return currentPath;
};

export const findPrevPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex > 0) {
        return visiblePaths[currentIndex - 1]!;
    }
    return currentPath;
};

export const getParentPath = (path: string): string | null => path.includes('/') ? path.split('/')[0]! : null;

export const getVisibleItemPaths = (
    transactions: Transaction[],
    expandedIds: Set<string>,
): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id)) {
            paths.push(`${tx.id}/message`);
            paths.push(`${tx.id}/prompt`);
            paths.push(`${tx.id}/reasoning`);
            if (tx.files) {
                for (const file of tx.files) {
                    paths.push(`${tx.id}/file/${file.id}`);
                }
            }
        }
    }
    return paths;
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

## File: src/hooks/useReviewScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';
import { UI_CONFIG } from '../config/ui.config';
import { REVIEW_BODY_VIEWS } from '../constants/review.constants';
import { useViewport } from './useViewport';

type NavigableItem =
    | { type: 'prompt' }
    | { type: 'reasoning' }
    | { type: 'script'; id: string }
    | { type: 'file'; id: string };

export const useReviewScreen = () => {
    const store = useReviewStore();
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
    } = store;

    const transaction = useTransactionStore(selectSelectedTransaction);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const scriptCount = transaction?.scripts?.length || 0;
    const fileCount = transaction?.files?.length || 0;

    const layout = UI_CONFIG.layout.review;

    // Layout for the main navigable item list (prompt, reasoning, files, etc.)
    const mainListLayoutConfig = useMemo(() => ({
        header: layout.header,
        fixedRows: layout.fixedRows,
        marginsY: layout.marginsY,
        separators: layout.separators,
        footer: layout.footer,
        dynamicRows: {
            count: bodyView !== REVIEW_BODY_VIEWS.NONE ? layout.bodyHeightReservation : 0,
        },
    }), [bodyView, layout]);

    const { remainingHeight: listViewportHeight } = useLayout(mainListLayoutConfig);
    const { viewOffset } = useViewport({ selectedIndex: selectedItemIndex, itemCount: 100, layoutConfig: mainListLayoutConfig });

    // Layout for the body content (diff, reasoning, etc.)
    const bodyLayoutConfig = useMemo(() => ({
        header: layout.header,
        separators: layout.separators,
        fixedRows: 2, // meta
        marginsY: 1 + 1 + 1, // meta, scripts, files
        footer: 2,
        dynamicRows: { count: 2 + scriptCount + 1 + fileCount }, // prompt, reasoning, scripts, 'FILES' header, files
    }), [layout, scriptCount, fileCount]);

    const { remainingHeight: availableBodyHeight } = useLayout(bodyLayoutConfig);

    const navigableItems = useMemo((): NavigableItem[] => {
        if (!transaction) return [];
        const scriptItems: NavigableItem[] = (transaction.scripts || []).map(s => ({ type: 'script', id: s.command }));
        const fileItems: NavigableItem[] = (transaction.files || []).map(f => ({ type: 'file', id: f.id }));
        return [{ type: 'prompt' }, { type: 'reasoning' }, ...scriptItems, ...fileItems];
    }, [transaction]);

    const contentLineCount = useMemo(() => {
        const currentItem = navigableItems[selectedItemIndex];
        switch (bodyView) { //
            case REVIEW_BODY_VIEWS.REASONING:
                return (transaction?.reasoning || '').split('\n').length;
            case REVIEW_BODY_VIEWS.DIFF: {
                if (currentItem?.type !== 'file') return 0;
                const selectedFile = (transaction?.files || []).find(f => f.id === currentItem.id);
                return (selectedFile?.diff || '').split('\n').length;
            }
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: {
                if (currentItem?.type !== 'script') return 0;
                const selectedScript = (transaction?.scripts || []).find(s => s.command === currentItem.id);
                return (selectedScript?.output || '').split('\n').length;
            }
            default: return 0;
        }
    }, [bodyView, navigableItems, selectedItemIndex, transaction]);
    const contentViewport = useContentViewport({ contentLineCount, viewportHeight: availableBodyHeight });

    const navigableItemsInView = navigableItems.slice(viewOffset, viewOffset + listViewportHeight);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            totalFiles: files.length,
            totalLinesAdded: files.reduce((sum, f) => sum + f.linesAdded, 0),
            totalLinesRemoved: files.reduce((sum, f) => sum + f.linesRemoved, 0),
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
        };
    }, [files, fileReviewStates]);

    const hasRejectedFiles = useMemo(() => {
        if (!fileReviewStates) return false;
        return Array.from(fileReviewStates.values()).some(s => s.status === 'REJECTED');
    }, [fileReviewStates]);

    const { approvedFilesCount } = reviewStats;

    const isFileSelected = navigableItems[selectedItemIndex]?.type === 'file';

    const scripts = transaction?.scripts || [];

    const {
        moveSelectionUp,
        moveSelectionDown,
        expandDiff,
        toggleBodyView,
        setBodyView,
        startApplySimulation,
        approve,
        tryRepairFile,
        tryInstruct,
        showBulkRepair,
        showBulkInstruct,
        executeBulkRepairOption,
        executeBulkInstructOption,
        confirmHandoff,
        scrollReasoningUp,
        scrollReasoningDown,
        navigateScriptErrorUp,
        navigateScriptErrorDown,
        toggleFileApproval,
        rejectAllFiles,
        navigateBulkRepairUp,
        navigateBulkRepairDown,
        navigateBulkInstructUp,
        navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'success'); return true;
        }
        if (input === '2' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        if (key.escape) {
            switch (bodyView) {
                case REVIEW_BODY_VIEWS.BULK_REPAIR:
                case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF:
                case REVIEW_BODY_VIEWS.BULK_INSTRUCT:
                    toggleBodyView(bodyView);
                    break;
                default:
                    if (bodyView !== REVIEW_BODY_VIEWS.NONE) {
                        setBodyView(REVIEW_BODY_VIEWS.NONE);
                    }
                    break;
            }
            return true;
        }
        return false;
    };

    const handleHandoffConfirmInput = (_input: string, key: Key): void => {
        if (key.return) confirmHandoff();
    };

    const handleBulkRepairInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkRepairUp();
        if (key.downArrow) navigateBulkRepairDown();
        if (key.return) {
            executeBulkRepairOption(selectedBulkRepairOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '4') {
            executeBulkRepairOption(parseInt(input));
        }
    };
    
    const handleBulkInstructInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkInstructUp();
        if (key.downArrow) navigateBulkInstructDown();
        if (key.return) {
            executeBulkInstructOption(selectedBulkInstructOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '3') {
            executeBulkInstructOption(parseInt(input));
        }
    };

    const handleContentScrollInput = (key: Key): boolean => {
        const contentViews = [
            REVIEW_BODY_VIEWS.REASONING,
            REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
            REVIEW_BODY_VIEWS.DIFF,
        ] as const;
        if (!(contentViews as readonly string[]).includes(bodyView)) return false;

        if (key.upArrow) {
            contentViewport.actions.scrollUp();
            return true;
        }
        if (key.downArrow) { contentViewport.actions.scrollDown(); return true; }
        if (key.pageUp) { contentViewport.actions.pageUp(); return true; }
        if (key.pageDown) { contentViewport.actions.pageDown(); return true; }
        return false;
    };

    const handleReasoningInput = (input: string, key: Key): void => {
        if (key.upArrow) scrollReasoningUp();
        if (key.downArrow) scrollReasoningDown();
        if (input.toLowerCase() === 'r') toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
    };

    const handleScriptOutputInput = (input: string, key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (key.return) toggleBodyView(REVIEW_BODY_VIEWS.SCRIPT_OUTPUT);
        if (input.toLowerCase() === 'c') { // TODO: this copy logic is not great.
            const currentItem = navigableItems[selectedItemIndex];
            const selectedScript = currentItem?.type === 'script' ? scripts.find(s => s.command === currentItem.id) : undefined;
            if (selectedScript) {
                useNotificationStore.getState().actions.show({
                    type: 'success',
                    title: 'Copied to Clipboard',
                    message: `Copied script output for: ${selectedScript.command}`,
                });
            }
        }
    };

    const handleDiffInput = (input: string) => {
        if (input.toLowerCase() === 'x') expandDiff();
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    }; //

    const handleMainNavigationInput = (input: string, key: Key): void => {
        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp(navigableItems.length);
        if (key.downArrow) moveSelectionDown(navigableItems.length);

        const currentItem = navigableItems[selectedItemIndex];

        if (input === ' ') {
            if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(currentItem.id);
                }
            }
        }

        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            } else if (currentItem?.type === 'reasoning') {
                toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
            } else if (currentItem?.type === 'script') {
                toggleBodyView(REVIEW_BODY_VIEWS.SCRIPT_OUTPUT);
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }

        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'FAILED') tryRepairFile(currentItem.id);
            }
        }

        if (input.toLowerCase() === 'i') {
            if (key.shift) {
                if (hasRejectedFiles) showBulkInstruct();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'REJECTED') {
                    tryInstruct(currentItem.id);
                }
            }
        }
    };

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) {
            return;
        }

        // If we are in a scrollable body view, prioritize that input.
        if (handleContentScrollInput(key)) {
            return;
        }

        switch (bodyView) {
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF: return handleHandoffConfirmInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_REPAIR: return handleBulkRepairInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT: return handleBulkInstructInput(input, key);
            case REVIEW_BODY_VIEWS.REASONING: return handleReasoningInput(input, key);
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: return handleScriptOutputInput(input, key);
            case REVIEW_BODY_VIEWS.DIFF: return handleDiffInput(input);
            default: return handleMainNavigationInput(input, key);
        }
    });

    return {
        ...store,
        fileReviewStates,
        selectedItemIndex,
        transaction,
        files,
        scripts,
        patchStatus,
        navigableItems,
        isFileSelected,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex: contentViewport.scrollIndex,
        availableBodyHeight,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        ...reviewStats,
        hasRejectedFiles,
    };
};
```

## File: src/components/ReviewScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import type { ScriptResult, FileItem, FileChangeType } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';
import { REVIEW_BODY_VIEWS, REVIEW_FOOTER_ACTIONS, FILE_STATUS_UI, BULK_REPAIR_OPTIONS, BULK_INSTRUCT_OPTIONS } from '../constants/review.constants';
import ActionFooter from './ActionFooter';

// --- Sub-components ---

const FileItemRow = ({ file, reviewState, isFocused }: {
    file: FileItem;
    reviewState: { status: string; error?: string; details?: string };
    isFocused: boolean;
}) => {
    const ui = FILE_STATUS_UI[reviewState.status as keyof typeof FILE_STATUS_UI] || { icon: '[?]', color: 'gray' };

    const typeColor = (type: FileChangeType) => {
        switch (type) {
            case 'ADD': return 'green';
            case 'DEL': return 'red';
            case 'REN': return 'yellow';
            default: return 'white';
        }
    };

    const diffStats = <Text>(+<Text color="green">{file.linesAdded}</Text>/-<Text color="red">{file.linesRemoved}</Text>)</Text>;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isFocused ? '> ' : '  ';
    const colorProps = isFocused ? { bold: true, color: 'cyan' } : {};

    if (reviewState.status === 'FAILED') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} FAILED {file.path}</Text>
                    <Text color="red">    ({reviewState.error})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewState.status === 'AWAITING') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    ({reviewState.details})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewState.status === 'RE_APPLYING') {
        return (
             <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text {...colorProps}>
                {prefix}<Text color={ui.color}>{ui.icon}</Text> {file.type}{' '}
                <Text color={typeColor(file.type)}>{file.path}</Text>{' '}
                {diffStats} [{strategy}]
            </Text>
        </Box>
    );
};

const ScriptItemRow = ({
    script,
    isSelected,
    isExpanded,
}: {
    script: ScriptResult;
    isSelected: boolean;
    isExpanded: boolean;
}) => {
    const icon = script.success ? '✓' : '✗';
    const iconColor = script.success ? 'green' : 'red';
    const arrow = isExpanded ? '▾' : '▸';
    const prefix = isSelected ? '> ' : '  ';
    
    // Extract script type from command (e.g., "bun run test" -> "Post-Command", "bun run lint" -> "Linter")
    const scriptType = script.command.includes('test') ? 'Post-Command' : 
                      script.command.includes('lint') ? 'Linter' : 
                      'Script';

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> {scriptType}: `{script.command}` ({script.duration}s) {arrow}{' '}
                {script.summary}
            </Text>
        </Box>
    );
};

// --- Main Component ---

const ReviewScreen = () => {
    const {
        transaction,
        files,
        scripts = [],
        patchStatus,
        selectedItemIndex,
        bodyView,
        isDiffExpanded,
        reasoningScrollIndex,
        scriptErrorIndex,
        fileReviewStates,
        numFiles,
        approvedFilesCount,
        totalLinesAdded,
        totalLinesRemoved,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        navigableItems,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex,
        availableBodyHeight,
        hasRejectedFiles,
    } = useReviewScreen();

    if (!transaction) {
        return <Text>Loading review...</Text>;
    }
    const { hash, message, prompt = '', reasoning = '' } = transaction;

    const renderBody = () => {
        if (bodyView === REVIEW_BODY_VIEWS.NONE) return null;

        if (bodyView === REVIEW_BODY_VIEWS.REASONING) {
            const reasoningText = reasoning || '';
            const reasoningLinesCount = reasoningText.split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ReasonScreen
                        reasoning={reasoningText}
                        scrollIndex={contentScrollIndex}
                        visibleLinesCount={Math.max(1, availableBodyHeight)}
                    />
                    {reasoningLinesCount > visibleLinesCount && (
                        <Text color="gray">
                            Showing lines {reasoningScrollIndex + 1}-{Math.min(reasoningScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
                            of {reasoningLinesCount}
                        </Text>
                    )}
                </Box>
            );
        }
        
        if (bodyView === REVIEW_BODY_VIEWS.DIFF) {
            const currentItem = navigableItems[selectedItemIndex];
            const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                    scrollIndex={contentScrollIndex}
                    maxHeight={Math.max(1, availableBodyHeight)}
                />
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT) {
             const currentItem = navigableItems[selectedItemIndex];
             const scriptItems = navigableItems.filter((i): i is { type: 'script'; id: string } => i.type === 'script');
             const scriptIndex = currentItem?.type === 'script'
                ? scriptItems.findIndex(i => i.id === currentItem.id)
                : -1;
             const selectedScript = scripts[scriptIndex] || null;
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter((line: string) =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>
                        {selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`
                    </Text>
                    <Box marginTop={1} flexDirection="column">
                        {outputLines.map((line: string, index: number) => {
                            const isError = line.includes('Error');
                            const isWarning = line.includes('Warning');
                            const isHighlighted = errorLines[scriptErrorIndex] === line;
                            
                            return (
                                <Text 
                                    key={index} 
                                    color={isError ? 'red' : isWarning ? 'yellow' : undefined}
                                    bold={isHighlighted}
                                    backgroundColor={isHighlighted ? 'blue' : undefined}
                                >
                                    {line}
                                </Text>
                            );
                        })}
                    </Box>
                    {errorLines.length > 0 && (
                        <Text color="gray">
                            Error {scriptErrorIndex + 1} of {errorLines.length} highlighted
                        </Text>
                    )}
                </Box>
             );
        }

        if (bodyView === REVIEW_BODY_VIEWS.CONFIRM_HANDOFF) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>HANDOFF TO EXTERNAL AGENT</Text>
                    <Box flexDirection="column">
                        <Text>This action will:</Text>
                        <Text>1. Copy a detailed prompt to your clipboard for an agentic AI.</Text>
                        <Text>2. Mark the current transaction as &apos;Handoff&apos; and close this review.</Text>
                        <Text>3. Assume that you and the external agent will complete the work.</Text>
                    </Box>
                    <Text>Relaycode will NOT wait for a new patch. This is a final action.</Text>
                    <Text bold color="yellow">Are you sure you want to proceed?</Text>
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.BULK_REPAIR) {
            const failedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'FAILED');

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK REPAIR ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {failedFiles.length} files failed to apply:</Text>
                        {failedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>

                    <Text>How would you like to proceed?</Text>

                    <Box flexDirection="column">
                        {BULK_REPAIR_OPTIONS.map((opt, i) => (
                            <Text key={i} color={selectedBulkRepairOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkRepairOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.BULK_INSTRUCT) {
            const rejectedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'REJECTED');

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK INSTRUCTION ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {rejectedFiles.length} files were rejected:</Text>
                        {rejectedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>
                    <Box flexDirection="column" marginTop={1}>
                        {BULK_INSTRUCT_OPTIONS.map((opt, i) => (
                            <Text key={i} color={selectedBulkInstructOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkInstructOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        if (bodyView === REVIEW_BODY_VIEWS.DIFF) return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.DIFF_VIEW}/>;
        if (bodyView === REVIEW_BODY_VIEWS.REASONING) return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.REASONING_VIEW}/>;
        if (bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT) return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.SCRIPT_OUTPUT_VIEW}/>;
        if (bodyView === REVIEW_BODY_VIEWS.BULK_REPAIR) return <Text>{REVIEW_FOOTER_ACTIONS.BULK_REPAIR_VIEW.text}</Text>;
        if (bodyView === REVIEW_BODY_VIEWS.BULK_INSTRUCT) return <Text>{REVIEW_FOOTER_ACTIONS.BULK_INSTRUCT_VIEW.text}</Text>;
        if (bodyView === REVIEW_BODY_VIEWS.CONFIRM_HANDOFF) return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.HANDOFF_CONFIRM_VIEW}/>;

        // Dynamic Main footer
        const currentItem = navigableItems[selectedItemIndex];
        const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
        const fileState = currentItem?.type === 'file' ? fileReviewStates.get(currentItem.id) : undefined;

        const footerConfig = {
            isFileSelected: currentItem?.type === 'file',
            fileStatus: fileState?.status as 'FAILED' | 'REJECTED' | 'OTHER' | undefined,
            currentItemType: currentItem?.type as 'file' | 'script' | 'reasoning' | 'prompt' | undefined,
            hasFailedFiles,
            hasRejectedFiles,
            hasApprovedFiles: approvedFilesCount > 0,
        };
        return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.MAIN_VIEW(footerConfig)} />;
    };

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · REVIEW </Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column" marginY={1}>
                <Box flexDirection="column">
                    <Text>{hash} · {message}</Text>
                    <Box>
                        <Text>
                            (<Text color="green">+{totalLinesAdded}</Text>/<Text color="red">-{totalLinesRemoved}</Text>)
                            {' '}| {numFiles} Files · ({approvedFilesCount}/{numFiles} Appr)
                            {' '}| Showing {viewOffset + 1}-
                            {Math.min(viewOffset + navigableItemsInView.length, navigableItems.length)}{' '}
                            of {navigableItems.length}
                        </Text>
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && (
                            <Text> · Scripts: SKIPPED</Text>
                        )}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Box>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'prompt' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'prompt' ? '> ' : '  '}
                        (P)rompt ▸ {(prompt || '').substring(0, 50)}...
                    </Text>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'reasoning' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'reasoning' ? '> ' : '  '}
                        (R)easoning ({(reasoning || '').split('\n\n').length} steps){' '}
                        {bodyView === REVIEW_BODY_VIEWS.REASONING ? '▾' : '▸'}{' '}
                        {((reasoning || '').split('\n')[0] ?? '').substring(0, 40)}...
                    </Text>
                </Box>
            </Box>

            <Separator />

            {/* Script Results (if any) */}
            {scripts.length > 0 && navigableItemsInView.some(i => i.type === 'script') && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script: ScriptResult) => {
                            const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'script' && i.id === script.command);
                            if (itemInViewIndex === -1) return null;
                            
                            const isSelected = selectedItemIndex === viewOffset + itemInViewIndex;
                            return (
                                <ScriptItemRow key={script.command} script={script} isSelected={isSelected} isExpanded={bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT && isSelected} />
                            );
                        })}
                    </Box>
                    <Separator />
                </>
            )}
            
            {/* Files Section */}
            <Box flexDirection="column" marginY={1}>
                <Text bold>FILES</Text>
                {files.map((file: FileItem) => {
                    const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'file' && i.id === file.id);
                    if (itemInViewIndex === -1) return null; // Only render if visible

                    const isFocused = selectedItemIndex === viewOffset + itemInViewIndex;
                    const reviewState = fileReviewStates.get(file.id);
                    
                    return (
                        <FileItemRow key={file.id} file={file} isFocused={isFocused} reviewState={reviewState || { status: 'AWAITING' }} />
                    );
                })}
            </Box>
            
            <Separator />
            
            {/* Body Viewport */}
            {bodyView !== REVIEW_BODY_VIEWS.NONE && (
                <>
                    <Box marginY={1}>
                        {renderBody()}
                    </Box>
                    <Separator />
                </>
            )}

            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default ReviewScreen;
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';
import { useAppStore } from './app.store';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { ReviewService, type SimulationResult } from '../services/review.service';
import { INITIAL_APPLY_STEPS, PATCH_STATUS, REVIEW_BODY_VIEWS } from '../constants/review.constants';
import { moveIndex } from './navigation.utils';
import { sleep } from '../utils';
import type { FileReviewStatus } from '../types/domain.types';

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    startTime?: number;
    duration?: number;
}

export type ReviewBodyView = (typeof REVIEW_BODY_VIEWS)[keyof typeof REVIEW_BODY_VIEWS];
export type PatchStatus = (typeof PATCH_STATUS)[keyof typeof PATCH_STATUS];
export type ApplyUpdate =
    | { type: 'UPDATE_STEP'; payload: { id: string; status: ApplyStep['status']; duration?: number; details?: string } }
    | { type: 'ADD_SUBSTEP'; payload: { parentId: string; substep: Omit<ApplyStep, 'substeps'> } }
    | { type: 'UPDATE_SUBSTEP'; payload: { parentId: string; substepId: string; status: ApplyStep['status']; title?: string } };

interface ReviewState {
    patchStatus: PatchStatus;
    applySteps: ApplyStep[];
    selectedItemIndex: number;
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;
    reasoningScrollIndex: number;
    scriptErrorIndex: number;
    processingStartTime: number | null;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string; details?: string }>;

    selectedBulkRepairOptionIndex: number;
    selectedBulkInstructOptionIndex: number;
    isCancelling: boolean;
    isSkipping: boolean;

    actions: {
        load: (transactionId: string, initialState?: Partial<Pick<ReviewState, 'bodyView' | 'selectedBulkRepairOptionIndex'>>) => void;
        moveSelectionUp: (listSize: number) => void;
        moveSelectionDown: (listSize: number) => void;
        expandDiff: () => void;
        toggleBodyView: (view: Extract<
            ReviewBodyView, 'bulk_instruct' |
            'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'
        >) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        startApplySimulation: (transactionId: string, scenario: 'success' | 'failure') => void;
        tryRepairFile: (fileId: string) => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        skipCurrentStep: () => void;
        resetSkip: () => void;
        tryInstruct: (fileId: string) => void;
        cancelProcessing: () => void;
        showBulkInstruct: () => void;
        executeBulkInstructOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;
        updateApplyStep: (id: string, status: ApplyStep['status'], details?: string) => void;
        addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
        updateApplySubstep: (parentId: string, substepId: string, status: ApplyStep['status'], title?: string) => void;
        updateFileReviewStatus: (fileId: string, status: FileReviewStatus, error?: string, details?: string) => void;
        toggleFileApproval: (fileId: string) => void;
        rejectAllFiles: () => void;
        navigateBulkRepairUp: () => void;
        navigateBulkRepairDown: () => void;
        navigateBulkInstructUp: () => void;
        navigateBulkInstructDown: () => void;
    };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    patchStatus: PATCH_STATUS.SUCCESS,
    applySteps: INITIAL_APPLY_STEPS,
    selectedItemIndex: 0,
    bodyView: REVIEW_BODY_VIEWS.NONE,
    isDiffExpanded: false,
    reasoningScrollIndex: 0,
    scriptErrorIndex: 0,
    processingStartTime: null,
    fileReviewStates: new Map(),
    selectedBulkRepairOptionIndex: 0,
    selectedBulkInstructOptionIndex: 0,
    isCancelling: false,
    isSkipping: false,

    actions: {
        load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;

            // This logic is preserved from the deleted `prepareTransactionForReview`
            // to allow debug screens to jump directly to a pre-populated review state
            // without running the full simulation.
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
            const patchStatus = isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS';
            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                patchStatus,
                fileReviewStates,
                processingStartTime: null,
                selectedItemIndex: 0,
                bodyView: initialState?.bodyView ?? REVIEW_BODY_VIEWS.NONE,
                isDiffExpanded: false,
                reasoningScrollIndex: 0,
                scriptErrorIndex: 0,
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
                selectedBulkRepairOptionIndex: 0,
                selectedBulkInstructOptionIndex: 0,
                ...initialState,
            });
        },
        moveSelectionUp: (listSize) => set(state => {
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', listSize) };
        }),
        moveSelectionDown: (listSize) => set(state => {
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', listSize) };
        }),
        toggleBodyView: (view) => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.selectedItemIndex >= files.length) return {};
            return {
                bodyView: state.bodyView === view ? REVIEW_BODY_VIEWS.NONE : view,
                isDiffExpanded: false,
            };
        }),
        setBodyView: (view) => set({ bodyView: view }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (selectedTransactionId) {
                useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'APPLIED');
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        startApplySimulation: async (transactionId, scenario) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction?.files) return;

            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            const { updateApplyStep, addApplySubstep, updateApplySubstep } = get().actions;

            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
                processingStartTime: Date.now(),
                isCancelling: false,
                isSkipping: false,
                fileReviewStates: new Map(), // Clear previous states
            });

            showReviewProcessingScreen();
            const simulationGenerator = ReviewService.runApplySimulation(transaction.files, scenario);
            let simulationResult: SimulationResult;

            // Manually iterate to get the return value from the async generator
            const iterator = simulationGenerator[Symbol.asyncIterator]();
            while (true) {
                const { value, done } = await iterator.next();
                if (done) {
                    simulationResult = value as SimulationResult;
                    break;
                }
                const update = value;
                if (update.type === 'UPDATE_STEP') {
                    updateApplyStep(update.payload.id, update.payload.status, update.payload.details);
                } else if (update.type === 'ADD_SUBSTEP') {
                    addApplySubstep(update.payload.parentId, update.payload.substep);
                } else if (update.type === 'UPDATE_SUBSTEP') {
                    updateApplySubstep(update.payload.parentId, update.payload.substepId, update.payload.status, update.payload.title);
                }
            }

            await sleep(1000);
            set({
                processingStartTime: null,
                fileReviewStates: simulationResult.fileReviewStates,
                patchStatus: simulationResult.patchStatus,
            });
            showReviewScreen();
        },
        tryRepairFile: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!file) return;

            const { status, error } = fileReviewStates.get(file.id) || {};
            if (status !== 'FAILED') return;
            
            ReviewService.tryRepairFile(file, error);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING');
        },
        tryInstruct: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!tx || !file) return;

            const { status } = fileReviewStates.get(file.id) || {};
            if (status !== 'REJECTED') return;
            
            ReviewService.tryInstructFile(file, tx);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING', undefined, 'Instruction prompt copied!');
        },
        showBulkInstruct: () => get().actions.setBodyView('bulk_instruct'),
        cancelProcessing: () => set({ isCancelling: true }),
        skipCurrentStep: () => set({ isSkipping: true }),
        resetSkip: () => set({ isSkipping: false }),
        executeBulkInstructOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const rejectedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'REJECTED');
            if (rejectedFiles.length === 0) {
                set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkInstructPrompt(rejectedFiles, tx);
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 2:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 3:
                    rejectedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'APPROVED');
                    });
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                default:
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
            }
        },

        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const failedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'FAILED');
            if (failedFiles.length === 0) {
                set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkRepairPrompt(failedFiles);
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 2: {
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    failedFiles.forEach(f => get().actions.updateFileReviewStatus(f.id, 'RE_APPLYING'));
                    const results = await ReviewService.runBulkReapply(failedFiles);
                    results.forEach(result =>
                        get().actions.updateFileReviewStatus(
                            result.id, result.status, result.error,
                        ),
                    );
                    break;
                }
                case 3:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 4:
                    failedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'REJECTED');
                    });
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                default:
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
            }
        },
        confirmHandoff: () => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.files) return;
            const { fileReviewStates } = get();
            ReviewService.generateHandoffPrompt(tx, fileReviewStates);
            ReviewService.performHandoff(tx.hash);
        },
        scrollReasoningUp: () => set(state => ({ reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1) })),
        scrollReasoningDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.reasoning) return {};
            const maxLines = tx.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({ scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1) })),
        navigateScriptErrorDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.scripts || !tx?.files) return {};
            const selectedScript = tx.scripts[state.selectedItemIndex - tx.files.length];
            if (selectedScript?.output) {
                const errorLines = selectedScript.output
                    .split('\n')
                    .filter(line => line.includes('Error') || line.includes('Warning'));
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),
        updateApplyStep: (id, status, details) => {
            set(state => {
                const newSteps = state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep: ApplyStep = { ...s, status };
                        if (status === 'active') {
                            newStep.startTime = Date.now();
                        } else if ((status === 'done' || status === 'failed' || status === 'skipped') && s.startTime) {
                            newStep.duration = (Date.now() - s.startTime) / 1000;
                        }
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                });
                return { applySteps: newSteps };
            });
        },
        updateApplySubstep: (parentId, substepId, status, title) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId && s.substeps) {
                        const newSubsteps = s.substeps.map(sub => {
                            if (sub.id === substepId) {
                                const newSub: ApplyStep = { ...sub, status };
                                if (status === 'active') {
                                    newSub.startTime = Date.now();
                                } else if ((status === 'done' || status === 'failed') && sub.startTime) {
                                    newSub.duration = (Date.now() - sub.startTime) / 1000;
                                }
                                if (title) newSub.title = title;
                                return newSub;
                            }
                            return sub;
                        });
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
        addApplySubstep: (parentId, substep) => {
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
        updateFileReviewStatus: (fileId, status, error, details) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                newStates.set(fileId, { status, error, details });
                return { fileReviewStates: newStates };
            });
        },
        toggleFileApproval: (fileId) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                const current = newStates.get(fileId);
                if (current) {
                    const newStatus: FileReviewStatus = current.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                    newStates.set(fileId, { status: newStatus, error: undefined, details: undefined });
                }
                return { fileReviewStates: newStates };
            });
        },
        rejectAllFiles: () => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                for (const [fileId, reviewState] of newStates.entries()) {
                    if (reviewState.status === 'APPROVED') {
                        newStates.set(fileId, { status: 'REJECTED', error: undefined, details: undefined });
                    }
                }
                return { fileReviewStates: newStates };
            });
        },
        navigateBulkRepairUp: () => set(state => ({
            selectedBulkRepairOptionIndex: moveIndex(state.selectedBulkRepairOptionIndex, 'up', 4),
        })),
        navigateBulkRepairDown: () => set(state => ({
            selectedBulkRepairOptionIndex: moveIndex(state.selectedBulkRepairOptionIndex, 'down', 4),
        })),
        navigateBulkInstructUp: () => set(state => ({
            selectedBulkInstructOptionIndex: moveIndex(state.selectedBulkInstructOptionIndex, 'up', 4),
        })),
        navigateBulkInstructDown: () => set(state => ({
            selectedBulkInstructOptionIndex: moveIndex(state.selectedBulkInstructOptionIndex, 'down', 4),
        })),
    },
}));
```
