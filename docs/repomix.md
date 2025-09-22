# Directory Structure
```
docs/
  relaycode-tui/
    diff-screen.readme.md
    reason-screen.readme.md
    review-processing-screen.readme.md
    review-screen.readme.md
src/
  components/
    DashboardScreen.tsx
    DebugMenu.tsx
    DiffScreen.tsx
    ReasonScreen.tsx
    ReviewProcessingScreen.tsx
    ReviewScreen.tsx
    Separator.tsx
  stores/
    app.store.ts
    dashboard.store.ts
    init.store.ts
    review.store.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: docs/relaycode-tui/diff-screen.readme.md
````markdown
# DIFF-VIEW.README.MD

## Relaycode TUI: The Interactive Diff View Component

This document specifies the design and behavior of the interactive Diff View. This is not a standalone screen, but a stateful **component** that is rendered within the Body of parent screens like the **Review Screen** and **Transaction Details Screen**.

### 1. Core Philosophy

A diff is the most critical piece of evidence in a code change. This component's philosophy is to present that evidence with absolute **clarity, context, and control**.

-   **Clarity:** The diff must be clean, readable, and feature syntax highlighting to help the user instantly parse the changes.
-   **Context:** The user must never be confused about *which* file they are viewing. A persistent header provides this crucial context.
-   **Control:** A raw text dump is insufficient for large changes. The user is given powerful keyboard tools to navigate, expand, and collapse the diff, allowing them to focus on what matters.

### 2. Context of Use

The Diff View is activated and rendered within the Body of a parent screen when the user requests to see the changes for a specific file, typically by pressing `(D)`. It replaces any previous content in the Body.

### 3. UI Layout & Components

1.  **Header:** A single, static line providing the context of the file being viewed. Example: `DIFF: src/core/transaction.ts`.
2.  **Content Area:** The main rendering surface for the diff itself. It uses standard `+` (additions) and `-` (deletions) prefixes and supports color and syntax highlighting.
3.  **Truncation Hint (Conditional):** For large diffs, a line indicating that content is hidden is displayed. Example: `... 23 lines hidden ...`.

### 4. States & Interactions

The Diff View has several states, primarily related to content display and navigation.

#### **State 4.1: Default / Collapsed View (for large diffs)**

When a diff exceeds a certain line count (e.g., 20 lines), it initially renders in a collapsed state to avoid overwhelming the user.

```
 ... (Parent Screen Navigator) ...
 ──────────────────────────────────────────────────────────────────────────────
  DIFF: src/core/transaction.ts

   export const restoreSnapshot = async (snapshot: FileSnapshot, ...): ... => {
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
   ... 23 lines hidden ...
+        } catch (error) {
+          restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) { ... }
   }
 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) File Nav · (X)pand Diff · (J↓/K↑) Hunk Nav · (D)Collapse View
```
-   **Behavior:** The view intelligently shows the beginning and end of the diff, hiding the middle.
-   **Interactions:** The primary action is `(X)pand Diff`.

#### **State 4.2: Expanded View**

**Trigger:** User presses `(X)`.

The full, unabridged diff is rendered in the Content Area. The truncation hint is removed. The footer might update to show `(X)ollapse Diff`.

#### **State 4.3: Hunk Navigation (The "Advanced" Interaction)**

For very large, expanded diffs, users can navigate between distinct change blocks ("hunks").

```
 ... (Parent Screen Navigator) ...
 ──────────────────────────────────────────────────────────────────────────────
  DIFF: src/core/transaction.ts

> @@ -45,7 +45,9 @@ export const restoreSnapshot = ...
   ... (first hunk content) ...

  @@ -92,6 +94,12 @@ export const restoreSnapshot = ...
   ... (second hunk content, not focused) ...
```
-   **Trigger:** User presses `(J)` (next hunk) or `(K)` (previous hunk).
-   **Behavior:**
    *   A `>` indicator appears next to the `@@ ... @@` line of the currently active hunk.
    *   The view automatically scrolls to bring the active hunk into the viewport.
    *   This allows the user to quickly jump between separate changes within the same file without tedious line-by-line scrolling.
-   **Parent Interaction:** The parent screen's file navigation `(↑↓)` remains active. If the user selects a new file, the Diff View component will instantly re-render with the new file's diff, resetting to its default collapsed state.

### 5. Implementation Notes

-   **Syntax Highlighting:** A terminal-compatible syntax highlighting library should be used to parse and colorize the diff content for the appropriate language.
-   **Collapsing Logic:** The logic for collapsing large diffs should be configurable but default to a sensible value (e.g., show the first 10 and last 10 lines).
-   **Focus Management:** The parent screen is responsible for routing keyboard inputs. When the Diff View is active, it should listen for `(X)`, `(J)`, and `(K)` and delegate those actions to the Diff View component.
-   **State:** The parent screen's state must track which file is being viewed and whether its diff is expanded or collapsed.

***
````

## File: docs/relaycode-tui/reason-screen.readme.md
````markdown
# REASONING-VIEW.README.MD

## Relaycode TUI: The Reasoning View Component

This document specifies the design and behavior of the Reasoning View. This is a simple but essential **component** for displaying the AI's step-by-step thought process. It renders within the Body of parent screens like the **Review Screen** and **Transaction Details Screen**.

### 1. Core Philosophy

The reasoning behind a change is as important as the change itself. The philosophy of this component is to present the AI's narrative with maximum **readability and clarity**.

-   **Readability:** The text should be formatted cleanly, respecting newlines and list structures from the source data to be easily digestible.
-   **Clarity:** The view should be uncluttered, presenting only the reasoning text under a clear header, free from other UI noise.
-   **Focus:** When active, the component should allow for focused interaction (scrolling) without interference from the parent screen's navigation.

### 2. Context of Use

The Reasoning View is activated and rendered within the Body of a parent screen when the user requests to see the AI's reasoning, typically by pressing `(R)`. It replaces any previous content in the Body.

### 3. UI Layout & Components

1.  **Header:** A single, static line: `REASONING`.
2.  **Content Area:** The main rendering surface for the reasoning text. It displays formatted, multi-line text.

### 4. States & Interactions

The Reasoning View is simpler than the Diff View and has two primary interactive states.

#### **State 4.1: Expanded View**

This is the primary state of the component when it is active.

```
 ... (Parent Screen Navigator, Reasoning section shows '▾') ...
 ──────────────────────────────────────────────────────────────────────────────
  REASONING

  1. Identified a potential uncaught exception in the `restoreSnapshot` function
     if a file operation fails midway through a loop of many files. This could
     leave the project in a partially-reverted, inconsistent state.

  2. Wrapped the file restoration loop in a `Promise.all` and added a dedicated
     error collection array. This ensures that all file operations are
     attempted and that a comprehensive list of failures is available
     afterward for better error reporting or partial rollback logic.

  3. Improved the `getErrorMessage` utility to handle non-Error objects more
     gracefully, as this was a related minor issue found during analysis of
     the error handling pathways.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Scroll Text · (R)Collapse View · (C)opy Mode
