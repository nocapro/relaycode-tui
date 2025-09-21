Of course. Here is the final, comprehensive `TRANSACTION-DETAIL-SCREEN.README.MD`. It is structured to be a "show, don't tell" specification, using full-screen mockups to disclose every major state and interaction. This document is designed to be the single source of truth for implementing this feature.

***

# TRANSACTION-DETAIL-SCREEN.README.MD

## Relaycode TUI: The Transaction Detail Screen Specification

This document specifies the final design and behavior of the stateful Transaction Detail screen. This screen serves as the single source of truth for a past transaction, providing a deep, forensic analysis view. It is engineered for complete context via progressive disclosure, interactive data extraction, and direct, safe actions.

### 1. Anatomy of the Screen

The interface is divided into four consistent, logical components.

```
 ▲ relaycode transaction details                                    (Header)
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  fix: add missing error handling
  Date: 2023-10-27 14:32:15 · Status: Committed           (Navigator - Part A)
  Stats: 3 Files · +25 lines, -8 lines

 > ▸ (P)rompt
   ▸ (R)easoning (3 steps)                                  (Navigator - Part B)
   ▸ (F)iles (3)
 ──────────────────────────────────────────────────────────────────────────────

  (The Body is a dynamic viewport that renders content based on     (Body)
   the user's focus and actions within the Navigator.)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (C)opy Mode · (U)ndo · (Q)uit         (Footer)
```

1.  **Header:** Static branding, confirming the user's location.
2.  **Navigator:** The top half of the screen and the primary control surface. It contains static metadata (Part A) and a navigable list of expandable sections (Part B).
3.  **Body:** A dynamic viewport that renders detailed content (like diffs or full text) based on the user's selection in the Navigator.
4.  **Footer:** The contextual action bar, which updates to show only the currently available keyboard shortcuts.

---

### 2. The User Journey: A State-by-State Disclosure

This section illustrates the screen's behavior through a typical user interaction flow.

#### 2.1. Initial State: The Collapsed Overview

This is the default view upon selecting a transaction. It provides a complete, scannable summary with all detailed sections collapsed.

**Behavior:**
*   The initial focus is on the navigable sections (`(P)rompt`, `(R)easoning`, `(F)iles`).
*   The Body is empty, prompting the user to expand a section for more details.
*   The `▸` symbol indicates a collapsed section.

```
 ▲ relaycode transaction details
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  fix: add missing error handling
  Date: 2023-10-27 14:32:15 · Status: Committed
  Stats: 3 Files · +25 lines, -8 lines

 > ▸ (P)rompt
   ▸ (R)easoning (3 steps)
   ▸ (F)iles (3)

 ──────────────────────────────────────────────────────────────────────────────

  (Press → to expand a section and view its contents)


 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (C)opy Mode · (U)ndo · (Q)uit
```

#### 2.2. Expanding a Section: Viewing Reasoning

The user wants to read the full reasoning behind the transaction.

**Trigger:** The user navigates to `▸ (R)easoning` and presses `(→)`.

**Behavior:**
*   The `▸` icon for Reasoning flips to `▾`, indicating it is expanded.
*   The Body renders the full, formatted text of the reasoning.
*   The Footer updates to show that `(←)` will now collapse the section and that `(↑↓)` can be used to scroll if the content overflows.

```
 ▲ relaycode transaction details
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  fix: add missing error handling
  Date: 2023-10-27 14:32:15 · Status: Committed
  Stats: 3 Files · +25 lines, -8 lines

   ▸ (P)rompt
 > ▾ (R)easoning (3 steps)
   ▸ (F)iles (3)

 ──────────────────────────────────────────────────────────────────────────────
  REASONING

  1. The primary goal was to make the rollback functionality in `restoreSnapshot`
     more robust. The previous implementation used a simple for-loop which would
     halt on the first error, leaving the project in a partially restored state.

  2. I opted for a `Promise.all` approach to run file restorations in parallel.
     This improves performance slightly but, more importantly, ensures all
     restoration attempts are completed, even if some fail.

  3. An `restoreErrors` array was introduced to collect any exceptions that occur
     during the process. If this array is not empty after the `Promise.all`
     completes, a comprehensive error is thrown, informing the user exactly which
     files failed to restore. This provides much better diagnostics.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav/Scroll · (←) Collapse · (C)opy Mode · (U)ndo · (Q)uit
```

#### 2.3. Hierarchical Drill-Down: Inspecting File Diffs

This demonstrates the powerful two-level navigation for inspecting code changes.

**Step A: Expand the File List**

**Trigger:** The user navigates to `▸ (F)iles (3)` and presses `(→)`.

**Behavior:**
*   The `(F)iles` section expands *within the Navigator*, revealing an interactive list of affected files.
*   Focus shifts to this new inner list. `[MOD]`, `[ADD]`, etc., denote the change type.

```
 ▲ relaycode transaction details
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  fix: add missing error handling
  Date: 2023-10-27 14:32:15 · Status: Committed
  Stats: 3 Files · +25 lines, -8 lines

   ▸ (P)rompt
   ▸ (R)easoning (3 steps)
   ▾ (F)iles (3)
     > [MOD] src/core/transaction.ts (+18/-5)
       [MOD] src/utils/logger.ts    (+7/-3)
       [DEL] src/utils/old-helper.ts

 ──────────────────────────────────────────────────────────────────────────────

  (Select a file and press → to view the diff)


 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav Files · (→) View Diff · (←) Back to Sections · (C)opy Mode · (Q)uit
```

