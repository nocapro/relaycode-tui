# Directory Structure
```
src/
  components/
    DashboardScreen.tsx
    TransactionDetailScreen.tsx
    TransactionHistoryScreen.tsx
  data/
    mocks.ts
  hooks/
    useTransactionHistoryScreen.tsx
  services/
    transaction.service.ts
  stores/
    dashboard.store.ts
    transaction-detail.store.ts
    transaction-history.store.ts
  types/
    transaction.types.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/data/mocks.ts
```typescript
import type { Transaction, TransactionStatus } from '../types/transaction.types';
import type { FileChange, ReviewFileItem } from '../types/file.types';
import type { ScriptResult } from '../types/review.types';

// From dashboard.store.ts
export const createDashboardTransactions = (): Transaction[] => [
    { id: '1', timestamp: Date.now() - 15 * 1000, status: 'PENDING', hash: 'e4a7c112', message: 'fix: add missing error handling' },
    { id: '2', timestamp: Date.now() - 2 * 60 * 1000, status: 'APPLIED', hash: '4b9d8f03', message: 'refactor: simplify clipboard logic' },
    { id: '3', timestamp: Date.now() - 5 * 60 * 1000, status: 'COMMITTED', hash: '8a3f21b8', message: 'feat: implement new dashboard UI' },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

// From review.store.ts
export const mockReviewFiles: ReviewFileItem[] = [
    {
        id: '1',
        path: 'src/core/transaction.ts',
        status: 'APPROVED',
        linesAdded: 18,
        linesRemoved: 5,
        diff: `--- a/src/core/transaction.ts
+++ b/src/core/transaction.ts
@@ -15,7 +15,7 @@ export class Transaction {
   }

-  calculateChanges(): ChangeSet {
+  computeDelta(): ChangeSet {
     return this.changes;
   }
 }`,
        strategy: 'replace',
    },
    {
        id: '2',
        path: 'src/utils/logger.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Hunk #1 failed to apply',
        strategy: 'standard-diff',
    },
    {
        id: '3',
        path: 'src/commands/apply.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Context mismatch at line 92',
        strategy: 'standard-diff',
    },
];

export const mockReviewScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

export const mockReviewReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

// From transaction-detail.store.ts
export const mockDetailedTransactionData = {
    prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
    reasoning: `1. The primary goal was to make the rollback functionality in \`restoreSnapshot\` more robust. The previous implementation used a simple for-loop which would halt on the first error, leaving the project in a partially restored state.

2. I opted for a \`Promise.all\` approach to run file restorations in parallel. This improves performance slightly but, more importantly, ensures all restoration attempts are completed, even if some fail.

3. An \`restoreErrors\` array was introduced to collect any exceptions that occur during the process. If this array is not empty after the \`Promise.all\` completes, a comprehensive error is thrown, informing the user exactly which files failed to restore. This provides much better diagnostics.`,
    files: [
        { id: '1', path: 'src/core/transaction.ts', type: 'MOD' as const, linesAdded: 18, linesRemoved: 5, diff: `   export const restoreSnapshot = async (snapshot: FileSnapshot, ...): ... => {
     ...
-    for (const [filePath, content] of entries) {
-        if (content === null) {
-            await deleteFile(filePath, cwd);
-        }
-    }
+    const restoreErrors: { path: string, error: unknown }[] = [];
+
+    await Promise.all(entries.map(async ([filePath, content]) => {
+        try {
+          if (content === null) { ... }
+        } catch (error) {
+          restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) { ... }
   }` },
        { id: '2', path: 'src/utils/logger.ts', type: 'MOD' as const, linesAdded: 7, linesRemoved: 3, diff: '... diff content for logger.ts ...' },
        { id: '3', path: 'src/utils/old-helper.ts', type: 'DEL' as const, linesAdded: 0, linesRemoved: 0, diff: '... diff content for old-helper.ts ...' },
    ],
};

// From transaction.service.ts
export const createMockHistoryTransactions = (): Transaction[] => {
    const now = Date.now();
    return Array.from({ length: 42 }, (_, i) => {
        const status: TransactionStatus = i % 5 === 2 ? 'HANDOFF' : i % 5 === 3 ? 'REVERTED' : 'COMMITTED';
        const files: FileChange[] = [
            { id: `${i}-1`, path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 25, linesRemoved: 8, diff: '--- a/src/core/transaction.ts\n+++ b/src/core/transaction.ts\n@@ -45,7 +45,9 @@\n-    for (const [filePath, content] of entries) {\n+    const restoreErrors: { path: string, error: unknown }[] = [];\n...\n...\n...\n...\n-    another line removed' },
            { id: `${i}-2`, path: 'src/utils/logger.ts', type: 'MOD', linesAdded: 10, linesRemoved: 2, diff: 'diff for logger' },
            { id: `${i}-3`, path: 'src/utils/old-helper.ts', type: 'DEL', linesAdded: 0, linesRemoved: 30, diff: 'diff for old-helper' },
        ];
        const linesAdded = files.reduce((sum, f) => sum + f.linesAdded, 0);
        const linesRemoved = files.reduce((sum, f) => sum + f.linesRemoved, 0);

        return {
            id: `tx-${i}`,
            hash: Math.random().toString(16).slice(2, 10),
            timestamp: now - i * 24 * 60 * 60 * 1000,
            status,
            message: `feat: commit message number ${42 - i}`,
            files,
            stats: { files: files.length, linesAdded, linesRemoved },
        };
    });
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
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
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

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

## File: src/hooks/useTransactionHistoryScreen.tsx
```typescript
import { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import { useTransactionHistoryStore, getVisibleItemPaths } from '../stores/transaction-history.store';
import { useAppStore } from '../stores/app.store';
import { useStdoutDimensions } from '../utils';

export const useTransactionHistoryScreen = () => {
    const [, rows] = useStdoutDimensions();
    const store = useTransactionHistoryStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const [viewOffset, setViewOffset] = useState(0);
    
    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(store.transactions, store.expandedIds),
        [store.transactions, store.expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(store.selectedItemPath);

    const NON_CONTENT_HEIGHT = 8; // Header, filter, separators, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_CONTENT_HEIGHT);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);
    
    useInput((input, key) => {
        if (store.mode === 'FILTER') {
            if (key.escape) store.actions.setMode('LIST');
            if (key.return) store.actions.applyFilter();
            return;
        }
        if (store.mode === 'COPY') {
            if (key.escape || input.toLowerCase() === 'c') store.actions.setMode('LIST');
            if (key.return) store.actions.executeCopy();
            if (input.toLowerCase() === 'm') store.actions.toggleCopySelection('Git Messages');
            if (input.toLowerCase() === 'r') store.actions.toggleCopySelection('Reasonings');
            // Add other toggles here if needed for other copyFields
            return;
        }
        if (store.mode === 'BULK_ACTIONS') {
            if (key.escape) store.actions.setMode('LIST');
            // Add number handlers...
            return;
        }

        // LIST mode inputs
        if (key.upArrow) store.actions.navigateUp();
        if (key.downArrow) store.actions.navigateDown();
        if (key.rightArrow) store.actions.expandOrDrillDown();
        if (key.leftArrow) store.actions.collapseOrBubbleUp();
        if (input === ' ') store.actions.toggleSelection();

        if (input.toLowerCase() === 'f') store.actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && store.selectedForAction.size > 0) store.actions.setMode('COPY');
        if (input.toLowerCase() === 'b' && store.selectedForAction.size > 0) store.actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => store.transactions.filter(tx => txIdsInView.has(tx.id)),
        [store.transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatus = store.filterQuery ? store.filterQuery : '(none)';
    const showingStatus = `Showing ${viewOffset + 1}-${viewOffset + itemsInView.length} of ${visibleItemPaths.length} items`;
    
    const copyFields = [
        { key: 'M', name: 'Git Messages' }, { key: 'P', name: 'Prompts' }, { key: 'R', name: 'Reasonings' },
        { key: 'D', name: 'Diffs' }, { key: 'U', name: 'UUIDs' }, { key: 'Y', name: 'Full YAML' },
    ];

    return {
        store,
        viewOffset,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
        
        // For CopyMode sub-component
        selectedFields: store.copyModeSelections,
        copyFields,
    };
};
```

## File: src/types/transaction.types.ts
```typescript
import type { FileChange } from './file.types';

export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
    // Fields for history/detail view
    files?: FileChange[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
```

## File: src/services/transaction.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import { createMockHistoryTransactions } from '../data/mocks';
import type { HistoryTransaction, HistoryTransactionStatus } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';

const revertTransaction = (transactionId: string) => {
    const { updateTransactionStatus } = useDashboardStore.getState().actions;
    updateTransactionStatus(transactionId, 'REVERTED');
};

export const TransactionService = {
    revertTransaction,
    createMockTransactions: createMockHistoryTransactions,
};
```

## File: src/components/TransactionDetailScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { type FileChangeType } from '../stores/transaction-detail.store';
import Separator from './Separator';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';

const getFileChangeTypeIcon = (type: FileChangeType) => {
    switch (type) {
        case 'MOD': return '[MOD]';
        case 'ADD': return '[ADD]';
        case 'DEL': return '[DEL]';
        case 'REN': return '[REN]';
    }
};

interface CopyModeProps {
    transactionHash: string;
    copyOptions: { key: string; label: string }[];
    copyModeSelectionIndex: number;
    copyModeSelections: Record<string, boolean>;
    copyModeLastCopied: string | null;
}

const CopyMode = ({
    transactionHash,
    copyOptions,
    copyModeSelectionIndex,
    copyModeSelections,
    copyModeLastCopied,
}: CopyModeProps) => {
    
    return (
        <Box flexDirection="column" width="100%">
            <Text>Select data to copy from transaction {transactionHash} (use Space to toggle):</Text>
            <Box flexDirection="column" marginY={1}>
                {copyOptions.map((opt, index) => {
                    const isSelected = index === copyModeSelectionIndex;
                    const isChecked = copyModeSelections[opt.label] || false;
                    return (
                        <Text key={opt.label} color={isSelected ? 'cyan' : undefined}>
                            {isSelected ? '> ' : '  '}
                            [{isChecked ? 'x' : ' '}] ({opt.key}) {opt.label}
                        </Text>
                    );
                })}
            </Box>
            <Separator />
            {copyModeLastCopied && <Text color="green">✓ {copyModeLastCopied}</Text>}
        </Box>
    );
};

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

const TransactionDetailScreen = () => {
    const {
        transaction, prompt, reasoning, files,
        navigatorFocus, expandedSection, selectedFileIndex, bodyView,
        copyOptions, copyModeSelectionIndex, copyModeSelections, copyModeLastCopied,
    } = useTransactionDetailScreen();

    if (!transaction) {
        return <Text>Loading transaction...</Text>;
    }

    const renderNavigator = () => {
        const isPromptFocused = navigatorFocus === 'PROMPT';
        const isReasoningFocused = navigatorFocus === 'REASONING';
        const isFilesFocused = navigatorFocus === 'FILES' || navigatorFocus === 'FILES_LIST';
        
        const isPromptExpanded = expandedSection === 'PROMPT';
        const isReasoningExpanded = expandedSection === 'REASONING';
        const isFilesExpanded = expandedSection === 'FILES';
        
        return (
            <Box flexDirection="column">
                <Text color={isPromptFocused && !isFilesFocused ? 'cyan' : undefined}>
                    {isPromptFocused && !isFilesFocused ? '> ' : '  '}
                    {isPromptExpanded ? '▾' : '▸'} (P)rompt
                </Text>
                <Text color={isReasoningFocused && !isFilesFocused ? 'cyan' : undefined}>
                    {isReasoningFocused && !isFilesFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (R)easoning ({reasoning.split('\n\n').length} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && navigatorFocus !== 'FILES_LIST' ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (F)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file, index) => {
                             const isFileSelected = navigatorFocus === 'FILES_LIST' && selectedFileIndex === index;
                             const stats = file.type === 'DEL' ? '' : ` (+${file.linesAdded}/-${file.linesRemoved})`;
                             return (
                                <Text key={file.id} color={isFileSelected ? 'cyan' : undefined}>
                                    {isFileSelected ? '> ' : '  '}
                                    {`${getFileChangeTypeIcon(file.type)} ${file.path}${stats}`}
                                </Text>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    const renderBody = () => {
        if (bodyView === 'NONE') {
            return <Text color="gray">(Press → to expand a section and view its contents)</Text>;
        }
        if (bodyView === 'PROMPT') {
            return (
                <Box flexDirection="column">
                    <Text>PROMPT</Text>
                    <Box marginTop={1}><Text>{prompt}</Text></Box>
                </Box>
            );
        }
        if (bodyView === 'REASONING') {
            return (
                <Box flexDirection="column">
                    <Text>REASONING</Text>
                    <Box marginTop={1}>
                        {reasoning.split('\n').map((line, i) => <Text key={i}>{line}</Text>)}
                    </Box>
                </Box>
            );
        }
        if (bodyView === 'FILES_LIST') {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === 'DIFF_VIEW') {
            const file = files[selectedFileIndex];
            if (!file) return null;
            return (
                <Box flexDirection="column">
                    <Text>DIFF: {file.path}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {file.diff.split('\n').map((line, i) => {
                            let color = 'white';
                            if (line.startsWith('+')) color = 'green';
                            if (line.startsWith('-')) color = 'red';
                            if (line.startsWith('@@')) color = 'cyan';
                            return <Text key={i} color={color}>{line}</Text>;
                        })}
                    </Box>
                </Box>
            );
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === 'REVERT_CONFIRM') {
            return <Text>(Enter) Confirm Revert      (Esc) Cancel</Text>;
        }
        if (bodyView === 'COPY_MODE') {
             return <Text>(↑↓) Nav · (Spc) Toggle · (Enter) Copy Selected · (C)opy/Exit</Text>;
        }
        
        if (navigatorFocus === 'FILES_LIST') {
            if (bodyView === 'DIFF_VIEW') {
                return <Text>(↑↓) Nav Files · (←) Back to Files · (C)opy Mode · (U)ndo · (Q)uit</Text>;
            }
            return <Text>(↑↓) Nav Files · (→) View Diff · (←) Back to Sections · (C)opy Mode · (Q)uit</Text>;
        }
        
        if (expandedSection) {
            return <Text>(↑↓) Nav/Scroll · (←) Collapse · (C)opy Mode · (U)ndo · (Q)uit</Text>;
        }
        
        return <Text>(↑↓) Nav · (→) Expand · (C)opy Mode · (U)ndo · (Q)uit</Text>;
    };

    const { message, timestamp, status } = transaction;
    const date = new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    const fileStats = `${files.length} Files · +${files.reduce((a, f) => a + f.linesAdded, 0)} lines, -${files.reduce((a, f) => a + f.linesRemoved, 0)} lines`;

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text>▲ relaycode {bodyView === 'COPY_MODE' ? 'details · copy mode' : 'transaction details'}</Text>
            <Separator />
            
            {/* Modal takeover for Revert */}
            {bodyView === 'REVERT_CONFIRM' && <RevertModal transactionHash={transaction.hash} />}
            
            {/* Main view */}
            <Box flexDirection="column" display={bodyView === 'REVERT_CONFIRM' ? 'none' : 'flex'}>
                {/* Navigator Part A */}
                <Box flexDirection="column" marginY={1}>
                    <Text>UUID: {transaction.id}</Text>
                    <Text>Git: {message}</Text>
                    <Text>Date: {date} · Status: {status}</Text>
                    <Text>Stats: {fileStats}</Text>
                </Box>
                
                {/* Navigator Part B */}
                {renderNavigator()}
                
                <Separator />
                
                {/* Body */}
                <Box marginY={1}>
                    {bodyView === 'COPY_MODE' ? <CopyMode
                        transactionHash={transaction.hash}
                        copyOptions={copyOptions}
                        copyModeSelectionIndex={copyModeSelectionIndex}
                        copyModeSelections={copyModeSelections}
                        copyModeLastCopied={copyModeLastCopied}
                    />
                    : renderBody()}
                </Box>
                
                <Separator />
            </Box>
            
            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default TransactionDetailScreen;
```

## File: src/components/TransactionHistoryScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { type HistoryTransaction as Transaction, type FileChange } from '../stores/transaction-history.store';
import Separator from './Separator';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';

// --- Sub-components ---

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

const FileRow = ({ file, isSelected, isExpanded }: { file: FileChange, isSelected: boolean, isExpanded: boolean }) => {
    const icon = isExpanded ? '▾' : '▸';
    const typeMap = { MOD: '[MOD]', ADD: '[ADD]', DEL: '[DEL]', REN: '[REN]' };
    
    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {icon} {typeMap[file.type]} {file.path}
            </Text>
            {isExpanded && <DiffPreview diff={file.diff} />}
        </Box>
    );
};

const TransactionRow = ({
    tx,
    isSelected,
    isExpanded,
    isSelectedForAction,
}: {
    tx: Transaction,
    isSelected: boolean,
    isExpanded: boolean,
    isSelectedForAction: boolean,
}) => {
    const icon = isExpanded ? '▾' : '▸';
    const statusMap = {
        COMMITTED: <Text color="green">✓ Committed</Text>,
        HANDOFF: <Text color="magenta">→ Handoff</Text>,
        REVERTED: <Text color="gray">↩ Reverted</Text>,
    };
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    const selectionIndicator = isSelectedForAction ? '[x]' : '[ ]';
    
    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {selectionIndicator} {icon} {statusMap[tx.status as keyof typeof statusMap] || tx.status} · {tx.hash} · {date} · {tx.message}
            </Text>
            {isExpanded && (
                <Box flexDirection="column" paddingLeft={8}>
                    {tx.stats && <Text color="gray">Stats: {tx.stats.files} Files · +{tx.stats.linesAdded} lines, -{tx.stats.linesRemoved} lines</Text>}
                    <Text>Files:</Text>
                </Box>
            )}
        </Box>
    );
};