```
-   **Behavior:** The component renders the full reasoning text, preserving formatting like numbered lists and paragraph breaks from the transaction file.
-   **Footer Update:** The parent screen's footer updates to show that `(↑↓)` keys are now repurposed for scrolling.

#### **State 4.2: Scrolling Content**

**Trigger:** The reasoning text is too long to fit in the available space, and the user presses `(↑)` or `(↓)`.

-   **Behavior:** The text within the Content Area scrolls up or down. The rest of the UI (parent navigator, headers, footer) remains static. This provides a seamless reading experience for long explanations.
-   **Focus Management:** While the Reasoning View is active, it "captures" the arrow keys for scrolling. Pressing `(R)` again or `(Esc)` would release this capture, returning arrow key control to the parent screen's file navigator.

### 5. Implementation Notes

-   **Data Formatting:** The component should expect the reasoning data as an array of strings or a single multi-line string and be responsible for rendering it with correct line breaks.
-   **Scrolling Logic:** A state variable will need to track the current scroll position (the top visible line). Re-rendering will slice the full text array/string to display the correct "viewport" of text.
-   **Copy Integration:** When the user enters `(C)opy Mode`, one of the available options must be to copy the *entire* reasoning text to the clipboard with a single keystroke.
````

## File: docs/relaycode-tui/review-processing-screen.readme.md
````markdown
# REVIEW-PROCESSING-SCREEN.README.MD

## Relaycode TUI: The Live Patch Application Screen

This document specifies the design and behavior of the **Live Patch Application Screen**. This is the initial, ephemeral screen shown immediately after a new patch is detected and while it is being processed. Its primary purpose is to provide a real-time, step-by-step feedback loop as Relaycode applies changes.

This screen is not interactive. It is a transparent progress indicator that automatically transitions to the main interactive **Apply & Review Screen** upon completion or failure.

### 1. Core Philosophy

-   **Live Feedback Loop:** The screen provides real-time progress during patch application, giving the user confidence that the system is working and transparency into its performance. Each step is clearly delineated with status updates and timings.
-   **Clarity on Failure:** It immediately and clearly communicates not just *what* failed, but the downstream consequences. By explicitly marking subsequent steps as `SKIPPED`, it prevents user confusion and saves system resources.
-   **Informative & Ephemeral:** The screen exists only as long as it needs to, presenting crucial information about the application process before seamlessly transitioning the user to the next logical step: interactive review and repair.

### 2. The Workflow States

The screen displays one of two primary states, depending on the outcome of the patch application process.

---

#### **State 2.1: Live Application (Success Case)**

This is the state shown while Relaycode processes a patch that applies cleanly without any errors.

```
 ▲ relaycode apply
 ──────────────────────────────────────────────────────────────────────────────
 Applying patch 4b9d8f03... (refactor: simplify clipboard logic)

 (●) Reading initial file snapshot... (0.1s)
 (●) Applying operations to memory... (0.3s)
     └─ [✓] write: src/core/clipboard.ts (strategy: replace)
     └─ [✓] write: src/utils/shell.ts (strategy: standard-diff)
 (●) Running post-command script... (2.3s)
     └─ `bun run test` ... Passed
 (●) Analyzing changes with linter... (1.2s)
     └─ `bun run lint` ... 0 Errors

 ──────────────────────────────────────────────────────────────────────────────
 Elapsed: 3.9s · Processing... Please wait.
