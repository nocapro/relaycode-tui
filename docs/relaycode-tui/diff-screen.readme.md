# DIFF-SCREEN.README.MD

## Relaycode TUI: The Interactive Diff View Component

This document specifies the design and behavior of the interactive Diff View. This is not a standalone screen, but a stateful **component** that is rendered within the Body of parent screens like the **Review Screen**.

### 1. Core Philosophy

A diff is the most critical piece of evidence in a code change. This component's philosophy is to present that evidence with absolute **clarity, context, and control**.

-   **Clarity:** The diff must be clean, readable, and feature syntax highlighting to help the user instantly parse the changes.
-   **Context:** The user must never be confused about *which* file they are viewing. A persistent header provides this crucial context.
-   **Control:** A raw text dump is insufficient for large changes. The user is given powerful keyboard tools to navigate, expand, and collapse the diff, allowing them to focus on what matters.

### 2. Technical Implementation

#### Component Architecture

-   **Integration:** Built into `ReviewScreen.tsx` as a body view (lines 190-203)
-   **Component:** Uses `ContentView` component with `highlight="diff"` for syntax highlighting
-   **State Management:** Part of the Review Screen's state management system
-   **Navigation:** Accessible via `(D)` key or Enter when file is selected

#### Key Features

- **Syntax Highlighting:** Green for additions, red for removals, cyan for diff headers
- **File Context:** Shows the file path being viewed in the header
- **Expandable Content:** Large diffs can be expanded/collapsed for better readability
- **Scrolling Support:** PgUp/PgDn navigation through large diffs
- **Hunk Navigation:** Jump between different change blocks within the same file

### 3. Context of Use

The Diff View is activated and rendered within the Body of the Review Screen when the user requests to see the changes for a specific file, typically by pressing `(D)` or selecting a file and pressing Enter. It replaces any previous content in the Body.

### 4. UI Layout & Components

1.  **Header:** A single, static line providing the context of the file being viewed. Example: `DIFF: src/core/transaction.ts`.
2.  **Content Area:** The main rendering surface for the diff itself. It uses standard `+` (additions) and `-` (deletions) prefixes and supports color and syntax highlighting.
3.  **Truncation Hint (Conditional):** For large diffs, a line indicating that content is hidden is displayed. Example: `... 23 lines hidden ...`.

### 5. States & Interactions

The Diff View has several states, primarily related to content display and navigation.

#### **State 5.1: Default / Collapsed View (for large diffs)**

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

#### **State 5.2: Expanded View**

**Trigger:** User presses `(X)`.

The full, unabridged diff is rendered in the Content Area. The truncation hint is removed. The footer might update to show `(X)ollapse Diff`.

#### **State 5.3: Hunk Navigation (The "Advanced" Interaction)**

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

#### **State 5.4: Syntax Highlighting**

The Diff View uses color-coded syntax highlighting to make changes more readable:

```
 ... (Parent Screen Navigator) ...
 ──────────────────────────────────────────────────────────────────────────────
  DIFF: src/core/transaction.ts

  @@ -45,7 +45,9 @@ export const restoreSnapshot = async (
      snapshot: FileSnapshot,
      cwd: string
  ): Promise<void> => {
-    for (const [filePath, content] of entries) {
-        if (content === null) {
-            await deleteFile(filePath, cwd);
-        }
+    const restoreErrors: { path: string, error: unknown }[] = [];
+
+    await Promise.all(entries.map(async ([filePath, content]) => {
+        try {
+            if (content === null) {
+                await deleteFile(filePath, cwd);
+            }
+            await writeFile(filePath, content, cwd);
+        } catch (error) {
+            restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) {
+        console.error('Restore errors:', restoreErrors);
+    }
  }
```
-   **Color Coding:**
    *   `@@ -45,7 +45,9 @@`: Cyan (diff headers)
    *   `-    for (const [filePath, content] of entries) {`: Red (removals)
    *   `+    const restoreErrors: { path: string, error: unknown }[] = [];`: Green (additions)
    *   Unchanged lines: Default terminal color

### 6. Implementation Details

#### ContentView Integration

```typescript
// Implementation details from ReviewScreen.tsx
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
```

#### Key Features

- **Syntax Highlighting:** The `highlight="diff"` prop enables specialized diff coloring
- **File Context:** The title includes the full file path for clarity
- **Expandable Content:** The `isExpanded` prop controls content visibility
- **Scrolling:** The `scrollIndex` manages the current viewing position
- **Dynamic Content:** Diffs are rendered based on the currently selected file

