# Directory Structure
```
src/
  components/
    ActionFooter.tsx
    CopyScreen.tsx
    DashboardScreen.tsx
    DebugLogScreen.tsx
    DebugMenu.tsx
    ReviewScreen.tsx
    TransactionDetailScreen.tsx
    TransactionHistoryScreen.tsx
  constants/
    app.constants.ts
    dashboard.constants.ts
    detail.constants.ts
    history.constants.ts
    review.constants.ts
    view.constants.ts
  hooks/
    useCopyScreen.tsx
    useDashboardScreen.tsx
    useDebugLogScreen.tsx
    useDebugMenu.tsx
    useGlobalHotkeys.tsx
    useListNavigator.ts
    useReviewScreen.tsx
    useTransactionDetailScreen.tsx
    useTransactionHistoryScreen.tsx
  stores/
    app.store.ts
    detail.store.ts
    history.store.ts
    navigation.utils.ts
  types/
    actions.types.ts
  App.tsx
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/hooks/useListNavigator.ts
```typescript
import { useInput, type Key } from 'ink';

const moveIndex = (
    currentIndex: number,
    direction: 'up' | 'down',
    listSize: number,
): number => {
    if (direction === 'up') {
        return Math.max(0, currentIndex - 1);
    }
    return Math.min(listSize - 1, currentIndex + 1);
};

interface ListNavigatorOptions {
    itemCount: number;
    viewportHeight: number;
    selectedIndex: number;
    onIndexChange: (newIndex: number) => void;
    onKey?: (input: string, key: Key) => void;
    isActive: boolean;
}

export const useListNavigator = ({
    itemCount,
    viewportHeight,
    selectedIndex,
    onIndexChange,
    onKey,
    isActive,
}: ListNavigatorOptions) => {
    useInput((input, key) => {
        if (key.upArrow) {
            onIndexChange(moveIndex(selectedIndex, 'up', itemCount));
            return;
        }
        if (key.downArrow) {
            onIndexChange(moveIndex(selectedIndex, 'down', itemCount));
            return;
        }
        if (key.pageUp) {
            onIndexChange(Math.max(0, selectedIndex - viewportHeight));
            return;
        }
        if (key.pageDown) {
            onIndexChange(Math.min(itemCount - 1, selectedIndex + viewportHeight));
            return;
        }

        if (onKey) {
            onKey(input, key);
        }
    }, { isActive });
};
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

## File: src/constants/app.constants.ts
```typescript
/**
 * Application-level screens and navigation constants.
 */
export const APP_SCREENS = {
    SPLASH: 'splash',
    INIT: 'init',
    DASHBOARD: 'dashboard',
    REVIEW: 'review',
    REVIEW_PROCESSING: 'review-processing',
    GIT_COMMIT: 'git-commit',
    TRANSACTION_DETAIL: 'transaction-detail',
    TRANSACTION_HISTORY: 'transaction-history',
} as const;

export const SCREENS_WITH_DASHBOARD_BACK_ACTION = [
    APP_SCREENS.REVIEW,
    APP_SCREENS.GIT_COMMIT,
    APP_SCREENS.TRANSACTION_DETAIL,
    APP_SCREENS.TRANSACTION_HISTORY,
];
```

## File: src/constants/dashboard.constants.ts
```typescript
import type { ActionItem } from '../types/actions.types';

export const DASHBOARD_STATUS = {
    LISTENING: 'LISTENING',
    PAUSED: 'PAUSED',
    CONFIRM_APPROVE: 'CONFIRM_APPROVE',
    APPROVING: 'APPROVING',
} as const;

type DashboardStatusValue = (typeof DASHBOARD_STATUS)[keyof typeof DASHBOARD_STATUS];

export interface DashboardStandardActionsOptions {
    status: DashboardStatusValue;
    hasPending: boolean;
    hasApplied: boolean;
}

export const DASHBOARD_FOOTER_ACTIONS = {
    MODAL: [
        { key: 'Enter', label: 'Confirm' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    STANDARD: (options: DashboardStandardActionsOptions): ActionItem[] => {
        const { status, hasPending, hasApplied } = options;
        const actions: ActionItem[] = [
            { key: '↑↓', label: 'Nav' },
            { key: '→/Ent', label: 'View' },
            { key: '←', label: 'Collapse' },
            { key: 'L', label: 'Log' },
        ];
        if (hasPending) actions.push({ key: 'A', label: 'Approve All' });
        if (hasApplied) actions.push({ key: 'C', label: 'Commit' });
        actions.push({ key: 'P', label: status === DASHBOARD_STATUS.PAUSED ? 'Resume' : 'Pause' });
        actions.push({ key: 'Q', label: 'Quit' });
        return actions;
    },
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
            { key: '←', label: 'Collapse/Up' },
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
        actions.push({ key: '←/Q/Esc', label: 'Back' });
        return actions;
    },
    DIFF_VIEW: [{ key: '↑↓', label: 'Nav Files' }, { key: '←/Esc', label: 'Back to List' }] as const,
    FILE_LIST_VIEW: [
        { key: '↑↓', label: 'Nav Files' },
        { key: '→', label: 'View Diff' },
        { key: '←', label: 'Back' },
    ] as const,
    SECTION_EXPANDED: [{ key: '↑↓', label: 'Nav/Scroll' }, { key: '→', label: 'Drill In' }, { key: '←', label: 'Collapse/Back' }] as const,
    SECTION_COLLAPSED: [{ key: '↑↓', label: 'Nav' }, { key: '→', label: 'Expand' }] as const,
};
```