```
-   **Behavior:** Each line updates its status symbol `( ) → (●) → [✓]`. Timings appear as each step completes. The specific patch strategy used for each file is displayed.
-   **Transition:** Upon completion, seamlessly transitions into the **Interactive Review Screen** for final approval.

---

#### **State 2.2: Live Application (Partial Failure Case)**

This state is shown when one or more file operations fail during the application process. It demonstrates the **Golden Rule**: post-application scripts are **skipped** if the patch does not apply cleanly.

```
 ▲ relaycode apply
 ──────────────────────────────────────────────────────────────────────────────
 Applying patch e4a7c112... (refactor: rename core utility function)

 (●) Reading initial file snapshot... (0.1s)
 (●) Applying operations to memory... (0.5s)
     └─ [✓] write: src/core/transaction.ts (strategy: replace)
     └─ [!] failed: src/utils/logger.ts (Hunk #1 failed to apply)
     └─ [!] failed: src/commands/apply.ts (Context mismatch at line 92)
 (-) SKIPPED Post-command script...
     └─ Skipped due to patch application failure
 (-) SKIPPED Analyzing changes with linter...
     └─ Skipped due to patch application failure

 ──────────────────────────────────────────────────────────────────────────────
 Elapsed: 0.6s · Transitioning to repair workflow...
```
-   **Behavior:** Failed operations are marked with `[!]` and a concise error message. Subsequent dependent steps (scripts, linters) are marked `(-) SKIPPED` with a clear explanation, preventing false results and saving resources.
-   **Transition:** Immediately transitions to the **Interactive Review Screen** in its "Failed Application & Repair Workflow" state.
````

## File: src/components/DiffScreen.tsx
````typescript
import React from 'react';
import { Box, Text } from 'ink';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
}

const DiffScreen = ({ filePath, diffContent, isExpanded }: DiffScreenProps) => {
    const lines = diffContent.split('\n');
    const COLLAPSE_THRESHOLD = 20;
    const COLLAPSE_SHOW_LINES = 8;

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

## File: src/components/ReasonScreen.tsx
````typescript
import React from 'react';
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string,
    scrollIndex?: number,
    visibleLinesCount?: number,
}

const ReasonScreen = ({ reasoning, scrollIndex = 0, visibleLinesCount = 10 }: ReasonScreenProps) => {
    const lines = reasoning.split('\n');
    const visibleLines = lines.slice(scrollIndex, scrollIndex + visibleLinesCount);

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

## File: src/components/ReviewProcessingScreen.tsx
````typescript
import React from 'react';
import { Box, Text } from 'ink';
import { useReviewStore, type ApplyStep } from '../stores/review.store';
import Separator from './Separator';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep, isSubstep?: boolean }) => {
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
            {step.substeps?.map((sub, i) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const { hash, message, patchStatus, applySteps } = useReviewStore(state => ({
        hash: state.hash,
        message: state.message,
        patchStatus: state.patchStatus,
        applySteps: state.applySteps,
    }));

    const totalDuration = applySteps.reduce((acc, step) => acc + (step.duration || 0), 0);
    const failureCase = patchStatus === 'PARTIAL_FAILURE';
    const footerText = failureCase
        ? `Elapsed: ${totalDuration.toFixed(1)}s · Transitioning to repair workflow...`
        : `Elapsed: ${totalDuration.toFixed(1)}s · Processing... Please wait.`;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode apply</Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {hash}... ({message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map(step => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;
````

## File: src/utils.ts
````typescript
// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
````

## File: src/components/DebugMenu.tsx
````typescript
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useInitStore } from '../stores/init.store';
import { useReviewStore } from '../stores/review.store';
import Separator from './Separator';

interface MenuItem {
    title: string;
    action: () => void;
}

const DebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const appActions = useAppStore(s => s.actions);
    const dashboardActions = useDashboardStore(s => s.actions);
    const initActions = useInitStore(s => s.actions);
    const reviewActions = useReviewStore(s => s.actions);

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
                dashboardActions.setStatus('CONFIRM_APPROVE');
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
                reviewActions.simulateFailureScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.simulateSuccessScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleDiffView();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleReasoningView();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleCopyMode();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => appActions.showReviewProcessingScreen(),
        },
    ];

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => Math.max(0, i - 1));
        }
        if (key.downArrow) {
            setSelectedIndex(i => Math.min(menuItems.length - 1, i + 1));
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                appActions.toggleDebugMenu();
            }
        }
        if (key.escape || (key.ctrl && input === 'b')) {
            appActions.toggleDebugMenu();
        }
    });

    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="yellow"
            width="100%"
            paddingX={2}
        >
            <Text bold color="yellow">▲ relaycode · DEBUG MENU</Text>
            <Separator />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => (
                    <Text key={item.title} color={selectedIndex === index ? 'cyan' : undefined}>
                        {selectedIndex === index ? '> ' : '  '}
                        {item.title}
                    </Text>
                ))}
            </Box>
            <Separator />
            <Text>(↑↓) Navigate · (Enter) Select · (Esc / Ctrl+B) Close</Text>
        </Box>
    );
};

export default DebugMenu;
````

## File: src/components/Separator.tsx
````typescript
import React, { useState, useEffect } from 'react';
import {Text} from 'ink';

const useStdoutDimensions = () => {
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

const Separator = () => {
	const [columns] = useStdoutDimensions();
	return <Text>{'─'.repeat(columns || 80)}</Text>;
};

export default Separator;
````

## File: src/stores/init.store.ts
````typescript
import { create } from 'zustand';

// Types
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';

export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}

// Initial State definitions from README
export const initialAnalyzeTasks: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

export const initialConfigureTasks: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];

// Store Interface
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (_phase: InitPhase) => void;
        updateAnalyzeTask: (_id: string, _status: TaskStatus) => void;
        setAnalysisResults: (_projectId: string, _gitignoreFound: boolean) => void;
        updateConfigureTask: (_id: string, _status: TaskStatus) => void;
        setInteractiveChoice: (_choice: GitignoreChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: initialAnalyzeTasks,
    projectId: null,
    gitignoreFound: null,
    configureTasks: initialConfigureTasks,
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
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
            analyzeTasks: JSON.parse(JSON.stringify(initialAnalyzeTasks)),
            projectId: null,
            gitignoreFound: null,
            configureTasks: JSON.parse(JSON.stringify(initialConfigureTasks)),
            interactiveChoice: null,
        }),
    },
}));
````

## File: src/stores/app.store.ts
````typescript
import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review' | 'review-processing';

interface AppState {
    isDebugMenuOpen: boolean;
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showSplashScreen: () => void;
        toggleDebugMenu: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    isDebugMenuOpen: false,
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        toggleDebugMenu: () => set(state => ({ isDebugMenuOpen: !state.isDebugMenuOpen })),
    },
}));
````

## File: src/stores/dashboard.store.ts
````typescript
import { create } from 'zustand';
import { sleep } from '../utils';

// --- Types ---
export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'FAILED' | 'REVERTED' | 'IN-PROGRESS';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
}

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'CONFIRM_COMMIT' | 'APPROVING' | 'COMMITTING';

// --- Initial State (for simulation) ---
const createInitialTransactions = (): Transaction[] => [
    { id: '1', timestamp: Date.now() - 15 * 1000, status: 'PENDING', hash: 'e4a7c112', message: 'fix: add missing error handling' },
    { id: '2', timestamp: Date.now() - 2 * 60 * 1000, status: 'APPLIED', hash: '4b9d8f03', message: 'refactor: simplify clipboard logic' },
    { id: '3', timestamp: Date.now() - 5 * 60 * 1000, status: 'COMMITTED', hash: '8a3f21b8', message: 'feat: implement new dashboard UI' },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

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
        startCommitAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: createInitialTransactions(),
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
        startCommitAll: () => set(state => ({
            status: 'CONFIRM_COMMIT',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
        setStatus: (status) => set({ status }),

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                // Find pending transactions and mark them as in-progress
                const pendingTxIds: string[] = [];
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (tx.status === 'PENDING') {
                            pendingTxIds.push(tx.id);
                            return { ...tx, status: 'IN-PROGRESS' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs };
                });

                await sleep(2000); // Simulate approval process

                // Mark them as applied
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (pendingTxIds.includes(tx.id)) {
                            return { ...tx, status: 'APPLIED' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs, status: previousStatus };
                });
            } else if (status === 'CONFIRM_COMMIT') {
                set({ status: 'COMMITTING' });
                 // Find applied transactions and mark them as in-progress
                 const appliedTxIds: string[] = [];
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (tx.status === 'APPLIED') {
                            appliedTxIds.push(tx.id);
                             return { ...tx, status: 'IN-PROGRESS' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs };
                 });
 
                 await sleep(2000); // Simulate commit process
 
                 // Mark them as committed
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (appliedTxIds.includes(tx.id)) {
                             return { ...tx, status: 'COMMITTED' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs, status: previousStatus };
                 });
            }
        },
    },
}));
````

## File: index.tsx
````typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';

// Check if we're running in an interactive terminal
if (process.stdin.isTTY && process.stdout.isTTY) {
    render(<App />);
} else {
    process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
    process.exit(1);
}
````

## File: docs/relaycode-tui/review-screen.readme.md
````markdown
# REVIEW-SCREEN.README.MD

## Relaycode TUI: The Stateful Apply & Review Screen

This document specifies the design and behavior of the stateful **Apply & Review Screen**. This screen is the interactive core of the Relaycode workflow, appearing immediately after a patch has been processed and applied to the filesystem. It is a command center for analysis, granular control, data extraction, and iterative repair.

### 1. Core Philosophy

The Review screen is not a simple "accept/reject" dialog. It is a strategic workspace designed to give the user complete control and insight over incoming code changes.

-   **Information Supremacy:** The UI provides all necessary context at a glance: high-level stats, the AI's reasoning, post-script results, the patch strategy used per file, and deep-dive diffs. Nothing is hidden.
-   **Granular Control:** The user is empowered to make decisions on a per-file basis. The UI dynamically recalculates and reflects the impact of these decisions in real-time.
-   **Iterative Repair Workflow:** Failure is treated as a temporary state, not an endpoint. The UI provides a powerful suite of tools—from AI-driven prompts to manual overrides—to handle even complex, multi-file failures gracefully.
-   **Data Accessibility:** Every piece of information (prompts, diffs, reasoning, script outputs) is easily copyable, respecting the user's need to use this data in other contexts.

### 2. UI Layout Components

1.  **Header:** `▲ relaycode review`.
2.  **Navigator:** The top section, acting as a command-and-control center. It contains the transaction summary, global stats, expandable reasoning/prompt, script results, and the file list.
3.  **Body:** A dynamic viewport that renders detailed content—like diffs or script outputs—based on the user's focus in the Navigator.
4.  **Footer:** The contextual action bar, showing available keyboard shortcuts that change constantly based on the UI's state and focus.

### 3. The Interactive States & Workflow

This screen is the interactive workspace that appears after the initial patch application is complete (whether successful or not). It allows the user to review, repair, and resolve the transaction.

---

#### **State 3.1: Interactive Review (Multi-File Failure)**

This state appears after a partial failure during the live application phase. The screen is now waiting for user intervention.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  e4a7c112 · refactor: rename core utility function
  (+18/-5) · 1/3 Files · 0.6s · Scripts: SKIPPED · MULTIPLE PATCHES FAILED

 (P)rompt ▸ Rename the `calculateChanges` utility to `computeDelta`...
 (R)easoning (2 steps) ▸ 1. Renamed the function in its definition file...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
   [✓] MOD src/core/transaction.ts (+18/-5) [replace]
 > [!] FAILED src/utils/logger.ts    (Hunk #1 failed to apply)
   [!] FAILED src/commands/apply.ts   (Context mismatch at line 92)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (D)iff · (T)ry Repair · (Shift+T) Bulk Repair · (Shift+R) Reject All · (Esc) Back
```
-   **Behavior:** The header clearly indicates `MULTIPLE PATCHES FAILED`. The footer presents both single-file `(T)` and `(Shift+T)` bulk repair options.

---

#### **State 3.2: Granular File Rejection & Dynamic Recalculation**

The user decides one of the successful changes is undesirable and rejects it.

**Trigger:** User navigates to `src/core/transaction.ts` and presses `(Space)`.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  e4a7c112 · refactor: rename core utility function
  (0/0) · 0/3 Files · 0.6s · Scripts: SKIPPED · MULTIPLE PATCHES FAILED

 (P)rompt ▸ Rename the `calculateChanges` utility to `computeDelta`...
 (R)easoning (2 steps) ▸ 1. Renamed the function in its definition file...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
 > [✗] MOD src/core/transaction.ts (+18/-5) [replace]
   [!] FAILED src/utils/logger.ts    (Hunk #1 failed to apply)
   [!] FAILED src/commands/apply.ts   (Context mismatch at line 92)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Spc) Toggle · (D)iff · (Shift+R) Reject All · (Esc) Back
```
-   **Behavior:** The UI instantly recalculates. The file icon changes to `[✗]`, and the global stats in the navigator (`0/0`, `0/3 Files`) reflect the new reality. The footer updates as there are no longer any approved files to commit.

---

#### **State 3.3: Interactive Review (Success Case with Script Results)**

This is the state after a fully successful patch application.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  4b9d8f03 · refactor: simplify clipboard logic
  (+22/-11) · 2 Files · 3.9s

 (P)rompt ▸ Simplify the clipboard logic using an external library...
 (R)easoning (3 steps) ▸ 1. Added clipboardy dependency...
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Post-Command: `bun run test` (2.3s) ▸ Passed (37 tests)
  ✗ Linter: `bun run lint` (1.2s) ▸ 1 Error, 3 Warnings
 ──────────────────────────────────────────────────────────────────────────────
 FILES
 > [✓] MOD src/core/clipboard.ts (+15/-8) [replace]
   [✓] MOD src/utils/shell.ts     (+7/-3)  [diff]

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Spc) Toggle · (D)iff · (Ent) Expand Details · (C)opy · (A)pprove · (Q)uit
```
-   **Behavior:** New, expandable sections appear for each post-application script, providing an at-a-glance summary of their results (`✓`/`✗`).

---

#### **State 3.4: Expanding Script Results (Body View)**

**Trigger:** User navigates to the Linter line and presses `(Enter)`.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  4b9d8f03 · refactor: simplify clipboard logic
  (+22/-11) · 2 Files · 3.9s

 (P)rompt ▸ Simplify the clipboard logic using an external library...
 (R)easoning (3 steps) ▸ 1. Added clipboardy dependency...
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Post-Command: `bun run test` (2.3s) ▸ Passed (37 tests)
> ✗ Linter: `bun run lint` (1.2s) ▾ 1 Error, 3 Warnings
 ──────────────────────────────────────────────────────────────────────────────
  LINTER OUTPUT: `bun run lint`

  src/core/clipboard.ts
    45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
    88:5   Warning  Unexpected console statement. (no-console)

  src/utils/shell.ts
    23:9   Warning  'result' is never reassigned. Use 'const' instead. (prefer-const)
    25:1   Warning  Empty block statement. (no-empty)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Collapse · (J↓/K↑) Next/Prev Error · (C)opy Output · (Esc) Back
```
-   **Behavior:** The Body viewport is replaced with the detailed, formatted output from the linter. The footer provides contextual navigation hotkeys (`J/K`) to jump between errors.

---

#### **State 3.5: Copy Mode**

**Trigger:** User presses `(C)` from any primary review state.

```
 ▲ relaycode review · copy mode
 ──────────────────────────────────────────────────────────────────────────────
 Select item to copy to clipboard:

 > [U] UUID:        e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
   [M] Git Message: refactor: rename core utility function
   [P] Prompt:      Rename the `calculateChanges` utility to...
   [R] Reasoning:   1. Renamed the function in its definition...
 ──────────────────────────────────────────────────────────────────────────────
   [F] Diff for:    src/core/transaction.ts
   [A] All Diffs (3 files)
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Copied UUID to clipboard.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A) Hotkeys · (C, Esc) Exit
```
-   **Behavior:** A modal overlay appears, allowing the user to copy any piece of metadata related to the transaction to their clipboard with single keystrokes.

### 4. The Advanced Repair Workflow

---

#### **State 4.1: Initiating Bulk Repair**

**Trigger:** From the multi-failure state (3.1), the user presses `(Shift+T)`.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
 ... (Navigator remains the same) ...
 ──────────────────────────────────────────────────────────────────────────────
  BULK REPAIR ACTION

  The following 2 files failed to apply:
  - src/utils/logger.ts
  - src/commands/apply.ts

  How would you like to proceed?

> (1) Copy Bulk Re-apply Prompt (for single-shot AI)
  (2) Bulk Change Strategy & Re-apply
  (3) Handoff to External Agent
  (4) Bulk Abandon All Failed Files
  (Esc) Cancel

 ──────────────────────────────────────────────────────────────────────────────
 Choose an option [1-4, Esc]:
```
-   **Behavior:** A blocking modal appears, presenting four distinct repair strategies that will apply to all failed files simultaneously.

