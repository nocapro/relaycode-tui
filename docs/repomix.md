# Directory Structure
```
docs/
  relaycode-tui/
    transaction-history-screen.readme.md
src/
  components/
    CopyScreen.tsx
    DashboardScreen.tsx
    DebugMenu.tsx
    DiffScreen.tsx
    GitCommitScreen.tsx
    GlobalHelpScreen.tsx
    InitializationScreen.tsx
    ReasonScreen.tsx
    ReviewProcessingScreen.tsx
    ReviewScreen.tsx
    Separator.tsx
    SplashScreen.tsx
    TransactionDetailScreen.tsx
    TransactionHistoryScreen.tsx
  config/
    ui.config.ts
  constants/
    app.constants.ts
    copy.constants.ts
    detail.constants.ts
    init.constants.ts
    review.constants.ts
  data/
    mocks.ts
  hooks/
    useDashboardScreen.tsx
    useDebugMenu.tsx
    useGitCommitScreen.tsx
    useGlobalHotkeys.tsx
    useInitializationScreen.tsx
    useReviewScreen.tsx
    useSplashScreen.tsx
    useTransactionDetailScreen.tsx
    useTransactionHistoryScreen.tsx
    useViewport.ts
  services/
    commit.service.ts
    copy.service.ts
    dashboard.service.ts
    init.service.ts
    review.service.ts
    transaction.service.ts
  stores/
    app.store.ts
    commit.store.ts
    copy.store.ts
    dashboard.store.ts
    detail.store.ts
    history.store.ts
    init.store.ts
    navigation.utils.ts
    review.store.ts
    transaction.store.ts
    view.store.ts
  types/
    copy.types.ts
    debug.types.ts
    domain.types.ts
    view.types.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: docs/relaycode-tui/transaction-history-screen.readme.md
````markdown
# TRANSACTION-HISTORY-SCREEN.README.MD

## Relaycode TUI: The Stateful Transaction History Screen

This document specifies the final design and behavior of the stateful Transaction History screen, the command center for a project's AI-driven development history. Triggered by `relay log`, this screen transforms a simple log into a powerful, interactive database explorer.

### 1. Core Philosophy

The transaction history is the project's institutional memory. This screen is engineered to make that memory **discoverable, drillable, queryable, and actionable**.

-   **Discoverable & Drillable:** The log is an interactive outline. Users get a high-level overview and then progressively disclose more detail *in-place* using familiar arrow key navigation, minimizing context switching.
-   **Queryable:** A powerful, live-filtering system allows users to instantly find specific transactions based on content, status, file paths, or dates.
-   **Actionable:** The screen provides sophisticated tools for bulk data extraction (Copy Mode) and history management (Bulk Actions), turning insight into action.

---

### 2. The Interaction Journey: A Walkthrough

The power of the screen is best understood by following a user's workflow from browsing to deep analysis and action.

#### **State 2.1: Default View - The 10,000-Foot Overview**

Upon launching `relay log`, the user is presented with a clean, compact, and reverse-chronological list of all transactions. Each entry is a single line, prefixed with `▸` to indicate it can be expanded.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 transactions

 > ▸ ✓ Committed · e4a7c112 · 2023-10-27 · fix: add missing error handling
   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ▸ → Handoff   · 8a3f21b8 · 2023-10-26 · feat: implement new dashboard UI
   ▸ ↩ Reverted  · b2c9e04d · 2023-10-26 · style: update button component
   ▸ ✗ Reverted  · 9c2e1a05 · 2023-10-25 · docs: update readme with TUI spec
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (Spc) Select · (Ent) Details · (F)ilter · (C)opy · (B)ulk
```

#### **State 2.2: Level 1 Drill-Down - The File List**

Pressing `(→)` on the selected transaction expands it in-place, revealing key statistics and a list of all files that were modified. The icon changes to `▾` and the footer updates to include the `(←) Collapse` action.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 transactions

 > ▾ ✓ Committed · e4a7c112 · fix: add missing error handling
       Stats: 3 Files · +25 lines, -8 lines
       Files:
         ▸ [MOD] src/core/transaction.ts
         ▸ [MOD] src/utils/logger.ts
         ▸ [DEL] src/utils/old-helper.ts

   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ▸ → Handoff   · 8a3f21b8 · 2023-10-26 · feat: implement new dashboard UI
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (←) Collapse · (→) Expand Files · (Ent) Details · (F)ilter · (C)opy
```

#### **State 2.3: Level 2 Drill-Down - The In-place Diff Preview**

With the transaction expanded, the user can navigate `(↓)` to a specific file and press `(→)` again. This performs a second-level expansion, showing a truncated preview of that file's diff directly within the list.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 transactions

 > ▾ ✓ Committed · e4a7c112 · fix: add missing error handling
       Stats: 3 Files · +25 lines, -8 lines
       Files:
         ▾ [MOD] src/core/transaction.ts
               --- a/src/core/transaction.ts
               +++ b/src/core/transaction.ts
               @@ -45,7 +45,9 @@
               -    for (const [filePath, content] of entries) {
               +    const restoreErrors: { path: string, error: unknown }[] = [];
               ... 4 lines hidden ...
         ▸ [MOD] src/utils/logger.ts
         ▸ [DEL] src/utils/old-helper.ts

   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav File/Tx · (←→) Collapse/Expand · (Ent) Full Diff · (X)pand Full Diff
```

---
*(Page Break)*
---

#### **State 2.4: Filtering Mode - Querying the History**

From any browsing state, pressing `(F)` shifts focus to the filter bar. The transaction list updates in real-time as the user constructs their query. The footer shows context-specific actions.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: logger.ts status:committed ▸ |

 > ✓ Committed · e4a7c112 · 2023-10-27 · fix: add missing error handling
   ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Apply Filter & Return      (Esc) Cancel
```
After pressing `(Enter)`, the filter is applied, the status bar is updated, and control returns to the (now much shorter) transaction list.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: logger.ts status:committed · Showing 2 of 42 transactions

 > ▸ ✓ Committed · e4a7c112 · 2023-10-27 · fix: add missing error handling
   ▸ ✓ Committed · 1a2b3c4d · 2023-10-22 · feat: introduce structured logging
 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (Ent) Details · (F)ilter · (C)opy · (B)ulk Actions
```

#### **State 2.5: Advanced Copy Mode - Aggregating Data for Export**

After selecting one or more transactions with `(Space)`, pressing `(C)` transforms the entire screen into a powerful, two-panel data aggregation tool. The user can select multiple transactions *and* multiple data fields to create a custom report.

```
 ▲ relaycode history · copy mode
 ──────────────────────────────────────────────────────────────────────────────
 [x] ✓ e4a7c112 · fix: add missing error handling
 [ ] ✓ 4b9d8f03 · refactor: simplify clipboard logic
 [x] → 8a3f21b8 · feat: implement new dashboard UI
 ...
 ──────────────────────────────────────────────────────────────────────────────
 Select data to copy from 2 transactions:

 [x] (M) Git Messages         [ ] (P) Prompts          [x] (R) Reasonings
 [ ] (D) Diffs                [ ] (U) UUIDs            [ ] (Y) Full YAML

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav Panels · (←→) Nav Items · (Spc) Toggle · (Enter) Copy · (C)opy/Exit
```
Pressing `(Enter)` aggregates the selected data (`Git Messages` and `Reasonings` from two transactions) and places it on the clipboard, providing instant feedback.

```
 ──────────────────────────────────────────────────────────────────────────────
 ✓ Copied Messages & Reasonings to clipboard.
 ──────────────────────────────────────────────────────────────────────────────
```
**Example Clipboard Output:**
```
--- TRANSACTION e4a7c112 ---

[Git Message]
fix: add missing error handling
- Added try/catch to restoreSnapshot to prevent crashes on partial reverts.

[Reasoning]
1. Identified a potential uncaught exception in the restoreSnapshot function.
2. Wrapped the file restoration loop in a Promise.all for robustness.

--- TRANSACTION 8a3f21b8 ---

[Git Message]
feat: implement new dashboard UI
- Creates a new stateful dashboard screen for the 'watch' command.

[Reasoning]
1. The goal was to provide a more application-like feel for the watch command.
2. Designed a high-density layout to show system status and recent history.
```

#### **State 2.6: Bulk Actions Mode - Managing History**

Multi-selecting items with `(Space)` and then pressing `(B)` brings up a modal for performing operations on the entire selection. This is for powerful, state-changing actions.

```
 ▲ relaycode history · bulk actions
 ──────────────────────────────────────────────────────────────────────────────
 [x] ✓ e4a7c112 · fix: add missing error handling
 [ ] ✓ 4b9d8f03 · refactor: simplify clipboard logic
 [x] → 8a3f21b8 · feat: implement new dashboard UI
 ...
 ──────────────────────────────────────────────────────────────────────────────
  PERFORM BULK ACTION ON 2 SELECTED ITEMS

  This action is often irreversible. Are you sure?

  (1) Revert Selected Transactions
  (2) Mark as 'Git Committed'
  (3) Delete Selected Transactions (from Relaycode history)
  (Esc) Cancel

 ──────────────────────────────────────────────────────────────────────────────
 Choose an option [1-3, Esc]:
```
This comprehensive design ensures the Transaction History screen is an indispensable tool for managing the entire lifecycle of AI-assisted changes, providing unparalleled efficiency and control.
````

