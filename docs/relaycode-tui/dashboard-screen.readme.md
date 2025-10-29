# DASHBOARD-SCREEN.README.MD

## Relaycode TUI: The Stateful Dashboard Screen

This document specifies the design and behavior of the stateful Dashboard screen for Relaycode, triggered by the `relay watch` command. This is the primary, long-running interface for the application.

### 1. Core Philosophy

The Dashboard is the user's "Heads-Up Display" (HUD) for all Relaycode activity. It has evolved from a simple log stream to a sophisticated, interactive command center.

-   **High Information Density:** The screen presents critical information—system status, pending actions, recent history, and context—in a compact, instantly scannable format.
-   **Live & Dynamic:** Every part of the UI reflects the real-time state of the application. The status header updates, the event stream grows, and action counts change as events occur.
-   **Keyboard-First Command Center:** All primary user actions (reviewing, approving, committing, pausing, viewing logs) are accessible via single-keystroke shortcuts.
-   **Clear State Transitions:** The UI provides unambiguous feedback for its state, whether it's actively listening, paused, or in the middle of a blocking operation.
-   **Visual Feedback:** Rich animations, status indicators, and color coding provide immediate feedback for all user interactions and system states.
-   **Context Awareness:** The dashboard displays contextual information like current directory and git branch for better situational awareness.
-   **Smart Scrolling:** Efficient viewport management with smooth navigation through large transaction histories.

### 2. UI Layout Components

The screen maintains a consistent single-column layout, divided into four key regions:

1.  **Header:** `▲ relaycode dashboard` - Static branding with context information.
2.  **Status Bar:** A high-level summary of the system's current state, including watcher status, approval counts, and commit counts with visual indicators.
3.  **Body / Event Stream:** The main content area. This is a reverse-chronological list of recent transaction events with expandable details, smooth animations, and visual feedback.
4.  **Footer / Action Bar:** A dynamic action bar that changes based on current state and available actions.

### 3. The State Machine & Visuals

The Dashboard exists in several distinct states, each with unique visual representations and available actions.

---

#### **State 3.1: Active & Listening (Default State)**

This is the primary operational state. The system is actively monitoring the clipboard for new patches.

```
 ▲ relaycode dashboard · [.../project/name @ main]
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: 01 · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ▸ ? PENDING   e4a7c112 · fix: add missing error handling
    -2m    ▸ ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    -5m    ▸ → COMMITTED 8a3f21b8 · feat: implement new dashboard UI
    -8m    ▸ ↩ REVERTED  b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ▸ ✗ FAILED    9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   ▸ → COMMITTED c7d6b5e0 · docs: update readme with TUI spec

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→/Ent) View · (←) Collapse · (L)og · (A)pprove All · (C)ommit · (P)ause · (Q)uit
```
-   **Behavior:** The Event Stream updates in real-time as new patches are detected and processed. New transactions animate in with yellow highlighting.
-   **Interactions:** All primary actions are available. `(→)` or `(Enter)` expands an item. Pressing `(Enter)` on an expanded `PENDING` item transitions to the **Apply & Review Screen**.
-   **Visual Feedback:** Selected items are highlighted in cyan, new items animate in yellow, status changes flash to draw attention.

---

#### **State 3.2: Paused**

The user has intentionally suspended clipboard monitoring. This is a clear, deliberate state with global header status update.

**Trigger:** User presses `(P)` or global pause hotkey.

```
 ▲ relaycode dashboard · [.../project/name @ main]
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: || PAUSED · APPROVALS: 01 · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ▸ ? PENDING   e4a7c112 · fix: add missing error handling
    -2m    ▸ ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    -5m    ▸ → COMMITTED 8a3f21b8 · feat: implement new dashboard UI
    -8m    ▸ ↩ REVERTED  b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ▸ ✗ FAILED    9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   ▸ → COMMITTED c7d6b5e0 · docs: update readme with TUI spec

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (→/Ent) View · (←) Collapse · (L)og · (A)pprove All · (C)ommit · (R)esume · (Q)uit
```
-   **Behavior:** The `LISTENING` status and `●` icon change to `PAUSED` and `||`. Global header status updates to show clipboard state.
-   **Footer Changes:** The `(P)ause` action is replaced with `(R)esume`. All other management actions remain available.
-   **Global State:** Pause state is managed globally and persists across screen transitions.

---

#### **State 3.3: Confirmation Overlay (Blocking Modal)**

