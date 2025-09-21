# Directory Structure
```
docs/
  relaycode-tui/
    diff-screen.readme.md
    reason-screen.readme.md
    review-screen.readme.md
src/
  components/
    DashboardScreen.tsx
    GlobalHelpScreen.tsx
    InitializationScreen.tsx
    Separator.tsx
    SplashScreen.tsx
  stores/
    app.store.ts
    dashboard.store.ts
    init.store.ts
  App.tsx
  utils.ts
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

## File: docs/relaycode-tui/review-screen.readme.md
````markdown
# REVIEW-SCREEN.README.MD

## Relaycode TUI: The Stateful Apply & Review Screen

This document specifies the design and behavior of the stateful **Apply & Review Screen**. This screen is the interactive core of the Relaycode workflow, appearing immediately after a patch is detected and applied to the filesystem. It is a command center for analysis, granular control, data extraction, and iterative repair.

### 1. Core Philosophy

The Review screen is not a simple "accept/reject" dialog. It is a strategic workspace designed to give the user complete control and insight over incoming code changes.

-   **Live Feedback Loop:** The screen provides real-time progress during patch application, giving the user confidence that the system is working and transparency into its performance.
-   **Information Supremacy:** The UI provides all necessary context at a glance: high-level stats, the AI's reasoning, post-script results, the patch strategy used per file, and deep-dive diffs. Nothing is hidden.
-   **Granular Control:** The user is empowered to make decisions on a per-file basis. The UI dynamically recalculates and reflects the impact of these decisions in real-time.
-   **Iterative Repair Workflow:** Failure is treated as a temporary state, not an endpoint. The UI provides a powerful suite of tools—from AI-driven prompts to manual overrides—to handle even complex, multi-file failures gracefully.
-   **Data Accessibility:** Every piece of information (prompts, diffs, reasoning, script outputs) is easily copyable, respecting the user's need to use this data in other contexts.

### 2. UI Layout Components

1.  **Header:** `▲ relaycode apply` (during application) transitioning to `▲ relaycode review`.
2.  **Navigator:** The top section, acting as a command-and-control center. It contains the transaction summary, global stats, expandable reasoning/prompt, script results, and the file list.
3.  **Body:** A dynamic viewport that renders detailed content—like diffs or script outputs—based on the user's focus in the Navigator.
4.  **Footer:** The contextual action bar, showing available keyboard shortcuts that change constantly based on the UI's state and focus.

### 3. The State Machine & Workflow

The screen flows through several distinct states, from initial application to final resolution.

---

#### **State 3.1: Live Application (Success Case)**

This is the initial, ephemeral state shown while Relaycode processes a patch that applies cleanly.

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
-   **Transition:** Upon completion, seamlessly transitions into the **Interactive Review** state (see State 3.5).

---

#### **State 3.2: Live Application (Partial Failure Case)**

This state is shown when one or more file operations fail. It demonstrates the **Golden Rule**: post-application scripts are **skipped** if the patch does not apply cleanly.

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
-   **Behavior:** Failed operations are marked with `[!]`. Subsequent steps are marked `(-) SKIPPED` with a clear explanation, preventing false results and saving resources.
-   **Transition:** Immediately transitions to the **Failed Application & Repair Workflow** state.

---

#### **State 3.3: Interactive Review (Multi-File Failure)**

The screen has transitioned from State 3.2 and is now waiting for user intervention.

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
 (↑↓) Nav · (D)iff · (T)ry Repair · (Shift+T) Bulk Repair · (Esc) Reject All
```
-   **Behavior:** The header clearly indicates `MULTIPLE PATCHES FAILED`. The footer presents both single-file `(T)` and `(Shift+T)` bulk repair options.

---

#### **State 3.4: Granular File Rejection & Dynamic Recalculation**

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
 (↑↓) Nav · (Spc) Toggle · (D)iff · (Esc) Reject All
```
-   **Behavior:** The UI instantly recalculates. The file icon changes to `[✗]`, and the global stats in the navigator (`0/0`, `0/3 Files`) reflect the new reality. The footer updates as there are no longer any approved files to commit.

---

#### **State 3.5: Interactive Review (Success Case with Script Results)**

This is the state after a fully successful application (from State 3.1).

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
 (↑↓) Nav · (Spc) Toggle · (D)iff · (Ent) Expand Details · (C)opy · (A)pprove
```
-   **Behavior:** New, expandable sections appear for each post-application script, providing an at-a-glance summary of their results (`✓`/`✗`).

---

