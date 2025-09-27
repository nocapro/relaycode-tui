# Directory Structure
```
src/
  components/
    layout/
      ScreenLayout.tsx
    ActionFooter.tsx
    CopyScreen.tsx
    GlobalHelpScreen.tsx
    Separator.tsx
  hooks/
    useLayout.ts
    useViewport.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/hooks/useLayout.ts
```typescript
import { useMemo } from 'react';
import { useStdoutDimensions } from '../utils';

export interface LayoutConfig {
    header?: number;
    footer?: number;
    separators?: number;
    marginsY?: number; // Total vertical margin
    paddingY?: number; // Total vertical padding
    fixedRows?: number; // For any other static rows
    dynamicRows?: {
        count: number;
        lineHeight?: number; // Default to 1
    };
}

export interface LayoutInfo {
    totalHeight: number;
    remainingHeight: number;
}

/**
 * Calculates available vertical space based on terminal height and a declarative layout config.
 * @param config A declarative object describing static and dynamic rows to reserve.
 * @returns An object with total terminal height and the calculated remaining height for content.
 */
export const useLayout = (config: LayoutConfig): LayoutInfo => {
    const [, totalHeight] = useStdoutDimensions();

    const reservedHeight = useMemo(() => {
        let reserved = 0;
        reserved += config.header || 0;
        reserved += config.footer || 0;
        reserved += config.separators || 0;
        reserved += config.marginsY || 0;
        reserved += config.paddingY || 0;
        reserved += config.fixedRows || 0;

        if (config.dynamicRows) {
            reserved += config.dynamicRows.count * (config.dynamicRows.lineHeight || 1);
        }
        return reserved;
    }, [config]);

    const remainingHeight = Math.max(1, totalHeight - reservedHeight);

    return {
        totalHeight,
        remainingHeight,
    };
};
```

## File: src/components/layout/ScreenLayout.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from '../Separator';

interface ScreenLayoutProps {
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
}

const ScreenLayout = ({ title, footer, children }: ScreenLayoutProps) => {
    return (
        <Box flexDirection="column" flexGrow={1}>
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · {title} </Text>
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

## File: src/utils.ts
```typescript
import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Dimensions = { columns: number; rows: number };
const subscribers = new Set<(dims: Dimensions) => void>();
let currentDimensions: Dimensions = {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
};

let listenerAttached = false;
let debounceTimeout: NodeJS.Timeout | null = null;

const updateAndNotify = () => {
    const newDimensions = {
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
    };

    if (newDimensions.columns !== currentDimensions.columns || newDimensions.rows !== currentDimensions.rows) {
        currentDimensions = newDimensions;
        subscribers.forEach(subscriber => subscriber(currentDimensions));
    }
};

const debouncedUpdateAndNotify = () => {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(updateAndNotify, 150); // Debounce resize event
};