interface CopyModeProps {
    selectedForActionCount: number;
    lastCopiedMessage: string | null;
    selectedFields: Set<string>;
    fields: { key: string; name: string }[];
}

const CopyMode = ({
    selectedForActionCount,
    lastCopiedMessage,
    selectedFields,
    fields,
}: CopyModeProps) => {

    return (
        <Box flexDirection="column" marginY={1}>
            <Text>Select data to copy from {selectedForActionCount} transactions:</Text>
            <Box marginY={1}>
                {fields.map(f => (
                    <Text key={f.key}>
                        [{selectedFields.has(f.name) ? 'x' : ' '}] ({f.key}) {f.name.padEnd(15)}
                    </Text>
                ))}
            </Box>
            {lastCopiedMessage && <Text color="green">✓ {lastCopiedMessage}</Text>}
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
            <Text>(1) Revert Selected Transactions</Text>
            <Text>(2) Mark as &apos;Git Committed&apos;</Text>
            <Text>(3) Delete Selected Transactions (from Relaycode history)</Text>
            <Text>(Esc) Cancel</Text>
        </Box>
    );
};

// --- Main Component ---

const TransactionHistoryScreen = () => {
    const {
        store,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
        selectedFields,
        copyFields,
    } = useTransactionHistoryScreen();

    const renderFooter = () => {
        if (store.mode === 'FILTER') return <Text>(Enter) Apply Filter & Return      (Esc) Cancel</Text>;
        if (store.mode === 'COPY') return <Text>(M,R,...) Toggle · (Enter) Copy · (C, Esc) Exit</Text>;
        if (store.mode === 'BULK_ACTIONS') return <Text>Choose an option [1-3, Esc]:</Text>;
        
        const actions = ['(↑↓) Nav', '(→) Expand', '(←) Collapse', '(Spc) Select', '(Ent) Details', '(F)ilter'];
        if (store.selectedForAction.size > 0) {
            actions.push('(C)opy', '(B)ulk');
        }
        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode transaction history</Text>
            <Separator />

            <Box>
                <Text>Filter: </Text>
                {store.mode === 'FILTER' ? (
                    <TextInput value={store.filterQuery} onChange={store.actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus} ({store.transactions.length} txns)</Text>
            </Box>

            <Box flexDirection="column" marginY={1}>
                {store.mode === 'COPY' && <CopyMode
                    selectedForActionCount={store.selectedForAction.size}
                    lastCopiedMessage={store.lastCopiedMessage}
                    selectedFields={selectedFields}
                    fields={copyFields}
                />}
                {store.mode === 'BULK_ACTIONS' && <BulkActionsMode selectedForActionCount={store.selectedForAction.size} />}

                {store.mode === 'LIST' && transactionsInView.map(tx => {
                    const isTxSelected = store.selectedItemPath.startsWith(tx.id);
                    const isTxExpanded = store.expandedIds.has(tx.id);
                    const isSelectedForAction = store.selectedForAction.has(tx.id);

                    const showTxRow = pathsInViewSet.has(tx.id);

                    return (
                        <Box flexDirection="column" key={tx.id}>
                            {showTxRow && (
                                <TransactionRow
                                    tx={tx}
                                    isSelected={isTxSelected && !store.selectedItemPath.includes('/')}
                                    isExpanded={isTxExpanded}
                                    isSelectedForAction={isSelectedForAction}
                                />
                            )}
                            {isTxExpanded && tx.files?.map(file => {
                                if (!pathsInViewSet.has(`${tx.id}/${file.id}`)) return null;
                                const filePath = `${tx.id}/${file.id}`;
                                const isFileSelected = store.selectedItemPath === filePath;
                                const isFileExpanded = store.expandedIds.has(filePath);
                                return (
                                    <FileRow
                                        key={file.id}
                                        file={file}
                                        isSelected={isFileSelected}
                                        isExpanded={isFileExpanded}
                                    />
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            <Separator />
            {renderFooter()}
        </Box>
    );
};

export default TransactionHistoryScreen;
```

## File: src/stores/transaction-detail.store.ts
```typescript
import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import { TransactionService } from '../services/transaction.service';
import { mockDetailedTransactionData } from '../data/mocks';
import type { Transaction } from '../types/transaction.types';
import type { FileChange as FileDetail } from '../types/file.types';
export type { FileChangeType } from '../types/file.types';
import type { NavigatorSection, DetailBodyView } from '../types/transaction-detail.types';

interface TransactionDetailState {
    // Data
    transaction: Transaction | null;
    prompt: string;
    reasoning: string;
    files: FileDetail[];

    // UI State
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: DetailBodyView;
    copyModeSelectionIndex: number;
    copyModeSelections: Record<string, boolean>;
    copyModeLastCopied: string | null;

    // Actions
    actions: {
        loadTransaction: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleCopyMode: () => void;
        toggleRevertConfirm: () => void;
        copyModeNavigateUp: () => void;
        copyModeNavigateDown: () => void;
        copyModeToggleSelection: () => void;
        copyModeExecuteCopy: () => void;
        confirmRevert: () => void;
    }
}

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
const copyOptionsList = [
    'Git Message', 'Prompt', 'Reasoning', `All Diffs (${mockDetailedTransactionData.files.length} files)`, `Diff for: ${mockDetailedTransactionData.files[0]?.path}`, 'UUID', 'Full YAML representation',
];

export const useTransactionDetailStore = create<TransactionDetailState>((set, get) => ({
    transaction: null,
    prompt: '',
    reasoning: '',
    files: [],

    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',
    copyModeSelectionIndex: 0,
    copyModeSelections: { 'Git Message': true, 'Reasoning': true }, // Default selections from readme
    copyModeLastCopied: null,

    actions: {
        loadTransaction: (transactionId) => {
            const { transactions } = useDashboardStore.getState();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                set({
                    transaction,
                    ...mockDetailedTransactionData,
                    // Reset UI state
                    navigatorFocus: 'PROMPT',
                    expandedSection: null,
                    selectedFileIndex: 0,
                    bodyView: 'NONE',
                });
            }
        },
        navigateUp: () => {
            const { navigatorFocus, selectedFileIndex } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.max(0, selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ navigatorFocus: navigatorOrder[currentIndex - 1] });
                }
            }
        },
        navigateDown: () => {
            const { navigatorFocus, selectedFileIndex, files } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.min(files.length - 1, selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ navigatorFocus: navigatorOrder[currentIndex + 1] });
                }
            }
        },
        handleEnterOrRight: () => {
            const { navigatorFocus, expandedSection } = get();

            if (navigatorFocus === 'FILES_LIST') {
                // Already in file list, now show diff
                set({ bodyView: 'DIFF_VIEW' });
                return;
            }

            if (expandedSection === navigatorFocus) {
                // Section is already expanded, handle nested navigation
                if (navigatorFocus === 'FILES') {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: 'FILES_LIST' });
                }
                return;
            }

            // Expand the focused section
            set({ expandedSection: navigatorFocus });

            switch(navigatorFocus) {
                case 'PROMPT':
                    set({ bodyView: 'PROMPT' });
                    break;
                case 'REASONING':
                    set({ bodyView: 'REASONING' });
                    break;
                case 'FILES':
                    set({ bodyView: 'FILES_LIST' });
                    break;
            }
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();

            if (bodyView === 'DIFF_VIEW') {
                set({ bodyView: 'FILES_LIST' }); // Go back from diff to file list
                return;
            }

            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: 'FILES', bodyView: 'NONE' }); // Go back from file list to files section
                return;
            }

            // If a section is expanded, collapse it
            if (expandedSection) {
                set({ expandedSection: null, bodyView: 'NONE' });
                return;
            }
        },
        toggleCopyMode: () => set(state => {
            if (state.bodyView === 'COPY_MODE') {
                return { bodyView: 'NONE' };
            }
            return {
                bodyView: 'COPY_MODE',
                copyModeSelectionIndex: 0,
                copyModeLastCopied: null,
            };
        }),
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        copyModeNavigateUp: () => set(state => ({
            copyModeSelectionIndex: Math.max(0, state.copyModeSelectionIndex - 1),
        })),
        copyModeNavigateDown: () => set(state => ({
            copyModeSelectionIndex: Math.min(copyOptionsList.length - 1, state.copyModeSelectionIndex + 1),
        })),
        copyModeToggleSelection: () => set(state => {
            const currentOption = copyOptionsList[state.copyModeSelectionIndex];
            if (!currentOption) return {};

            const newSelections = { ...state.copyModeSelections };
            newSelections[currentOption] = !newSelections[currentOption];
            return { copyModeSelections: newSelections };
        }),
        copyModeExecuteCopy: () => {
            // Mock copy to clipboard
            const { copyModeSelections } = get();
            const selectedItems = Object.keys(copyModeSelections).filter(key => copyModeSelections[key]);
            const message = `Copied ${selectedItems.length} items to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Mock copy: ${selectedItems.join(', ')}`);
            set({ copyModeLastCopied: message });
        },
        confirmRevert: () => {
            const { transaction } = get();
            if (!transaction) return;
            TransactionService.revertTransaction(transaction.id);
            set({ bodyView: 'NONE' });
        },
    },
}));
```

## File: src/stores/transaction-history.store.ts
```typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';
import type { HistoryViewMode } from '../types/transaction-history.types';