## File: src/config/ui.config.ts
````typescript
/**
 * Centralized UI configuration.
 * This object is the single source of truth for layout constants, thresholds,
 * and other UI-related magic numbers.
 */
export const UI_CONFIG = {
    diffScreen: {
        collapseThreshold: 20, // Lines before collapsing
        collapseShowLines: 8,  // Lines to show at top/bottom when collapsed
    },
    dashboard: {
        reservedRows: 9, // Non-event stream vertical space (header, footer, etc.)
    },
    history: {
        reservedRows: 8, // Non-content vertical space (header, footer, filter)
    },
    splash: {
        initialCountdown: 3, // Seconds before auto-skip
    },
} as const;
````

## File: src/constants/copy.constants.ts
````typescript
/**
 * Constants for the Copy/Clipboard feature.
 */
export const COPYABLE_ITEMS = {
    UUID: 'UUID',
    MESSAGE: 'Git Message',
    PROMPT: 'Prompt',
    REASONING: 'Reasoning',
    FILE_DIFF: 'Diff for',
    ALL_DIFFS: 'All Diffs',
    FULL_YAML: 'Full YAML representation',
    // For multi-selection contexts
    MESSAGES: 'Git Messages',
    PROMPTS: 'Prompts',
    REASONINGS: 'Reasonings',
    DIFFS: 'Diffs',
    UUIDS: 'UUIDs',
} as const;
````

## File: src/constants/detail.constants.ts
````typescript
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
````

## File: src/constants/init.constants.ts
````typescript
import type { Task } from '../stores/init.store';

/**
 * Constants for the Initialization process.
 */
export const INITIAL_ANALYZE_TASKS: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

export const INITIAL_CONFIGURE_TASKS: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];
````

## File: src/constants/review.constants.ts
````typescript
import type { ApplyStep } from '../stores/review.store';

/**
 * Constants for the Review screen and process.
 */
export const INITIAL_APPLY_STEPS: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];
````

## File: src/stores/view.store.ts
````typescript
import { create } from 'zustand';

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: 'none' | 'help' | 'copy' | 'debug';
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: 'none',
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));
````

## File: src/types/debug.types.ts
````typescript
export interface MenuItem {
    title: string;
    action: () => void;
}
````

## File: src/constants/app.constants.ts
````typescript
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

export const MAIN_SCREENS_FOR_QUIT = [
    APP_SCREENS.DASHBOARD,
    APP_SCREENS.INIT,
    APP_SCREENS.TRANSACTION_HISTORY,
];

export const SCREENS_WITH_DASHBOARD_BACK_ACTION = [
    APP_SCREENS.REVIEW,
    APP_SCREENS.GIT_COMMIT,
    APP_SCREENS.TRANSACTION_DETAIL,
];
````

## File: src/hooks/useViewport.ts
````typescript
import { useState, useEffect } from 'react';
import { useStdoutDimensions } from '../utils';

interface UseViewportOptions {
	selectedIndex: number;
	reservedRows: number; // Vertical padding (headers, footers, etc.)
}

export const useViewport = ({ selectedIndex, reservedRows }: UseViewportOptions) => {
	const [columns, rows] = useStdoutDimensions();
	const [viewOffset, setViewOffset] = useState(0);

	const viewportHeight = Math.max(1, rows - reservedRows);

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
        width: columns,
    };
};
````

## File: src/stores/history.store.ts
````typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { getVisibleItemPaths, findNextPath, findPrevPath, getParentPath } from './navigation.utils';

export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';
 
// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<HistoryState, 'actions'>;

interface HistoryState {
    mode: HistoryViewMode;
    selectedItemPath: string;
    expandedIds: Set<string>;
    filterQuery: string;
    selectedForAction: Set<string>;
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
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    mode: 'LIST',
    selectedItemPath: '',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    actions: {
        load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
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
                newExpandedIds.delete(selectedItemPath);
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { expandedIds: newExpandedIds };
            }
            const parentId = getParentPath(selectedItemPath);
            if (parentId) {
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
        setMode: (mode) => set({ mode }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            set({ mode: 'LIST' });
        },
        prepareDebugState: (stateName) => {
            const { actions } = get();
            switch (stateName) {
                case 'l1-drill':
                    actions.load({ expandedIds: new Set(['3']), selectedItemPath: '3' });
                    break;
                case 'l2-drill':
                    actions.load({ expandedIds: new Set(['3', '3/3-1']), selectedItemPath: '3/3-1' });
                    break;
                case 'filter':
                    actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:COMMITTED' });
                    break;
                case 'copy':
                    actions.load({ selectedForAction: new Set(['3', '6']) });
                    break;
                case 'bulk':
                    actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['3', '6']) });
                    break;
            }
        },
    },
}));
````

## File: src/types/domain.types.ts
````typescript
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
````

## File: src/utils.ts
````typescript
import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState({ columns: 80, rows: 24 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            });
        };

        updateDimensions();
        process.stdout.on('resize', updateDimensions);

        return () => {
            process.stdout.off('resize', updateDimensions);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};
````

## File: eslint.config.js
````javascript
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
````

## File: tsconfig.json
````json
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
````

## File: src/components/DiffScreen.tsx
````typescript
import { Box, Text } from 'ink';
import { UI_CONFIG } from '../config/ui.config';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
}
const DiffScreen = ({ filePath, diffContent, isExpanded }: DiffScreenProps) => {
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
````

## File: src/services/dashboard.service.ts
````typescript
import { sleep } from '../utils';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';

const approveAll = async () => {
    const pendingTransactions = selectTransactionsByStatus('PENDING')(useTransactionStore.getState());
    const pendingTxIds = pendingTransactions.map(tx => tx.id);
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'IN-PROGRESS'));

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
};

export const DashboardService = {
    approveAll,
};
````

## File: src/stores/copy.store.ts
````typescript
import { create } from 'zustand';
import { moveIndex } from './navigation.utils';
import { useViewStore } from './view.store';
import { CopyService } from '../services/copy.service';
import type { CopyItem } from '../types/copy.types';
import type { Transaction, FileItem } from '../types/domain.types';

export type { CopyItem };

interface CopyState {
    title: string;
    items: CopyItem[];
    selectedIndex: number;
    selectedIds: Set<string>;
    lastCopiedMessage: string | null;
    onClose?: () => void;

    actions: {
        open: (title: string, items: CopyItem[], onClose?: () => void) => void;
        close: () => void;
        openForReview: (transaction: Transaction, files: FileItem[], selectedFile?: FileItem) => void;
        openForDetail: (transaction: Transaction, selectedFile?: FileItem) => void;
        openForHistory: (transactions: Transaction[]) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        toggleSelection: () => void;
        toggleSelectionById: (id: string) => void;
        executeCopy: () => void;
    };
}

