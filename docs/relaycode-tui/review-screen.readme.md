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