## File: src/constants/view.constants.ts
```typescript
export const OVERLAYS = {
    NONE: 'none',
    HELP: 'help',
    COPY: 'copy',
    DEBUG: 'debug',
    LOG: 'log',
    NOTIFICATION: 'notification',
} as const;
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
            if (key.escape || key.leftArrow) {
                actions.close();
                return;
            }
            if (input === ' ') {
                const currentItem = items[selectedIndex];
                if (!currentItem) return;
                actions.toggleSelectionById(currentItem.id);
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

## File: src/stores/history.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { getVisibleItemPaths, findNextPath, findPrevPath, getParentPath } from './navigation.utils';
import { HISTORY_VIEW_MODES, HISTORY_ITEM_PATH_SEGMENTS } from '../constants/history.constants';
import { sleep } from '../utils';

export type HistoryViewMode = (typeof HISTORY_VIEW_MODES)[keyof typeof HISTORY_VIEW_MODES];
 
// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<HistoryState, 'actions'>;

interface HistoryState {
    mode: HistoryViewMode;
    selectedItemPath: string;
    expandedIds: Set<string>;
    loadingPaths: Set<string>;
    filterQuery: string;
    selectedForAction: Set<string>;
    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        navigatePageUp: (viewportHeight: number) => void;
        navigatePageDown: (viewportHeight: number) => void;
        expandOrDrillDown: () => Promise<void>;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        prepareDebugState: (stateName: 'l1-drill-content' | 'l2-drill-reasoning' | 'l2-drill-diff' | 'filter' | 'copy' | 'bulk') => void;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    mode: HISTORY_VIEW_MODES.LIST,
    selectedItemPath: '',
    expandedIds: new Set(),
    loadingPaths: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    actions: {
        load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                selectedItemPath: transactions[0]?.id || '',
                mode: HISTORY_VIEW_MODES.LIST,
                expandedIds: new Set(),
                loadingPaths: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findPrevPath(selectedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findNextPath(selectedItemPath, visibleItems) });
        },
        navigatePageUp: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.max(0, currentIndex - viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        navigatePageDown: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.min(visibleItems.length - 1, currentIndex + viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        expandOrDrillDown: async () => {
            const { selectedItemPath, expandedIds } = get();

            // Smart back-out: if already expanded, collapse it.
            if (expandedIds.has(selectedItemPath)) {
                set(state => {
                    const newExpandedIds = new Set(state.expandedIds);
                    newExpandedIds.delete(selectedItemPath);
                    // Recursively collapse children
                    for (const id of newExpandedIds) {
                        if (id.startsWith(`${selectedItemPath}/`)) {
                            newExpandedIds.delete(id);
                        }
                    }
                    return { expandedIds: newExpandedIds };
                });
                return; // Stop execution
            }
            
            // Files and content items with potentially large data can show a loading state
            const isLoadable = selectedItemPath.includes(HISTORY_ITEM_PATH_SEGMENTS.FILE) ||
                               selectedItemPath.includes(HISTORY_ITEM_PATH_SEGMENTS.PROMPT) ||
                               selectedItemPath.includes(HISTORY_ITEM_PATH_SEGMENTS.REASONING);

            if (isLoadable) {
                set(state => ({ loadingPaths: new Set(state.loadingPaths).add(selectedItemPath) }));
                await sleep(250); // Simulate loading
                set(state => {
                    const newLoadingPaths = new Set(state.loadingPaths);
                    newLoadingPaths.delete(selectedItemPath);
                    const newExpandedIds = new Set(state.expandedIds).add(selectedItemPath);
                    return { loadingPaths: newLoadingPaths, expandedIds: newExpandedIds };
                });
            } else { // For transactions or simple items, expand immediately
                set(state => ({ expandedIds: new Set(state.expandedIds).add(selectedItemPath) }));
            }
        },
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.delete(selectedItemPath);
                // Recursively collapse children
                for (const id of newExpandedIds) { //
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { expandedIds: newExpandedIds };
            }
            const parentId = getParentPath(selectedItemPath);
            if (parentId) {
                return { selectedItemPath: parentId };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = getParentPath(selectedItemPath) || selectedItemPath;
            if (!txId) return {};
            const newSelection = new Set(selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { selectedForAction: newSelection };
        }),
        setMode: (mode) => set({ mode }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            set({ mode: HISTORY_VIEW_MODES.LIST });
        },
        prepareDebugState: (stateName) => {
            const { actions } = get();
            switch (stateName) {
                case 'l1-drill-content':
                    actions.load({ expandedIds: new Set(['3']), selectedItemPath: '3' });
                    break;
                case 'l2-drill-reasoning':
                    actions.load({ expandedIds: new Set(['3', '3/reasoning']), selectedItemPath: '3/reasoning' });
                    break;
                case 'l2-drill-diff':
                    actions.load({ expandedIds: new Set(['3', '3/file/3-1']), selectedItemPath: '3/file/3-1' });
                    break;
                case 'filter':
                    actions.load({ mode: HISTORY_VIEW_MODES.FILTER, filterQuery: 'logger.ts status:COMMITTED' });
                    break;
                case 'copy':
                    actions.load({ selectedForAction: new Set(['3', '6']) });
                    break;
                case 'bulk':
                    actions.load({ mode: HISTORY_VIEW_MODES.BULK_ACTIONS, selectedForAction: new Set(['3', '6']) });
                    break;
            }
        },
    },
}));
```