export const useCopyStore = create<CopyState>((set, get) => ({
    title: '',
    items: [],
    selectedIndex: 0,
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
                selectedIndex: 0,
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
        navigateUp: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'up', state.items.length),
        })),
        navigateDown: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'down', state.items.length),
        })),
        toggleSelection: () => set(state => {
            const currentItem = state.items[state.selectedIndex];
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
        executeCopy: () => {
            const { items, selectedIds } = get();
            const itemsToCopy = items.filter(i => selectedIds.has(i.id));
            if (itemsToCopy.length === 0) return;

            const content = itemsToCopy.map(item => `--- ${item.label} ---\n${item.getData()}`).join('\n\n');
            const message = `Copied ${itemsToCopy.length} item(s) to clipboard.`;
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD MOCK] ${message}\n${content.substring(0, 200)}...`);
            set({ lastCopiedMessage: message });
        },
    },
}));
````

## File: src/stores/navigation.utils.ts
````typescript
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
        if (expandedIds.has(tx.id) && tx.files) {
            for (const file of tx.files) {
                paths.push(`${tx.id}/${file.id}`);
            }
        }
    }
    return paths;
};
````

## File: src/types/view.types.ts
````typescript
import type { APP_SCREENS } from '../constants/app.constants';

// --- UI / View-Specific Types ---

// app.store
type ObjectValues<T> = T[keyof T];

export type AppScreen = ObjectValues<typeof APP_SCREENS>;
````

## File: src/components/CopyScreen.tsx
````typescript
import { Box, Text, useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import Separator from './Separator';
import { useViewStore } from '../stores/view.store';
import { useStdoutDimensions } from '../utils';

const CopyScreen = () => {
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const {
        title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));

    useInput((input, key) => {
        if (key.escape) {
            actions.close();
            return;
        }
        if (key.upArrow) {
            actions.navigateUp();
            return;
        }
        if (key.downArrow) {
            actions.navigateDown();
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
        if(item) {
            actions.toggleSelectionById(item.id);
        }
    }, { isActive: activeOverlay === 'copy' });
    const [width] = useStdoutDimensions();

    return (
        <Box 
            width="100%"
            height="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Box 
                flexDirection="column" 
                borderStyle="round" 
                borderColor="yellow" 
                paddingX={2}
                width="80%"
            >
                <Text bold color="yellow">▲ relaycode · copy mode</Text>
                <Separator width={Math.floor(width * 0.8) - 4} />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {items.map((item, index) => {
                            const isSelected = index === selectedIndex;
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
                <Text>(↑↓) Nav · (Spc/Hotkey) Toggle · (Enter) Copy · (Esc) Close</Text>
            </Box>
        </Box>
    );
};

export default CopyScreen;
````

## File: src/components/GlobalHelpScreen.tsx
````typescript
import { Box, Text } from 'ink';

const GlobalHelpScreen = () => {
    return (
        <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
        >
            <Box
                flexDirection="column"
                borderStyle="round"
                paddingX={2}
                paddingY={1}
                width="80%"
            >
                <Box justifyContent="center" marginBottom={1}>
                    <Text bold color="cyan">▲ relaycode · keyboard shortcuts</Text>
                </Box>
                <Box flexDirection="column" gap={1}>
                    <Box flexDirection="column">
                        <Text bold color="cyan">GLOBAL</Text>
                        <Text>  <Text color="cyan" bold>?</Text>        Toggle this help screen</Text>
                        <Text>  <Text color="cyan" bold>Q</Text>        Quit to terminal (or go back)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">DASHBOARD (watch)</Text>
                        <Text>  <Text color="cyan" bold>↑↓</Text>       Navigate event stream</Text>
                        <Text>  <Text color="cyan" bold>Enter</Text>    View details of selected transaction</Text>
                        <Text>  <Text color="cyan" bold>P</Text>        Pause / Resume clipboard watcher</Text>
                        <Text>  <Text color="cyan" bold>A</Text>        Approve all pending transactions</Text>
                        <Text>  <Text color="cyan" bold>C</Text>        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">REVIEW & DETAILS SCREENS</Text>
                        <Text>  <Text color="cyan" bold>D</Text>        Show / Collapse file diff</Text>
                        <Text>  <Text color="cyan" bold>←→</Text>       Collapse / Expand sections or files</Text>
                        <Text>  <Text color="cyan" bold>R</Text>        Show / Collapse reasoning steps</Text>
                        <Text>  <Text color="cyan" bold>C</Text>        Enter / Exit Copy Mode (Details Screen)</Text>
                        <Text>  <Text color="cyan" bold>U</Text>        Undo / Revert Transaction</Text>
                        <Text>  <Text color="cyan" bold>Space</Text>    Toggle approval state of a file (Review Screen)</Text>
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text bold>(Press <Text color="cyan" bold>?</Text> or <Text color="cyan" bold>Esc</Text> to close)</Text>
            </Box>
        </Box>
    );
};

export default GlobalHelpScreen;
````

## File: src/components/ReasonScreen.tsx
````typescript
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string,
    scrollIndex?: number,
    visibleLinesCount?: number, // if not provided, all lines are shown
}

const ReasonScreen = ({ reasoning, scrollIndex = 0, visibleLinesCount }: ReasonScreenProps) => {
    const lines = reasoning.split('\n');
    const visibleLines = visibleLinesCount ? lines.slice(scrollIndex, scrollIndex + visibleLinesCount) : lines;

    return (
        <Box flexDirection="column">
            <Text>REASONING</Text>
            <Box flexDirection="column" marginTop={1}>
                {visibleLines.map((line, index) => <Text key={index}>{line}</Text>)}
            </Box>
        </Box>
    );
};

export default ReasonScreen;
````

## File: src/services/commit.service.ts
````typescript
import type { Transaction } from '../types/domain.types';
import { sleep } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';

const generateCommitMessage = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
        return '';
    }
    // Using a more complex aggregation for better demo, based on the readme
    const title = 'feat: implement new dashboard and clipboard logic';
    const bodyPoints = [
        '- Adds error handling to the core transaction module to prevent uncaught exceptions during snapshot restoration.',
        '- Refactors the clipboard watcher for better performance and cross-platform compatibility, resolving issue #42.',
    ];

    if (transactions.length === 1 && transactions[0]) {
        return transactions[0].message;
    }

    return `${title}\n\n${bodyPoints.join('\n\n')}`;
};

const commit = async (transactionsToCommit: Transaction[]): Promise<void> => {
    // In a real app, this would run git commands.
    // For simulation, we'll just update the transaction store.
    const { updateTransactionStatus } = useTransactionStore.getState().actions;

    const txIds = transactionsToCommit.map(tx => tx.id);

    // A bit of simulation
    await sleep(500);

    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTED');
    });
};

export const CommitService = {
    generateCommitMessage,
    commit,
};
````

## File: src/stores/detail.store.ts
````typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';
import { NAVIGATOR_SECTIONS, DETAIL_BODY_VIEWS } from '../constants/detail.constants';
import { findNextPath, findPrevPath, getParentPath } from './navigation.utils';

type ObjectValues<T> = T[keyof T];

export type NavigatorSection = ObjectValues<typeof NAVIGATOR_SECTIONS>;
export type DetailBodyView = ObjectValues<typeof DETAIL_BODY_VIEWS>;
 
interface DetailState {
    focusedItemPath: string; // e.g., 'PROMPT', 'FILES', 'FILES/1-1'
    expandedItemPaths: Set<string>;
    bodyView: DetailBodyView;
    actions: {
        load: (transactionId: string) => void;
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
        load: (transactionId) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
                expandedItemPaths: new Set(),
                bodyView: DETAIL_BODY_VIEWS.NONE,
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
        expandOrDrillDown: () => set(state => {
            const { focusedItemPath, expandedItemPaths } = state;
            const newExpandedPaths = new Set(expandedItemPaths);
            
            if (focusedItemPath.includes('/')) { // Is a file
                return { bodyView: DETAIL_BODY_VIEWS.DIFF_VIEW };
            }

            // Is a section header
            if (newExpandedPaths.has(focusedItemPath)) {
                // Already expanded, drill in if it's FILES
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) {
                    const visibleItems = getVisibleItemPaths(newExpandedPaths);
                    const firstFile = visibleItems.find(item => item.startsWith(`${NAVIGATOR_SECTIONS.FILES}/`));
                    if (firstFile) {
                        return { focusedItemPath: firstFile, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
                    }
                }
                return {}; // No-op for PROMPT/REASONING if already expanded
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
````

## File: src/types/copy.types.ts
````typescript
export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string;
    isDefaultSelected?: boolean;
}
````

## File: src/data/mocks.ts
````typescript
import type { Transaction } from '../types/domain.types';

const mockReasoning1 = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.
`;

export const allMockTransactions: Transaction[] = [
    {
        id: '1',
        timestamp: Date.now() - 10 * 1000,
        status: 'PENDING',
        hash: 'e4a7c112',
        message: 'fix: add missing error handling',
        prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
        reasoning: mockReasoning1,
        files: [
            { id: '1-1', type: 'MOD', path: 'src/core/transaction.ts', linesAdded: 18, linesRemoved: 5, diff: '--- a/src/core/transaction.ts\n+++ b/src/core/transaction.ts\n@@ -15,7 +15,7 @@ export class Transaction {\n   }\n\n-  calculateChanges(): ChangeSet {\n+  computeDelta(): ChangeSet {\n     return this.changes;\n   }\n }', strategy: 'replace' },
            { id: '1-2', type: 'MOD', path: 'src/utils/logger.ts', linesAdded: 0, linesRemoved: 0, diff: '', strategy: 'standard-diff' },
            { id: '1-3', type: 'MOD', path: 'src/commands/apply.ts', linesAdded: 0, linesRemoved: 0, diff: '', strategy: 'standard-diff' },
        ],
        stats: { files: 3, linesAdded: 18, linesRemoved: 5 },
    },
    {
        id: '2',
        timestamp: Date.now() - 15 * 1000,
        status: 'PENDING',
        hash: '4b9d8f03',
        message: 'refactor: simplify clipboard logic',
        prompt: 'Simplify the clipboard logic using an external library...',
        reasoning: 'The existing clipboard logic was complex and platform-dependent. Using the `clipboardy` library simplifies the code and improves reliability across different operating systems.',
        files: [
            { id: '2-1', type: 'MOD', path: 'src/core/clipboard.ts', linesAdded: 15, linesRemoved: 8, diff: '--- a/src/core/clipboard.ts\n+++ b/src/core/clipboard.ts\n@@ -1,5 +1,6 @@\n import { copy as copyToClipboard } from \'clipboardy\';', strategy: 'replace' },
            { id: '2-2', type: 'MOD', path: 'src/utils/shell.ts', linesAdded: 7, linesRemoved: 3, diff: '--- a/src/utils/shell.ts\n+++ b/src/utils/shell.ts', strategy: 'standard-diff' },
        ],
        stats: { files: 2, linesAdded: 22, linesRemoved: 11 },
        scripts: [
            { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
            { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: 'src/core/clipboard.ts\n  45:12  Error    \'clipboardy\' is assigned a value but never used. (@typescript-eslint/no-unused-vars)\n  88:5   Warning  Unexpected console statement. (no-console)' },
        ],
    },
    {
        id: '3',
        timestamp: Date.now() - 5 * 60 * 1000,
        status: 'APPLIED',
        hash: '8a3f21b8',
        message: 'feat: implement new dashboard UI',
        prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
        reasoning: mockReasoning1,
        files: [
            { id: '3-1', type: 'MOD', path: 'src/core/transaction.ts', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
            { id: '3-2', type: 'MOD', path: 'src/utils/logger.ts', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
            { id: '3-3', type: 'DEL', path: 'src/utils/old-helper.ts', linesAdded: 0, linesRemoved: 30, diff: '... diff ...' },
        ],
        stats: { files: 3, linesAdded: 25, linesRemoved: 38 },
    },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

/**
 * Creates a deep copy of the mock transactions to prevent state mutations.
 */
export const createMockTransactions = (): Transaction[] => {
    return JSON.parse(JSON.stringify(allMockTransactions));
};
````

## File: src/hooks/useGitCommitScreen.tsx
````typescript
import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';

export const useGitCommitScreen = () => {
    const { finalCommitMessage, isCommitting } = useCommitStore();
    const transactionsToCommit = useTransactionStore(selectTransactionsByStatus('APPLIED'));
    const { commit } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    useInput((_, key) => {
        if (isCommitting) return;

        if (key.return) {
            commit().then(() => {
                showDashboardScreen();
            });
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting };
};
````

## File: src/hooks/useSplashScreen.tsx
````typescript
import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening noca.pro in browser...');
            return;
        }
        if (lowerInput === 'x') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening X/Twitter in browser...');
            return;
        }
        if (lowerInput === 'd') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening Discord in browser...');
            return;
        }
        if (lowerInput === 'g') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening GitHub in browser...');
            return;
        }

        // Any other key skips
        handleSkip(); 
    });

    useEffect(() => {
        if (countdown === 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showInitScreen]);

    return { countdown };
};
````

## File: src/services/init.service.ts
````typescript
import { useInitStore } from '../stores/init.store';
import { sleep } from '../utils';
import { INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS } from '../constants/init.constants';

const runInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    actions.resetInit();
    actions.setTasks(INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS);

    actions.setPhase('ANALYZE');
    for (const task of INITIAL_ANALYZE_TASKS) {
        actions.updateAnalyzeTask(task.id, 'active');
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    const configTasksUntilInteractive = INITIAL_CONFIGURE_TASKS.slice(0, 2);
    for (const task of configTasksUntilInteractive) {
        actions.updateConfigureTask(task.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(task.id, 'done');
    }
    await sleep(500);

    actions.setPhase('INTERACTIVE');
};

const resumeInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    
    actions.setPhase('CONFIGURE');
    const lastTask = INITIAL_CONFIGURE_TASKS[2];
    if (lastTask) {
        actions.updateConfigureTask(lastTask.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(lastTask.id, 'done');
        await sleep(500);

        actions.setPhase('FINALIZE');
    }
};

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};
````

## File: src/components/GitCommitScreen.tsx
````typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useGitCommitScreen();

    const transactionLines = transactionsToCommit.map(tx => (
        <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
    ));

    const footer = isCommitting
        ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
        : <Text>(Enter) Confirm & Commit      (Esc) Cancel</Text>;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode git commit</Text>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text bold>TRANSACTIONS INCLUDED</Text>
                    {transactionLines}
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text bold>FINAL COMMIT MESSAGE</Text>
                <Box marginTop={1}>
                    <Text>{finalCommitMessage}</Text>
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} paddingX={2}>
                 <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>
            </Box>
            <Separator />
            {footer}
        </Box>
    );
};