if (!listenerAttached) {
    process.stdout.on('resize', debouncedUpdateAndNotify);
    listenerAttached = true;
}

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState(currentDimensions);

    useEffect(() => {
        const subscriber = (newDims: Dimensions) => setDimensions(newDims);
        subscribers.add(subscriber);

        // On mount, check if dimensions are stale and update if needed for this hook instance.
        setDimensions(dims => {
            const latestDims = {
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            };
            if (latestDims.columns !== dims.columns || latestDims.rows !== dims.rows) {
                return latestDims;
            }
            return dims;
        });

        return () => {
            subscribers.delete(subscriber);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};
```

## File: src/hooks/useViewport.ts
```typescript
import { useState, useEffect } from 'react';
import { useStdoutDimensions } from '../utils';
import { useLayout, type LayoutConfig } from './useLayout';

interface UseViewportOptions {
	selectedIndex: number;
	itemCount: number;
	layoutConfig: LayoutConfig;
}

export const useViewport = ({ selectedIndex, itemCount, layoutConfig }: UseViewportOptions) => {
	const { remainingHeight: viewportHeight } = useLayout(layoutConfig);
	const [viewOffset, setViewOffset] = useState(0);

	useEffect(() => {
		setViewOffset(0);
	}, [itemCount]);

	useEffect(() => {
		if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);

    return {
        viewOffset,
        viewportHeight,
        width: useStdoutDimensions()[0],
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

## File: src/components/GlobalHelpScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { useStdoutDimensions } from '../utils';
import ModalLayout from './layout/ModalLayout';

const HELP_SECTIONS = [
    {
        title: 'GLOBAL',
        shortcuts: [
            { key: '?', label: 'Toggle this help screen' },
            { key: 'Q/Esc', label: 'Quit or Go Back' },
            { key: 'Ctrl+V', label: 'Process Clipboard' },
            { key: 'Ctrl+B', label: 'Toggle Debug Menu' },
            { key: 'Ctrl+L', label: 'Toggle Debug Log' },
        ],
    },
    {
        title: 'DASHBOARD',
        shortcuts: [
            { key: '↑↓', label: 'Navigate event stream' },
            { key: '→/Enter', label: 'Expand / View Details' },
            { key: '←', label: 'Collapse Item' },
            { key: 'P', label: 'Pause / Resume clipboard watcher' },
            { key: 'A', label: 'Approve All Pending' },
            { key: 'C', label: 'Commit All Applied' },
            { key: 'L', label: 'View History Log' },
        ],
    },
    {
        title: 'HISTORY',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Items' },
            { key: '→/←', label: 'Expand / Collapse' },
            { key: 'Space', label: 'Select for Bulk Action' },
            { key: 'Enter', label: 'View Details' },
            { key: 'F', label: 'Filter History' },
            { key: 'B', label: 'Open Bulk Actions Menu' },
            { key: 'C', label: 'Copy Selected Items' },
        ],
    },
    {
        title: 'REVIEW SCREEN',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Items' },
            { key: 'D/Enter', label: 'View File Diff' },
            { key: 'R', label: 'Show / Collapse Reasoning' },
            { key: 'Space', label: 'Toggle Approval State' },
            { key: 'A', label: 'Apply Approved Changes' },
            { key: 'T/Shift+T', label: 'Repair / Bulk Repair Failed Files' },
            { key: 'I/Shift+I', label: 'Instruct / Bulk Instruct Rejected' },
            { key: 'C', label: 'Open Copy Menu' },
        ],
    },
    {
        title: 'DETAIL SCREEN',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Sections/Files' },
            { key: '→/←', label: 'Expand / Collapse' },
            { key: 'Enter', label: 'Drill-in / View Diff' },
            { key: 'U', label: 'Revert Transaction' },
            { key: 'C', label: 'Open Copy Menu' },
            { key: 'O', label: 'Open File/YAML in Editor' },
        ],
    },
];

const KEY_PADDING = 12;

const Shortcut = ({ shortcut }: { shortcut: { key: string; label: string } }) => (
    <Text>
        {'  '}
        <Text color="cyan" bold>{shortcut.key.padEnd(KEY_PADDING)}</Text>
        {shortcut.label}
    </Text>
);

const GlobalHelpScreen = () => {
    const [width] = useStdoutDimensions();

    // 90% view width, minus 2 padding on each side.
    const availableWidth = Math.floor(width * 0.9) - 4;

    // Calculate max width needed for one column of content
    const allShortcutLines = HELP_SECTIONS.flatMap(s => 
        s.shortcuts.map(sc => `  ${sc.key.padEnd(KEY_PADDING)} ${sc.label}`)
    );
    const allLines = [...allShortcutLines, ...HELP_SECTIONS.map(s => s.title)];
    const maxContentWidth = Math.max(...allLines.map(line => line.length));

    const GAP = 4;
    // Determine optimal number of columns
    const numColumns = Math.max(1, Math.min(
        HELP_SECTIONS.length, // Don't make more columns than sections
        Math.floor(availableWidth / (maxContentWidth + GAP))
    ));

    // Distribute sections into columns
    const columns: typeof HELP_SECTIONS[] = Array.from({ length: numColumns }, () => []);
    const sectionsPerColumn = Math.ceil(HELP_SECTIONS.length / numColumns);

    HELP_SECTIONS.forEach((section, index) => {
        const columnIndex = Math.floor(index / sectionsPerColumn);
        if (columns[columnIndex]) {
            columns[columnIndex].push(section);
        }
    });

    return (
        <ModalLayout width="90%">
            <Box
                flexDirection="column"
                paddingX={2}
                paddingY={2}
            >
                <Box justifyContent="center" marginBottom={1}>
                    <Text bold>
                        <Text color="yellow">▲ relaycode</Text>
                        <Text color="cyan"> · Keyboard Shortcuts</Text>
                    </Text>
                </Box>

                <Box flexDirection="row" gap={GAP}>
                    {columns.map((sectionList, i) => (
                        <Box key={i} flexDirection="column" gap={1} flexGrow={1} flexShrink={1} flexBasis={0}>
                            {sectionList.map(section => (
                                <Box key={section.title} flexDirection="column">
                                    <Text bold color="cyan">{section.title}</Text>
                                    {section.shortcuts.map(shortcut => (
                                        <Shortcut key={shortcut.label} shortcut={shortcut} />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box justifyContent="center" marginTop={1}>
                <Text bold>(Press <Text color="cyan" bold>?</Text> or <Text color="cyan" bold>Esc</Text> to close)</Text>
            </Box>
        </ModalLayout>
    );
};

export default GlobalHelpScreen;
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
