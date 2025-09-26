# Directory Structure
```
src/
  components/
    ActionFooter.tsx
    CopyScreen.tsx
    DashboardScreen.tsx
    DebugLogScreen.tsx
    GitCommitScreen.tsx
    NotificationScreen.tsx
    ReviewScreen.tsx
    Separator.tsx
    TransactionDetailScreen.tsx
    TransactionHistoryScreen.tsx
  constants/
    detail.constants.ts
    history.constants.ts
    log.constants.ts
    review.constants.ts
  hooks/
    useCopyScreen.tsx
    useDashboardScreen.tsx
    useDebugLogScreen.tsx
    useDebugMenu.tsx
    useReviewScreen.tsx
  stores/
    copy.store.ts
    dashboard.store.ts
    log.store.ts
    navigation.utils.ts
    review.store.ts
  types/
    actions.types.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/NotificationScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { useNotificationScreen } from '../hooks/useNotificationScreen';
import ActionFooter from './ActionFooter';
import ModalLayout from './layout/ModalLayout';
import { NOTIFICATION_FOOTER_ACTIONS, NOTIFICATION_TYPE_CONFIG } from '../constants/notification.constants';

const NotificationScreen = () => {
    const { notification, countdown } = useNotificationScreen();

    if (!notification) {
        return null;
    }

    const config = NOTIFICATION_TYPE_CONFIG[notification.type];

    return (
        <ModalLayout>
            <Box paddingX={2} marginBottom={1} backgroundColor={config.color}>
                <Text bold color="black">{config.title}</Text>
            </Box>
            <Box paddingX={2}>
                <Text>{notification.message}</Text>
            </Box>
            <Box marginTop={1}>
                <Box paddingX={2}>
                    <Text color="gray">(Dismissing in {countdown}s...)</Text>
                </Box>
            </Box>
            <Box marginTop={1}>
                <ActionFooter actions={NOTIFICATION_FOOTER_ACTIONS} />
            </Box>
        </ModalLayout>
    );
};

export default NotificationScreen;
```

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

## File: src/constants/history.constants.ts
```typescript
import type { ActionItem } from '../types/actions.types';

export const HISTORY_VIEW_MODES = {
    LIST: 'LIST',
    FILTER: 'FILTER',
    BULK_ACTIONS: 'BULK_ACTIONS',
} as const;

export const HISTORY_ITEM_PATH_SEGMENTS = {
    FILE: '/file/',
    PROMPT: '/prompt',
    REASONING: '/reasoning',
} as const;

export const BULK_ACTIONS_OPTIONS = [
    '(1) Revert Selected Transactions',
    "(2) Mark as 'Git Committed'",
    '(3) Delete Selected Transactions (from Relaycode history)',
    '(Esc) Cancel',
] as const;

export const HISTORY_FOOTER_ACTIONS = {
    FILTER_MODE: [{ key: 'Enter', label: 'Apply Filter & Return' }, { key: 'Esc', label: 'Cancel' }] as const,
    BULK_MODE: { text: 'Choose an option [1-3] or (Esc) Cancel' } as const,
    LIST_MODE: (openActionLabel: string, hasSelection: boolean): ActionItem[] => {
        const actions: ActionItem[] = [
            { key: '↑↓/PgUp/PgDn', label: 'Nav' },
            { key: '→', label: 'Expand' },
            { key: '←', label: 'Collapse' },
            { key: 'Spc', label: 'Select' },
            { key: 'Ent', label: 'Details' },
            { key: 'O', label: openActionLabel },
            { key: 'F', label: 'Filter' },
        ];
        if (hasSelection) {
            actions.push({ key: 'C', label: 'Copy' }, { key: 'B', label: 'Bulk' });
        }
        return actions;
    },
};
```

## File: src/constants/log.constants.ts
```typescript
export const MAX_LOGS = 200;

export const DEBUG_LOG_MODES = {
    LIST: 'LIST',
    FILTER: 'FILTER',
} as const;

export const LOG_LEVEL_COLORS = {
    DEBUG: 'gray',
    INFO: 'white',
    WARN: 'yellow',
    ERROR: 'red',
};

export const LOG_LEVEL_TAGS = {
    DEBUG: { color: 'white', backgroundColor: 'gray' },
    INFO: { color: 'black', backgroundColor: 'cyan' },
    WARN: { color: 'black', backgroundColor: 'yellow' },
    ERROR: { color: 'white', backgroundColor: 'red' },
};

export const DEBUG_LOG_FOOTER_ACTIONS = {
    FILTER_MODE: [{ key: 'Enter/Esc', label: 'Apply & Close Filter' }] as const,
    LIST_MODE: (hasLogs: boolean) => {
        const actions = [
            { key: '↑↓/PgUp/PgDn', label: 'Scroll' },
            { key: 'F', label: 'Filter' },
        ];
        if (hasLogs) actions.push({ key: 'C', label: 'Clear' });
        actions.push({ key: 'Esc/Ctrl+L', label: 'Close' });
        return actions;
    },
};
```

## File: src/stores/log.store.ts
```typescript
import { create } from 'zustand';
import type { LogEntry, LogLevel } from '../types/log.types';
import { MAX_LOGS } from '../constants/log.constants';

interface LogState {
    logs: LogEntry[];
    actions: {
        addLog: (level: LogLevel, message: string) => void;
        clearLogs: () => void;
    };
}

export const useLogStore = create<LogState>((set) => ({
    logs: [],
    actions: {
        addLog: (level, message) => {
            set(state => {
                const newLog: LogEntry = {
                    level,
                    message,
                    timestamp: Date.now(),
                };
                // Prepend new log and trim the array to max size
                const updatedLogs = [newLog, ...state.logs].slice(0, MAX_LOGS);
                return { logs: updatedLogs };
            });
        },
        clearLogs: () => set({ logs: [] }),
    },
}));
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

## File: src/constants/detail.constants.ts
```typescript
import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Transaction Detail screen.
 */
export const NAVIGATOR_SECTIONS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES: 'FILES',
} as const;

export const DETAIL_BODY_VIEWS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES_LIST: 'FILES_LIST',
    DIFF_VIEW: 'DIFF_VIEW',
    REVERT_CONFIRM: 'REVERT_CONFIRM',
    NONE: 'NONE',
} as const;