#### **State 3.6: Expanding Script Results (Body View)**

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
 (↑↓) Nav · (Enter) Collapse · (J↓/K↑) Next/Prev Error · (C)opy Output
```
-   **Behavior:** The Body viewport is replaced with the detailed, formatted output from the linter. The footer provides contextual navigation hotkeys (`J/K`) to jump between errors.

---

#### **State 3.7: Copy Mode**

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
 (↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A) Hotkeys · (C)opy/Exit
```
-   **Behavior:** A modal overlay appears, allowing the user to copy any piece of metadata related to the transaction to their clipboard with single keystrokes.

### 4. The Advanced Repair Workflow

---

#### **State 4.1: Initiating Bulk Repair**

**Trigger:** From the multi-failure state (3.3), the user presses `(Shift+T)`.

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

#### **Flow 4.2.A: The "Re-apply Prompt" (AI-driven Repair)**

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

#### **Flow 4.2.B: The "Change Strategy" (User-driven Repair)**

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

#### **Flow 4.2.C: The "Handoff" (Agentic Repair)**

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




## The Handoff Prompt: Design & Specification

The "Handoff Prompt" is a specialized, machine-generated text block copied to the user's clipboard during the Handoff workflow. It is not a simple error message; it is a carefully engineered "briefing document" designed to transfer the entire context of a failed Relaycode transaction to an external, conversational AI assistant (like Claude, GPT-4, or an IDE-integrated agent).

### Core Design Principles

1.  **Context is King:** The prompt's primary goal is to eliminate the need for the user to manually explain the situation. It must contain the *goal*, the *plan*, the *partial results*, and the *failures* of the original transaction.
2.  **Clear Separation of Concerns:** The prompt must unambiguously distinguish between what has already been successfully applied to the filesystem and what remains broken. This prevents the external agent from re-doing completed work.
3.  **Actionable & Conversational:** It should not be a passive data dump. The prompt must end with a clear call to action that initiates a collaborative, turn-by-turn repair session.
4.  **Pointer to the Source of Truth:** For maximum fidelity, it must reference the on-disk transaction YAML file. This allows an advanced agent (or the user) to consult the original, detailed plan if the summary is insufficient.

---

### Handoff Prompt Template

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

### Concrete Example

Let's use the multi-file failure scenario from the main `README.MD`.

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

### How It Works in Practice

1.  The user's Relaycode screen shows the multi-file failure.
2.  They choose the `(4) Handoff to External Agent` option.
3.  The text above is copied to their clipboard. Relaycode closes the review and marks the transaction as `HANDOFF`.
4.  The user switches to their preferred chat-based AI tool (e.g., a Claude or GPT-4 chat window).
5.  They paste the entire block of text and send it.
6.  The AI assistant, now fully briefed, responds with something like:
    > "Understood. It looks like we've successfully renamed the function in `src/core/transaction.ts`, but the updates failed in `logger.ts` and `apply.ts`. Which of the failed files would you like to work on first?"

The user is now seamlessly engaged in a productive, context-aware repair session, having spent zero time explaining the problem. This workflow transforms Relaycode from just a patch tool into a powerful orchestrator for more complex, agent-driven development.
````