---

#### **Flow 4.2: The "Re-apply Prompt" (AI-driven Repair)**

**Trigger:** User selects option `(1)`. A detailed prompt is copied to the clipboard, and the UI enters a waiting state.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  e4a7c112 · refactor: rename core utility function
  (+18/-5) · 1/3 Files · 0.6s · AWAITING PATCH

 (P)rompt ▸ Rename the `calculateChanges` utility to `computeDelta`...
 (R)easoning (2 steps) ▸ 1. Renamed the function in its definition file...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
   [✓] MOD src/core/transaction.ts    (+18/-5) [replace]
 > [●] AWAITING src/utils/logger.ts    (Bulk re-apply prompt copied!)
   [●] AWAITING src/commands/apply.ts

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (D)iff · (C)opy · (Esc) Abandon & Commit Approved
```

**Generated Prompt (Copied to Clipboard):**
```text
The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

--- FILE: src/utils/logger.ts ---
Strategy: standard-diff
Error: Hunk #1 failed to apply

ORIGINAL CONTENT:
---
import chalk from 'chalk';
// ... entire original content of logger.ts ...
---

FAILED PATCH:
---
--- a/src/utils/logger.ts
+++ b/src/utils/logger.ts
// ... the failed diff block ...
---


--- FILE: src/commands/apply.ts ---
Strategy: standard-diff
Error: Context mismatch at line 92

ORIGINAL CONTENT:
---
import { applyPatch } from 'relaycode-core';
// ... entire original content of apply.ts ...
---

FAILED PATCH:
---
--- a/src/commands/apply.ts
+++ b/src/commands/apply.ts
// ... the second failed diff block ...
---

Please analyze all failed files and provide a complete, corrected response.
```

---

#### **Flow 4.3: The "Change Strategy" (User-driven Repair)**

**Trigger:** User selects option `(2)` and chooses a new strategy (e.g., `replace`). The system re-applies the original patches with the new strategy, providing live feedback.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
 ... (Navigator) ... · BULK RE-APPLYING...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
   [✓] MOD src/core/transaction.ts    (+18/-5) [replace]
 > [●] RE-APPLYING... src/utils/logger.ts (using 'replace' strategy)
   [ ] PENDING...     src/commands/apply.ts

 ──────────────────────────────────────────────────────────────────────────────
 Re-applying failed patches...
```

**Resolution (Mixed Result):**
The re-application finishes with one success and one failure.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  e4a7c112 · refactor: rename core utility function
  (+27/-7) · 2/3 Files · 0.6s · PATCH FAILED

 ... (Navigator) ...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
   [✓] MOD src/core/transaction.ts    (+18/-5) [replace]
 > [✓] MOD src/utils/logger.ts    (+9/-2) [replace]
   [!] FAILED src/commands/apply.ts   ('replace' failed: markers not found)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Spc) Toggle · (T)ry Repair · (C)opy · (Ent) Confirm & Commit