## File: src/components/DebugLogScreen.tsx
```typescript
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import { DEBUG_LOG_FOOTER_ACTIONS, DEBUG_LOG_MODES, LOG_LEVEL_COLORS, LOG_LEVEL_TAGS } from '../constants/log.constants';
import type { LogEntry } from '../types/log.types';
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
    PROMPT: 'prompt',
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
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/D/Esc', label: 'Back' },
    ] as const,
    PROMPT_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/P/Ent', label: 'Collapse' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    REASONING_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/R/Ent', label: 'Collapse' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    SCRIPT_OUTPUT_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: 'J↓/K↑', label: 'Next/Prev Error' },
        { key: 'C', label: 'Copy Output' },
        { key: '←/Ent/Esc', label: 'Back' },
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
        actions.push({ key: 'X', label: 'Reject Tx' });
        actions.push({ key: '←/Q/Esc', label: 'Back' });
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
            if (key.escape || key.leftArrow) {
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

## File: src/stores/detail.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';
import { NAVIGATOR_SECTIONS, DETAIL_BODY_VIEWS } from '../constants/detail.constants';
import { findNextPath, findPrevPath, getParentPath } from './navigation.utils';

type ObjectValues<T> = T[keyof T];

export type NavigatorSection = ObjectValues<typeof NAVIGATOR_SECTIONS>;
export type DetailBodyView = ObjectValues<typeof DETAIL_BODY_VIEWS>;

// Omit 'actions' from state type for partial updates
type DetailStateData = Omit<DetailState, 'actions'>;
 
interface DetailState {
    focusedItemPath: string; // e.g., 'PROMPT', 'FILES', 'FILES/1-1'
    expandedItemPaths: Set<string>;
    bodyView: DetailBodyView;
    actions: {
        load: (transactionId: string, initialState?: Partial<DetailStateData>) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    };
}

const getVisibleItemPaths = (expandedItemPaths: Set<string>): string[] => {
    const { selectedTransactionId } = useViewStore.getState();
    const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === selectedTransactionId);
    if (!transaction) return [];

    const paths: string[] = [NAVIGATOR_SECTIONS.PROMPT, NAVIGATOR_SECTIONS.REASONING, NAVIGATOR_SECTIONS.FILES];
    if (expandedItemPaths.has(NAVIGATOR_SECTIONS.FILES) && transaction.files) {
        for (const file of transaction.files) {
            paths.push(`${NAVIGATOR_SECTIONS.FILES}/${file.id}`);
        }
    }
    return paths;
};

export const useDetailStore = create<DetailState>((set, get) => ({
    focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
    expandedItemPaths: new Set(),
    bodyView: DETAIL_BODY_VIEWS.NONE,
    actions: {
        load: (transactionId, initialState) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
                expandedItemPaths: new Set(),
                bodyView: DETAIL_BODY_VIEWS.NONE,
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findPrevPath(focusedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findNextPath(focusedItemPath, visibleItems) });
        },
        expandOrDrillDown: () => set(state => { //
            const { focusedItemPath, expandedItemPaths, bodyView } = state;

            // Smart back-out: If already in a terminal view (like diff), go back.
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return { bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }

            const newExpandedPaths = new Set(expandedItemPaths);
            
            if (focusedItemPath.startsWith(`${NAVIGATOR_SECTIONS.FILES}/`)) { // Is a file
                return { bodyView: DETAIL_BODY_VIEWS.DIFF_VIEW };
            }

            // Is a section header
            if (newExpandedPaths.has(focusedItemPath)) {
                // Already expanded, try to drill deeper (only for FILES section)
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) {
                    const visibleItems = getVisibleItemPaths(newExpandedPaths);
                    const firstFile = visibleItems.find(item => item.startsWith(`${NAVIGATOR_SECTIONS.FILES}/`));
                    if (firstFile) {
                        return { focusedItemPath: firstFile, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
                    }
                }
                // Cannot drill down further, so collapse (smart back-out)
                newExpandedPaths.delete(focusedItemPath);
                return { expandedItemPaths: newExpandedPaths, bodyView: DETAIL_BODY_VIEWS.NONE };
            } else {
                // Not expanded, so expand it
                newExpandedPaths.add(focusedItemPath);
                let newBodyView: DetailBodyView = DETAIL_BODY_VIEWS.NONE;
                if (focusedItemPath === NAVIGATOR_SECTIONS.PROMPT) newBodyView = DETAIL_BODY_VIEWS.PROMPT;
                if (focusedItemPath === NAVIGATOR_SECTIONS.REASONING) newBodyView = DETAIL_BODY_VIEWS.REASONING;
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) newBodyView = DETAIL_BODY_VIEWS.FILES_LIST;
                return { expandedItemPaths: newExpandedPaths, bodyView: newBodyView };
            }
        }),
        collapseOrBubbleUp: () => set(state => {
            const { focusedItemPath, expandedItemPaths, bodyView } = state;
            
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return { bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }

            if (getParentPath(focusedItemPath)) { // Is a file
                return { focusedItemPath: NAVIGATOR_SECTIONS.FILES, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }
            
            // Is a section header
            if (expandedItemPaths.has(focusedItemPath)) {
                const newExpandedPaths = new Set(expandedItemPaths);
                newExpandedPaths.delete(focusedItemPath);
                return { expandedItemPaths: newExpandedPaths, bodyView: DETAIL_BODY_VIEWS.NONE };
            }
            
            return {}; // No-op if not expanded (global back will handle)
        }),
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM
                ? DETAIL_BODY_VIEWS.NONE
                : DETAIL_BODY_VIEWS.REVERT_CONFIRM,
        })),
        confirmRevert: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (!selectedTransactionId) return;
            TransactionService.revertTransaction(selectedTransactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REVERTED');
            set({ bodyView: DETAIL_BODY_VIEWS.NONE });
        },
    },
}));
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

        if (key.ctrl && input === 'v') {
            ClipboardService.processClipboardContent();
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

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';
import { SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        navigateBack: () => void;
    };
}

export const useAppStore = create<AppState>((set, get) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showGitCommitScreen: () => set({ currentScreen: 'git-commit' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        showTransactionHistoryScreen: () => set({ currentScreen: 'transaction-history' }),
        showTransactionDetailScreen: () => set({ currentScreen: 'transaction-detail' }),
        navigateBack: () => {
            const { currentScreen } = get();
            if ((SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
                get().actions.showDashboardScreen();
            }
        },
    },
}));
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

## File: src/components/DebugMenu.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDebugMenu } from '../hooks/useDebugMenu';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';
import { DEBUG_MENU_FOOTER_ACTIONS } from '../constants/debug.constants';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems, viewOffset, totalItems } = useDebugMenu();
    const [width] = useStdoutDimensions();

    return (
        <Box
            flexDirection="column"
            width="100%"
            paddingX={2}
            paddingY={1}
        >
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · DEBUG MENU </Text>
            <Separator width={width - 4} />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => {
                    const absoluteIndex = index + viewOffset;
                    return (
                        <Text key={item.title} color={selectedIndex === absoluteIndex ? 'cyan' : undefined}>
                            {selectedIndex === absoluteIndex ? '> ' : '  '}
                            ({getKeyForIndex(absoluteIndex)}) {item.title}
                        </Text>
                    );
                })}
            </Box>
            <Separator width={width - 4} />
            <Box>
                <ActionFooter actions={DEBUG_MENU_FOOTER_ACTIONS}/>
                <Box flexGrow={1} />
                <Text>
                    {Math.min(viewOffset + 1, totalItems)}-
                    {Math.min(viewOffset + menuItems.length, totalItems)} of {totalItems}
                </Text>
            </Box>
        </Box>
    );
};

export default DebugMenu;
```