**Step B: Display the Diff**

**Trigger:** With `src/core/transaction.ts` selected, the user presses `(→)` again.

**Behavior:**
*   The Body renders a clean, syntax-highlighted diff for the selected file.
*   Navigating with `(↑↓)` in the file list will now instantly update the Body with the diff for the newly selected file.
*   Pressing `(←)` will clear the Body and return focus to the file list itself (the state in Step A).

```
 ▲ relaycode transaction details
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  fix: add missing error handling
  Date: 2023-10-27 14:32:15 · Status: Committed
  Stats: 3 Files · +25 lines, -8 lines

   ▸ (P)rompt
   ▸ (R)easoning (3 steps)
   ▾ (F)iles (3)
     > [MOD] src/core/transaction.ts (+18/-5)
       [MOD] src/utils/logger.ts    (+7/-3)
       [DEL] src/utils/old-helper.ts

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
+          if (content === null) { ... }
+        } catch (error) {
+          restoreErrors.push({ path: filePath, error });
+        }
+    }));
+
+    if (restoreErrors.length > 0) { ... }
   }

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav Files · (←) Back to Files · (C)opy Mode · (U)ndo · (Q)uit
```

---

### 3. Advanced Modes & Actions

#### 3.1. Advanced Copy Mode

This mode transforms the screen into a powerful data extraction tool.

**Trigger:** The user presses `(C)` from any non-modal view.

**Behavior:**
*   The entire screen is replaced by a multi-select checklist interface.
*   The user can navigate `(↑↓)`, toggle items with `(Spc)`, and press `(Enter)` to copy a formatted aggregation of the selected data to the clipboard.
*   A confirmation message provides immediate feedback. Pressing `(C)` or `(Esc)` exits the mode.

```
 ▲ relaycode details · copy mode
 ──────────────────────────────────────────────────────────────────────────────
 Select data to copy from transaction e4a7c112 (use Space to toggle):

 > [x] (M) Git Message
   [ ] (P) Prompt
   [x] (R) Reasoning
   [ ] (A) All Diffs (3 files)
   [ ] (F) Diff for: src/core/transaction.ts
   [ ] (U) UUID
   [ ] (Y) Full YAML representation

 ──────────────────────────────────────────────────────────────────────────────
  ✓ Copied 2 items to clipboard.


 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Spc) Toggle · (Enter) Copy Selected · (C)opy/Exit
```

#### 3.2. Revert Confirmation Modal

This action initiates a safe, non-destructive revert of the transaction.

**Trigger:** The user presses `(U)` from any primary view.

**Behavior:**
*   A modal overlay appears, halting all other interactions to prevent accidental reverts.
*   The text clearly explains that this creates a *new* transaction, preserving history.
*   The footer simplifies to the only two possible actions: Confirm or Cancel.

```
 ▲ relaycode transaction details
 ──────────────────────────────────────────────────────────────────────────────
  UUID: e4a7c112-a8b3-4f2c-9d1e-8a7c1b9d8f03
  Git:  ┌──────────────────────────────────────────────────────────┐
  Date: │                 REVERT THIS TRANSACTION?                 │
        │                                                          │
  Stats:│ This will create a NEW transaction that reverses all     │
        │ changes made by e4a7c112. The original transaction       │
 ───────│ record will be preserved.                                │
        │                                                          │
   ▸ (P)│                       Are you sure?                      │
   ▸ (R)└──────────────────────────────────────────────────────────┘
   ▾ (F)iles (3)
     > [MOD] src/core/transaction.ts (+18/-5)
       [MOD] src/utils/logger.ts    (+7/-3)
       [DEL] src/utils/old-helper.ts

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Confirm Revert      (Esc) Cancel
```

---

### 4. UI Legend & Keybindings

| Symbol | Meaning                 | Context       | Description                                  |
| :----- | :---------------------- | :------------ | :------------------------------------------- |
| `>`    | Focused/Selected Item   | Universal     | The currently active line for navigation.    |
| `▸`    | Collapsed Section       | Navigator     | Indicates a section can be expanded with `→`. |
| `▾`    | Expanded Section        | Navigator     | Indicates a section can be collapsed with `←`.|
| `[MOD]`| Modified File           | File List     | The file was modified.                       |
| `[ADD]`| Added File              | File List     | The file was newly created.                  |
| `[DEL]`| Deleted File            | File List     | The file was deleted.                        |
| `[REN]`| Renamed File            | File List     | The file was renamed.                        |

| Key(s)       | Action             | Context                                    |
| :----------- | :----------------- | :----------------------------------------- |
| `↑` `↓`      | Navigate           | Universal                                  |
| `→`          | Expand / Drill Down| Navigator (Sections or Files)              |
| `←`          | Collapse / Go Back | Navigator (Expanded Sections or Files)     |
| `(C)`        | Enter/Exit Copy Mode | Primary Views & Copy Mode                  |
| `(U)`        | Initiate Revert    | Primary Views                              |
| `(Q)` `Esc`  | Quit / Cancel      | Universal                                  |
| `(Enter)`    | Confirm Action     | Copy Mode (to copy), Revert Modal (to revert) |
| `(Spc)`      | Toggle Selection   | Copy Mode                                  |