export default GitCommitScreen;
````

## File: src/components/ReviewProcessingScreen.tsx
````typescript
import { Box, Text } from 'ink';
import { useTransactionStore } from '../stores/transaction.store';
import { useViewStore } from '../stores/view.store';
import { useReviewStore, type ApplyStep } from '../stores/review.store';
import Separator from './Separator';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep; isSubstep?: boolean }) => {
    if (isSubstep) {
        let color;
        if (step.status === 'done' && step.title.startsWith('[✓]')) color = 'green';
        if (step.status === 'failed') color = 'red';

        return (
            <Text color={color}>
                {'     └─ '}{step.title}
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

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title} {step.duration && !isSubstep && `(${step.duration}s)`}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const selectedTransactionId = useViewStore(s => s.selectedTransactionId);
    const { patchStatus, applySteps } = useReviewStore(state => ({
        patchStatus: state.patchStatus,
        applySteps: state.applySteps,
    }));
    const transaction = useTransactionStore(s => s.transactions.find(t => t.id === selectedTransactionId));

    const totalDuration = applySteps.reduce((acc: number, step: ApplyStep) => acc + (step.duration || 0), 0);
    const failureCase = patchStatus === 'PARTIAL_FAILURE';
    const footerText = failureCase
        ? `Elapsed: ${totalDuration.toFixed(1)}s · Transitioning to repair workflow...`
        : `Elapsed: ${totalDuration.toFixed(1)}s · Processing... Please wait.`;

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode apply</Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;
````

## File: src/components/Separator.tsx
````typescript
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = ({ width: propWidth }: { width?: number }) => {
	const [columns] = useStdoutDimensions();
	const width = propWidth ?? columns;
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;
````

## File: src/hooks/useGlobalHotkeys.tsx
````typescript
import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { MAIN_SCREENS_FOR_QUIT } from '../constants/app.constants';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { currentScreen } = useAppStore(s => ({
        currentScreen: s.currentScreen,
    }));
    const { navigateBack } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === 'debug' ? 'none' : 'debug');
            return;
        }

        // If debug menu is open, it has its own input handler, so we stop here.
        if (activeOverlay === 'debug') {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === 'help') {
            if (key.escape || input === '?') {
                setActiveOverlay('none');
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay('help');
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q') {
            if ((MAIN_SCREENS_FOR_QUIT as readonly string[]).includes(currentScreen)) {
                exit();
            }
            navigateBack();
        } else if (key.escape) {
            navigateBack();
        }
    }, { isActive });
};
````

## File: src/hooks/useInitializationScreen.tsx
````typescript
import { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { InitService } from '../services/init.service';

export const useInitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const actions = useInitStore(s => s.actions);
    const showDashboardScreen = useAppStore(s => s.actions.showDashboardScreen);
    const { exit } = useApp();

    useInput((input, key) => {
        if (phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (phase === 'FINALIZE') {
            if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
            if (input.toLowerCase() === 'q') {
                exit();
            }
        }
    });

    useEffect(() => {
        InitService.runInitializationProcess();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            InitService.resumeInitializationProcess();
        }
    }, [interactiveChoice, phase]);

    const {
        analyzeTasks,
        configureTasks,
        projectId,
    } = useInitStore();

    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    };
};
````

## File: src/services/copy.service.ts
````typescript
import type { Transaction, FileItem } from '../types/domain.types';
import type { CopyItem } from '../types/copy.types';
import { COPYABLE_ITEMS } from '../constants/copy.constants';