## File: src/hooks/useTransactionDetailScreen.tsx
```typescript
import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';
import { OVERLAYS } from '../constants/view.constants';
import { UI_CONFIG } from '../config/ui.config';

export const useTransactionDetailScreen = () => {
    const store = useDetailStore();
    const transaction = useTransactionStore(selectSelectedTransaction);
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        navigateUp,
        navigateDown,
        expandOrDrillDown,
        collapseOrBubbleUp,
        toggleRevertConfirm,
        confirmRevert,
    } = store.actions;

    const isFilesExpanded = store.expandedItemPaths.has('FILES');
    const layoutConfig = useMemo(() => ({
        ...UI_CONFIG.layout.transactionDetail,
        dynamicRows: {
            count: 3 + (isFilesExpanded ? (files.length || 0) : 0), // navigator items
        },
    }), [isFilesExpanded, files.length]); //

    const { remainingHeight: availableBodyHeight } = useLayout(layoutConfig);
    
    const contentLineCount = useMemo(() => {
        if (store.bodyView === 'PROMPT') return (transaction?.prompt || '').split('\n').length;
        if (store.bodyView === 'REASONING') return (transaction?.reasoning || '').split('\n').length;
        if (store.bodyView === 'DIFF_VIEW') { //
            const fileId = store.focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            return (file?.diff || '').split('\n').length;
        }
        return 0;
    }, [store.bodyView, store.focusedItemPath, transaction, files]);

    const viewport = useContentViewport({ contentLineCount, viewportHeight: availableBodyHeight });

    const openCopyMode = () => {
        if (!transaction) return;
        const { focusedItemPath } = store;
        const fileId = focusedItemPath.split('/')[1];
        const selectedFile = fileId ? files.find(f => f.id === fileId) : undefined;
        useCopyStore.getState().actions.openForDetail(transaction, selectedFile);
    };

    useInput((input: string, key: Key) => {
        if (store.bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }
        
        // --- Back/Collapse action has priority ---
        if (key.leftArrow) {
            collapseOrBubbleUp();
            return;
        }

        // --- Content Scrolling ---
        if (['PROMPT', 'REASONING', 'DIFF_VIEW'].includes(store.bodyView)) {
            if (key.upArrow) {
                viewport.actions.scrollUp();
                return;
            }
            if (key.downArrow) {
                viewport.actions.scrollDown();
                return;
            }
            if (key.pageUp) { viewport.actions.pageUp(); return; }
            if (key.pageDown) { viewport.actions.pageDown(); return; }
        }

        // --- Main Input ---
        if (input.toLowerCase() === 'c') {
            openCopyMode();
            return;
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
            return;
        }
        if (input.toLowerCase() === 'o') {
            if (!transaction) return;
            const { focusedItemPath } = store;
            if (focusedItemPath.includes('/')) { //
                const fileId = focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else { // Is a section, open the transaction YAML
                const yamlPath = EditorService.getTransactionYamlPath(transaction.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        // Navigator movement only if not scrolling content
        if (!['PROMPT', 'REASONING', 'DIFF_VIEW'].includes(store.bodyView)) {
            if (key.upArrow) navigateUp();
            if (key.downArrow) navigateDown();
        }
        if (key.rightArrow || key.return) expandOrDrillDown();
    }, { isActive: useViewStore.getState().activeOverlay === OVERLAYS.NONE });

    return {
        transaction,
        files,
        focusedItemPath: store.focusedItemPath,
        expandedItemPaths: store.expandedItemPaths,
        bodyView: store.bodyView,
        contentScrollIndex: viewport.scrollIndex,
        availableBodyHeight,
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

## File: src/App.tsx
```typescript
import { Box } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import GitCommitScreen from './components/GitCommitScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import DebugMenu from './components/DebugMenu'; 
import DebugLogScreen from './components/DebugLogScreen';
import GlobalHelpScreen from './components/GlobalHelpScreen';
import CopyScreen from './components/CopyScreen';
import NotificationScreen from './components/NotificationScreen';
import { useViewStore } from './stores/view.store';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const isOverlayOpen = activeOverlay !== 'none';

    // Global hotkeys are active if no modal-like component is open
    const areGlobalHotkeysActive = activeOverlay !== 'copy' && activeOverlay !== 'log' && activeOverlay !== 'notification'; // These overlays have their own input handlers
    useGlobalHotkeys({ isActive: areGlobalHotkeysActive });

    const renderMainScreen = () => {
        if (currentScreen === 'splash') return <SplashScreen />;
        if (currentScreen === 'init') return <InitializationScreen />;
        if (currentScreen === 'dashboard') return <DashboardScreen />;
        if (currentScreen === 'review') return <ReviewScreen />;
        if (currentScreen === 'review-processing') return <ReviewProcessingScreen />;
        if (currentScreen === 'git-commit') return <GitCommitScreen />;
        if (currentScreen === 'transaction-detail') return <TransactionDetailScreen />;
        if (currentScreen === 'transaction-history') return <TransactionHistoryScreen />;
        return null;
    };

    return (
        <>
            <Box
                width="100%"
                height="100%"
                flexDirection="column"
                display={isOverlayOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            {activeOverlay === 'help' && <GlobalHelpScreen />}
            {activeOverlay === 'copy' && <CopyScreen />}
            {activeOverlay === 'log' && <DebugLogScreen />}
            {activeOverlay === 'debug' && <DebugMenu />}
            {activeOverlay === 'notification' && <NotificationScreen />}
        </>
    );
};

