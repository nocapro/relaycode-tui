# Directory Structure
```
src/
  components/
    ActionFooter.tsx
    ReviewProcessingScreen.tsx
    Separator.tsx
  constants/
    review.constants.ts
  hooks/
    useReviewScreen.tsx
  services/
    review.service.ts
  stores/
    app.store.ts
    review.store.ts
    transaction.store.ts
    view.store.ts
  types/
    actions.types.ts
  App.tsx
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

export const REVIEW_PROCESSING_FOOTER_ACTION: readonly ActionItem[] = [
    { key: 'Ctrl+C', label: 'Cancel Process' },
] as const;
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

## File: src/stores/view.store.ts
```typescript
import { create } from 'zustand';
import { OVERLAYS } from '../constants/view.constants';

export type Overlay = (typeof OVERLAYS)[keyof typeof OVERLAYS];

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: Overlay;
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: OVERLAYS.NONE,
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));
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

## File: src/components/ReviewProcessingScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type ApplyStep } from '../stores/review.store';
import Separator from './Separator';
import ActionFooter from './ActionFooter';
import { useReviewProcessingScreen } from '../hooks/useReviewProcessingScreen';
import { REVIEW_PROCESSING_FOOTER_ACTION } from '../constants/review.constants';

const ApplyStepRow = ({ step, isSubstep = false, now }: {
    step: ApplyStep;
    isSubstep?: boolean;
    now: number;
}) => {
    if (isSubstep) {
        let color: string | undefined;
        let symbol: React.ReactNode;

        switch (step.status) {
            case 'pending':
                symbol = '○';
                color = 'gray';
                break;
            case 'active':
                symbol = <Text color="cyan"><Spinner type="dots" /></Text>;
                break;
            case 'done':
                symbol = '✓';
                color = 'green';
                break;
            case 'failed':
                symbol = '✗';
                color = 'red';
                break;
            default:
                symbol = ' ';
        }

        return (
            <Text color={color}>
                {'     └─ '}{symbol}{' '}{step.title}
            </Text>
        );
    }

    let symbol;
    let color;
    switch (step.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = '(●)'; color = 'cyan'; break;
        case 'done': symbol = '[✓]'; color = 'green'; break;
        case 'failed': symbol = '[!]'; color = 'red'; break;
        case 'skipped': symbol = '(-)'; color = 'gray'; break;
    }

    let durationText = '';
    if (!isSubstep) {
        if (step.status === 'active' && step.startTime) {
            durationText = ` (${((now - step.startTime) / 1000).toFixed(1)}s)`;
        } else if (step.duration) {
            durationText = ` (${step.duration.toFixed(1)}s)`;
        }
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title}{durationText}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} now={now} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const {
        transaction,
        applySteps,
        isProcessing,
        isCancelling,
        patchStatus,
        elapsedTime,
        now,
    } = useReviewProcessingScreen();

    const failureCase = patchStatus === 'PARTIAL_FAILURE';

    const renderFooter = () => {
        if (isCancelling) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Cancelling... Please wait.</Text>;
        }
        if (isProcessing) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text>Elapsed: {elapsedTime.toFixed(1)}s · Processing... Please wait.</Text>
                    <Separator />
                    <ActionFooter actions={REVIEW_PROCESSING_FOOTER_ACTION} />
                </Box>
            );
        }
        if (failureCase) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Transitioning to repair workflow...</Text>;
        }
        return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Patch applied successfully. Transitioning...</Text>;
    };

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · APPLYING PATCH </Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} now={now} />)}
                </Box>
            </Box>
            <Separator />
            {renderFooter()}
        </Box>
    );
};

export default ReviewProcessingScreen;
```

## File: src/stores/transaction.store.ts
```typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import { useViewStore } from './view.store';
import { useDashboardStore } from './dashboard.store';
import type { Transaction, TransactionStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
        addTransaction: (transaction: Transaction) => void;
        clearTransactions: () => void;
    };
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    actions: {
        loadTransactions: () => {
            const transactions = TransactionService.getAllTransactions();
            set({ transactions });
        },
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
        },
        addTransaction: (transaction) => {
            set(state => ({
                transactions: [transaction, ...state.transactions],
            }));
            useDashboardStore.getState().actions.setSelectedIndex(0);
        },
        clearTransactions: () => set({ transactions: [] }),
    },
}));

// --- Selectors ---

/** Selects transactions by their status. */
export const selectTransactionsByStatus = (status: TransactionStatus) => (state: TransactionState) =>
    state.transactions.filter(tx => tx.status === status);

/** Selects the transaction currently targeted by the view store. */
export const selectSelectedTransaction = (state: TransactionState): Transaction | undefined => {
    const { selectedTransactionId } = useViewStore.getState();
    return state.transactions.find(t => t.id === selectedTransactionId);
};
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

## File: src/services/review.service.ts
```typescript
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { useReviewStore } from '../stores/review.store';
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
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done' } };
        if (useReviewStore.getState().isCancelling) { return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates: new Map() }; }

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
            if (useReviewStore.getState().isCancelling) break;
            const file = mockSuccessFiles[i]!;
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: `s${i + 3}`, title: `write: ${file}`, status: 'pending' } } };
        }
        await sleep(50);
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            if (useReviewStore.getState().isCancelling) break;
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'active' } };
            await sleep(50);
        }

        await sleep(200);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's1', status: 'done' } };
        await sleep(150);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's2', status: 'done' } };
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            if (useReviewStore.getState().isCancelling) break;
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'done' } };
            await sleep(80);
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done' } };

        const fileReviewStates = new Map<string, { status: FileReviewStatus }>();
        files.forEach(file => {
            fileReviewStates.set(file.id, { status: 'APPROVED' });
        });

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(100);
        if (useReviewStore.getState().isCancelling) {
            yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'failed', details: 'Cancelled by user' } };
            yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to cancellation' } };
            return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
        }
        await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done' } };

        if (useReviewStore.getState().isCancelling) {
             yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to cancellation' } };
             return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done' } };

        await sleep(500);

        return { patchStatus: 'SUCCESS', fileReviewStates };

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done' } };

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
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done' } };

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