### 7. Navigation Controls

#### Keyboard Shortcuts

- **D:** Toggle diff view (expand/collapse)
- **X:** Expand/collapse diff content
- **↑/↓:** Navigate between files when in diff view
- **PgUp/PgDn:** Scroll through large diffs
- **J/K:** Navigate between hunks (change blocks) in expanded diffs
- **Esc:** Collapse view and return to navigator
- **C:** Enter copy mode (when view is active)

#### Footer Actions

When diff view is active, the footer shows:
- **Navigation:** `(↑↓) File Nav`
- **Content Controls:** `(X)pand Diff` or `(X)ollapse Diff`
- **Hunk Navigation:** `(J↓/K↑) Hunk Nav` (when expanded)
- **View Controls:** `(D)Collapse View`

### 8. Integration Points

#### Store Integration

- **File Data:** Retrieved from transaction store and file list
- **View State:** Managed through Review Screen's body view state
- **Scroll Position:** Tracked in content scroll index
- **Selection State:** Current file selection determines which diff to show

#### Component Integration

- **ContentView:** Reusable component that handles diff rendering and scrolling
- **Review Screen:** Parent screen that manages the diff view state
- **ActionFooter:** Provides contextual actions based on active view
- **FileItemRow:** Shows file status and enables file selection

#### Data Flow

1. **User Action:** Press `D` or select a file and press Enter
2. **State Update:** Review screen updates body view to diff
3. **File Selection:** Current file determines which diff content to display
4. **Content Render:** ContentView renders diff with syntax highlighting
5. **Footer Update:** Action footer shows diff-specific actions

### 9. Performance Considerations

- **Virtual Scrolling:** Large diffs are handled with efficient scrolling mechanisms
- **Lazy Loading:** Diff content is only processed when needed
- **Memory Management:** Cleanup of unused diff content
- **Rendering Optimization:** Only visible portion of diff is rendered
- **Syntax Highlighting:** Efficient highlighting algorithm for large diffs

### 10. Accessibility Features

- **Keyboard Navigation:** Full keyboard support for all interactions
- **Visual Feedback:** Clear indicators for active view and scroll position
- **Color Coding:** Consistent color scheme for additions/removals
- **Context Awareness:** Always shows which file is being viewed
- **Expandable Content:** Allows users to control information density

### 11. Error Handling

#### Missing Files

- Handles cases where selected file doesn't exist or has no diff content
- Provides informative messages when diff cannot be displayed
- Maintains UI consistency even with missing data

#### Malformed Diffs

- Gracefully handles corrupted or malformed diff content
- Provides fallback rendering for complex diff structures
- Maintains scrollability and navigation even with errors

#### Large Content

- Efficiently handles extremely large diff files
- Provides progress feedback when processing large diffs
- Maintains responsive UI even with substantial content

### 12. Advanced Features

#### Hunk Navigation

- **Jump Navigation:** Quick navigation between change blocks
- **Visual Indicators:** Clear marking of current hunk
- **Context Preservation:** Maintains surrounding context when jumping
- **Multi-hunk Support:** Handles files with many separate changes

#### Syntax Highlighting

- **Language Awareness:** Context-aware highlighting based on file type
- **Change Emphasis:** Clear visual distinction between additions and removals
- **Line Numbers:** Optional line number display for reference
- **Search Integration:** Ability to search within diff content

#### Copy Integration

- **Selective Copy:** Copy specific lines or hunks from diff
- **Format Options:** Copy in various formats (unified, context, etc.)
- **Metadata Inclusion:** Option to include file path and change statistics
- **Clipboard Integration:** Seamless integration with system clipboard

### 13. Future Enhancements

#### Potential Improvements

- **Side-by-Side View:** Option to show original and modified versions side by side
- **Word-level Diffing:** More granular change highlighting within lines
- **Inline Comments:** Allow users to add comments to specific lines
- **Diff Statistics:** Show detailed metrics about the changes (complexity, risk, etc.)

#### Extension Points

- **Custom Highlighters:** Support for language-specific syntax highlighting
- **Diff Algorithms:** Support for different diff algorithms and strategies
- **Export Options:** Export diffs in various formats
- **Integration Hooks:** Integration with external diff tools and services