const createBaseTransactionCopyItems = (transaction: Transaction): CopyItem[] => [
    { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
    { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message },
    { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
    { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '' },
];

const getCopyItemsForReview = (
    transaction: Transaction,
    files: FileItem[],
    selectedFile?: FileItem,
): CopyItem[] => {
    return [
        ...createBaseTransactionCopyItems(transaction),
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
    ];
};

const getCopyItemsForDetail = (
    transaction: Transaction,
    selectedFile?: FileItem,
): CopyItem[] => {
    const baseItems = createBaseTransactionCopyItems(transaction);
    const messageItem = { ...baseItems.find(i => i.id === 'message')!, isDefaultSelected: true };
    const promptItem = baseItems.find(i => i.id === 'prompt')!;
    const reasoningItem = { ...baseItems.find(i => i.id === 'reasoning')!, isDefaultSelected: true };
    const uuidItem = baseItems.find(i => i.id === 'uuid')!;

    return [
        messageItem,
        promptItem,
        reasoningItem,
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        uuidItem,
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
};

const getCopyItemsForHistory = (
    transactions: Transaction[],
): CopyItem[] => {
    if (transactions.length === 0) return [];
    
    return [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
};

export const CopyService = {
    getCopyItemsForReview,
    getCopyItemsForDetail,
    getCopyItemsForHistory,
};
````

## File: src/stores/transaction.store.ts
````typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import { useViewStore } from './view.store';
import type { Transaction, TransactionStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
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
````

## File: package.json
````json
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
````

## File: src/hooks/useDashboardScreen.tsx
````typescript
import { useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useViewport } from './useViewport';

export const useDashboardScreen = ({ reservedRows }: { reservedRows: number }) => {
    const {
        status,
        selectedTransactionIndex,
    } = useDashboardStore();
    const transactions = useTransactionStore(s => s.transactions);
    const pendingTransactions = useTransactionStore(selectTransactionsByStatus('PENDING'));
    const appliedTransactions = useTransactionStore(selectTransactionsByStatus('APPLIED'));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex: selectedTransactionIndex,
        reservedRows,
    });

    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        confirmAction,
        cancelAction,
    } = useDashboardStore(s => s.actions);
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);

    const pendingApprovals = pendingTransactions.length;
    const pendingCommits = appliedTransactions.length;

    const isModal = status === 'CONFIRM_APPROVE';
    const isProcessing = status === 'APPROVING';

    useInput((input, key) => {
        if (isModal) {
            if (key.return) confirmAction();
            if (key.escape) cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        
        if (key.return) {
            const selectedTx = transactions[selectedTransactionIndex];
            if (selectedTx?.status === 'PENDING') {
                // For PENDING transactions, we still go to the review screen.
                useReviewStore.getState().actions.load(selectedTx.id);
                appActions.showReviewScreen();
            } else if (selectedTx) {
                useDetailStore.getState().actions.load(selectedTx.id);
                appActions.showTransactionDetailScreen();
            }
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
    });
    const transactionsToConfirm = status === 'CONFIRM_APPROVE' ? pendingTransactions : [];

    return {
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
    };
};
````

## File: src/services/transaction.service.ts
````typescript
import { createMockTransactions } from '../data/mocks';
import type { Transaction } from '../types/domain.types';

const revertTransaction = (_transactionId: string) => {
    // In a real app, this would perform the revert operation (e.g., API call).
    // The state update is now handled by the calling store.
    // This is a no-op for the simulation, we just need the id.
};

export const TransactionService = {
    revertTransaction,
    getAllTransactions: (): Transaction[] => createMockTransactions(),
};
````

## File: src/components/SplashScreen.tsx
````typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashScreen = () => {
    const { countdown } = useSplashScreen();
    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀
`;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode</Text>
            <Separator />
            <Text color="cyan">{logo}</Text>
            <Box flexDirection="column" alignItems="center">
                <Text italic>A zero-friction, AI-native patch engine.</Text>
                <Text italic color="gray">Built by Arman and contributors · <Text underline>https://relay.noca.pro</Text></Text>
            </Box>
            
            <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                <Box flexDirection="column" width="45%">
                    <Text>Version 1.1.5</Text>
                    <Text>─────────────────────────</Text>
                    <Text>relaycode</Text>
                    <Text>relaycode-core</Text>
                    <Text>apply-multi-diff</Text>
                    <Text>konro</Text>
                </Box>
                 <Box flexDirection="column" width="45%">
                    <Text>Build Timestamps</Text>
                    <Text>─────────────────────────</Text>
                    <Text>2025-09-20 13:58:05</Text>
                    <Text>2025-09-20 10:59:05</Text>
                    <Text>(versioned)</Text>
                    <Text>(versioned)</Text>
                </Box>
            </Box>
            
            <Box marginTop={1}><Separator /></Box>
            <Text>If you love this workflow, check out <Text underline>https://www.noca.pro</Text> for the full</Text>
            <Text>web app with repo-wide visual context, history, and rollback.</Text>
            <Text><Text color="cyan" bold>(V)</Text>isit noca.pro</Text>
            <Separator />
            <Text>Follow <Text color="cyan" bold>(X)</Text> · Join <Text color="cyan" bold>(D)</Text>iscord · Star on <Text color="cyan" bold>(G)</Text>itHub</Text>
            <Separator />
            <Text>Loading... {countdown} (<Text color="gray">Press any key to skip</Text>)</Text>
        </Box>
    );
};

export default SplashScreen;
````

## File: src/stores/commit.store.ts
````typescript
import { create } from 'zustand';
import { CommitService } from '../services/commit.service';
import { useTransactionStore, selectTransactionsByStatus } from './transaction.store';

interface CommitState {
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

export const useCommitStore = create<CommitState>((set) => ({
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);
            set({ finalCommitMessage });
        },
        commit: async () => {
            set({ isCommitting: true });
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            await CommitService.commit(appliedTransactions);
            set({ isCommitting: false });
        },
    },
}));
````

## File: src/stores/init.store.ts
````typescript
import { create } from 'zustand';

// Store Interface
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';
export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}
 
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (phase: InitPhase) => void;
        setTasks: (analyzeTasks: Task[], configureTasks: Task[]) => void;
        updateAnalyzeTask: (id: string, status: TaskStatus) => void;
        setAnalysisResults: (projectId: string, gitignoreFound: boolean) => void;
        updateConfigureTask: (id: string, status: TaskStatus) => void;
        setInteractiveChoice: (choice: GitignoreChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: [],
    projectId: null,
    gitignoreFound: null,
    configureTasks: [],
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        setTasks: (analyzeTasks, configureTasks) => set({
            analyzeTasks: JSON.parse(JSON.stringify(analyzeTasks)),
            configureTasks: JSON.parse(JSON.stringify(configureTasks)),
        }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setInteractiveChoice: (choice) => set({ interactiveChoice: choice }),
        resetInit: () => set({
            phase: 'ANALYZE',
            analyzeTasks: [],
            projectId: null,
            gitignoreFound: null,
            configureTasks: [],
            interactiveChoice: null,
        }),
    },
}));
````

## File: src/services/review.service.ts
````typescript
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyUpdate, PatchStatus } from '../stores/review.store';
import type { Transaction, FileItem, FileReviewStatus } from '../types/domain.types';

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
        string, { status: FileReviewStatus; error?: string }
    >,
): string => {
    const successfulFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
    const failedFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'FAILED');

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

async function* runApplySimulation(scenario: 'success' | 'failure'): AsyncGenerator<ApplyUpdate> {
    if (scenario === 'success') {
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(1300);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done', duration: 2.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done', duration: 1.2 } };

        await sleep(500);

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.5 } };

        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped due to patch application failure' } };
        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to patch application failure' } };

        await sleep(500);
    }
}

const prepareTransactionForReview = (
    transaction: Transaction,
): {
    patchStatus: PatchStatus;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;
} => {
    // This simulates the backend determining which files failed or succeeded and sets it ONCE on load.
    // For this demo, tx '1' is the failure case, any other is success.
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
    return { patchStatus: isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS', fileReviewStates };
};

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
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

    return file;
};

const runBulkReapply = async (failedFiles: FileItem[]): Promise<{ id: string; status: FileReviewStatus; error?: string }[]> => {
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
    prepareTransactionForReview,
    generateBulkRepairPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    runBulkReapply,
};
````

## File: src/components/DebugMenu.tsx
````typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDebugMenu } from '../hooks/useDebugMenu';
import { useStdoutDimensions } from '../utils';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems } = useDebugMenu();
    const [width] = useStdoutDimensions();

    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="yellow"
            width="100%"
            paddingX={2}
        >
            <Text bold color="yellow">▲ relaycode · DEBUG MENU</Text>
            <Separator width={width - 4} />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => (
                    <Text key={item.title} color={selectedIndex === index ? 'cyan' : undefined}>
                        {selectedIndex === index ? '> ' : '  '}
                        ({getKeyForIndex(index)}) {item.title}
                    </Text>
                ))}
            </Box>
            <Separator width={width - 4} />
            <Text>(↑↓) Nav · (1-9,a-z) Jump · (Enter) Select · (Esc / Ctrl+B) Close</Text>
        </Box>
    );
};

export default DebugMenu;
````

## File: src/components/InitializationScreen.tsx
````typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import type { Task } from '../stores/init.store';
import { useInitializationScreen } from '../hooks/useInitializationScreen';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
	let symbol: React.ReactNode;
	switch (task.status) {
		case 'pending': symbol = '( )'; break;
		case 'active': symbol = <Text color="cyan">(●)</Text>; break;
		case 'done': symbol = <Text color="green">{doneSymbol}</Text>; break;
	}

	const title = task.status === 'done' && doneSymbol?.startsWith('[✓]') ? `Created ${task.title.split(' ')[1]}` : task.title;

	return (
		<Box flexDirection="column">
			<Text>
				{symbol} {title}
			</Text>
			{task.subtext && task.status !== 'done' && (
				<Text italic color="gray">
					{'     └─ '}{task.subtext}
				</Text>
			)}
		</Box>
	);
};

const InitializationScreen = () => {
    const {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    } = useInitializationScreen();

    const renderAnalyze = () => (
        <Box flexDirection="column">
            <Text bold color="cyan">PHASE 1: ANALYZE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {analyzeTasks.map(t => <TaskItem key={t.id} task={t} />)}
            </Box>
        </Box>
    );

    const renderContext = () => (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold color="cyan">CONTEXT</Text>
            <Text>  <Text color="green">✓</Text> Project ID: {projectId}</Text>
            <Text>  <Text color="green">✓</Text> Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text><Text color="cyan">&gt;</Text> The .relay/ directory is usually ignored by git.</Text>
                    <Text>  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = interactiveChoice === 'share'
            ? '.relay/ directory initialized. It will be committed to git.'
            : '.relay/ directory initialized and added to .gitignore.';
        const stateSubText = interactiveChoice === 'share'
            ? undefined
            : 'Local transaction history will be stored here.';
        
        return (
            <Box flexDirection="column">
                <Text bold color="green"> SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> Config:   relay.config.json created.</Text>
                        <Text color="gray" italic>          › Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> State:    {stateText}</Text>
                        {stateSubText && <Text color="gray" italic>          › {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> Prompt:   System prompt generated at .relay/prompts/system-prompt.md.</Text>
                        <Text color="gray" italic>          › Copied to clipboard. Paste into your AI&apos;s custom instructions.</Text>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderPhase = () => {
        switch (phase) {
            case 'ANALYZE': return renderAnalyze();
            case 'CONFIGURE': return renderConfigure();
            case 'INTERACTIVE': return renderInteractive();
            case 'FINALIZE': return renderFinalize();
        }
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">{phase === 'FINALIZE' ? '▲ relaycode bootstrap complete' : '▲ relaycode bootstrap'}</Text>
            <Separator />
            <Box marginY={1}>{renderPhase()}</Box>
            <Separator />
            {typeof footerText === 'string' ? <Text>{footerText}</Text> : footerText}
        </Box>
    );
};

export default InitializationScreen;
````

## File: src/hooks/useTransactionDetailScreen.tsx
````typescript
import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';

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

        // --- Main Input ---
        if (input.toLowerCase() === 'c') {
            openCopyMode();
            return;
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
            return;
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) expandOrDrillDown();
        if (key.escape || key.leftArrow) collapseOrBubbleUp();
    }, { isActive: useViewStore.getState().activeOverlay === 'none' }); // Prevent input when copy overlay is open

    return {
        transaction,
        files,
        focusedItemPath: store.focusedItemPath,
        expandedItemPaths: store.expandedItemPaths,
        bodyView: store.bodyView,
    };
};
````

## File: src/hooks/useReviewScreen.tsx
````typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';

export const useReviewScreen = () => {
    const store = useReviewStore();
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
    } = store;

    const transaction = useTransactionStore(selectSelectedTransaction);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
            approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
            approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files, fileReviewStates]);

    const { numFiles, approvedFilesCount } = reviewStats;

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
        showBulkRepair,
        executeBulkRepairOption,
        confirmHandoff,
        scrollReasoningUp,
        scrollReasoningDown,
        navigateScriptErrorUp,
        navigateScriptErrorDown,
        toggleFileApproval,
        rejectAllFiles,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1') { // For demo purposes
            startApplySimulation('success'); return true;
        }
        if (input === '2') { // For demo purposes
            startApplySimulation('failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        if (key.escape) {
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff') {
                toggleBodyView(bodyView);
            } else if (bodyView !== 'none') {
                setBodyView('none');
            }
            return true;
        }
        return false;
    };

    const handleHandoffConfirmInput = (_input: string, key: Key): void => {
        if (key.return) confirmHandoff();
    };

    const handleBulkRepairInput = (input: string) => {
        if (input >= '1' && input <= '4') {
            executeBulkRepairOption(parseInt(input));
        }
    };

    const handleReasoningInput = (input: string, key: Key): void => {
        if (key.upArrow) scrollReasoningUp();
        if (key.downArrow) scrollReasoningDown();
        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');
    };

    const handleScriptOutputInput = (input: string, key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (key.return) toggleBodyView('script_output');
        if (input.toLowerCase() === 'c') {
            const scriptIndex = selectedItemIndex - numFiles;
            const selectedScript = scripts[scriptIndex];
            if (selectedScript) {
                // eslint-disable-next-line no-console
                console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
            }
        }
    };

    const handleDiffInput = (input: string) => {
        if (input.toLowerCase() === 'x') expandDiff();
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                const fileState = file ? fileReviewStates.get(file.id) : undefined;
                if (file && fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(file.id);
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleBodyView('diff');
            }
        }

        if (key.return) { // Enter key
            if (selectedItemIndex >= numFiles) { // It's a script
                toggleBodyView('script_output');
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
            if (key.shift) { // Bulk repair
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    const fileState = file ? fileReviewStates.get(file.id) : undefined;
                    if (file && fileState?.status === 'FAILED') tryRepairFile();
                }
            }
        }
    };

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) {
            return;
        }

        switch (bodyView) {
            case 'confirm_handoff': return handleHandoffConfirmInput(input, key);
            case 'bulk_repair': return handleBulkRepairInput(input);
            case 'reasoning': return handleReasoningInput(input, key);
            case 'script_output': return handleScriptOutputInput(input, key);
            case 'diff': return handleDiffInput(input);
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
        ...reviewStats,
    };
};
````

## File: src/stores/app.store.ts
````typescript
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
````

## File: index.tsx
````typescript
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useViewStore } from './src/stores/view.store';
import { useDetailStore } from './src/stores/detail.store';
import { useHistoryStore } from './src/stores/history.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionStore } from './src/stores/transaction.store';
import { useCommitStore } from './src/stores/commit.store';

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
                useReviewStore.getState().actions.load('1');
                appActions.showReviewProcessingScreen();
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
````

## File: src/components/TransactionHistoryScreen.tsx
````typescript
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Separator from './Separator';
import type { Transaction, FileItem } from '../types/domain.types';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';
import { UI_CONFIG } from '../config/ui.config';

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

const FileRow = ({ file, isSelected, isExpanded }: { file: FileItem, isSelected: boolean, isExpanded: boolean }) => {
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
    
    const statusDisplay = statusMap[tx.status as keyof typeof statusMap] || tx.status;

    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {selectionIndicator} {icon} {statusDisplay} · {tx.hash} · {date} ·{' '}
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
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        actions,
        transactions,
        pathsInViewSet,
        filterStatus,
        showingStatus,
    } = useTransactionHistoryScreen({ reservedRows: UI_CONFIG.history.reservedRows });

    const renderFooter = () => {
        if (mode === 'FILTER') return <Text>(Enter) Apply Filter & Return      (Esc) Cancel</Text>; 
        if (mode === 'BULK_ACTIONS') return <Text>Choose an option [1-3, Esc]:</Text>;
        
        const footerActions = ['(↑↓) Nav', '(→) Expand', '(←) Collapse', '(Spc) Select', '(Ent) Details', '(F)ilter'];
        if (selectedForAction.size > 0) {
            footerActions.push('(C)opy', '(B)ulk');
        }
        return <Text>{footerActions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode transaction history</Text>
            <Separator />

            <Box>
                <Text>Filter: </Text>
                {mode === 'FILTER' ? (
                    <TextInput value={filterQuery} onChange={actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus} ({transactions.length} txns)</Text>
            </Box>

            <Box flexDirection="column" marginY={1}>
                {mode === 'BULK_ACTIONS' && <BulkActionsMode selectedForActionCount={selectedForAction.size} />}

                {mode === 'LIST' && transactions.map((tx: Transaction) => {
                    const isTxSelected = selectedItemPath.startsWith(tx.id);
                    const isTxExpanded = expandedIds.has(tx.id);
                    const isSelectedForAction = selectedForAction.has(tx.id);

                    const showTxRow = pathsInViewSet.has(tx.id);

                    return (
                        <Box flexDirection="column" key={tx.id}>
                            {showTxRow && (
                                <TransactionRow
                                    tx={tx}
                                    isSelected={isTxSelected && !selectedItemPath.includes('/')}
                                    isExpanded={isTxExpanded}
                                    isSelectedForAction={isSelectedForAction}
                                />
                            )}
                            {isTxExpanded && tx.files?.map((file: FileItem) => {
                                if (!pathsInViewSet.has(`${tx.id}/${file.id}`)) return null;
                                const filePath = `${tx.id}/${file.id}`;
                                const isFileSelected = selectedItemPath === filePath;
                                const isFileExpanded = expandedIds.has(filePath);
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
````

## File: src/components/TransactionDetailScreen.tsx
````typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';
import type { FileChangeType } from '../types/domain.types';

const getFileChangeTypeIcon = (type: FileChangeType) => {
    switch (type) {
        case 'MOD': return '[MOD]';
        case 'ADD': return '[ADD]';
        case 'DEL': return '[DEL]';
        case 'REN': return '[REN]';
    }
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
        transaction, files,
        focusedItemPath, expandedItemPaths, bodyView,
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
                    {isPromptExpanded ? '▾' : '▸'} (P)rompt
                </Text>
                <Text color={isReasoningFocused ? 'cyan' : undefined}>
                    {isReasoningFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (R)easoning ({transaction.reasoning?.split('\n\n').length || 0} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && !focusedItemPath.includes('/') ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (F)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file) => {
                             const fileId = `FILES/${file.id}`;
                             const isFileSelected = focusedItemPath === fileId;
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
                    <Box marginTop={1}><Text>{transaction.prompt}</Text></Box>
                </Box>
            );
        }
        if (bodyView === 'REASONING') {
            if (!transaction.reasoning) return <Text color="gray">No reasoning provided.</Text>;
            return <ReasonScreen reasoning={transaction.reasoning} />;
        }
        if (bodyView === 'FILES_LIST') {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === 'DIFF_VIEW') {
            const fileId = focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            if (!file) return null;
            return <DiffScreen filePath={file.path} diffContent={file.diff} isExpanded={true} />;
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === 'REVERT_CONFIRM') {
            return <Text>(Enter) Confirm Revert      (Esc) Cancel</Text>;
        }
        
        const baseActions = ['(↑↓) Nav', '(C)opy', '(U)ndo', '(Q)uit/Back'];

        if (focusedItemPath.includes('/')) { // Is a file
            if (bodyView === 'DIFF_VIEW') {
                return <Text>(↑↓) Nav Files · (←) Back to List · {baseActions.slice(1).join(' · ')}</Text>;
            }
            return <Text>(↑↓) Nav Files · (→) View Diff · (←) Back to Sections · {baseActions.slice(1).join(' · ')}</Text>;
        }
        
        if (expandedItemPaths.has(focusedItemPath)) {
            return <Text>(↑↓) Nav/Scroll · (→) Drill In · (←) Collapse · {baseActions.slice(1).join(' · ')}</Text>;
        }
        
        return <Text>(↑↓) Nav · (→) Expand · {baseActions.slice(1).join(' · ')}</Text>;
    };

    const { message, timestamp, status } = transaction;
    const date = new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    const fileStats = `${files.length} Files · +${files.reduce((a, f) => a + f.linesAdded, 0)} lines, -${files.reduce((a, f) => a + f.linesRemoved, 0)} lines`;

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text>▲ relaycode transaction details</Text>
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
                    {renderBody()}
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
````

## File: src/hooks/useTransactionHistoryScreen.tsx
````typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useHistoryStore } from '../stores/history.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useDetailStore } from '../stores/detail.store';
import { useCopyStore } from '../stores/copy.store';
import { getVisibleItemPaths } from '../stores/navigation.utils';
import { useViewport } from './useViewport';

export const useTransactionHistoryScreen = ({ reservedRows }: { reservedRows: number }) => {
    const store = useHistoryStore();
    const { mode, selectedItemPath, expandedIds, filterQuery, selectedForAction, actions } = store;
    const { showDashboardScreen, showTransactionDetailScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, expandedIds),
        [transactions, expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(selectedItemPath);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows,
    });

    const openCopyMode = () => {
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        useCopyStore.getState().actions.openForHistory(transactionsToCopy);
    };

    const handleFilterInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode('LIST');
        if (key.return) actions.applyFilter();
    };

    const handleBulkActionsInput = (input: string, key: Key): void => {
        if (key.escape) {
            actions.setMode('LIST');
            return;
        }
        if (input >= '1' && input <= '3') {
            // eslint-disable-next-line no-console
            console.log(`[MOCK] Bulk action #${input} selected.`);
            actions.setMode('LIST');
        }
    };

    const handleListInput = (input: string, key: Key): void => {
        if (key.upArrow) actions.navigateUp();
        if (key.downArrow) actions.navigateDown();
        if (key.rightArrow) actions.expandOrDrillDown();
        if (key.leftArrow) actions.collapseOrBubbleUp();
        if (input === ' ') actions.toggleSelection();
        if (key.return) {
            const txId = selectedItemPath.split('/')[0];
            if (txId && !selectedItemPath.includes('/')) {
                useDetailStore.getState().actions.load(txId);
                showTransactionDetailScreen();
            }
        }

        if (input.toLowerCase() === 'f') actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && selectedForAction.size > 0) actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    };

    useInput((input: string, key: Key) => {
        if (mode === 'FILTER') {
            handleFilterInput(input, key);
            return;
        }
        if (mode === 'BULK_ACTIONS') {
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
    const showingStatusText = `Showing ${Math.min(viewOffset + 1, visibleItemPaths.length)}-${Math.min(viewOffset + itemsInView.length, visibleItemPaths.length)} of ${visibleItemPaths.length} items`;
    
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
        transactionsInView,
        pathsInViewSet,
        filterStatus: filterStatusText,
        showingStatus: showingStatusText,
        visibleItemPaths,
    };
};
````

## File: src/components/ReviewScreen.tsx
````typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import type { ScriptResult, FileItem } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';

// --- Sub-components ---

const FileItemRow = ({ file, isSelected, reviewStatus, reviewError }: {
    file: FileItem;
    isSelected: boolean;
    reviewStatus: string;
    reviewError?: string;
}) => {
    let icon;
    let iconColor;
    switch (reviewStatus) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
        case 'AWAITING': icon = '[●]'; iconColor = 'yellow'; break;
        case 'RE_APPLYING': icon = '[●]'; iconColor = 'cyan'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isSelected ? '> ' : '  ';

    if (reviewStatus === 'FAILED') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({reviewError})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'AWAITING') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    (Bulk re-apply prompt copied!)</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'RE_APPLYING') {
        return (
             <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> MOD {file.path} {diffStats} [{strategy}]
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
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useReviewScreen();

    if (!transaction) {
        return <Text>Loading review...</Text>;
    }
    const { hash, message, prompt = '', reasoning = '' } = transaction;

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningLinesCount = (reasoning || '').split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ReasonScreen
                        reasoning={reasoning}
                        scrollIndex={reasoningScrollIndex}
                        visibleLinesCount={visibleLinesCount}
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
        
        if (bodyView === 'diff') {
            const selectedFile = files[selectedItemIndex];
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                />
            );
        }

        if (bodyView === 'script_output') {
             const scriptIndex = selectedItemIndex - numFiles;
             const selectedScript = scripts[scriptIndex];
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter((line: string) =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>{selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`</Text>
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

        if (bodyView === 'confirm_handoff') {
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

        if (bodyView === 'bulk_repair') {
            const failedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'FAILED');
            const repairOptions = [
                '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
                '(2) Bulk Change Strategy & Re-apply',
                '(3) Handoff to External Agent',
                '(4) Bulk Abandon All Failed Files',
                '(Esc) Cancel',
            ];

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
                        {repairOptions.map((opt, i) => (
                            <Text key={i}>
                                {i === 0 ? '> ' : '  '}
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
        if (bodyView === 'diff') {
            return <Text>(↑↓) Nav · (X)pand · (D/Esc) Back</Text>;
        }
        if (bodyView === 'reasoning') {
            return <Text>(↑↓) Scroll Text · (R)Collapse View · (C)opy Mode</Text>;
        }
        if (bodyView === 'script_output') {
            return (
                <Text>(↑↓) Nav · (J↓/K↑) Next/Prev Error · (C)opy Output · (Ent/Esc) Back</Text>
            );
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Choose an option [1-4, Esc]:</Text>;
        }
        if (bodyView === 'confirm_handoff') {
            return <Text>(Enter) Confirm Handoff      (Esc) Cancel</Text>;
        }

        // Main footer
        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
        
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            const fileState = selectedFile ? fileReviewStates.get(selectedFile.id) : undefined;
            if (selectedFile && fileState?.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
            
            // Add repair options for failed files
            if (selectedFile && fileState?.status === 'FAILED') {
                actions.push('(T)ry Repair');
            }
        } else { // script selected
            actions.push('(Ent) Expand Details');
        }

        actions.push('(R)easoning');
        
        // Add bulk repair if there are failed files
        if (hasFailedFiles) {
            actions.push('(Shift+T) Bulk Repair');
        }
        
        actions.push('(C)opy');

        if (approvedFilesCount > 0) {
            actions.push('(A)pprove');
        }

        if (Array.from(fileReviewStates.values()).some(s => s.status === 'APPROVED' || s.status === 'FAILED')) {
            actions.push('(Shift+R) Reject All');
        }
        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column" marginY={1}>
                <Box flexDirection="column">
                    <Text>{hash} · {message}</Text>
                    <Text>
                        (<Text color="green">+{approvedLinesAdded}</Text>/<Text color="red">-{approvedLinesRemoved}</Text>) · {approvedFilesCount}/{numFiles} Files
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && <Text> · Scripts: SKIPPED</Text>}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Text>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text>
                        (P)rompt ▸ {(prompt || '').substring(0, 60)}...
                    </Text>
                    <Text>
                        (R)easoning ({(reasoning || '').split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'}{' '}
                        {((reasoning || '').split('\n')[0] ?? '').substring(0, 50)}...
                    </Text>
                </Box>
            </Box>

            <Separator />

            {/* Script Results (if any) */}
            {scripts.length > 0 && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script: ScriptResult, index: number) => (
                            <ScriptItemRow
                                key={script.command}
                                script={script}
                                isSelected={selectedItemIndex === numFiles + index}
                                isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                            />
                        ))}
                    </Box>
                    <Separator />
                </>
            )}

            {/* Files Section */}
            <Box flexDirection="column" marginY={1}>
                <Text bold>FILES</Text>
                {files.map((file: FileItem, index: number) => {
                    const reviewState = fileReviewStates.get(file.id);
                    return (<FileItemRow
                        key={file.id}
                        file={file}
                        isSelected={selectedItemIndex === index}
                        reviewStatus={reviewState?.status || 'AWAITING'}
                        reviewError={reviewState?.error}
                    />);
                })}
            </Box>
            
            <Separator />
            
            {/* Body Viewport */}
            {bodyView !== 'none' && (
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
````

## File: src/hooks/useDebugMenu.tsx
````typescript
import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useInitStore } from '../stores/init.store';
import { useCommitStore } from '../stores/commit.store';
import { useCopyStore } from '../stores/copy.store';
import type { MenuItem } from '../types/debug.types';
import { useTransactionStore } from '../stores/transaction.store';
import { moveIndex } from '../stores/navigation.utils';
export type { MenuItem } from '../types/debug.types';

const useDebugMenuActions = () => {
    const { actions: appActions } = useAppStore();
    const { actions: initActions } = useInitStore();
    const { actions: commitActions } = useCommitStore();
    const { actions: dashboardActions } = useDashboardStore();
    const { actions: reviewActions } = useReviewStore();
    const { actions: detailActions } = useDetailStore();
    const { actions: historyActions } = useHistoryStore();

    const menuItems: MenuItem[] = [
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
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.load('1', { bodyView: 'confirm_handoff' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => {
                reviewActions.load('2'); // Use tx '2' which has scripts
                appActions.showReviewProcessingScreen();
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
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                detailActions.load('3'); // 'feat: implement new dashboard UI'
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
            title: 'History: L1 Drilldown',
            action: () => {
                historyActions.prepareDebugState('l1-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Diff)',
            action: () => {
                historyActions.prepareDebugState('l2-drill');
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
    
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', menuItems.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', menuItems.length));
            return;
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                useViewStore.getState().actions.setActiveOverlay('none');
            }
            return;
        }
        if (key.escape) {
            useViewStore.getState().actions.setActiveOverlay('none');
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
    });

    return {
        selectedIndex,
        menuItems,
    };
};
````

## File: src/App.tsx
````typescript
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
import GlobalHelpScreen from './components/GlobalHelpScreen';
import CopyScreen from './components/CopyScreen';
import { useViewStore } from './stores/view.store';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const isOverlayOpen = activeOverlay !== 'none';

    // Global hotkeys are active if no modal-like component is open
    const areGlobalHotkeysActive = activeOverlay !== 'copy'; // Copy mode has its own input handler
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
            {activeOverlay === 'debug' && <DebugMenu />}
        </>
    );
};

export default App;
````

## File: src/stores/dashboard.store.ts
````typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { moveIndex } from './navigation.utils';

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    selectedTransactionIndex: 0,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', transactions.length) };
        }),
        moveSelectionDown: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', transactions.length) };
        }),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => { // The `if` is redundant as this is only called from that state.
            const previousStatus = get().previousStatus;
            set({ status: 'APPROVING' });
            await DashboardService.approveAll();
            set({ status: previousStatus });
        },
    },
}));
````

## File: src/components/DashboardScreen.tsx
````typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import type { Transaction, TransactionStatus } from '../types/domain.types';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { UI_CONFIG } from '../config/ui.config';

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
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    } = useDashboardScreen({ reservedRows: UI_CONFIG.dashboard.reservedRows });

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
			? <Text>(<Text color="cyan" bold>P</Text>)resume</Text>
			: <Text>(<Text color="cyan" bold>P</Text>)ause</Text>;
		return (
            <Text color="gray">
                (<Text color="cyan" bold>↑↓</Text>) Nav · (<Text color="cyan" bold>Enter</Text>) Review · (<Text color="cyan" bold>L</Text>)og · (<Text color="cyan" bold>A</Text>)pprove All · (<Text color="cyan" bold>C</Text>)ommit All · {pauseAction} · (<Text color="cyan" bold>Q</Text>)uit
            </Text>
        );
    };
    
    return (
        <Box flexDirection="column" height="100%">
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
    );
};

export default DashboardScreen;
````

## File: src/stores/review.store.ts
````typescript
import { create } from 'zustand';
import { useAppStore } from './app.store';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { ReviewService } from '../services/review.service';
import { moveIndex } from './navigation.utils';
import { INITIAL_APPLY_STEPS } from '../constants/review.constants';
import type { FileReviewStatus } from '../types/domain.types';

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}
export type ReviewBodyView = 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';
export type ApplyUpdate =
    | { type: 'UPDATE_STEP'; payload: { id: string; status: ApplyStep['status']; duration?: number; details?: string } }
    | { type: 'ADD_SUBSTEP'; payload: { parentId: string; substep: Omit<ApplyStep, 'substeps'> } };

interface ReviewState {
    patchStatus: PatchStatus;
    applySteps: ApplyStep[];
    selectedItemIndex: number;
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;
    reasoningScrollIndex: number;
    scriptErrorIndex: number;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;

    actions: {
        load: (transactionId: string, initialState?: { bodyView: ReviewBodyView }) => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        expandDiff: () => void;
        toggleBodyView: (view: Extract<
            ReviewBodyView,
            'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'
        >) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;
        updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
        updateFileReviewStatus: (fileId: string, status: FileReviewStatus, error?: string) => void;
        toggleFileApproval: (fileId: string) => void;
        rejectAllFiles: () => void;
    };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    patchStatus: 'SUCCESS',
    applySteps: INITIAL_APPLY_STEPS,
    selectedItemIndex: 0,
    bodyView: 'none',
    isDiffExpanded: false,
    reasoningScrollIndex: 0,
    scriptErrorIndex: 0,
    fileReviewStates: new Map(),

    actions: {
        load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;
            
            const { patchStatus, fileReviewStates } = ReviewService.prepareTransactionForReview(transaction);

            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                patchStatus,
                fileReviewStates,
                selectedItemIndex: 0,
                bodyView: initialState?.bodyView ?? 'none',
                isDiffExpanded: false,
                reasoningScrollIndex: 0,
                scriptErrorIndex: 0,
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
            });
        },
        moveSelectionUp: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', listSize) };
        }),
        moveSelectionDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', listSize) };
        }),
        toggleBodyView: (view) => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.selectedItemIndex >= files.length) return {};
            return {
                bodyView: state.bodyView === view ? 'none' : view,
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
        startApplySimulation: async (scenario) => {
            const { showReviewProcessingScreen } = useAppStore.getState().actions;
            const { updateApplyStep, addApplySubstep } = get().actions;
            set({ applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)) });
            showReviewProcessingScreen();
            const simulationGenerator = ReviewService.runApplySimulation(scenario);
            for await (const update of simulationGenerator) {
                if (update.type === 'UPDATE_STEP') {
                    updateApplyStep(
                        update.payload.id,
                        update.payload.status,
                        update.payload.duration,
                        update.payload.details,
                    );
                } else if (update.type === 'ADD_SUBSTEP') {
                    addApplySubstep(update.payload.parentId, update.payload.substep);
                }
            }
            // Transition back to review screen is handled by the processing screen component or a separate flow
            // For this simulation, we'll assume it transitions back, but the action itself doesn't need to do it.
            // This avoids a direct dependency from the store to app-level navigation.
        },
        tryRepairFile: () => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { selectedItemIndex, fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.[selectedItemIndex];
            if (!file) return;

            const { status, error } = fileReviewStates.get(file.id) || {};
            if (status !== 'FAILED') return;
            
            ReviewService.tryRepairFile(file, error);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING');
        },
        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const failedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'FAILED');
            if (failedFiles.length === 0) {
                set({ bodyView: 'none' });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkRepairPrompt(failedFiles);
                    set({ bodyView: 'none' });
                    break;
                case 2: {
                    set({ bodyView: 'none' });
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
                    set({ bodyView: 'none' });
                    break;
                default:
                    set({ bodyView: 'none' });
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
        updateApplyStep: (id, status, duration, details) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep = { ...s, status };
                        if (duration !== undefined) newStep.duration = duration;
                        if (details !== undefined) newStep.details = details;
                        return newStep;
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
        updateFileReviewStatus: (fileId, status, error) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                newStates.set(fileId, { status, error });
                return { fileReviewStates: newStates };
            });
        },
        toggleFileApproval: (fileId) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                const current = newStates.get(fileId);
                if (current) {
                    const newStatus: FileReviewStatus = current.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                    newStates.set(fileId, { status: newStatus, error: undefined });
                }
                return { fileReviewStates: newStates };
            });
        },
        rejectAllFiles: () => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                for (const [fileId, reviewState] of newStates.entries()) {
                    if (reviewState.status === 'APPROVED') {
                        newStates.set(fileId, { status: 'REJECTED', error: undefined });
                    }
                }
                return { fileReviewStates: newStates };
            });
        },
    },
}));
````