export const DETAIL_FOOTER_ACTIONS = {
    REVERT_CONFIRM: [
        { key: 'Enter', label: 'Confirm Revert' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    BASE: (options: { openActionLabel: string; isRevertable: boolean }): ActionItem[] => {
        const { openActionLabel, isRevertable } = options;
        const actions: ActionItem[] = [
            { key: 'C', label: 'Copy' },
            { key: 'O', label: openActionLabel },
        ];
        if (isRevertable) {
            actions.push({ key: 'U', label: 'Undo' });
        }
        actions.push({ key: 'Q', label: 'Quit/Back' });
        return actions;
    },
    DIFF_VIEW: [{ key: '↑↓', label: 'Nav Files' }, { key: '←', label: 'Back to List' }] as const,
    FILE_LIST_VIEW: [
        { key: '↑↓', label: 'Nav Files' },
        { key: '→', label: 'View Diff' },
        { key: '←', label: 'Back to Sections' },
    ] as const,
    SECTION_EXPANDED: [{ key: '↑↓', label: 'Nav/Scroll' }, { key: '→', label: 'Drill In' }, { key: '←', label: 'Collapse' }] as const,
    SECTION_COLLAPSED: [{ key: '↑↓', label: 'Nav' }, { key: '→', label: 'Expand' }] as const,
};
```

## File: src/hooks/useCopyScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { UI_CONFIG } from '../config/ui.config';
import { OVERLAYS } from '../constants/view.constants';
import { useListNavigator } from './useListNavigator.js';

export const useCopyScreen = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const {
        title, items, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));
    
    useEffect(() => setSelectedIndex(0), [items]);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: items.length,
        layoutConfig: UI_CONFIG.layout.copyScreen,
    });


    useListNavigator({
        itemCount: items.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: useViewStore.getState().activeOverlay === OVERLAYS.COPY,
        onKey: (input, key) => {
            if (key.escape) {
                actions.close();
                return;
            }
            if (input === ' ') {
                actions.toggleSelection();
                return;
            }
            if (key.return) {
                actions.executeCopy();
                return;
            }
            const item = items.find(i => i.key.toLowerCase() === input.toLowerCase());
            if (item) {
                actions.toggleSelectionById(item.id);
            }
        },
    });

    const itemsInView = items.slice(viewOffset, viewOffset + viewportHeight);

    return {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    };
};
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
        { key: '↑↓', label: 'Next/Prev File' },
        { key: 'X', label: 'Expand' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
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
            actions.push({ key: 'D/Ent', label: 'Diff' });
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

## File: src/components/DebugLogScreen.tsx
```typescript
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import { DEBUG_LOG_FOOTER_ACTIONS, DEBUG_LOG_MODES, LOG_LEVEL_COLORS, LOG_LEVEL_TAGS } from '../constants/log.constants';
import type { LogEntry } from '../types/log.types';
import { useStdoutDimensions } from '../utils';
import ScreenLayout from './layout/ScreenLayout';

const LogEntryRow = ({ entry, isSelected }: { entry: LogEntry; isSelected: boolean }) => {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.replace('Z', '');
    const color = LOG_LEVEL_COLORS[entry.level];
    const tagColors = LOG_LEVEL_TAGS[entry.level];

    return (
        <Text color={color}>
            {isSelected ? '> ' : '  '}
            <Text color="gray">{time}</Text>
            {' '}
            <Text bold color={tagColors.color} backgroundColor={tagColors.backgroundColor}>
                {' '}{entry.level.padEnd(5, ' ')}{' '}
            </Text>
            {' '}
            {entry.message}
        </Text>
    );
};

const DebugLogScreen = () => {
    const {
        logsInView,
        logCount,
        filteredLogCount,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
        viewOffset,
    } = useDebugLogScreen();
    const [width] = useStdoutDimensions();

    const renderFilter = () => (
        <Box>
            <Text>Filter: </Text>
            {mode === DEBUG_LOG_MODES.FILTER ? (
                <TextInput
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder="Type to filter log messages..."
                />
            ) : (
                <Text color="gray">{filterQuery || '(none)'}</Text>
            )}
            <Box flexGrow={1} /> 
            <Text>
                Showing {Math.min(viewOffset + 1, filteredLogCount)}-
                {Math.min(viewOffset + logsInView.length, filteredLogCount)} of {filteredLogCount}
            </Text> 
        </Box>
    );

    const footerActions =
        mode === DEBUG_LOG_MODES.FILTER
            ? DEBUG_LOG_FOOTER_ACTIONS.FILTER_MODE
            : DEBUG_LOG_FOOTER_ACTIONS.LIST_MODE(logCount > 0);

    return (
        <ScreenLayout
            title="▲ relaycode · DEBUG LOG"
            footer={<ActionFooter actions={footerActions} />}
        >
            <Box flexDirection="column" flexGrow={1} paddingX={2}>
                {renderFilter()}
                <Box flexDirection="column" flexGrow={1} marginTop={1}>
                    {logsInView.map((entry, index) => (
                        <LogEntryRow
                            key={`${entry.timestamp}-${index}`}
                            entry={entry}
                            isSelected={selectedIndex === index + viewOffset}
                        />
                    ))}
                    {logCount > 0 && filteredLogCount === 0 && (
                        <Text color="gray">No logs match your filter.</Text>
                    )}
                    {logCount === 0 && (
                        <Text color="gray">No log entries yet. Waiting for system activity...</Text>
                    )}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default DebugLogScreen;
```

## File: src/hooks/useDebugLogScreen.tsx
```typescript
import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useLogStore } from '../stores/log.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { LoggerService } from '../services/logger.service';
import { DEBUG_LOG_MODES } from '../constants/log.constants';
import { OVERLAYS } from '../constants/view.constants';
import { UI_CONFIG } from '../config/ui.config';
import { useListNavigator } from './useListNavigator';

export const useDebugLogScreen = () => {
    const logs = useLogStore(s => s.logs);
    const clearLogs = useLogStore(s => s.actions.clearLogs);
    const setActiveOverlay = useViewStore(s => s.actions.setActiveOverlay);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<keyof typeof DEBUG_LOG_MODES>('LIST');
    const [filterQuery, setFilterQuery] = useState('');

    const filteredLogs = useMemo(() => logs.filter(log =>
        log.message.toLowerCase().includes(filterQuery.toLowerCase()),
    ), [logs, filterQuery]);

    // Reset index to top when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filterQuery]);

    // Clamp index if it's out of bounds after logs change for other reasons
    useEffect(() => {
        if (selectedIndex >= filteredLogs.length) {
            setSelectedIndex(Math.max(0, filteredLogs.length - 1));
        }
    }, [filteredLogs.length, selectedIndex]);

    // Header, borders, footer, filter line
    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: filteredLogs.length,
        layoutConfig: UI_CONFIG.layout.debugLog,
    });

    const isOverlayActive = useViewStore.getState().activeOverlay === OVERLAYS.LOG;

    useInput((_input, key) => {
        if (mode === DEBUG_LOG_MODES.FILTER) {
            if (key.escape || key.return) {
                setMode(DEBUG_LOG_MODES.LIST);
            }
        }
    }, { isActive: isOverlayActive && mode === DEBUG_LOG_MODES.FILTER });

    useListNavigator({
        itemCount: filteredLogs.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: isOverlayActive && mode === DEBUG_LOG_MODES.LIST,
        onKey: (input, key) => {
            if (key.escape) {
                setActiveOverlay(OVERLAYS.NONE);
                return;
            }
            if (input.toLowerCase() === 'c') {
                clearLogs();
                setFilterQuery('');
                setSelectedIndex(0);
                return;
            }
            if (input.toLowerCase() === 'f') {
                setMode(DEBUG_LOG_MODES.FILTER);
            }
        }
    });

    useEffect(() => {
        LoggerService.startSimulator();
        return () => {
            LoggerService.stopSimulator();
        };
    }, []);

    const logsInView = filteredLogs.slice(viewOffset, viewOffset + viewportHeight);

    return {
        logsInView,
        logCount: logs.length,
        filteredLogCount: filteredLogs.length,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
        viewOffset,
    };
};
```

## File: src/components/Separator.tsx
```typescript
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = ({ width: propWidth }: { width?: number }) => {
	const [columns] = useStdoutDimensions();
	const width = propWidth ?? columns;
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;
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

## File: src/stores/copy.store.ts
```typescript
import { create } from 'zustand';
import { useViewStore } from './view.store';
import { useNotificationStore } from './notification.store';
import { LoggerService } from '../services/logger.service';
import { CopyService } from '../services/copy.service';
import type { CopyItem } from '../types/copy.types';
import type { Transaction, FileItem } from '../types/domain.types';

export type { CopyItem };

interface CopyState {
    title: string;
    items: CopyItem[];
    selectedIds: Set<string>;
    lastCopiedMessage: string | null;
    onClose?: () => void;

    actions: {
        open: (title: string, items: CopyItem[], onClose?: () => void) => void;
        close: () => void;
        openForReview: (transaction: Transaction, files: FileItem[], selectedFile?: FileItem) => void;
        openForDetail: (transaction: Transaction, selectedFile?: FileItem) => void;
        openForHistory: (transactions: Transaction[]) => void;
        toggleSelection: () => void;
        toggleSelectionById: (id: string) => void;
        executeCopy: () => void;
    };
}

export const useCopyStore = create<CopyState>((set, get) => ({
    title: '',
    items: [],
    selectedIds: new Set(),
    lastCopiedMessage: null,
    onClose: undefined,

    actions: {
        open: (title, items, onClose) => {
            const defaultSelectedIds = new Set(items.filter(i => i.isDefaultSelected).map(i => i.id));
            useViewStore.getState().actions.setActiveOverlay('copy');
            set({
                title,
                items,
                selectedIds: defaultSelectedIds,
                lastCopiedMessage: null,
                onClose,
            });
        },
        close: () => {
            useViewStore.getState().actions.setActiveOverlay('none');
            get().onClose?.();
            set({ items: [], onClose: undefined });
        },
        openForReview: (transaction, files, selectedFile) => {
            const { actions } = get();
            const title = 'Select data to copy from review:';
            const items = CopyService.getCopyItemsForReview(transaction, files, selectedFile);
            actions.open(title, items);
        },
        openForDetail: (transaction, selectedFile) => {
            const { actions } = get();
            const title = `Select data to copy from transaction ${transaction.hash}:`;
            const items = CopyService.getCopyItemsForDetail(transaction, selectedFile);
            actions.open(title, items);
        },
        openForHistory: (transactions) => {
            const { actions } = get();
            const title = `Select data to copy from ${transactions.length} transactions:`;
            const items = CopyService.getCopyItemsForHistory(transactions);
            actions.open(title, items);
        },
        toggleSelection: () => set(state => {
            const currentItem = useCopyScreen.getState().items[useCopyScreen.getState().selectedIndex];
            if (!currentItem) return {};
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(currentItem.id)) {
                newSelectedIds.delete(currentItem.id);
            } else {
                newSelectedIds.add(currentItem.id);
            }
            return { selectedIds: newSelectedIds };
        }),
        toggleSelectionById: (id: string) => set(state => {
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                newSelectedIds.add(id);
            }
            return { selectedIds: newSelectedIds };
        }),
        executeCopy: async () => {
            const { items, selectedIds } = get();
            const itemsToCopy = items.filter(i => selectedIds.has(i.id));
            if (itemsToCopy.length === 0) return;

            LoggerService.info(`Copying ${itemsToCopy.length} item(s) to clipboard.`);
            const dataPromises = itemsToCopy.map(item => item.getData());
            const resolvedData = await Promise.all(dataPromises);

            const content = itemsToCopy
                .map((item, index) => `--- ${item.label} ---\n${resolvedData[index]}`)
                .join('\n\n');
            const message = `Copied ${itemsToCopy.length} item(s) to clipboard.`;
            LoggerService.debug(`[CLIPBOARD MOCK] ${message}\n${content.substring(0, 200)}...`);
            useNotificationStore.getState().actions.show({
                type: 'success',
                title: 'Copied to Clipboard',
                message,
            });
            set({ lastCopiedMessage: message });
        },
    },
}));
```

## File: src/components/CopyScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';
import { useCopyScreen } from '../hooks/useCopyScreen';
import ModalLayout from './layout/ModalLayout';
import { COPY_SCREEN_FOOTER_ACTIONS } from '../constants/copy.constants';

const CopyScreen = () => {
    const {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    } = useCopyScreen();
    const [width] = useStdoutDimensions();

    return (
        <ModalLayout>
            <Box
                flexDirection="column"
                paddingX={2}
                width="100%"
            >
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · COPY MODE </Text>
                <Separator width={Math.floor(width * 0.8) - 4} />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {itemsInView.map((item, index) => {
                            const isSelected = (index + viewOffset) === selectedIndex;
                            const isChecked = selectedIds.has(item.id);
                            return (
                                <Text key={item.id} color={isSelected ? 'cyan' : undefined}>
                                    {isSelected ? '> ' : '  '}
                                    [{isChecked ? 'x' : ' '}] ({item.key}) {item.label}
                                </Text>
                            );
                        })}
                    </Box>
                </Box>
                <Separator width={Math.floor(width * 0.8) - 4} />
                {lastCopiedMessage && <Text color="green">✓ {lastCopiedMessage}</Text>}
                <ActionFooter actions={COPY_SCREEN_FOOTER_ACTIONS}/>
            </Box>
        </ModalLayout>
    );
};

export default CopyScreen;
```

## File: src/components/GitCommitScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';
import ScreenLayout from './layout/ScreenLayout';
import { COMMIT_FOOTER_ACTIONS } from '../constants/commit.constants';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting, commitError } = useGitCommitScreen();

    const messageParts = finalCommitMessage.split('\n');
    const subject = messageParts[0] || '';
    const body = messageParts.slice(1).join('\n');

    const renderError = () => (
        <Box 
            flexDirection="column" 
            borderStyle="round" 
            borderColor="red" 
            paddingX={2} 
            marginY={1}
        >
            <Text bold color="red">COMMIT FAILED</Text>
            <Text wrap="wrap">The git operation failed. Please check the error message below and resolve any issues before retrying.</Text>
            <Box marginTop={1}>
                <Text color="red">{commitError}</Text>
            </Box>
        </Box>
    );

    const footer = isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={commitError ? COMMIT_FOOTER_ACTIONS.FAILURE : COMMIT_FOOTER_ACTIONS.BASE} />;

    return (
        <ScreenLayout
            title="▲ relaycode · GIT COMMIT"
            footer={footer}
        >
            <Box flexDirection="column" paddingX={2}>
                <Box flexDirection="column">
                    <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>TRANSACTIONS INCLUDED</Text>
                        {transactionsToCommit.map(tx => (
                            <Text key={tx.id}>- <Text color="gray">{tx.hash}</Text>: {tx.message}</Text>
                        ))}
                    </Box>
                </Box>
                <Box marginY={1} flexDirection="column">
                    <Text bold>FINAL COMMIT MESSAGE</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text color="yellow">{subject}</Text>
                        {body ? <Text>{body}</Text> : null}
                    </Box>
                </Box>
                {commitError && renderError()}
                {!commitError && <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>}
            </Box>
        </ScreenLayout>
    );
};

export default GitCommitScreen;
```

## File: src/hooks/useDashboardScreen.tsx
```typescript
import { useState, useEffect, useRef } from 'react';
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
        togglePause,
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
                if (transactions[selectedTransactionIndex] && !expandedTransactionId) toggleExpand();
                return;
            }
            if (key.return) {
                const selectedTx = transactions[selectedTransactionIndex];
                if (!selectedTx) return;
                
                const isExpanded = expandedTransactionId === selectedTx.id;

                if (isExpanded) {
                    if (selectedTx.status === 'PENDING') {
                        useReviewStore.getState().actions.load(selectedTx.id);
                        appActions.showReviewScreen();
                    } else {
                        useDetailStore.getState().actions.load(selectedTx.id);
                        appActions.showTransactionDetailScreen();
                    }
                } else {
                    toggleExpand();
                }
                return;
            }
            if (input.toLowerCase() === 'p') togglePause();
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

## File: src/components/TransactionHistoryScreen.tsx
```typescript
import { useMemo } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import type { Transaction, FileItem } from '../types/domain.types';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';
import { HISTORY_FOOTER_ACTIONS, BULK_ACTIONS_OPTIONS, HISTORY_VIEW_MODES } from '../constants/history.constants';
import ActionFooter from './ActionFooter';
import ScreenLayout from './layout/ScreenLayout';
import { TRANSACTION_STATUS_UI, FILE_CHANGE_ICONS } from '../constants/ui.constants';

// --- Sub-components ---

const ContentRow = ({ title, content, isSelected, isExpanded, isLoading }: {
    title: string;
    content: string;
    isSelected: boolean;
    isExpanded: boolean;
    isLoading: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';
    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}{icon} {title}
            </Text>
            {isLoading && <Box paddingLeft={8}><Spinner type="dots" /></Box>}
            {isExpanded && !isLoading && (
                <Box paddingLeft={8} flexDirection="column">
                    {(content || '').split('\n').map((line, i) => <Text key={i}>{line || ' '}</Text>)}
                </Box>
            )}
        </Box>
    );
};

const DiffPreview = ({ diff }: { diff: string }) => {
    const lines = diff.split('\n');
    const previewLines = lines.slice(0, 5);
    const hiddenLines = lines.length > 5 ? lines.length - 5 : 0;

    return (
        <Box flexDirection="column" paddingLeft={8}>
            {previewLines.map((line, i) => {
                let color = 'white';
                if (line.startsWith('+')) color = 'green';
                if (line.startsWith('-')) color = 'red';
                if (line.startsWith('@@')) color = 'cyan';
                return <Text key={i} color={color}>{line}</Text>;
            })}
            {hiddenLines > 0 && <Text color="gray">... {hiddenLines} lines hidden ...</Text>}
        </Box>
    );
};

const FileRow = ({ file, isSelected, isExpanded, isLoading }: {
    file: FileItem;
    isSelected: boolean;
    isExpanded: boolean;
    isLoading: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';

    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}{' '}
                {icon} {FILE_CHANGE_ICONS[file.type]} {file.path}
            </Text>
            {isLoading && <Box paddingLeft={8}><Spinner type="dots" /></Box>}
            {isExpanded && !isLoading && <DiffPreview diff={file.diff} />}
        </Box>
    );
};

