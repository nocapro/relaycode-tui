# REVIEW-SCREEN.README.MD

## Relaycode TUI: The Interactive Review Screen

This document specifies the design and behavior of the **Review Screen**. This screen is the interactive core of the Relaycode workflow, appearing immediately after a patch has been processed and applied to the filesystem. It is a command center for analysis, granular control, data extraction, and iterative repair.

### 1. Core Philosophy

The Review screen is not a simple "accept/reject" dialog. It is a strategic workspace designed to give the user complete control and insight over incoming code changes.

-   **Information Supremacy:** The UI provides all necessary context at a glance: high-level stats, the AI's reasoning, post-script results, the patch strategy used per file, and deep-dive diffs. Nothing is hidden.
-   **Granular Control:** The user is empowered to make decisions on a per-file basis. The UI dynamically recalculates and reflects the impact of these decisions in real-time.
-   **Iterative Repair Workflow:** Failure is treated as a temporary state, not an endpoint. The UI provides a powerful suite of tools—from AI-driven prompts to manual overrides—to handle even complex, multi-file failures gracefully.
-   **Data Accessibility:** Every piece of information (prompts, diffs, reasoning, script outputs) is easily copyable, respecting the user's need to use this data in other contexts.

### 2. Technical Architecture

#### Component Structure

-   **Main Component:** `ReviewScreen` (`src/components/ReviewScreen.tsx`)
-   **Hook:** `useReviewScreen` (`src/hooks/useReviewScreen.tsx`)
-   **State Management:** Zustand store (`review.store.ts`) for complex state handling
-   **Constants:** `REVIEW_BODY_VIEWS` and `REVIEW_FOOTER_ACTIONS` from `review.constants.ts`

#### Key Subcomponents

-   **FileItemRow:** Handles file display with status indicators and error information
-   **ScriptItemRow:** Displays script execution results with expandable output
-   **ContentView:** Reusable component for displaying various content types
-   **ActionFooter:** Contextual action bar with dynamic keyboard shortcuts

### 3. UI Layout Components

1.  **Header:** `▲ relaycode review`
2.  **Navigator:** The top section, acting as a command-and-control center. It contains the transaction summary, global stats, expandable reasoning/prompt, script results, and the file list.
3.  **Body:** A dynamic viewport that renders detailed content—like diffs or script outputs—based on the user's focus in the Navigator.
4.  **Footer:** The contextual action bar, showing available keyboard shortcuts that change constantly based on the UI's state and focus.

### 4. The Reality: 13 Distinct Screen States

The Review Screen isn't theoretically complex—it's **actually complex**. Here's what users really see:

---

#### **State 1: Partial Failure (Most Common)**

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  e4a7c112 · refactor: rename core utility function
  (+18/-5) · 3 Files · 1/3 Approved · Scripts: SKIPPED · MULTIPLE PATCHES FAILED

 (P)rompt ▸ Rename the `calculateChanges` utility to `computeDelta`...
 (R)easoning (2 steps) ▸ 1. Renamed the function in its definition file...
 ──────────────────────────────────────────────────────────────────────────────
 FILES
   [✓] MOD src/core/transaction.ts (+18/-5) [replace]
 > [!] FAILED src/utils/logger.ts    (Hunk #1 failed to apply)
   [!] FAILED src/commands/apply.ts   (Context mismatch at line 92)

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (D)iff · (Ent) Expand · (T)ry Repair · (Shift+T) Bulk Repair · (Shift+R) Reject All
```

**Footer:** 6 actions, includes bulk repair options
**Focus:** Failed file with error details

---

#### **State 2: Success with Script Issues**

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  4b9d8f03 · refactor: simplify clipboard logic
  (+22/-11) · 2 Files · 2/2 Approved · 3.9s

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

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Collapse · (J↓/K↑) Next/Prev Error · (C)opy Output · (Esc) Back
```

**Footer:** 5 actions, includes error navigation
**Focus:** Script output with highlighted errors

---

#### **State 3: Diff View (Expanded)**

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  4b9d8f03 · refactor: simplify clipboard logic
  (+22/-11) · 2 Files · 2/2 Approved · 3.9s

 (P)rompt ▸ Simplify the clipboard logic using an external library...
 (R)easoning (3 steps) ▸ 1. Added clipboardy dependency...
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

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) File Nav · (X)ollapse Diff · (J↓/K↑) Hunk Nav · (D)Collapse View
```

**Footer:** 4 actions, focused on diff navigation
**Focus:** Syntax-highlighted code changes

---

#### **State 4: Bulk Repair Modal**

```
 ▲ relaycode review
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
  (5) Auto-repair with AI
  (Esc) Cancel

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Select · [1-4, Esc] Hotkeys
```

**Footer:** 3 actions, modal navigation only
**Focus:** Bulk repair decision tree

---

#### **State 5: Copy Mode Overlay**

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
   [X] Context Files (latest) (3 files)
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Copied UUID to clipboard.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A,X) Hotkeys · (C, Esc) Exit
```

