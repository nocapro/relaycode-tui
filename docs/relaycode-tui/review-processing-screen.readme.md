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
