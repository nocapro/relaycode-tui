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
  Filter: (none) · Showing 1-10 of 42 · Stats: 6 Cmt, 1 H/O, 2 Rev

 > ▸ ✓ Committed · e4a7c112 · 2023-10-27 · fix: add missing error handling
   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ▸ → Handoff   · 8a3f21b8 · 2023-10-26 · feat: implement new dashboard UI
   ▸ ↩ Reverted  · b2c9e04d · 2023-10-26 · style: update button component
   ▸ ✗ Reverted  · 9c2e1a05 · 2023-10-25 · docs: update readme with TUI spec
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (Spc) Select · (Ent) Details · (F)ilter · (C)opy · (B)ulk
```

#### **State 2.2: Level 1 Drill-Down - The Content Overview**

Pressing `(→)` on the selected transaction expands it in-place, revealing its core components: Commit Message, Prompt, Reasoning, and Files. The icon changes to `▾` and the footer updates to include the `(←) Collapse` action.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 · Stats: 6 Cmt, 1 H/O, 2 Rev

 > ▾ ✓ Committed · e4a7c112 · fix: add missing error handling
       ▸ Commit Message
       ▸ Prompt
       ▸ Reasoning
       ▸ Files (3)

   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ▸ → Handoff   · 8a3f21b8 · 2023-10-26 · feat: implement new dashboard UI
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (←) Collapse · (→) Expand · (Ent) Details · (F)ilter · (C)opy
```

#### **State 2.3: Level 2 Drill-Down - In-place Content Preview**

With the transaction expanded, the user can navigate `(↓)` to a content item like `Reasoning` and press `(→)` again. This performs a second-level expansion, showing the full text content directly within the list.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 · Stats: 6 Cmt, 1 H/O, 2 Rev

 > ▾ ✓ Committed · e4a7c112 · fix: add missing error handling
       ▸ Commit Message
       ▸ Prompt
       ▾ Reasoning
           1. Identified a potential uncaught exception in the `restoreSnapshot`
              function if a file operation fails midway through a loop...
           2. Wrapped the file restoration loop in a `Promise.all` for
              robustness and comprehensive error collection.
       ▸ Files (3)

   ▸ ✓ Committed · 4b9d8f03 · 2023-10-27 · refactor: simplify clipboard logic
   ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (←→) Collapse/Expand · (Ent) Details · (F)ilter · (C)opy
```

#### **State 2.4: Level 3 Drill-Down - The In-place Diff Preview**

By navigating to and expanding the `Files` item, the user can then select a specific file and press `(→)` again. This performs a third-level expansion, showing a truncated preview of that file's diff directly within the list.

```
 ▲ relaycode transaction history
 ──────────────────────────────────────────────────────────────────────────────
  Filter: (none) · Showing 1-10 of 42 · Stats: 6 Cmt, 1 H/O, 2 Rev

 > ▾ ✓ Committed · e4a7c112 · fix: add missing error handling
       ...
       ▾ Files (3)
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

#### **State 2.5: Filtering Mode - Querying the History**

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
  Filter: logger.ts status:committed · Showing 2 of 42 · Stats: 6 Cmt, 1 H/O, 2 Rev

 > ▸ ✓ Committed · e4a7c112 · 2023-10-27 · fix: add missing error handling
   ▸ ✓ Committed · 1a2b3c4d · 2023-10-22 · feat: introduce structured logging
 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→) Expand · (Ent) Details · (F)ilter · (C)opy · (B)ulk Actions
```

#### **State 2.6: Advanced Copy Mode - Aggregating Data for Export**

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

#### **State 2.7: Bulk Actions Mode - Managing History**

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