**Footer:** 4 actions, copy-specific navigation
**Focus:** Metadata selection menu

---

#### **State 6: Handoff Confirmation**

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

**Footer:** 2 actions, binary choice
**Focus:** Critical decision point

---

### 5. The Action Matrix in Practice

Watch how the footer changes as you navigate:

| Starting State | Press Key | New State | Footer Actions |
|---------------|----------|-----------|---------------|
| Main Navigator | D | Diff View | "↑↓ File Nav · X)ollapse Diff · J↓/K↑ Hunk Nav" |
| Diff View | X | Expanded Diff | "↑↓ File Nav · X)ollapse Diff · J↓/K↑ Hunk Nav" |
| Failed File | T | Bulk Repair Modal | "↑↓ Nav · Enter Select · [1-4] Jump · Esc Cancel" |
| Any State | C | Copy Mode | "↑↓ Nav · Enter Copy · Hotkeys · C Esc Exit" |
| Bulk Repair | Enter | Handoff Confirm | "Enter Confirm · Esc Cancel" |

**Each state has completely different:**
- Visual layout
- Available actions
- Navigation rules
- Keyboard shortcuts

---

### 6. State Transitions in Action

Here's how users actually navigate through these states:

---

#### **Flow 1: Simple Approval Path**
```
Main Navigator → [Space on file] → [Space on another file] → [A] → Commit
```

**What happens:**
1. Start at main navigator with file list
2. Press Space to approve first file (`[ ]` → `[✓]`)
3. Press ↓ to next file, Space to approve
4. Press `A` to approve all and commit

---

#### **Flow 2: Failure Recovery Path**
```
Main Navigator → [T on failed file] → Bulk Repair Modal → [Enter] → Handoff Confirm → [Enter]
```

**What happens:**
1. See red `[!] FAILED` files in list
2. Press `T` on failed file to open bulk repair modal
3. Select "Handoff to External Agent" and press Enter
4. Confirm handoff decision
5. System copies detailed prompt to clipboard

---

#### **Flow 3: Detailed Inspection Path**
```
Main Navigator → [D on file] → Diff View → [X to expand] → [J/K to navigate hunks] → [Space] → [Esc] → [A]
```

**What happens:**
1. Select file and press `D` to view diff
2. Press `X` to see full diff (not just summary)
3. Use `J/K` to jump between different change blocks
4. Press `Space` to approve the file
5. Press `Esc` to return to navigator
6. Press `A` to commit

---

#### **Flow 4: Script Issues Path**
```
Main Navigator → [Enter on script] → Script Output → [J/K to navigate errors] → [C to copy] → [Esc]
```

**What happens:**
1. Navigate to red `✗ Linter` line
2. Press Enter to see detailed error output
3. Use `J/K` to jump between different errors
4. Press `C` to copy error details to clipboard
5. Press `Esc` to return to navigator

---

### 7. Real User Journeys

#### **User: Maria (Backend Developer)**

**Scenario:** Complex database refactoring with multiple failures

```
Start: Partial Failure State
├── Reviews failed patch files
├── Presses Shift+T for bulk repair
├── Chooses "Handoff to External Agent"
├── Gets detailed prompt in clipboard
├── Pastes to Claude for manual fix
└── Returns later to apply corrected patch
```

**Time saved:** 30 minutes of manual error diagnosis

#### **User: Alex (Frontend Developer)**

**Scenario:** Simple UI component changes

```
Start: Success State
├── Scans file changes quickly
├── Presses D on each file to review
├── Presses Space to approve each
├── Presses A to commit all
└── Done in 2 minutes
```