const TransactionRow = ({
    tx,
    isSelected,
    isExpanded,
    isSelectedForAction,
    hasSelection,
}: {
    tx: Transaction;
    isSelected: boolean;
    isExpanded: boolean;
    isSelectedForAction: boolean;
    hasSelection: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';
    const uiStatus = TRANSACTION_STATUS_UI[tx.status as keyof typeof TRANSACTION_STATUS_UI] || { text: tx.status, color: 'white' };

    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    const selectionIndicator = isSelectedForAction ? '[x] ' : '[ ] ';
    
    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {hasSelection && selectionIndicator}
                {icon} <Text color={uiStatus.color}>{uiStatus.text}</Text> · <Text color="gray">{tx.hash}</Text> · {date} ·{' '}
                {tx.message}
            </Text>
            {isExpanded && (
                <Box flexDirection="column" paddingLeft={8}>
                    {tx.stats && (
                        <Text color="gray">
                            Stats: {tx.stats.files} files, +{tx.stats.linesAdded}/-{tx.stats.linesRemoved}
                        </Text>
                    )}
                    <Text>Files:</Text>
                </Box>
            )}
        </Box>
    );
};

const BulkActionsMode = ({ selectedForActionCount }: { selectedForActionCount: number }) => {
    return (
        <Box flexDirection="column" marginY={1}>
            <Text bold color="yellow">PERFORM BULK ACTION ON {selectedForActionCount} SELECTED ITEMS</Text>
            <Box marginY={1}>
                <Text>This action is often irreversible. Are you sure?</Text>
            </Box>
            {BULK_ACTIONS_OPTIONS.map(opt => <Text key={opt}>{opt}</Text>)}
        </Box>
    );
};

