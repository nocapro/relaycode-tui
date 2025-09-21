# DASHBOARD-SCREEN.README.MD

## Relaycode TUI: The Stateful Dashboard Screen

This document specifies the design and behavior of the stateful Dashboard screen for Relaycode, triggered by the `relay watch` command. This is the primary, long-running interface for the application.

### 1. Core Philosophy

The Dashboard is the user's "Heads-Up Display" (HUD) for all Relaycode activity. It must be more than a simple log stream; it is an interactive and stateful command center.

-   **High Information Density:** The screen is designed to present the most critical information—system status, pending actions, and recent history—in a compact, instantly scannable format.
-   **Live & Dynamic:** Every part of the UI reflects the real-time state of the application. The status header updates, the event stream grows, and action counts change as events occur, even without user interaction.
-   **Keyboard-First Command Center:** All primary user actions (reviewing, approving, committing, pausing) are accessible via single-keystroke shortcuts, making the workflow incredibly fast for power users.
-   **Clear State Transitions:** The UI provides unambiguous feedback for its state, whether it's actively listening, paused, or in the middle of a blocking operation.

### 2. UI Layout Components

The screen maintains a consistent single-column layout, divided into three key regions:

1.  **Header:** `▲ relaycode dashboard` - Static branding.
2.  **Status Bar:** A high-level summary of the system's current state, including the watcher status and counts of pending approvals and commits.
3.  **Body / Event Stream:** The main content area. This is a reverse-chronological list of the most recent transaction events. It is navigable and serves as the entry point for drilling down into specific transactions.
4.  **Footer / Action Bar:** A single line at the bottom that dynamically displays the available keyboard shortcuts for the current state.

### 3. The State Machine & Visuals

The Dashboard exists in several distinct states, each with a unique visual representation and set of available actions.

---

#### **State 3.1: Active & Listening (Default State)**

This is the primary operational state. The system is actively monitoring the clipboard for new patches.

```
 ▲ relaycode dashboard
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: 01 · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ? PENDING   e4a7c112 · fix: add missing error handling
    -2m    ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    -5m    → COMMITTED 8a3f21b8 · feat: implement new dashboard UI
    -8m    ↩ REVERTED  b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ✗ FAILED    9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   → COMMITTED c7d6b5e0 · docs: update readme with TUI spec

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Review · (A)pprove All · (C)ommit All · (P)ause · (Q)uit
```
-   **Behavior:** The Event Stream updates in real-time as new patches are detected and processed. The `APPROVALS` and `COMMITS` counters increment or decrement accordingly.
-   **Interactions:** All primary actions are available. `(Enter)` on a `PENDING` item transitions to the **Apply & Review Screen**. `(Enter)` on any other item transitions to the **Transaction Details Screen**.

---

#### **State 3.2: Paused**

The user has intentionally suspended clipboard monitoring. This is a clear, deliberate state.

**Trigger:** User presses `(P)`.

```
 ▲ relaycode dashboard
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: || PAUSED · APPROVALS: 01 · COMMITS: 03

  EVENT STREAM ...

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Review · (R)esume · (A)pprove All · (C)ommit All · (Q)uit
```
-   **Behavior:** The `LISTENING` status and `●` icon change to `PAUSED` and `||`. No new events will appear in the stream.
-   **Footer Changes:** The `(P)ause` action in the footer is replaced with `(R)esume`. All other management actions remain available. Pressing `(R)` returns to the **Active & Listening** state.

---

#### **State 3.3: Confirmation Overlay (Blocking Modal)**

To prevent accidental bulk actions, a modal confirmation overlay appears.

**Trigger:** User presses `(A)` to Approve All or `(C)` to Commit All.

```
 ▲ relaycode dashboard
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: ┌ 01 ┐ · COMMITS: 03
                                 └────┘
  APPROVE ALL PENDING TRANSACTIONS?

  The following transaction will be approved:
  - e4a7c112: fix: add missing error handling

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Confirm      (Esc) Cancel
 ──────────────────────────────────────────────────────────────────────────────
  EVENT STREAM ... (pushed down but visible)
```
-   **Behavior:** This is a blocking modal. The main UI is frozen. The overlay clearly states the action and its scope. A subtle box `┌ ┐` highlights the relevant counter in the status bar.
-   **Footer Changes:** The action bar is reduced to only `Confirm` and `Cancel`.
-   **Transition:** `(Enter)` proceeds to the **In-Progress** state. `(Esc)` dismisses the overlay and returns to the previous state.

---

#### **State 3.4: In-Progress Operation**

Provides critical feedback while a potentially long-running background task is executing.

**Trigger:** User confirms an overlay or uses a force hotkey (e.g., `Shift+A`).

```
 ▲ relaycode dashboard
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● APPROVING... · APPROVALS: (●) · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ● Approving... e4a7c112 · fix: add missing error handling
    -2m    ✓ APPLIED      4b9d8f03 · refactor: simplify clipboard logic
    ...

 ──────────────────────────────────────────────────────────────────────────────
 Processing... This may take a moment.
```
-   **Behavior:** The main `STATUS` indicator changes to reflect the action (e.g., `APPROVING...`, `COMMITTING...`). The relevant counter is replaced with a spinner `(●)`. In the event stream, the status icon for the affected items also changes to a spinner. The footer displays a simple, non-interactive "Processing..." message.
-   **Transition:** Upon completion, the screen returns to the **Active & Listening** state, with the counters and event stream updated to reflect the results of the operation.

### 4. Event Stream Iconography

The icons are critical for at-a-glance comprehension of the transaction history.

| Symbol | Status | Meaning |
| :--- | :--- | :--- |
| `?` | **PENDING** | Patch applied, awaiting user approval. |
| `✓` | **APPLIED** | Transaction approved and committed to local state. |
| `→` | **COMMITTED** | Transaction has been included in a git commit. |
| `✗` | **FAILED** | Patch failed to apply or was rejected by the user. |
| `↩` | **REVERTED** | This is a revert transaction, undoing a previous one. |
| `●` | **IN-PROGRESS** | An operation (e.g., approving, committing) is currently running on this item. |

### 5. Implementation Notes

-   **State Management:** The TUI must be driven by a central state object. Any change to this state (e.g., `status: 'listening'` to `status: 'paused'`) should trigger a re-render of the necessary components (Status Bar, Footer).
-   **Event Bus:** The core logic (clipboard watcher, patch processor) should emit events (e.g., `new_patch_detected`, `transaction_approved`). The Dashboard UI subscribes to these events to update its state and re-render.
-   **Component-based Rendering:** The screen should be thought of as components (`StatusBar`, `EventStream`, `ActionBar`). When state changes, only the affected components need to be redrawn to prevent flickering and improve performance.
-   **Force Hotkeys:** `Shift+A` (Force Approve) and `Shift+C` (Force Commit) should bypass the **Confirmation Overlay** and go directly to the **In-Progress Operation** state. This provides a valuable shortcut for expert users.