**Efficiency:** Direct path with no detours

#### **User: Sam (DevOps Engineer)**

**Scenario:** Deployment script with linting issues

```
Start: Success with Script Issues
├── Sees ✗ Linter with 3 warnings
├── Presses Enter to view details
├── Uses J/K to review each warning
├── Presses C to copy warnings for team
├── Decides warnings are acceptable
├── Presses Esc, then A to commit
└── Files Jira ticket with warning details
```

**Risk management:** Informed decision despite warnings

### 8. Why This Complexity Works

#### **Progressive Disclosure**
- **Simple cases:** Show only approve/reject
- **Complex cases:** Reveal repair options as needed
- **Critical cases:** Offer handoff to external AI

#### **Context-Aware Actions**
```
Same key, different results:
[Space] on approved file = Reject it
[Space] on rejected file = Approve it
[Space] on failed file = No effect (use T instead)
```

#### **Mental Model Matching**
- **File-focused:** Actions apply to selected file
- **Bulk-focused:** Actions apply to multiple files
- **System-focused:** Actions affect entire transaction
- **External-focused:** Actions involve external tools

#### **Error Recovery**
Every state has an "escape hatch":
- **Esc:** Always goes back to previous state
- **Q:** Always returns to dashboard
- **Ctrl+C:** Cancels long-running operations

### 6. File State Management

#### File Status Indicators

- **[✓] Approved:** File changes accepted and will be committed
- **[✗] Rejected:** File changes rejected and will not be committed
- **[!] Failed:** Patch application failed for this file
- **[●] Awaiting:** Waiting for user action or AI response
- **[●] Re-applying:** Currently re-applying with new strategy

#### Dynamic Recalculation

The system automatically recalculates:
- Total approved/rejected file counts
- Line addition/removal statistics
- Available actions based on current state
- Footer shortcuts based on selected item

### 7. Keyboard Shortcuts & Mental Model

The keyboard shortcuts follow a **hierarchical mental model** to manage complexity:

#### **Level 1: Core Navigation (Always Available)**
- **↑/↓:** Navigate through items
- **Enter:** Expand selected item or confirm action
- **Esc:** Collapse current view or go back
- **Q:** Quit to dashboard

#### **Level 2: Content Viewing (Context-Aware)**
- **M:** View commit message
- **P:** View AI prompt
- **R:** View AI reasoning
- **D:** View file diff
- **C:** Enter copy mode

#### **Level 3: File Operations (Context-Sensitive)**
- **Space:** Toggle file approval/rejection
- **T:** Try repair (failed files only)
- **I:** Instruct (rejected files only)
- **A:** Approve transaction
- **X:** Reject transaction

#### **Level 4: Bulk Operations (Conditional)**
- **Shift+T:** Bulk repair failed files (when failures exist)
- **Shift+I:** Bulk instruct rejected files (when rejections exist)
- **Shift+R:** Reject all files

#### **Level 5: Advanced Navigation (View-Specific)**
- **PgUp/PgDn:** Scroll in content views
- **J/K:** Navigate between hunks (diff view) or errors (script output)
- **X:** Expand/collapse large diffs
- **1-5:** Quick select in modal dialogs

#### **Mental Model Guidelines**

1. **Simple First:** Core actions (↑↓, Enter, Esc) work everywhere
2. **Context Matters:** Actions appear only when relevant
3. **Progressive Disclosure:** Advanced features are hidden until needed
4. **Consistent Patterns:** Similar actions use similar keys across contexts
5. **Escape Hatch:** Esc always goes back to the previous state