```

---

#### **Flow 4.4: The "Handoff" (Agentic Repair)**

**Trigger:** User selects option `(3)`. A confirmation modal appears first. Upon confirmation, a specialized prompt is copied, and the transaction is finalized with a `Handoff` status.

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  HANDOFF TO EXTERNAL AGENT

  This action will:
  1. Copy a detailed prompt to your clipboard for an agentic AI.
  2. Mark the current transaction as 'Handoff' and close this review.
  3. Assume that you and the external agent will complete the work.

  Relaycode will NOT wait for a new patch. This is a final action.

  Are you sure you want to proceed?
 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Confirm Handoff      (Esc) Cancel
```

**Resolution (Dashboard View):**
After handoff, the user is returned to the dashboard, which now logs the action.

```
 ▲ relaycode dashboard
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: 00 · COMMITS: 04

  EVENT STREAM (Last 15 minutes)

  > -5s    → HANDOFF   e4a7c112 · refactor: rename core utility function
    -2m    ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) View Details · (P)ause · (Q)uit
```
-   **Behavior:** A new `→ HANDOFF` icon and status provide a permanent record. The transaction is considered "done" by Relaycode's automated systems, and responsibility is now with the user and their external agent.

### 5. The Handoff Prompt: Design & Specification

The "Handoff Prompt" is a specialized, machine-generated text block copied to the user's clipboard during the Handoff workflow. It is not a simple error message; it is a carefully engineered "briefing document" designed to transfer the entire context of a failed Relaycode transaction to an external, conversational AI assistant (like Claude, GPT-4, or an IDE-integrated agent).

#### Core Design Principles

1.  **Context is King:** The prompt's primary goal is to eliminate the need for the user to manually explain the situation. It must contain the *goal*, the *plan*, the *partial results*, and the *failures* of the original transaction.
2.  **Clear Separation of Concerns:** The prompt must unambiguously distinguish between what has already been successfully applied to the filesystem and what remains broken. This prevents the external agent from re-doing completed work.
3.  **Actionable & Conversational:** It should not be a passive data dump. The prompt must end with a clear call to action that initiates a collaborative, turn-by-turn repair session.
4.  **Pointer to the Source of Truth:** For maximum fidelity, it must reference the on-disk transaction YAML file. This allows an advanced agent (or the user) to consult the original, detailed plan if the summary is insufficient.

---

#### Handoff Prompt Template

This is the template used by Relaycode to generate the prompt. It dynamically fills in the placeholders with data from the current failed transaction.

```text
I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: `.relay/transactions/{{TRANSACTION_UUID}}.yml`. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: {{GIT_COMMIT_MESSAGE}}
Reasoning:
{{AI_REASONING_STEPS}}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
{{#each successful_files}}
- {{operation}}: {{path}}
{{/each}}

FAILED CHANGES (these are the files you need to fix):
{{#each failed_files}}
- FAILED: {{path}} (Error: {{error_message}})
{{/each}}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.
```

---

#### Concrete Example

Let's use the multi-file failure scenario from this document.

-   **Transaction UUID:** `e4a7c112`
-   **Goal:** `refactor: rename core utility function`
-   **Reasoning:**
    1.  Renamed the function in its definition file, `src/core/transaction.ts`.
    2.  Attempted to update all call sites for the renamed function.
-   **Successful Files:**
    -   `MODIFIED: src/core/transaction.ts`
-   **Failed Files:**
    -   `FAILED: src/utils/logger.ts` (Error: Hunk #1 failed to apply)
    -   `FAILED: src/commands/apply.ts` (Error: Context mismatch at line 92)

When the user confirms the Handoff action, the following text is copied directly to their clipboard:

```text
I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: `.relay/transactions/e4a7c112.yml`. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: refactor: rename core utility function
Reasoning:
1. Renamed the function in its definition file, `src/core/transaction.ts`.
2. Attempted to update all call sites for the renamed function.

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
- MODIFIED: src/core/transaction.ts

FAILED CHANGES (these are the files you need to fix):
- FAILED: src/utils/logger.ts (Error: Hunk #1 failed to apply)
- FAILED: src/commands/apply.ts (Error: Context mismatch at line 92)

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.
```
````

## File: src/components/DashboardScreen.tsx
````typescript
import React, { useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { useDashboardStore, type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return <Text color="yellow">?</Text>;
        case 'APPLIED': return <Text color="green">✓</Text>;
        case 'COMMITTED': return <Text color="blue">→</Text>;
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
    status,
    transactionsToConfirm,
}: {
    status: DashboardStatus;
    transactionsToConfirm: Transaction[];
}) => {
    const isApprove = status === 'CONFIRM_APPROVE';
    const actionText = isApprove ? 'APPROVE' : 'COMMIT';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold color="yellow">{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>
                The following {transactionsToConfirm.length} transaction(s) will be {isApprove ? 'approved' : 'committed'}:
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
    const { status, transactions, selectedTransactionIndex, showHelp } = useDashboardStore();
    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        startCommitAll,
        confirmAction,
        cancelAction,
        toggleHelp,
    } = useDashboardStore(s => s.actions);
    const { exit } = useApp();
    const showReviewScreen = useAppStore(s => s.actions.showReviewScreen);

    const pendingApprovals = useMemo(() => transactions.filter(t => t.status === 'PENDING').length, [transactions]);
    const pendingCommits = useMemo(() => transactions.filter(t => t.status === 'APPLIED').length, [transactions]);

    const isModal = status === 'CONFIRM_APPROVE' || status === 'CONFIRM_COMMIT';
    const isProcessing = status === 'APPROVING' || status === 'COMMITTING';
    
    useInput((input, key) => {
        if (input === '?') {
            toggleHelp();
            return;
        }

        if (showHelp) {
            if (key.escape || input === '?') toggleHelp();
            return;
        }

        if (isModal) {
            if (key.return) confirmAction();
            if (key.escape) cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing
        
        if (input.toLowerCase() === 'q') exit();

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        
        if (key.return) {
            showReviewScreen();
        }
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) startCommitAll();
    });

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            case 'COMMITTING': statusText = 'COMMITTING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>;
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        let commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'COMMITTING') commitStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'CONFIRM_APPROVE') {
            approvalStr = <Text bold color="yellow">┌ {approvalStr} ┐</Text>;
        }
        if (status === 'CONFIRM_COMMIT') {
            commitStr = <Text bold color="yellow">┌ {commitStr} ┐</Text>;
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
                (<Text color="cyan" bold>↑↓</Text>) Nav · (<Text color="cyan" bold>Enter</Text>) Review · (<Text color="cyan" bold>A</Text>)pprove All · (<Text color="cyan" bold>C</Text>)ommit All · {pauseAction} · (<Text color="cyan" bold>Q</Text>)uit
            </Text>
        );
    };
    
    const transactionsToConfirm = useMemo(() => {
        if (status === 'CONFIRM_APPROVE') return transactions.filter(t => t.status === 'PENDING');
        if (status === 'CONFIRM_COMMIT') return transactions.filter(t => t.status === 'APPLIED');
        return [];
    }, [status, transactions]);

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
                        <ConfirmationContent status={status} transactionsToConfirm={transactionsToConfirm} />
                        <Separator />
                    </>
                )}
                
                <Text bold underline> EVENT STREAM (Last 15 minutes)</Text>
                <Box flexDirection="column" marginTop={1}>
                    {transactions.map((tx, index) => (
                        <EventStreamItem 
                            key={tx.id} 
                            transaction={tx} 
                            isSelected={!isModal && index === selectedTransactionIndex}
                        />
                    ))}
                </Box>

                <Box marginTop={1}><Separator /></Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default DashboardScreen;
````

## File: src/components/ReviewScreen.tsx
````typescript
import React, { useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useReviewStore, type FileItem, type ScriptResult } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';

// --- Sub-components ---