export type { Transaction as HistoryTransaction } from '../types/transaction.types';
export type { FileChange } from '../types/file.types';

// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<TransactionHistoryState, 'actions'>;

interface TransactionHistoryState {
    transactions: Transaction[];
    mode: HistoryViewMode;
    selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    expandedIds: Set<string>; // holds ids of expanded items
    filterQuery: string;
    selectedForAction: Set<string>; // set of transaction IDs
    copyModeSelections: Set<string>;
    lastCopiedMessage: string | null;

    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        toggleCopySelection: (field: string) => void;
        executeCopy: () => void;
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    }
}

export const getVisibleItemPaths = (transactions: Transaction[], expandedIds: Set<string>): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id) && tx.files) {
            for (const file of tx.files) {
                paths.push(`${tx.id}/${file.id}`);
            }
        }
    }
    return paths;
};

// --- Store ---
export const useTransactionHistoryStore = create<TransactionHistoryState>((set, get) => ({
    transactions: [],
    mode: 'LIST',
    selectedItemPath: 'tx-0',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    copyModeSelections: new Set(['Git Messages', 'Reasonings']),
    lastCopiedMessage: null,

    actions: {
        load: (initialState) => {
            const transactions = TransactionService.createMockTransactions();
            set({
                transactions,
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                copyModeSelections: new Set(['Git Messages', 'Reasonings']),
                lastCopiedMessage: null,
                ...initialState,
            });
        },
        navigateUp: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex > 0) {
                set({ selectedItemPath: visibleItems[currentIndex - 1] });
            }
        },
        navigateDown: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ selectedItemPath: visibleItems[currentIndex + 1] });
            }
        },
        expandOrDrillDown: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (!newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.add(selectedItemPath);
            }
            return { expandedIds: newExpandedIds };
        }),
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                // If it's expanded, collapse it
                newExpandedIds.delete(selectedItemPath);
                
                // Also collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }

                return { expandedIds: newExpandedIds };
            } else if (selectedItemPath.includes('/')) {
                // If it's a file, move selection to parent transaction
                const parentId = selectedItemPath.split('/')[0];
                return { selectedItemPath: parentId || '' };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = selectedItemPath.split('/')[0];
            if (!txId) return {};

            const newSelection = new Set(selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { selectedForAction: newSelection };
        }),
        setMode: (mode) => set({ mode, lastCopiedMessage: null }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            // In a real app, this would filter `transactions`.
            // For the demo, we just go back to LIST mode.
            set({ mode: 'LIST' });
        },
        toggleCopySelection: (field) => set(state => {
            const newSelections = new Set(state.copyModeSelections);
            if (newSelections.has(field)) {
                newSelections.delete(field);
            } else {
                newSelections.add(field);
            }
            return { copyModeSelections: newSelections };
        }),
        executeCopy: () => {
             // Mock copy
            const { selectedForAction, copyModeSelections } = get();
            const message = `Copied ${Array.from(copyModeSelections).join(' & ')} from ${selectedForAction.size} transactions to clipboard.`;
            // In real app: clipboardy.writeSync(...)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD MOCK] ${message}`);
            set({ lastCopiedMessage: message });
        },
        prepareDebugState: (stateName) => {
            switch (stateName) {
                case 'l1-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0']), selectedItemPath: 'tx-0' });
                    break;
                case 'l2-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0', 'tx-0/0-1']), selectedItemPath: 'tx-0/0-1' });
                    break;
                case 'filter':
                    get().actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:committed' });
                    break;
                case 'copy':
                    get().actions.load({
                        mode: 'COPY',
                        selectedForAction: new Set(['tx-0', 'tx-2']),
                        copyModeSelections: new Set(['Git Messages', 'Diffs', 'UUIDs']),
                    });
                    break;
                case 'bulk':
                    get().actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
            }
        },
    },
}));
```

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useCommitStore } from './src/stores/commit.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionDetailStore } from './src/stores/transaction-detail.store';
import { useTransactionHistoryStore } from './src/stores/transaction-history.store';

const main = () => {
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
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useTransactionDetailStore.getState().actions.loadTransaction('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useTransactionHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
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

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { createDashboardTransactions } from '../data/mocks';
import type { Transaction, TransactionStatus } from '../types/transaction.types';
import type { DashboardStatus } from '../types/dashboard.types';

export type { Transaction, TransactionStatus } from '../types/transaction.types';
export type { DashboardStatus } from '../types/dashboard.types';

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    transactions: Transaction[];
    selectedTransactionIndex: number;
    showHelp: boolean;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: createDashboardTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
        setStatus: (status) => set({ status }),
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
            // After updating, move selection to the updated transaction
            const index = get().transactions.findIndex(tx => tx.id === id);
            if (index !== -1) set({ selectedTransactionIndex: index });
        },

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                await DashboardService.approveAll();

                set({ status: previousStatus });
            }
        },
    },
}));
```