### 8. Copy Mode Integration

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
   [X] Context Files (latest) (3 files)
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Copied UUID to clipboard.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A,X) Hotkeys · (C, Esc) Exit
```
-   **Behavior:** A modal overlay appears, allowing the user to copy any piece of metadata related to the transaction to their clipboard with single keystrokes.

### 9. Integration Points

#### Store Integration

- **Transaction Data:** Current patch metadata and execution results
- **File Review States:** Per-file approval/rejection/failed status
- **Body View State:** Current content view and scroll position
- **Script Results:** Post-application execution outputs

#### Service Integration

- **Review Service:** Handles patch simulation and repair workflows
- **Clipboard Service:** Manages copy operations and paste detection
- **Navigation Service:** Handles screen transitions and state management

#### AI Integration

- **Prompt Generation:** Creates detailed prompts for AI repair
- **Handoff Workflow:** Seamless transition to external AI agents
- **Bulk Operations:** Supports batch processing for multiple files

### 10. Performance Considerations

- **Virtual Scrolling:** Efficient rendering of large file lists
- **Lazy Loading:** Content views are loaded on demand
- **State Optimization:** Minimal re-renders through careful state management
- **Memory Management:** Cleanup of unused content and cached data

### 11. Usage Guidelines & Best Practices

Given the complexity of the Review Screen, here are guidelines for effective usage:

#### **Common Workflows**

**1. Quick Review (Simple Changes)**
```
↑↓ → Navigate to files → Space → Approve → A → Commit
```
**2. Detailed Inspection (Complex Changes)**
```
↑↓ → Select file → D → Review diff → Space → Approve → Repeat → A → Commit
```
**3. Failure Recovery (Patch Issues)**
```
↑↓ → Failed file → T → Choose repair strategy → Review → A → Commit
```
**4. Bulk Operations (Multiple Issues)**
```
Shift+T → Choose bulk repair → Review results → A → Commit
```

#### **Decision Framework**

**When to Approve:**
- All changes look correct
- Script results are acceptable (warnings OK, errors not)
- No files are in FAILED state
- You understand and agree with all changes

**When to Reject:**
- Changes are incorrect or unwanted
- Script errors are unacceptable
- You want to modify the changes manually
- The AI misunderstood the request

**When to Repair:**
- Patch failed to apply (FAILED files)
- Context mismatch or hunk application errors
- You want to retry with different strategy
- Files are in AWAITING state

**When to Handoff:**
- Complex failures that need human expertise
- Multiple failed files with different issues
- You want to use an external AI agent
- The repair is beyond automated capabilities

#### **Performance Tips**

1. **Start Simple:** Begin with quick navigation (↑↓) to get an overview
2. **Use Views Wisely:** Open detailed views only when needed
3. **Bulk Operations:** Use Shift+T/Shift+I for multiple files instead of individual actions
4. **Leverage Copy Mode:** Use C to copy prompts for external reference
5. **Monitor Status:** Watch the footer for context-relevant actions

#### **Avoiding Common Pitfalls**

1. **Action Overload:** Don't try to learn all shortcuts at once - focus on core navigation first
2. **State Confusion:** Pay attention to the current view and selected item
3. **Bulk Caution:** Review bulk operations carefully before confirming
4. **Handoff Finality:** Remember handoff is a final action - Relaycode won't wait for results
5. **Script Results:** Always check script outputs even if files applied successfully

#### **Mental Model for Complexity**

Think of the Review Screen as **layers of detail**:

```
Layer 1: Overview (Navigator) → Quick assessment
Layer 2: Details (Body Views) → Deep inspection
Layer 3: Actions (Footer) → Contextual operations
Layer 4: Advanced (Modals) → Bulk operations and handoff
```

**Debug Menu Evidence:**
The existence of **13 debug scenarios** proves this complexity is real and necessary. Each scenario tests a specific user workflow:
- **Basic Workflows:** Success, Failure states
- **Content Views:** Diff, Reasoning, Script output
- **Modal Interactions:** Copy mode, Bulk operations, Handoff
- **Processing States:** Real-time application, AI processing
- **Edge Cases:** Navigation within modal states, Error recovery

**Progressive Disclosure:** The interface shows only what's relevant:
- Simple cases show basic approve/reject
- Complex cases reveal repair options
- Multiple failures enable bulk operations
- Critical situations offer handoff capabilities

### 12. Error Handling

#### Display Strategies

- **Immediate Feedback:** Failed files show error messages inline
- **Color Coding:** Red for errors, yellow for warnings, green for success
- **Contextual Actions:** Repair options available directly from error display
- **Progressive Disclosure:** Detailed error information available on expansion

#### Recovery Mechanisms

- **Automatic Retry:** Failed operations can be retried with different strategies
- **Bulk Operations:** Multiple failures can be addressed simultaneously
- **External Handoff:** Complex failures can be delegated to external AI
- **Graceful Degradation:** System remains functional even with partial failures