To prevent accidental bulk actions, a modal confirmation overlay appears with enhanced visual feedback.

**Trigger:** User presses `(A)` to Approve All.

```
 ▲ relaycode dashboard · [.../project/name @ main]
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: ┌ 01 ┐ · COMMITS: 03
                                 └────┘
  APPROVE ALL PENDING TRANSACTIONS?

  The following 1 transaction(s) will be approved:
  - e4a7c112: fix: add missing error handling

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Confirm      (Esc) Cancel
 ──────────────────────────────────────────────────────────────────────────────
  EVENT STREAM (Last 15 minutes)
  > -15s   ▸ ? PENDING   e4a7c112 · fix: add missing error handling
    -2m    ▸ ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    -5m    ▸ → COMMITTED 8a3f21b8 · feat: implement new dashboard UI
    -8m    ▸ ↩ REVERTED  b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ▸ ✗ FAILED    9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   ▸ → COMMITTED c7d6b5e0 · docs: update readme with TUI spec
```
-   **Behavior:** This is a blocking modal with the event stream still visible below. The approval counter is highlighted with a box.
-   **Footer Changes:** The action bar is reduced to only `Confirm` and `Cancel`.
-   **Visual Design:** Yellow highlighting for important elements, clear separation between modal and background content.

---

#### **State 3.4: In-Progress Operation**

Provides critical feedback while a potentially long-running background task is executing with animated spinners.

**Trigger:** User confirms an overlay or action.

```
 ▲ relaycode dashboard · [.../project/name @ main]
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● APPROVING... · APPROVALS: (●) · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ● Approving... e4a7c112 · fix: add missing error handling
    -2m    ▸ ✓ APPLIED      4b9d8f03 · refactor: simplify clipboard logic
    -5m    ▸ → COMMITTED     8a3f21b8 · feat: implement new dashboard UI
    -8m    ▸ ↩ REVERTED     b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ▸ ✗ FAILED       9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   ▸ → COMMITTED    c7d6b5e0 · docs: update readme with TUI spec

 ──────────────────────────────────────────────────────────────────────────────
 Processing... This may take a moment.
```
-   **Behavior:** The main `STATUS` indicator changes to reflect the action. The approval counter shows an animated spinner. Transaction status also shows spinners.
-   **Visual Feedback:** Multiple animated elements provide clear feedback that operations are in progress.
-   **Transition:** Upon completion, the screen returns to the **Active & Listening** state with updated counters.

---

#### **State 3.5: Active with Expanded Item**

This state provides a quick look into a transaction's details without leaving the dashboard, with enhanced visual presentation.

**Trigger:** User presses `(→)` or `(Enter)` on a selected event.

```
 ▲ relaycode dashboard · [.../project/name @ main]
 ──────────────────────────────────────────────────────────────────────────────
 STATUS: ● LISTENING · APPROVALS: 01 · COMMITS: 03

  EVENT STREAM (Last 15 minutes)

  > -15s   ▾ ? PENDING   e4a7c112 · fix: add missing error handling
        Stats: 3 files, +18/-5 lines
        Files:
          [MOD] src/core/transaction.ts
          [MOD] src/utils/logger.ts
          [MOD] src/commands/apply.ts
    -2m    ▸ ✓ APPLIED   4b9d8f03 · refactor: simplify clipboard logic
    -5m    ▸ → COMMITTED 8a3f21b8 · feat: implement new dashboard UI
    -8m    ▸ ↩ REVERTED  b2c9e04d · Reverting transaction 9c2e1a05
    -9m    ▸ ✗ FAILED    9c2e1a05 · style: update button component (Linter errors: 5)
    -12m   ▸ → COMMITTED c7d6b5e0 · docs: update readme with TUI spec

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Review · (←) Collapse · (L)og · (A)pprove All · (C)ommit · (P)ause · (Q)uit
```
-   **Behavior:** The event stream allows drilling into a single transaction to see detailed stats and affected files with visual hierarchy.
-   **Visual Design:** Expanded content is offset with borders and indentation for clear visual separation.
-   **Footer Changes:** Actions become context-specific based on the expanded item type and status.

### 4. Event Stream Features

#### **4.1. Animation System**
- **New Item Animation**: New transactions animate in with yellow highlighting that fades after 1 second
- **Status Change Flash**: Transaction status changes flash yellow to draw user attention
- **Smooth Transitions**: All state changes use smooth animations to provide visual feedback