// --- Main Component ---

const TransactionHistoryScreen = () => {
    const {
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        loadingPaths,
        actions,
        transactions,
        itemsInView,
        filterStatus,
        showingStatus,
        statsStatus,
        hasSelection,
    } = useTransactionHistoryScreen();

    const transactionsById = useMemo(() => new Map(transactions.map(tx => [tx.id, tx])), [transactions]);

    const renderFooter = () => {
        if (mode === HISTORY_VIEW_MODES.FILTER) {
            return <ActionFooter actions={HISTORY_FOOTER_ACTIONS.FILTER_MODE} />;
        }
        if (mode === HISTORY_VIEW_MODES.BULK_ACTIONS) {
            return <Text>{HISTORY_FOOTER_ACTIONS.BULK_MODE.text}</Text>;
        }
        
        const openActionLabel = selectedItemPath.includes('/file/') ? 'Open File' : 'Open YAML';
        return <ActionFooter actions={HISTORY_FOOTER_ACTIONS.LIST_MODE(openActionLabel, hasSelection)} />;
    };

    return (
        <ScreenLayout title="▲ relaycode · TRANSACTION HISTORY" footer={renderFooter()}>
            <Box>
                <Text>Filter: </Text>
                {mode === HISTORY_VIEW_MODES.FILTER ? (
                    <TextInput value={filterQuery} onChange={actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus}</Text>
                {statsStatus && <Text> · <Text color="magenta">{statsStatus}</Text></Text>}
            </Box>

            <Box flexDirection="column" marginY={1}>
                {mode === HISTORY_VIEW_MODES.BULK_ACTIONS && <BulkActionsMode selectedForActionCount={selectedForAction.size} />}

                {mode === HISTORY_VIEW_MODES.LIST && itemsInView.map(path => {
                    const txId = path.split('/')[0]!;
                    const tx = transactionsById.get(txId);
                    if (!tx) return <Text key={path}>Error: Missing TX {txId}</Text>;

                    // Is a transaction row
                    if (path === tx.id) {
                        return (
                            <TransactionRow
                                key={path}
                                tx={tx}
                                isSelected={selectedItemPath === path}
                                isExpanded={expandedIds.has(path)}
                                isSelectedForAction={selectedForAction.has(tx.id)}
                                hasSelection={hasSelection}
                            />
                        );
                    }

                    // Is a child row
                    const itemType = path.split('/')[1]!;
                    const isSelected = selectedItemPath === path;
                    const isExpanded = expandedIds.has(path);
                    const isLoading = loadingPaths.has(path);

                    if (itemType === 'file') {
                        const fileId = path.split('/')[2]!;
                        const file = tx.files?.find(f => f.id === fileId);
                        if (!file) return null;
                        return (
                            <FileRow
                                key={path} file={file} isSelected={isSelected}
                                isExpanded={isExpanded} isLoading={isLoading}
                            />
                        );
                    }

                    const contentMap = {
                        message: { title: 'Commit Message', content: tx.message || '' },
                        prompt: { title: 'Prompt', content: tx.prompt || '' },
                        reasoning: { title: 'Reasoning', content: tx.reasoning || '' },
                    };

                    const item = contentMap[itemType as keyof typeof contentMap];
                    if (!item) return null;

                    return (
                        <ContentRow
                            key={path}
                            {...item}
                            isSelected={isSelected}
                            isExpanded={isExpanded}
                            isLoading={isLoading}
                        />
                    );
                })}
            </Box>
        </ScreenLayout>
    );
};


export default TransactionHistoryScreen;
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
import { useListNavigator } from './useListNavigator';
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
        setSelectedItemIndex,
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

    const navigateToNextFile = () => {
        const nextFileIndex = navigableItems.findIndex(
            (item, index) => index > selectedItemIndex && item.type === 'file',
        );
        if (nextFileIndex !== -1) {
            setSelectedItemIndex(nextFileIndex);
        }
    };

    const navigateToPreviousFile = () => {
        // Find the last index of a file before the current one
        const prevFileIndex = navigableItems
            .slice(0, selectedItemIndex)
            .findLastIndex(item => item.type === 'file');

        if (prevFileIndex !== -1) {
            setSelectedItemIndex(prevFileIndex);
        }
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

        if (key.upArrow && bodyView !== REVIEW_BODY_VIEWS.DIFF) {
            contentViewport.actions.scrollUp();
            return true;
        }
        if (key.downArrow && bodyView !== REVIEW_BODY_VIEWS.DIFF) {
            contentViewport.actions.scrollDown();
            return true;
        }
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

    const handleDiffInput = (input: string, key: Key) => {
        if (key.upArrow) {
            navigateToPreviousFile();
            return;
        }
        if (key.downArrow) {
            navigateToNextFile();
            return;
        }
        if (input.toLowerCase() === 'x') expandDiff();
        if (input.toLowerCase() === 'd' || key.escape) toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

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

    useListNavigator({
        itemCount: navigableItems.length,
        viewportHeight: listViewportHeight,
        selectedIndex: selectedItemIndex,
        onIndexChange: setSelectedItemIndex,
        isActive: bodyView === REVIEW_BODY_VIEWS.NONE,
        onKey: handleMainNavigationInput,
    });

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) return;
        if (handleContentScrollInput(key)) return;

        switch (bodyView) {
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF: return handleHandoffConfirmInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_REPAIR: return handleBulkRepairInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT: return handleBulkInstructInput(input, key);
            case REVIEW_BODY_VIEWS.REASONING: return handleReasoningInput(input, key);
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: return handleScriptOutputInput(input, key);
            case REVIEW_BODY_VIEWS.DIFF: return handleDiffInput(input, key);
        }
    }, { isActive: bodyView !== REVIEW_BODY_VIEWS.NONE });

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

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { DASHBOARD_STATUS } from '../constants/dashboard.constants';

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
        togglePause: () => set(state => ({
            status: state.status === DASHBOARD_STATUS.LISTENING ? DASHBOARD_STATUS.PAUSED : DASHBOARD_STATUS.LISTENING,
        }),
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

## File: src/components/TransactionDetailScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import ContentView from './ContentView';
import type { FileChangeType } from '../types/domain.types';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';
import { DETAIL_BODY_VIEWS, DETAIL_FOOTER_ACTIONS } from '../constants/detail.constants';
import ActionFooter from './ActionFooter';
import { FILE_CHANGE_ICONS } from '../constants/ui.constants';
import ScreenLayout from './layout/ScreenLayout';

const RevertModal = ({ transactionHash }: { transactionHash: string }) => {
    return (
        <Box 
            borderStyle="round"
            borderColor="yellow"
            flexDirection="column"
            paddingX={2}
            width="80%"
            alignSelf='center'
        >
            <Text bold color="yellow" wrap="wrap" >REVERT THIS TRANSACTION?</Text>
            <Box height={1} />
            <Text wrap="wrap">This will create a NEW transaction that reverses all changes made by {transactionHash}. The original transaction record will be preserved.</Text>
            <Box height={1} />
            <Text wrap="wrap">Are you sure?</Text>
        </Box>
    );
};

const typeColor = (type: FileChangeType) => {
    switch (type) {
        case 'ADD': return 'green';
        case 'DEL': return 'red';
        case 'REN': return 'yellow';
        default: return 'white';
    }
};

const TransactionDetailScreen = () => {
    const {
        transaction, files,
        focusedItemPath, expandedItemPaths, bodyView, contentScrollIndex, availableBodyHeight,
    } = useTransactionDetailScreen();

    if (!transaction) {
        return <Text>Loading transaction...</Text>;
    }

    const renderNavigator = () => {
        const isPromptFocused = focusedItemPath === 'PROMPT';
        const isReasoningFocused = focusedItemPath === 'REASONING';
        const isFilesFocused = focusedItemPath.startsWith('FILES');
        
        const isPromptExpanded = expandedItemPaths.has('PROMPT');
        const isReasoningExpanded = expandedItemPaths.has('REASONING');
        const isFilesExpanded = expandedItemPaths.has('FILES');
        
        return (
            <Box flexDirection="column">
                <Text color={isPromptFocused ? 'cyan' : undefined}>
                    {isPromptFocused ? '> ' : '  '}
                    {isPromptExpanded ? '▾' : '▸'} (<Text color="cyan" bold>P</Text>)rompt
                </Text>
                <Text color={isReasoningFocused ? 'cyan' : undefined}>
                    {isReasoningFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (<Text color="cyan" bold>R</Text>)easoning{' '}
                    ({transaction.reasoning?.split('\n\n').length || 0} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && !focusedItemPath.includes('/') ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (<Text color="cyan" bold>F</Text>)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file) => {
                             const fileId = `FILES/${file.id}`;
                             const isFileSelected = focusedItemPath === fileId;
                             const stats = file.type === 'DEL' ? ''
                                : ` (+${file.linesAdded}/-${file.linesRemoved})`;
                             return (
                                <Text key={file.id} color={isFileSelected ? 'cyan' : undefined}>
                                    {isFileSelected ? '> ' : '  '}
                                    {FILE_CHANGE_ICONS[file.type]} <Text color={typeColor(file.type)}>{file.path}</Text>{stats}
                                </Text>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    const renderBody = () => {
        if (bodyView === DETAIL_BODY_VIEWS.NONE) {
            return <Text color="gray">(Press → to expand a section and view its contents)</Text>;
        }
        if (bodyView === DETAIL_BODY_VIEWS.PROMPT) {
            return (
                <Box flexDirection="column">
                    <Text>PROMPT</Text>
                    <Box marginTop={1} flexDirection="column">
                        {(transaction.prompt || '').split('\n')
                            .slice(contentScrollIndex, contentScrollIndex + availableBodyHeight)
                            .map((line, i) => <Text key={i}>{line}</Text>)
                        }
                    </Box>
                </Box>
            );
        }
        if (bodyView === DETAIL_BODY_VIEWS.REASONING) {
            if (!transaction.reasoning) return <Text color="gray">No reasoning provided.</Text>;
            return <ContentView title="REASONING" content={transaction.reasoning} scrollIndex={contentScrollIndex} maxHeight={Math.max(1, availableBodyHeight)} />;
        }
        if (bodyView === DETAIL_BODY_VIEWS.FILES_LIST) {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
            const fileId = focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            if (!file) return null;
            return <ContentView
                title={`DIFF: ${file.path}`}
                content={file.diff}
                highlight='diff'
                isExpanded={true}
                scrollIndex={contentScrollIndex}
                maxHeight={Math.max(1, availableBodyHeight)}
            />;
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM) {
            return <ActionFooter actions={DETAIL_FOOTER_ACTIONS.REVERT_CONFIRM} />;
        }
        
        const isFileFocused = focusedItemPath.includes('/');
        const openActionLabel = isFileFocused ? 'Open File' : 'Open YAML';
        const isRevertable = ['APPLIED', 'FAILED'].includes(transaction.status);
        const baseActions = DETAIL_FOOTER_ACTIONS.BASE({
            openActionLabel,
            isRevertable,
        });

        if (isFileFocused) { // Is a file
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.DIFF_VIEW, ...baseActions]} />;
            } else {
                return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.FILE_LIST_VIEW, ...baseActions]} />;
            }
        }
        
        if (expandedItemPaths.has(focusedItemPath)) {
            return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.SECTION_EXPANDED, ...baseActions]} />;
        }
        return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.SECTION_COLLAPSED, ...baseActions]} />;
    };

    const { message, timestamp, status } = transaction;
    const date = new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    const fileStats = `${files.length} Files · +${files.reduce((a, f) => a + f.linesAdded, 0)} lines, -${files.reduce((a, f) => a + f.linesRemoved, 0)} lines`;

    return (
        <ScreenLayout
            title="▲ relaycode · TRANSACTION DETAILS"
            footer={renderFooter()}
        >
            {/* Modal takeover for Revert */}
            {bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM && <RevertModal transactionHash={transaction.hash} />}

            {/* Main view */}
            <Box flexDirection="column" display={bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM ? 'none' : 'flex'}>
                <Box flexDirection="column">
                    <Text><Text color="gray">UUID:</Text> {transaction.id}</Text>
                    <Text><Text color="gray">Git:</Text> {message}</Text>
                    <Text><Text color="gray">Date:</Text> {date} · <Text color="gray">Status:</Text> {status}</Text>
                    <Text><Text color="gray">Stats:</Text> {fileStats}</Text>
                </Box>

                <Box marginY={1}>
                    {renderNavigator()}
                </Box>

                {/* Body */}
                <Box marginY={1}>
                    {renderBody()}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default TransactionDetailScreen;
```

## File: src/components/ReviewScreen.tsx
```typescript
import { Box, Text } from 'ink';
import ContentView from './ContentView';
import type { ScriptResult, FileItem, FileChangeType } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';
import { REVIEW_BODY_VIEWS, REVIEW_FOOTER_ACTIONS, BULK_REPAIR_OPTIONS, BULK_INSTRUCT_OPTIONS } from '../constants/review.constants';
import ActionFooter from './ActionFooter';
import { FILE_STATUS_UI } from '../constants/ui.constants';
import ScreenLayout from './layout/ScreenLayout';

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
                    <ContentView
                        title="REASONING"
                        content={reasoningText}
                        scrollIndex={contentScrollIndex}
                        maxHeight={Math.max(1, availableBodyHeight)}
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
                <ContentView
                    title={`DIFF: ${selectedFile.path}`}
                    content={selectedFile.diff}
                    highlight="diff"
                    isExpanded={isDiffExpanded}
                    scrollIndex={contentScrollIndex}
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
        <ScreenLayout title="▲ relaycode · REVIEW" footer={renderFooter()}>
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

            {/* Body Viewport */}
            {bodyView !== REVIEW_BODY_VIEWS.NONE && (
                <Box marginY={1}>
                    {renderBody()}
                </Box>
            )}
        </ScreenLayout>
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
import { INITIAL_APPLY_STEPS, PATCH_STATUS, REVIEW_BODY_VIEWS, BULK_INSTRUCT_OPTIONS, BULK_REPAIR_OPTIONS } from '../constants/review.constants';
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
        setSelectedItemIndex: (index: number) => void;
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
        setSelectedItemIndex: (index) => set({ selectedItemIndex: index }),
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
            selectedBulkRepairOptionIndex: (state.selectedBulkRepairOptionIndex - 1 + BULK_REPAIR_OPTIONS.length) % BULK_REPAIR_OPTIONS.length,
        })),
        navigateBulkRepairDown: () => set(state => ({
            selectedBulkRepairOptionIndex: (state.selectedBulkRepairOptionIndex + 1) % BULK_REPAIR_OPTIONS.length,
        })),
        navigateBulkInstructUp: () => set(state => ({
            selectedBulkInstructOptionIndex: (state.selectedBulkInstructOptionIndex - 1 + BULK_INSTRUCT_OPTIONS.length) % BULK_INSTRUCT_OPTIONS.length,
        })),
        navigateBulkInstructDown: () => set(state => ({
            selectedBulkInstructOptionIndex: (state.selectedBulkInstructOptionIndex + 1) % BULK_INSTRUCT_OPTIONS.length,
        })),
    },
}));
```

## File: src/components/DashboardScreen.tsx
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type { Transaction, TransactionStatus } from '../types/domain.types';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { UI_CONFIG } from '../config/ui.config'; //
import ActionFooter from './ActionFooter';
import ScreenLayout from './layout/ScreenLayout';
import { DASHBOARD_FOOTER_ACTIONS, DASHBOARD_STATUS } from '../constants/dashboard.constants';
import { TRANSACTION_STATUS_UI, FILE_CHANGE_ICONS } from '../constants/ui.constants';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    if (status === 'IN-PROGRESS' || status === 'COMMITTING') return <Spinner type="dots" />;
    const ui = TRANSACTION_STATUS_UI[status as keyof typeof TRANSACTION_STATUS_UI];
    if (!ui) return <Text> </Text>;
    return <Text color={ui.color}>{ui.text.split(' ')[0]}</Text>;
};

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
};

const ExpandedEventInfo = ({ transaction }: { transaction: Transaction }) => {
    const stats = transaction.stats;
    const files = transaction.files || [];

    return (
        <Box flexDirection="column" paddingLeft={4} marginBottom={1} borderStyle="round" borderLeft={true} borderTop={false} borderRight={false} borderBottom={false} borderColor="gray">
            {stats && (
                <Text color="gray">
                    Stats: {stats.files} files, +{stats.linesAdded}/-{stats.linesRemoved}
                </Text>
            )}
             <Box flexDirection="column" paddingLeft={1}>
                {files.map(file => (
                     <Text key={file.id}>
                        <Text color="gray">{FILE_TYPE_MAP[file.type]}</Text> {file.path}
                    </Text>
                ))}
             </Box>
        </Box>
    );
};
                        <Text color="gray">{FILE_CHANGE_ICONS[file.type]}</Text> {file.path}
const EventStreamItem = React.memo(({ transaction, isSelected, isExpanded, isNew }: { transaction: Transaction, isSelected: boolean, isExpanded: boolean, isNew: boolean }) => {
    const [isAnimatingIn, setIsAnimatingIn] = useState(isNew);
    const [isStatusFlashing, setIsStatusFlashing] = useState(false);
    const prevStatus = useRef(transaction.status);

    useEffect(() => {
        if (isNew) {
            const timer = setTimeout(() => setIsAnimatingIn(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isNew]);

    useEffect(() => {
        if (prevStatus.current !== transaction.status) {
            setIsStatusFlashing(true);
            const timer = setTimeout(() => setIsStatusFlashing(false), 500);
            prevStatus.current = transaction.status;
            return () => clearTimeout(timer);
        }
    }, [transaction.status]);

    const icon = getStatusIcon(transaction.status);
    const time = formatTimeAgo(transaction.timestamp).padEnd(5, ' ');
    const statusText = transaction.status.padEnd(11, ' ');
    const expandIcon = isExpanded ? '▾' : '▸';
    
    const messageNode =
        transaction.status === 'IN-PROGRESS' || transaction.status === 'COMMITTING'
            ? <Text color={isAnimatingIn ? 'yellow' : 'cyan'}>{transaction.message}</Text>
            : transaction.message;
    
    const content = (
        <Text>
            {time} {expandIcon} <Text color={isStatusFlashing ? 'yellow' : undefined} bold={isStatusFlashing}>{icon} {statusText}</Text>{' '}
            <Text color="gray">{transaction.hash}</Text>
            {' '}· {messageNode}
        </Text>
    );

    if (isSelected) {
        return <Text bold color={isAnimatingIn ? 'yellow' : 'cyan'}>{'> '}{content}</Text>;
    }

    return <Text color={isAnimatingIn ? 'yellow' : undefined}>{'  '}{content}</Text>;
});

const ConfirmationContent = ({
    transactionsToConfirm,
}: {
    transactionsToConfirm: Transaction[];
}) => {
    const actionText = 'APPROVE';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold color="yellow">{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>
                The following {transactionsToConfirm.length} transaction(s) will be approved:
            </Text>
            <Box flexDirection="column" paddingLeft={1} marginTop={1}>
                {transactionsToConfirm.map(tx => (
                    <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
                ))}
            </Box>
        </Box>
    );
};

// --- Main Component ---

const DashboardScreen = () => {
    const {
        status,
        transactions,
        selectedTransactionIndex,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
        expandedTransactionId,
        newTransactionIds,
    } = useDashboardScreen({
        layoutConfig: UI_CONFIG.layout.dashboard,
    });

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case DASHBOARD_STATUS.LISTENING: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case DASHBOARD_STATUS.PAUSED: statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case DASHBOARD_STATUS.APPROVING: statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; //
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        const commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === DASHBOARD_STATUS.APPROVING) approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === DASHBOARD_STATUS.CONFIRM_APPROVE) {
            approvalStr = <Text bold color="yellow">┌ {approvalStr} ┐</Text>;
        }
        
        return (
            <Text>
                STATUS: {statusIcon} {statusText} · APPROVALS: {approvalStr} · COMMITS: {commitStr}
            </Text>
        );
    };

    const renderFooter = () => {
        if (isModal) return (
            <ActionFooter actions={DASHBOARD_FOOTER_ACTIONS.MODAL}/>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

		return <ActionFooter actions={DASHBOARD_FOOTER_ACTIONS.STANDARD({
            status,
            hasPending: pendingApprovals > 0,
            hasApplied: pendingCommits > 0,
        })} />;
    };
    
    return (
        <ScreenLayout
            title={<Text color="cyan">▲ relaycode dashboard</Text>}
            footer={renderFooter()}
        >
            <Box flexDirection="column" flexGrow={1}>
                <Box>
                    {renderStatusBar()}
                </Box>
                
                {isModal && (
                    <Box marginY={1}>
                        <ConfirmationContent transactionsToConfirm={transactionsToConfirm} />
                    </Box>
                )}
                
                <Box marginTop={1}><Text bold underline> EVENT STREAM (Last 15 minutes)</Text></Box>
                <Box flexDirection="column" marginTop={1} flexGrow={1}>
                    {transactions.length === 0 && (
                         <Box paddingLeft={2}><Text color="gray">Listening for changes... no events yet.</Text></Box>
                    )}
                    {transactions.slice(viewOffset, viewOffset + viewportHeight).map((tx, index) => {
                        const actualIndex = viewOffset + index;
                        const isExpanded = expandedTransactionId === tx.id;
                        const isNew = newTransactionIds.has(tx.id);
                        return (
                            <React.Fragment key={tx.id}>
                                <EventStreamItem
                                    transaction={tx}
                                    isSelected={!isModal && actualIndex === selectedTransactionIndex}
                                    isExpanded={isExpanded}
                                    isNew={isNew}
                                />
                                {isExpanded && <ExpandedEventInfo transaction={tx} />}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default DashboardScreen;
```