const FileItemRow = ({ file, isSelected }: { file: FileItem, isSelected: boolean }) => {
    let icon;
    let iconColor;
    switch (file.status) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isSelected ? '> ' : '  ';

    if (file.status === 'FAILED') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({file.error})</Text>
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
    const { exit } = useApp();
    const store = useReviewStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        linesAdded, linesRemoved, duration,
        selectedItemIndex, bodyView, isDiffExpanded,
        copyModeSelectedIndex, copyModeLastCopied, reasoningScrollIndex, scriptErrorIndex,
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval,
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff,
        startApplySimulation,
        rejectAllFiles, approve,
        toggleCopyMode, moveCopySelectionUp, moveCopySelectionDown, copySelectedItem,
        copyUUID, copyMessage, copyPrompt, copyReasoning, copyFileDiff, copyAllDiffs,
        tryRepairFile, showBulkRepair, executeBulkRepairOption,
        scrollReasoningUp, scrollReasoningDown, navigateScriptErrorUp, navigateScriptErrorDown,
    } = store.actions;

    const {
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useMemo(() => {
        const approvedFiles = files.filter(f => f.status === 'APPROVED');
        return {
            numFiles: files.length, approvedFilesCount: approvedFiles.length, approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0), approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files]);

    useInput((input, key) => {
        // For demo purposes: Pressing 1 or 2 triggers the processing screen simulation.
        if (input === '1') {
            startApplySimulation('success');
            return;
        }
        if (input === '2') {
            // The store's default is failure, but to re-trigger the processing screen
            startApplySimulation('failure');
            return;
        }

        if (input.toLowerCase() === 'q') exit();

        // Handle Escape key - context-sensitive behavior
        if (key.escape) {
            if (bodyView === 'copy_mode') {
                toggleCopyMode();
            } else if (bodyView === 'bulk_repair') {
                showBulkRepair(); // Close bulk repair modal
            } else if (bodyView !== 'none') {
                if (bodyView === 'diff') toggleDiffView();
                if (bodyView === 'reasoning') toggleReasoningView();
                if (bodyView === 'script_output') toggleScriptView();
            } else {
                showDashboardScreen();
            }
            return;
        }

        // Copy Mode Navigation
        if (bodyView === 'copy_mode') {
            if (key.upArrow) moveCopySelectionUp();
            if (key.downArrow) moveCopySelectionDown();
            if (key.return) copySelectedItem();
            
            // Hotkey shortcuts
            if (input.toLowerCase() === 'u') copyUUID();
            if (input.toLowerCase() === 'm') copyMessage();
            if (input.toLowerCase() === 'p') copyPrompt();
            if (input.toLowerCase() === 'r') copyReasoning();
            if (input.toLowerCase() === 'f') copyFileDiff();
            if (input.toLowerCase() === 'a') copyAllDiffs();
            if (input.toLowerCase() === 'c') toggleCopyMode();
            return;
        }

        // Bulk Repair Navigation
        if (bodyView === 'bulk_repair') {
            if (input >= '1' && input <= '4') {
                executeBulkRepairOption(parseInt(input));
            }
            return;
        }

        // Reasoning Scroll Navigation
        if (bodyView === 'reasoning') {
            if (key.upArrow) scrollReasoningUp();
            if (key.downArrow) scrollReasoningDown();
            if (input.toLowerCase() === 'r') toggleReasoningView();
            return;
        }

        // Script Output Navigation
        if (bodyView === 'script_output') {
            if (input.toLowerCase() === 'j') navigateScriptErrorDown();
            if (input.toLowerCase() === 'k') navigateScriptErrorUp();
            if (key.return) toggleScriptView();
            if (input.toLowerCase() === 'c') {
                // Copy script output
                const scriptIndex = selectedItemIndex - numFiles;
                const selectedScript = scripts[scriptIndex];
                if (selectedScript) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
                }
            }
            return;
        }

        // Diff View Navigation
        if (bodyView === 'diff') {
            if (input.toLowerCase() === 'x') expandDiff();
            if (input.toLowerCase() === 'd') toggleDiffView();
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleReasoningView();

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.status !== 'FAILED') {
                    toggleFileApproval();
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleDiffView();
            }
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleScriptView();
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            toggleCopyMode();
        }

        // Handle T for single repair and Shift+T for bulk repair
        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = files.some(f => f.status === 'FAILED');
                if (hasFailedFiles) {
                    showBulkRepair();
                }
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    if (file && file.status === 'FAILED') {
                        tryRepairFile();
                    }
                }
            }
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningLinesCount = reasoning.split('\n').length;
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
             const errorLines = outputLines.filter(line =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>{selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`</Text>
                    <Box marginTop={1}>
                        {outputLines.map((line, index) => {
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

        if (bodyView === 'copy_mode') {
            const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
            const options = [
                { key: 'U', label: 'UUID', value: `${hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
                { key: 'M', label: 'Git Message', value: message },
                { key: 'P', label: 'Prompt', value: `${prompt.substring(0, 50)}...` },
                { key: 'R', label: 'Reasoning', value: `${reasoning.substring(0, 50)}...` },
                { key: 'F', label: 'Diff for', value: selectedFile ? selectedFile.path : 'N/A' },
                { key: 'A', label: 'All Diffs', value: `${files.length} files` },
            ];

            return (
                <Box flexDirection="column">
                    <Text>Select item to copy to clipboard:</Text>
                    <Box marginTop={1} />
                    
                    {options.map((option, index) => (
                        <Text key={option.key} bold={index === copyModeSelectedIndex} color={index === copyModeSelectedIndex ? 'cyan' : undefined}>
                            {index === copyModeSelectedIndex ? '> ' : '  '}
                            [{option.key}] {option.label}: {option.value}
                        </Text>
                    ))}
                    
                    <Box marginTop={1} />
                    {copyModeLastCopied && (
                        <Text color="green">✓ Copied {copyModeLastCopied} to clipboard.</Text>
                    )}
                </Box>
            );
        }

        if (bodyView === 'bulk_repair') {
            const failedFiles = files.filter(f => f.status === 'FAILED');
            
            return (
                <Box flexDirection="column">
                    <Text>BULK REPAIR ACTION</Text>
                    <Box marginTop={1} />
                    
                    <Text>The following {failedFiles.length} files failed to apply:</Text>
                    {failedFiles.map(file => (
                        <Text key={file.id}>- {file.path}</Text>
                    ))}
                    
                    <Box marginTop={1} />
                    <Text>How would you like to proceed?</Text>
                    <Box marginTop={1} />
                    
                    <Text>{'> (1) Copy Bulk Re-apply Prompt (for single-shot AI)'}</Text>
                    <Text>  (2) Bulk Change Strategy & Re-apply</Text>
                    <Text>  (3) Handoff to External Agent</Text>
                    <Text>  (4) Bulk Abandon All Failed Files</Text>
                    <Text>  (Esc) Cancel</Text>
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
            return <Text>(↑↓) Scroll · (R/Esc) Back</Text>;
        }
        if (bodyView === 'script_output') {
            return (
                <Text>(↑↓) Nav · (J↓/K↑) Next/Prev Error · (C)opy Output · (Ent/Esc) Back</Text>
            );
        }
        if (bodyView === 'copy_mode') {
            return <Text>(↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A) Hotkeys · (C, Esc) Exit</Text>;
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Choose an option [1-4, Esc]:</Text>;
        }

        // Main footer
        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        const hasFailedFiles = files.some(f => f.status === 'FAILED');
        
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            if (selectedFile && selectedFile.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
            
            // Add repair options for failed files
            if (selectedFile && selectedFile.status === 'FAILED') {
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
        
            actions.push('(Shift+R) Reject All');
        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };


    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text color="cyan">▲ relaycode review{bodyView === 'copy_mode' ? ' · copy mode' : ''}</Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column">
                {/* Transaction summary */}
                <Box>
                    <Text>{hash} · {message}</Text>
                </Box>
                <Box>
                    <Text>(<Text color="green">+{approvedLinesAdded}</Text>/<Text color="red">-{approvedLinesRemoved}</Text>) · {approvedFilesCount}/{numFiles} Files · {duration}s</Text>
                    {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    {scripts.length === 0 && patchStatus === 'PARTIAL_FAILURE' && <Text> · Scripts: SKIPPED</Text>}
                </Box>
                
                <Box marginTop={1} />
                
                {/* Prompt and Reasoning */}
                <Text>(P)rompt ▸ {prompt.substring(0, 50)}...</Text>
                <Text>(R)easoning ({reasoning.split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'}{' '}
                    {(reasoning.split('\n')[0] ?? '').substring(0, 50)}...
                </Text>
                
                <Separator/>
                
                {/* Script Results (if any) */}
                {scripts.length > 0 && (
                    <>
                        {scripts.map((script, index) => (
                            <ScriptItemRow 
                                key={script.command} 
                                script={script}
                                isSelected={selectedItemIndex === numFiles + index}
                                isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                            />
                        ))}
                        <Separator/>
                    </>
                )}
                
                {/* Files Section */}
                <Text>FILES</Text>
                {files.map((file, index) => (
                    <FileItemRow 
                        key={file.id} 
                        file={file} 
                        isSelected={selectedItemIndex === index}
                    />
                ))}
            </Box>
            
            <Separator/>
            
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

## File: src/stores/review.store.ts
````typescript
import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';

// --- Types ---

export type FileStatus = 'FAILED' | 'APPROVED' | 'REJECTED';
export interface FileItem {
    id: string;
    path: string;
    status: FileStatus;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}

export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}

const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

export type BodyView = 'diff' | 'reasoning' | 'script_output' | 'copy_mode' | 'bulk_repair' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';

interface ReviewState {
    // Transaction Info
    hash: string;
    message: string;
    prompt: string;
    reasoning: string;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
    patchStatus: PatchStatus;

    // File & Script Info
    files: FileItem[];
    scripts: ScriptResult[];

    // UI State
    applySteps: ApplyStep[];
    selectedItemIndex: number; // Can be file or script
    bodyView: BodyView;
    isDiffExpanded: boolean;
    
    // Copy Mode State
    copyModeSelectedIndex: number;
    copyModeLastCopied: string | null;
    
    // Reasoning Scroll State
    reasoningScrollIndex: number;
    
    // Script Navigation State
    scriptErrorIndex: number;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        toggleDiffView: () => void;
        toggleReasoningView: () => void;
        toggleScriptView: () => void;
        expandDiff: () => void;
        approve: () => void;
        simulateSuccessScenario: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        simulateFailureScenario: () => void;
        
        // Copy Mode Actions
        toggleCopyMode: () => void;
        moveCopySelectionUp: () => void;
        moveCopySelectionDown: () => void;
        copySelectedItem: () => void;
        copyUUID: () => void;
        copyMessage: () => void;
        copyPrompt: () => void;
        copyReasoning: () => void;
        copyFileDiff: () => void;
        copyAllDiffs: () => void;
        
        // Repair Actions
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => void;
        
        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void,
    };
}

// --- Mock Data ---

const mockFiles: FileItem[] = [
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

const mockScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

const mockReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

// --- Store Implementation ---

export const useReviewStore = create<ReviewState>((set) => ({
    // Transaction Info
    hash: 'e4a7c112',
    message: 'refactor: rename core utility function',
    prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
    reasoning: mockReasoning,
    linesAdded: 18,
    linesRemoved: 5,
    duration: 0.6,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockFiles,
    scripts: [], // Empty for partial failure scenario

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none',
    isDiffExpanded: false,
    
    // Copy Mode State
    copyModeSelectedIndex: 0,
    copyModeLastCopied: null,
    
    // Reasoning Scroll State
    reasoningScrollIndex: 0,
    
    // Script Navigation State
    scriptErrorIndex: 0,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: Math.max(0, state.selectedItemIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: Math.min(state.files.length + state.scripts.length - 1, state.selectedItemIndex + 1),
        })),
        toggleFileApproval: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex >= files.length) return {}; // Not a file
            
            const newFiles = [...files];
            const file = newFiles[selectedItemIndex];
            if (file) {
                if (file.status === 'APPROVED') {
                    file.status = 'REJECTED';
                } else if (file.status === 'REJECTED') {
                    file.status = 'APPROVED';
                }
            }
            return { files: newFiles };
        }),
        rejectAllFiles: () => set(state => {
            const newFiles = state.files.map(file => {
                if (file.status === 'APPROVED') {
                    return { ...file, status: 'REJECTED' as const };
                }
                return file;
            });
            return { files: newFiles };
        }),
        toggleDiffView: () => set(state => {
            const { bodyView } = state;
            if (state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: bodyView === 'diff' ? 'none' : 'diff',
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        toggleReasoningView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'reasoning' ? 'none' : 'reasoning',
            };
        }),
        toggleScriptView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'script_output' ? 'none' : 'script_output',
            };
        }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            
            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();
            
            const updateStep = (id: string, status: ApplyStep['status'], duration?: number, details?: string) => {
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
            };
    
            const addSubstep = (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => {
                 set(state => ({
                    applySteps: state.applySteps.map(s => {
                        if (s.id === parentId) {
                            const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                            return { ...s, substeps: newSubsteps };
                        }
                        return s;
                    }),
                }));
            };
    
            if (scenario === 'success') {
                useReviewStore.getState().actions.simulateSuccessScenario();
                
                updateStep('snapshot', 'active'); await sleep(100);
                updateStep('snapshot', 'done', 0.1);
    
                updateStep('memory', 'active'); await sleep(100);
                addSubstep('memory', { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' });
                await sleep(100);
                addSubstep('memory', { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' });
                updateStep('memory', 'done', 0.3);
    
                updateStep('post-command', 'active'); await sleep(1300);
                addSubstep('post-command', { id: 's3', title: '`bun run test` ... Passed', status: 'done' });
                updateStep('post-command', 'done', 2.3);
    
                updateStep('linter', 'active'); await sleep(1200);
                addSubstep('linter', { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' });
                updateStep('linter', 'done', 1.2);
    
                await sleep(500);
    
            } else { // failure scenario
                useReviewStore.getState().actions.simulateFailureScenario();
                
                updateStep('snapshot', 'active'); await sleep(100);
                updateStep('snapshot', 'done', 0.1);
    
                updateStep('memory', 'active'); await sleep(100);
                addSubstep('memory', { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' });
                await sleep(100);
                addSubstep('memory', { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' });
                await sleep(100);
                addSubstep('memory', { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' });
                updateStep('memory', 'done', 0.5);
    
                await sleep(100);
                updateStep('post-command', 'skipped', undefined, 'Skipped due to patch application failure');
                await sleep(100);
                updateStep('linter', 'skipped', undefined, 'Skipped due to patch application failure');
                
                await sleep(500);
            }
    
            showReviewScreen();
        },
        simulateSuccessScenario: () => set(() => ({
            hash: '4b9d8f03',
            message: 'refactor: simplify clipboard logic',
            prompt: 'Simplify the clipboard logic using an external library...',
            linesAdded: 22,
            linesRemoved: 11,
            duration: 3.9,
            patchStatus: 'SUCCESS' as const,
            files: [
                { 
                    id: '1', 
                    path: 'src/core/clipboard.ts', 
                    status: 'APPROVED' as const, 
                    linesAdded: 15, 
                    linesRemoved: 8, 
                    diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';`, 
                    strategy: 'replace' as const,
                },
                { 
                    id: '2', 
                    path: 'src/utils/shell.ts', 
                    status: 'APPROVED' as const, 
                    linesAdded: 7, 
                    linesRemoved: 3, 
                    diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts`, 
                    strategy: 'standard-diff' as const,
                },
            ],
            scripts: mockScripts,
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        })),
        simulateFailureScenario: () => set(() => ({
            hash: 'e4a7c112',
            message: 'refactor: rename core utility function',
            prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
            linesAdded: 18,
            linesRemoved: 5,
            duration: 0.6,
            patchStatus: 'PARTIAL_FAILURE' as const,
            files: mockFiles,
            scripts: [],
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        })),
        
        // Copy Mode Actions
        toggleCopyMode: () => set(state => ({
            bodyView: state.bodyView === 'copy_mode' ? 'none' : 'copy_mode',
            copyModeSelectedIndex: 0,
            copyModeLastCopied: null,
        })),
        moveCopySelectionUp: () => set(state => ({
            copyModeSelectedIndex: Math.max(0, state.copyModeSelectedIndex - 1),
        })),
        moveCopySelectionDown: () => set(state => ({
            copyModeSelectedIndex: Math.min(5, state.copyModeSelectedIndex + 1), // 6 total options (U,M,P,R,F,A)
        })),
        copySelectedItem: () => set(state => {
            const { copyModeSelectedIndex, hash, message, prompt, reasoning, files, selectedItemIndex } = state;
            let content = '';
            let label = '';
            
            switch (copyModeSelectedIndex) {
                case 0: // UUID
                    content = `${hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
                    label = 'UUID';
                    break;
                case 1: // Git Message
                    content = message;
                    label = 'Git Message';
                    break;
                case 2: // Prompt
                    content = prompt;
                    label = 'Prompt';
                    break;
                case 3: // Reasoning
                    content = reasoning;
                    label = 'Reasoning';
                    break;
                case 4: // Diff for current file
                    if (selectedItemIndex < files.length) {
                        const file = files[selectedItemIndex];
                        if (file) {
                            content = file.diff;
                            label = `Diff for ${file.path}`;
                        }
                    }
                    break;
                case 5: // All Diffs
                    content = files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
                    label = 'All Diffs';
                    break;
            }
            
            // Mock clipboard operation (TUI environment - no real clipboard)
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied ${label}: ${content.substring(0, 100)}...`);
            
            return { copyModeLastCopied: label };
        }),
        copyUUID: () => set(state => {
            const content = `${state.hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03`;
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied UUID: ${content}`);
            return { copyModeLastCopied: 'UUID' };
        }),
        copyMessage: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Git Message: ${state.message}`);
            return { copyModeLastCopied: 'Git Message' };
        }),
        copyPrompt: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Prompt: ${state.prompt.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Prompt' };
        }),
        copyReasoning: () => set(state => {
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied Reasoning: ${state.reasoning.substring(0, 100)}...`);
            return { copyModeLastCopied: 'Reasoning' };
        }),
        copyFileDiff: () => set(state => {
            if (state.selectedItemIndex < state.files.length) {
                const file = state.files[state.selectedItemIndex];
                if (file) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied diff for: ${file.path}`);
                    return { copyModeLastCopied: `Diff for ${file.path}` };
                }
            }
            return {};
        }),
        copyAllDiffs: () => set(state => {
            const content = state.files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n');
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD] Copied all diffs: ${state.files.length} files`);
            return { copyModeLastCopied: 'All Diffs' };
        }),
        
        // Repair Actions
        tryRepairFile: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    // Generate repair prompt and copy to clipboard
                    const repairPrompt = `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${file.error}
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

                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

                    // Mock: Update file status to show it's being repaired
                    const newFiles = [...files];
                    newFiles[selectedItemIndex] = { ...file, status: 'APPROVED' as const, error: undefined, linesAdded: 5, linesRemoved: 2 };

                    return { files: newFiles, copyModeLastCopied: 'Repair prompt copied to clipboard' };
                }
            }
            return {};
        }),
        showBulkRepair: () => set(() => ({
            bodyView: 'bulk_repair' as const,
        })),
        executeBulkRepairOption: (option: number) => set(state => {
            switch (option) {
                case 1: {
                    // Copy Bulk Re-apply Prompt
                    const failedFiles = state.files.filter(f => f.status === 'FAILED');
                    const bulkPrompt = `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: ${file.error}

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

                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files`);
                    return { bodyView: 'none' as const, copyModeLastCopied: 'Bulk repair prompt copied' };
                }
                    
                case 2: {
                    // Bulk Change Strategy & Re-apply
                    // Mock: Change all failed files to 'replace' strategy and mark as successful
                    const newFiles = state.files.map(file => 
                        file.status === 'FAILED' 
                            ? { ...file, status: 'APPROVED' as const, strategy: 'replace' as const, error: undefined, linesAdded: 3, linesRemoved: 1 }
                            : file,
                    );
                    return { files: newFiles, bodyView: 'none' as const };
                }
                    
                case 3: {
                    // Handoff to External Agent
                    // Mock: Generate handoff prompt
                    const failedFiles = state.files.filter(f => f.status === 'FAILED');
                    const handoffPrompt = `# Relaycode Handoff: Failed Patch Application

The following files failed to apply and require manual intervention:

${failedFiles.map(file => `## ${file.path}
- Error: ${file.error}
- Strategy: ${file.strategy}
`).join('\n')}

Please resolve these issues and provide updated patches.`;

                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied handoff prompt for ${failedFiles.length} files`);
                    return { bodyView: 'none' as const, copyModeLastCopied: 'Handoff prompt copied' };
                }
                    
                case 4: {
                    // Bulk Abandon All Failed Files
                    const abandonedFiles = state.files.map(file => 
                        file.status === 'FAILED' 
                            ? { ...file, status: 'REJECTED' as const }
                            : file,
                    );
                    return { files: abandonedFiles, bodyView: 'none' as const };
                }
                    
                default:
                    return { bodyView: 'none' as const };
            }
        }),
        
        // Navigation Actions
        scrollReasoningUp: () => set(state => ({
            reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1),
        })),
        scrollReasoningDown: () => set(state => {
            const maxLines = state.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({
            scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1),
        })),
        navigateScriptErrorDown: () => set(state => {
            const selectedScript = state.scripts[state.selectedItemIndex - state.files.length];
            if (selectedScript && selectedScript.output) {
                const errorLines = selectedScript.output.split('\n').filter(line => 
                    line.includes('Error') || line.includes('Warning'),
                );
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),
    },
}));
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
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-text-input": "^4.0.3",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "clipboardy": "^4.0.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.5.9",
    "@types/react": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "typescript": "^5"
  }
}
````

## File: src/App.tsx
````typescript
import React, { useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import DebugMenu from './components/DebugMenu';

const App = () => {
    const { currentScreen, isDebugMenuOpen, actions } = useAppStore(state => ({
        currentScreen: state.currentScreen,
        isDebugMenuOpen: state.isDebugMenuOpen,
        actions: state.actions,
    }));

    useInput((input, key) => {
        if (key.ctrl && input === 'b') {
            actions.toggleDebugMenu();
        }
    });

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen, isDebugMenuOpen]);

    if (isDebugMenuOpen) {
        return <DebugMenu />;
    }
    
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    if (currentScreen === 'dashboard') {
        return <DashboardScreen />;
    }

    if (currentScreen === 'review') {
        return <ReviewScreen />;
    }

    if (currentScreen === 'review-processing') {
        return <ReviewProcessingScreen />;
    }

    return null;
};

export default App;
````