## File: src/components/DashboardScreen.tsx
````typescript
import React, { useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import chalk from 'chalk';
import Spinner from 'ink-spinner';
import { useDashboardStore, type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return chalk.yellow('?');
        case 'APPLIED': return chalk.green('✓');
        case 'COMMITTED': return chalk.blue('→');
        case 'FAILED': return chalk.red('✗');
        case 'REVERTED': return chalk.gray('↩');
        case 'IN-PROGRESS': return <Spinner type="dots" />;
        default: return ' ';
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
    
    let message = transaction.message;
    if (transaction.status === 'IN-PROGRESS') {
        message = chalk.cyan(message);
    }
    
    const content = (
        <Text>
            {time} {icon} {statusText} <Text color="gray">{transaction.hash}</Text> · {message}
        </Text>
    );

    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
};

const ConfirmationContent = ({ status, transactionsToConfirm }: { status: DashboardStatus, transactionsToConfirm: Transaction[] }) => {
    const isApprove = status === 'CONFIRM_APPROVE';
    const actionText = isApprove ? 'APPROVE' : 'COMMIT';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold color="yellow">{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>The following {transactionsToConfirm.length} transaction(s) will be {isApprove ? 'approved' : 'committed'}:</Text>
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
    const { togglePause, moveSelectionUp, moveSelectionDown, startApproveAll, startCommitAll, confirmAction, cancelAction, toggleHelp } = useDashboardStore(s => s.actions);
    const { exit } = useApp();

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
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) startCommitAll();
    });

    const renderStatusBar = () => {
        let statusText, statusIcon;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = chalk.green('●'); break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = chalk.yellow('||'); break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = chalk.cyan(<Spinner type="dots"/>); break;
            case 'COMMITTING': statusText = 'COMMITTING...'; statusIcon = chalk.cyan(<Spinner type="dots"/>); break;
            default: statusText = 'LISTENING'; statusIcon = chalk.green('●');
        }

        let approvalStr = String(pendingApprovals).padStart(2, '0');
        let commitStr = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = `(${chalk.cyan(<Spinner type="dots"/>)})`;
        if (status === 'COMMITTING') commitStr = `(${chalk.cyan(<Spinner type="dots"/>)})`;
        if (status === 'CONFIRM_APPROVE') approvalStr = chalk.bold.yellow(`┌ ${approvalStr} ┐`);
        if (status === 'CONFIRM_COMMIT') commitStr = chalk.bold.yellow(`┌ ${commitStr} ┐`);
        
        return (
            <Text>
                STATUS: {statusIcon} {statusText} · APPROVALS: {approvalStr} · COMMITS: {commitStr}
            </Text>
        )
    }

    const renderFooter = () => {
        if (isModal) return (
            <Text>
                ({chalk.cyan.bold('Enter')}) Confirm      ({chalk.cyan.bold('Esc')}) Cancel
            </Text>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const pauseAction = status === 'PAUSED' ? `(${chalk.cyan.bold('R')})esume` : `(${chalk.cyan.bold('P')})ause`;;
        return <Text color="gray">
            ({chalk.cyan.bold('↑↓')}) Nav · ({chalk.cyan.bold('Enter')}) Review · ({chalk.cyan.bold('A')})pprove All · ({chalk.cyan.bold('C')})ommit All · {pauseAction} · ({chalk.cyan.bold('Q')})uit
        </Text>
    }
    
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

## File: src/components/GlobalHelpScreen.tsx
````typescript
import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

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
                        <Text>  {chalk.cyan.bold('?')}        Toggle this help screen</Text>
                        <Text>  {chalk.cyan.bold('Q')}        Quit to terminal (from main screens)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">DASHBOARD (watch)</Text>
                        <Text>  {chalk.cyan.bold('↑↓')}       Navigate event stream</Text>
                        <Text>  {chalk.cyan.bold('P')}        Pause / Resume clipboard watcher</Text>
                        <Text>  {chalk.cyan.bold('A')}        Approve all pending transactions</Text>
                        <Text>  {chalk.cyan.bold('C')}        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">REVIEW & DETAILS SCREENS</Text>
                        <Text>  {chalk.cyan.bold('D')}        Show / Collapse file diff</Text>
                        <Text>  {chalk.cyan.bold('R')}        Show / Collapse reasoning steps</Text>
                        <Text>  {chalk.cyan.bold('C')}        Enter / Exit Copy Mode (Details Screen)</Text>
                        <Text>  {chalk.cyan.bold('U')}        Undo / Revert Transaction</Text>
                        <Text>  {chalk.cyan.bold('Space')}    Toggle approval state of a file (Review Screen)</Text>
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text bold>(Press {chalk.cyan.bold('?')} or {chalk.cyan.bold('Esc')} to close)</Text>
            </Box>
        </Box>
    );
};

export default GlobalHelpScreen;
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
				rows: process.stdout.rows || 24
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

## File: src/stores/app.store.ts
````typescript
import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showDashboardScreen: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
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
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING'
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1)
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1)
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

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                // Find pending transactions and mark them as in-progress
                let pendingTxIds: string[] = [];
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
                 let appliedTxIds: string[] = [];
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
        setPhase: (phase: InitPhase) => void;
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
    analyzeTasks: initialAnalyzeTasks,
    projectId: null,
    gitignoreFound: null,
    configureTasks: initialConfigureTasks,
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t)
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t)
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

## File: src/utils.ts
````typescript
// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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

