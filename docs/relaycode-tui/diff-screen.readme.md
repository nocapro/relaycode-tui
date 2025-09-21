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