#### **4.2. Visual Indicators**
The icons are critical for at-a-glance comprehension of the transaction history.

| Symbol | Status | Meaning |
| :--- | :--- | :--- |
| `?` | **PENDING** | Patch applied, awaiting user approval. |
| `✓` | **APPLIED** | Transaction approved and committed to local state. |
| `→` | **COMMITTED** | Transaction has been included in a git commit. |
| `✗` | **FAILED** | Patch failed to apply or was rejected by the user. |
| `↩` | **REVERTED** | This is a revert transaction, undoing a previous one. |
| `●` | **IN-PROGRESS** | An operation is currently running on this item (animated spinner). |

#### **4.3. Smart Navigation**
- **Viewport Management**: Efficient scrolling through large transaction lists with proper offset calculation
- **Selection Persistence**: Selected item remains visible when navigating through long lists
- **Expand/Collapse**: Smooth expansion and collapse of transaction details with visual feedback

### 5. Context Awareness

The dashboard provides contextual information to enhance user awareness:

#### **5.1. Header Context**
```
▲ relaycode dashboard · [.../project/name @ main]
```
- **Current Directory**: Shows abbreviated path to current project
- **Git Branch**: Displays current git branch for version control context

#### **5.2. Status Bar Intelligence**
- **Dynamic Counters**: Real-time updates of pending approvals and commits
- **Visual Indicators**: Color-coded status icons and animated spinners
- **Modal Highlighting**: Subtle visual emphasis on relevant counters during operations

### 6. Keyboard Shortcuts & Actions

#### **Global Navigation**
- **↑↓** - Navigate transaction list
- **→/Enter** - Expand/view selected transaction
- **←** - Collapse expanded transaction
- **Q** - Quit application

#### **Actions**
- **A** - Approve all pending transactions (requires confirmation)
- **C** - Commit all applied transactions (opens commit screen)
- **L** - View transaction history log
- **P** - Pause/resume clipboard monitoring
- **R** - Resume when paused

#### **Modal Controls**
- **Enter** - Confirm action in modal
- **Esc** - Cancel modal or operation

### 7. Technical Architecture

#### **7.1. Component Architecture**
- **React Components**: Modular components using Ink framework for terminal UI
- **Custom Hooks**: Specialized hooks for dashboard logic, navigation, and viewport management
- **State Management**: Zustand stores for dashboard, transactions, and application state
- **Service Layer**: Backend services for transaction processing and git operations

#### **7.2. State Management**
- **Dashboard Store**: Manages screen state, selection, expansion, and operations
- **Transaction Store**: Handles transaction data and status updates
- **Application Store**: Global application state and navigation
- **View Store**: Manages UI state and header status updates

#### **7.3. Performance Optimizations**
- **Component Memoization**: React.memo for efficient rendering of transaction items
- **Viewport Management**: Smart calculation of visible items to prevent unnecessary rendering
- **Animation Cleanup**: Proper timeout and interval cleanup to prevent memory leaks
- **Efficient Updates**: Optimized state updates to minimize re-renders

#### **7.4. Event System**
- **Real-time Updates**: Live subscription to transaction state changes
- **Animation Events**: Coordinated animation timing with proper cleanup
- **User Input**: Keyboard input handling with proper state isolation
- **Global Events**: Cross-component communication for status updates

### 8. Advanced Features

#### **8.1. Global Pause/Resume**
- **System-wide State**: Pause state persists across all screens
- **Header Integration**: Global header status shows clipboard state
- **Keyboard Shortcut**: Global 'p' hotkey for quick pause/resume from any screen
- **Visual Feedback**: Clear indication of pause state with color-coded icons

#### **8.2. Smart Transaction Processing**
- **Batch Operations**: Efficient bulk approval and commit operations
- **Error Handling**: Graceful handling of failed operations with retry options
- **Progress Feedback**: Real-time progress indicators for long-running operations
- **Rollback Support**: Built-in revert functionality for failed transactions

#### **8.3. Enhanced User Experience**
- **Tooltips**: Context-sensitive help and information
- **Loading States**: Clear feedback for all async operations
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Accessibility**: Keyboard navigation and screen reader support

This comprehensive design ensures a professional, responsive, and feature-rich dashboard experience that serves as the central command center for Relaycode operations, providing users with powerful tools for managing their development workflow efficiently.