## File: src/components/InitializationScreen.tsx
````typescript
import React, { useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useInitStore, type Task, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import chalk from 'chalk';
import Separator from './Separator';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
	let symbol;
	switch (task.status) {
		case 'pending': symbol = '( )'; break;
		case 'active': symbol = chalk.cyan('(●)'); break;
		case 'done': symbol = chalk.green(doneSymbol); break;
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
    const phase = useInitStore(s => s.phase);
    const analyzeTasks = useInitStore(s => s.analyzeTasks);
    const configureTasks = useInitStore(s => s.configureTasks);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const projectId = useInitStore(s => s.projectId);
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
            if (input.toLowerCase() === 'q') {
                exit();
            } else if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
        }
    });

    useEffect(() => {
        actions.resetInit();
        const runSimulation = async () => {
            actions.setPhase('ANALYZE');
            for (const task of initialAnalyzeTasks) {
                actions.updateAnalyzeTask(task.id, 'active');
                await sleep(800);
                actions.updateAnalyzeTask(task.id, 'done');
            }
            actions.setAnalysisResults(`'relaycode' (from package.json)`, true);
            await sleep(500);

            actions.setPhase('CONFIGURE');
            const configTasksUntilInteractive = initialConfigureTasks.slice(0, 2);
            for (const task of configTasksUntilInteractive) {
                actions.updateConfigureTask(task.id, 'active');
                await sleep(800);
                actions.updateConfigureTask(task.id, 'done');
            }
            await sleep(500);

            actions.setPhase('INTERACTIVE');
        };

        runSimulation();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            const resumeSimulation = async () => {
                actions.setPhase('CONFIGURE');
                const lastTask = initialConfigureTasks[2];
                if (lastTask) {
                    actions.updateConfigureTask(lastTask.id, 'active');
                    await sleep(800);
                    actions.updateConfigureTask(lastTask.id, 'done');
                    await sleep(500);

                    actions.setPhase('FINALIZE');
                }
            };
            resumeSimulation();
        }
    }, [interactiveChoice, phase, actions]);

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
            <Text>  {chalk.green('✓')} Project ID: {projectId}</Text>
            <Text>  {chalk.green('✓')} Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text>{chalk.cyan('>')} The .relay/ directory is usually ignored by git.</Text>
                    <Text>  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = interactiveChoice === 'share'
            ? ".relay/ directory initialized. It will be committed to git."
            : ".relay/ directory initialized and added to .gitignore.";
        const stateSubText = interactiveChoice === 'share'
            ? undefined
            : "Local transaction history will be stored here.";
        
        return (
            <Box flexDirection="column">
                <Text bold color="green"> SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Config:   relay.config.json created.</Text>
                        <Text color="gray" italic>          › Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} State:    {stateText}</Text>
                        {stateSubText && <Text color="gray" italic>          › {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Prompt:   System prompt generated at .relay/prompts/system-prompt.md.</Text>
                        <Text color="gray" italic>          › Copied to clipboard. Paste into your AI's custom instructions.</Text>
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
    
    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>({chalk.cyan.bold('Enter')}) No, ignore it (default)      ({chalk.cyan.bold('S')}) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>({chalk.cyan.bold('W')})atch for Patches · ({chalk.cyan.bold('L')})View Logs · ({chalk.cyan.bold('Q')})uit</Text>; break;
    }

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

## File: src/components/SplashScreen.tsx
````typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import chalk from 'chalk';
import Separator from './Separator';

const SplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState(5);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput(() => {
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
                <Text italic color="gray">Built by Arman and contributors · {chalk.underline('https://relay.noca.pro')}</Text>
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
            <Text>If you love this workflow, check out {chalk.underline('https://www.noca.pro')} for the full</Text>
            <Text>web app with repo-wide visual context, history, and rollback.</Text>
            <Text>{chalk.cyan.bold('(V)')}isit noca.pro</Text>
            <Separator />
            <Text>Follow {chalk.cyan.bold('(X)')} · Join {chalk.cyan.bold('(D)')}iscord · Star on {chalk.cyan.bold('(G)')}itHub</Text>
            <Separator />
            <Text>Loading... {countdown} ({chalk.gray('Press any key to skip')})</Text>
        </Box>
    );
};

export default SplashScreen;
````

## File: src/App.tsx
````typescript
import React, { useEffect } from 'react';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        console.clear();
    }, [currentScreen]);
    
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    if (currentScreen === 'dashboard') {
        return <DashboardScreen />;
    }

    return null;
};

export default App;
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
    console.log('Interactive terminal required. Please run in a terminal that supports raw input mode.');
    process.exit(1);
}
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
    "dev": "bun run --watch index.tsx"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-text-input": "^4.0.3",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "chalk": "^5.3.0",
    "clipboardy": "^4.0.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/react": "^18.2.22",
    "@types/node": "^20.5.9",
    "typescript": "^5"
  }
}
````
