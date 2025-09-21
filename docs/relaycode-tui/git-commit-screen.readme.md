

### The Git Commit Screen (`relay git commit`)

**Purpose:** This screen transforms the `git commit` command from a simple script into a dedicated, final review stage. It gives the user a clear overview of what is about to be committed to the repository, preventing accidental or incorrect commits.

**Trigger:** The user runs `relay git commit` or selects the "Commit All" action from the Dashboard.

```
 ▲ relaycode git commit
 ──────────────────────────────────────────────────────────────────────────────
  Found 2 new transactions to commit since last git commit.

  TRANSACTIONS INCLUDED
  - e4a7c112: fix: add missing error handling
  - 4b9d8f03: refactor: simplify clipboard logic

 ──────────────────────────────────────────────────────────────────────────────
  FINAL COMMIT MESSAGE

  feat: implement new dashboard and clipboard logic

  - Adds error handling to the core transaction module to prevent
    uncaught exceptions during snapshot restoration.

  - Refactors the clipboard watcher for better performance and
    cross-platform compatibility, resolving issue #42.

 ──────────────────────────────────────────────────────────────────────────────
 This will run 'git add .' and 'git commit' with the message above.
 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Confirm & Commit      (Esc) Cancel
```

**Key Features & Interactions:**
*   **Contextual Summary:** It clearly states *which* Relaycode transactions are being bundled into this single git commit.
*   **Merged Message Preview:** It shows the final, beautifully formatted multi-line git commit message that will be used, exactly as it was generated from the individual transactions. This is the most critical piece of information.
*   **Final Gate:** It acts as a deliberate "airlock" before modifying the git history. The user must explicitly confirm the action. There is no ambiguity.
*   **Simplicity:** Unlike other screens, this one is not for deep inspection. It has one job: confirm or cancel. The footer reflects this with only two options.

---