export default App;
```

## File: src/hooks/useTransactionHistoryScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useHistoryStore } from '../stores/history.store';
import { useAppStore } from '../stores/app.store';
import { useNotificationStore } from '../stores/notification.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useDetailStore } from '../stores/detail.store';
import { useCopyStore } from '../stores/copy.store';
import type { TransactionStatus } from '../types/domain.types';
import { EditorService } from '../services/editor.service';
import { getVisibleItemPaths } from '../stores/navigation.utils';
import { HISTORY_VIEW_MODES, HISTORY_ITEM_PATH_SEGMENTS } from '../constants/history.constants';
import { UI_CONFIG } from '../config/ui.config';
import { useViewport } from './useViewport';

export const useTransactionHistoryScreen = () => {
    const store = useHistoryStore();
    const { mode, selectedItemPath, expandedIds, filterQuery, selectedForAction, loadingPaths, actions } = store;
    const { showTransactionDetailScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, expandedIds),
        [transactions, expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(selectedItemPath);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: visibleItemPaths.length,
        layoutConfig: UI_CONFIG.layout.history,
    });

    const openCopyMode = () => {
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        useCopyStore.getState().actions.openForHistory(transactionsToCopy);
    };

    const handleFilterInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode(HISTORY_VIEW_MODES.LIST);
        if (key.return) actions.applyFilter();
    };

    const handleBulkActionsInput = (input: string, key: Key): void => {
        if (key.escape) { //
            actions.setMode(HISTORY_VIEW_MODES.LIST);
            return;
        }
        if (input >= '1' && input <= '3') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Mock Action',
                message: `Bulk action #${input} would be performed here.`,
            });
            actions.setMode(HISTORY_VIEW_MODES.LIST);
        }
    };

    const handleListInput = (input: string, key: Key): void => {
        if (key.upArrow) actions.navigateUp();
        if (key.downArrow) actions.navigateDown();
        if (key.rightArrow) actions.expandOrDrillDown();
        if (key.leftArrow) actions.collapseOrBubbleUp();
        if (key.pageUp) actions.navigatePageUp(viewportHeight);
        if (key.pageDown) actions.navigatePageDown(viewportHeight);
        if (input === ' ') actions.toggleSelection();
        if (key.return) {
            const txId = selectedItemPath.split('/')[0];
            if (txId && !selectedItemPath.includes('/')) { //
                useDetailStore.getState().actions.load(txId);
                showTransactionDetailScreen();
            }
        }
        if (input.toLowerCase() === 'o') {
            const txId = selectedItemPath.split('/')[0];
            const tx = transactions.find(t => t.id === txId);
            if (!tx) return;

            if (selectedItemPath.includes(HISTORY_ITEM_PATH_SEGMENTS.FILE)) {
                const fileId = selectedItemPath.split('/')[2];
                const file = tx.files?.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else {
                const yamlPath = EditorService.getTransactionYamlPath(tx.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        if (input.toLowerCase() === 'f') actions.setMode(HISTORY_VIEW_MODES.FILTER);
        if (input.toLowerCase() === 'c' && selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && selectedForAction.size > 0) actions.setMode(HISTORY_VIEW_MODES.BULK_ACTIONS);
    };

    useInput((input: string, key: Key) => { //
        if (mode === HISTORY_VIEW_MODES.FILTER) {
            handleFilterInput(input, key);
            return;
        }
        if (mode === HISTORY_VIEW_MODES.BULK_ACTIONS) {
            handleBulkActionsInput(input, key);
            return;
        }
        handleListInput(input, key);
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => transactions.filter(tx => txIdsInView.has(tx.id)),
        [transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatusText = filterQuery ? filterQuery : '(none)';
    const startItem = Math.min(viewOffset + 1, visibleItemPaths.length);
    const endItem = Math.min(viewOffset + itemsInView.length, visibleItemPaths.length);
    const showingStatusText = `Showing ${startItem}-${endItem} of ${visibleItemPaths.length} items`;
    
    const hasSelection = selectedForAction.size > 0;

    const statsStatus = useMemo(() => {
        const stats = transactions.reduce((acc, tx) => {
            acc[tx.status] = (acc[tx.status] || 0) + 1;
            return acc;
        }, {} as Record<TransactionStatus, number>);
        
        const parts = [];
        if (stats.COMMITTED) parts.push(`${stats.COMMITTED} Cmt`);
        if (stats.HANDOFF) parts.push(`${stats.HANDOFF} H/O`);
        if (stats.REVERTED) parts.push(`${stats.REVERTED} Rev`);
        if (stats.APPLIED) parts.push(`${stats.APPLIED} App`);
        if (stats.PENDING) parts.push(`${stats.PENDING} Pend`);
        if (stats.FAILED) parts.push(`${stats.FAILED} Fail`);

        return parts.length > 0 ? `Stats: ${parts.join(', ')}` : '';
    }, [transactions]);

    return {
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        actions,
        transactions,
        viewOffset,
        itemsInView,
        loadingPaths,
        transactionsInView,
        pathsInViewSet,
        filterStatus: filterStatusText,
        showingStatus: showingStatusText,
        statsStatus,
        hasSelection,
        visibleItemPaths,
    };
};
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
        return (
            <ActionFooter actions={HISTORY_FOOTER_ACTIONS.LIST_MODE(openActionLabel, hasSelection)} />
        );
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

## File: src/components/TransactionDetailScreen.tsx
```typescript
import { Box, Text } from 'ink';
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
                const actions = [...DETAIL_FOOTER_ACTIONS.FILE_LIST_VIEW, ...baseActions];
                return <ActionFooter actions={actions} />;
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
import type { ReviewBodyView } from '../stores/review.store';
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
    const { viewOffset } = useViewport({
        selectedIndex: selectedItemIndex,
        itemCount: 100,
        layoutConfig: mainListLayoutConfig,
    });

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
            case REVIEW_BODY_VIEWS.PROMPT:
                return (transaction?.prompt || '').split('\n').length;
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
        setSelectedItemIndex, toggleBodyView, setBodyView, startApplySimulation, approve,
        rejectTransaction, tryRepairFile, tryInstruct, showBulkRepair, showBulkInstruct,
        executeBulkRepairOption, executeBulkInstructOption, confirmHandoff,
        navigateScriptErrorUp, navigateScriptErrorDown, toggleFileApproval,
        rejectAllFiles, navigateBulkRepairUp, navigateBulkRepairDown,
        navigateBulkInstructUp, navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    const navigateToNextItem = () => {
        if (selectedItemIndex < navigableItems.length - 1) {
            setSelectedItemIndex(selectedItemIndex + 1);
            contentViewport.actions.resetScroll();
        }
    };

    const navigateToPreviousItem = () => {
        if (selectedItemIndex > 0) {
            setSelectedItemIndex(selectedItemIndex - 1);
            contentViewport.actions.resetScroll();
        }
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

        const currentItem = navigableItems[selectedItemIndex];
        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            return true;
        }

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
        const contentViews: ReviewBodyView[] = [
            REVIEW_BODY_VIEWS.REASONING,
            REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
            REVIEW_BODY_VIEWS.DIFF,
            REVIEW_BODY_VIEWS.PROMPT,
        ];
        if (!contentViews.includes(bodyView)) return false;

        if (key.pageUp) { contentViewport.actions.pageUp(); return true; }
        if (key.pageDown) { contentViewport.actions.pageDown(); return true; }
        return false;
    };

    const handleReasoningInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'r') toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
    };

    const handleScriptOutputInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
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
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        if (key.leftArrow) {
            showDashboardScreen();
            return;
        }

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

        if (input.toLowerCase() === 'p') {
            toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            } else if (currentItem?.type === 'prompt') {
                toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
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

        if (input.toLowerCase() === 'x') {
            rejectTransaction();
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

        if (key.leftArrow) {
            // Allow left arrow to collapse any open body view
            setBodyView(REVIEW_BODY_VIEWS.NONE);
            return;
        }

        // Global "Enter to collapse" handler for non-modal views
        if (key.return) {
            if (
                bodyView !== REVIEW_BODY_VIEWS.BULK_REPAIR &&
                bodyView !== REVIEW_BODY_VIEWS.BULK_INSTRUCT &&
                bodyView !== REVIEW_BODY_VIEWS.CONFIRM_HANDOFF &&
                bodyView !== REVIEW_BODY_VIEWS.NONE
            ) {
                setBodyView(REVIEW_BODY_VIEWS.NONE);
                return;
            }
        }

        // Allow up/down list navigation even when a content view is open
        const listNavigableBodyViews: ReviewBodyView[] = [
            REVIEW_BODY_VIEWS.PROMPT, REVIEW_BODY_VIEWS.REASONING, REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
        ];

        if (listNavigableBodyViews.includes(bodyView)) {
            if (key.upArrow) { navigateToPreviousItem(); return; }
            if (key.downArrow) { navigateToNextItem(); return; }
        }

        // Handle content scrolling (PgUp/PgDn)
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

        if (bodyView === REVIEW_BODY_VIEWS.PROMPT) {
            const promptText = prompt || '';
            return (
                <Box flexDirection="column">
                    <ContentView
                        title="PROMPT"
                        content={promptText}
                        scrollIndex={contentScrollIndex}
                        maxHeight={Math.max(1, availableBodyHeight)}
                    />
                </Box>
            );
        }

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
                            Showing lines {contentScrollIndex + 1}-{Math.min(contentScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
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
                    isExpanded={true}
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
        switch (bodyView) {
            case REVIEW_BODY_VIEWS.PROMPT:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.PROMPT_VIEW} />;
            case REVIEW_BODY_VIEWS.DIFF:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.DIFF_VIEW}/>;
            case REVIEW_BODY_VIEWS.REASONING:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.REASONING_VIEW}/>;
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.SCRIPT_OUTPUT_VIEW}/>;
            case REVIEW_BODY_VIEWS.BULK_REPAIR:
                return <Text>{REVIEW_FOOTER_ACTIONS.BULK_REPAIR_VIEW.text}</Text>;
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT:
                return <Text>{REVIEW_FOOTER_ACTIONS.BULK_INSTRUCT_VIEW.text}</Text>;
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.HANDOFF_CONFIRM_VIEW}/>;
        }

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
                                <ScriptItemRow
                                    key={script.command} script={script}
                                    isSelected={isSelected}
                                    isExpanded={bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT && isSelected}
                                />
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
                        <Text color="gray">{FILE_CHANGE_ICONS[file.type]}</Text> {file.path}
                    </Text>
                ))}
             </Box>
        </Box>
    );
};
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
            if (key.escape || key.leftArrow) {
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