## File: src/hooks/useDebugMenu.tsx
```typescript
import { useState } from 'react';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useInitStore } from '../stores/init.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCommitStore } from '../stores/commit.store';
import { useCopyStore } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import type { MenuItem } from '../types/debug.types';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { ClipboardService } from '../services/clipboard.service';
import { UI_CONFIG } from '../config/ui.config';
import { OVERLAYS } from '../constants/view.constants';
import { useViewport } from './useViewport';
import { useListNavigator } from './useListNavigator';
export type { MenuItem } from '../types/debug.types';

const useDebugMenuActions = () => {
    const { actions: appActions } = useAppStore();
    const { actions: initActions } = useInitStore();
    const { actions: notificationActions } = useNotificationStore();
    const { actions: commitActions } = useCommitStore();
    const { actions: dashboardActions } = useDashboardStore();
    const { actions: reviewActions } = useReviewStore();
    const { actions: detailActions } = useDetailStore();
    const { actions: historyActions } = useHistoryStore();

    const menuItems: MenuItem[] = [
        {
            title: 'Simulate Pasting Valid Patch',
            action: () => ClipboardService.processClipboardContent(true),
        },
        {
            title: 'Simulate Pasting Invalid Text',
            action: () => ClipboardService.processClipboardContent(false),
        },
        {
            title: 'View Debug Log',
            action: () => useViewStore.getState().actions.setActiveOverlay(OVERLAYS.LOG),
        },
        {
            title: 'Show Success Notification',
            action: () => notificationActions.show({
                type: 'success',
                title: 'Operation Successful',
                message: 'The requested operation completed without errors.',
            }),
        },
        {
            title: 'Show Error Notification',
            action: () => notificationActions.show({
                type: 'error',
                title: 'Operation Failed',
                message: 'An unexpected error occurred. Check the debug log for details.',
            }),
        },
        {
            title: 'Show Info Notification',
            action: () => notificationActions.show({
                type: 'info',
                title: 'Information',
                message: 'This is an informational message for the user.',
            }),
        },
        {
            title: 'Show Warning Notification',
            action: () => notificationActions.show({
                type: 'warning',
                title: 'Warning',
                message: 'This action may have unintended side effects.',
            }),
        },
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
                dashboardActions.startApproveAll();
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
            title: 'Dashboard: Expanded View',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                dashboardActions.setExpandedTransactionId('1');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.load('1');
                reviewActions.setBodyView('diff');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.load('1', { bodyView: 'reasoning' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '1');
                if (!tx) return;
                // On load, selected index is 0, so we can assume the first file.
                const selectedFile = tx.files && tx.files.length > 0
                    ? tx.files[0]
                    : undefined;
                useCopyStore.getState().actions.openForReview(tx, tx.files || [], selectedFile);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
                reviewActions.setBodyView('script_output');
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Repair (Navigable)',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair', selectedBulkRepairOptionIndex: 1 });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Instruct',
            action: () => {
                reviewActions.load('2'); // Load success case
                // Reject some files to enable the workflow
                reviewActions.toggleFileApproval('2-1');
                reviewActions.toggleFileApproval('2-2');
                reviewActions.showBulkInstruct();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.load('1', { bodyView: 'confirm_handoff' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing (Success)',
            action: () => {
                // Use tx '2' which is the success case in prepareTransactionForReview
                reviewActions.load('2');
                reviewActions.startApplySimulation('2', 'success');
            },
        },
        {
            title: 'Review Processing (Failure)',
            action: () => {
                // Use tx '1' which is the failure case in prepareTransactionForReview
                reviewActions.load('1');
                reviewActions.startApplySimulation('1', 'failure');
            },
        },
        {
            title: 'Git Commit Screen',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            },
        },
        {
            title: 'Git Commit Screen (Failure State)',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                // Fire-and-forget, the UI will update from the store
                commitActions.commit(true);
            },
        },
        {
            title: 'Git Commit: Copy Mode',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                const transactionsToCommit = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
                const { finalCommitMessage } = useCommitStore.getState();
                const items = CopyService.getCopyItemsForCommit(
                    transactionsToCommit,
                    finalCommitMessage,
                );
                useCopyStore.getState().actions.open('Select data to copy from commit:', items);
            },
        },
        {
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                detailActions.load('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Copy Mode',
            action: () => {
                detailActions.load('3');
                appActions.showTransactionDetailScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '3');
                if (!tx) return;
                const selectedFile = tx.files?.[0];
                useCopyStore.getState().actions.openForDetail(tx, selectedFile);
            },
        },
        {
            title: 'Detail: Diff View (for File Open action)',
            action: () => {
                detailActions.load('3', {
                    focusedItemPath: 'FILES/3-1',
                    bodyView: 'DIFF_VIEW',
                    expandedItemPaths: new Set(['FILES']),
                });
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Revert Confirm',
            action: () => {
                detailActions.load('3', { bodyView: 'REVERT_CONFIRM' });
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
            title: 'History: L1 Drilldown (Content)',
            action: () => {
                historyActions.prepareDebugState('l1-drill-content');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Reasoning)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-reasoning');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (for File Open action)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-diff');
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
                const { transactions } = useTransactionStore.getState();
                const { selectedForAction } = useHistoryStore.getState();
                const txsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));
                useCopyStore.getState().actions.openForHistory(txsToCopy);
            },
        },
        {
            title: 'History: Bulk Actions Mode',
            action: () => {
                historyActions.prepareDebugState('bulk');
                appActions.showTransactionHistoryScreen();
            },
        },
    ];
    return { menuItems };
};

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { menuItems } = useDebugMenuActions();

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: menuItems.length,
        layoutConfig: UI_CONFIG.layout.debugMenu,
    });
    
    useListNavigator({
        itemCount: menuItems.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: useViewStore.getState().activeOverlay === OVERLAYS.DEBUG,
        onKey: (input, key) => {
            if (key.return) {
                const item = menuItems[selectedIndex];
                if (item) {
                    useViewStore.getState().actions.setActiveOverlay(OVERLAYS.NONE);
                    item.action();
                }
                return;
            }
            if (key.escape) {
                useViewStore.getState().actions.setActiveOverlay(OVERLAYS.NONE);
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
        },
    });

    const menuItemsInView = menuItems.slice(viewOffset, viewOffset + viewportHeight);

    return {
        selectedIndex,
        menuItems: menuItemsInView,
        viewOffset,
        totalItems: menuItems.length,
    };
};
```