## File: src/components/DashboardScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';
import { useDashboardScreen } from '../hooks/useDashboardScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return <Text color="yellow">?</Text>;
        case 'APPLIED': return <Text color="green">✓</Text>;
        case 'COMMITTED': return <Text color="blue">→</Text>;
        case 'HANDOFF': return <Text color="magenta">→</Text>;
        case 'FAILED': return <Text color="red">✗</Text>;
        case 'REVERTED': return <Text color="gray">↩</Text>;
        case 'IN-PROGRESS': return <Spinner type="dots" />;
        default: return <Text> </Text>;
    }
};

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `-${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `-${minutes}m`;
};

const EventStreamItem = ({ transaction, isSelected }: { transaction: Transaction, isSelected: boolean }) => {
    const icon = getStatusIcon(transaction.status);
    const time = formatTimeAgo(transaction.timestamp).padEnd(5, ' ');
    const statusText = transaction.status.padEnd(11, ' ');
    
    const messageNode = transaction.status === 'IN-PROGRESS'
        ? <Text color="cyan">{transaction.message}</Text>
        : transaction.message;
    
    const content = (
        <Text>
            {time} {icon} {statusText} <Text color="gray">{transaction.hash}</Text> · {messageNode}
        </Text>
    );

    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
};

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
        showHelp,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    } = useDashboardScreen();

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>;
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        const commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'CONFIRM_APPROVE') {
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
            <Text>
                (<Text color="cyan" bold>Enter</Text>) Confirm      (<Text color="cyan" bold>Esc</Text>) Cancel
            </Text>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const pauseAction = status === 'PAUSED'
			? <Text>(<Text color="cyan" bold>R</Text>)esume</Text>
			: <Text>(<Text color="cyan" bold>P</Text>)ause</Text>;
		return (
            <Text color="gray">
                (<Text color="cyan" bold>↑↓</Text>) Nav · (<Text color="cyan" bold>Enter</Text>) Review · (<Text color="cyan" bold>L</Text>)og · (<Text color="cyan" bold>A</Text>)pprove All · (<Text color="cyan" bold>C</Text>)ommit All · {pauseAction} · (<Text color="cyan" bold>Q</Text>)uit
            </Text>
        );
    };
    
    return (
        <Box flexDirection="column" height="100%">
            {showHelp && <GlobalHelpScreen />}

            <Box flexDirection="column" display={showHelp ? 'none' : 'flex'}>
                <Text color="cyan">▲ relaycode dashboard</Text>
                <Separator />
                <Box marginY={1}>
                    {renderStatusBar()}
                </Box>
                
                {isModal && (
                    <>
                        <ConfirmationContent transactionsToConfirm={transactionsToConfirm} />
                        <Separator />
                    </>
                )}
                
                <Text bold underline> EVENT STREAM (Last 15 minutes)</Text>
                <Box flexDirection="column" marginTop={1}>
                    {transactions.slice(viewOffset, viewOffset + viewportHeight).map((tx, index) => {
                        const actualIndex = viewOffset + index;
                        return (
                            <EventStreamItem
                                key={tx.id}
                                transaction={tx}
                                isSelected={!isModal && actualIndex === selectedTransactionIndex}
                            />
                        );
                    })}
                </Box>

                <Box marginTop={1}><Separator /></Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default DashboardScreen;
```
