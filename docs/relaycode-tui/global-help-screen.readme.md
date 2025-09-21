

### 3. A Global Help / Keyboard Shortcuts Overlay

**Purpose:** To make the TUI discoverable and empower users to become proficient quickly without leaving the terminal. A good keyboard-first application needs easily accessible help.

**Trigger:** The user presses `(?)` from any main screen (Dashboard, Log, Details, etc.).

```
 ▲ relaycode · keyboard shortcuts
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                                                                            │
 │  GLOBAL                                                                    │
 │    ?        Toggle this help screen                                        │
 │    Q        Quit to terminal (from main screens)                           │
 │                                                                            │
 │  DASHBOARD (watch)                                                         │
 │    ↑↓       Navigate event stream                                          │
 │    P        Pause / Resume clipboard watcher                               │
 │    A        Approve all pending transactions                               │
 │    C        Commit all applied transactions to git                         │
 │                                                                            │
 │  REVIEW & DETAILS SCREENS                                                  │
 │    D        Show / Collapse file diff                                      │
 │    R        Show / Collapse reasoning steps                                │
 │    C        Enter / Exit Copy Mode (Details Screen)                        │
 │    U        Undo / Revert Transaction                                      │
 │    Space    Toggle approval state of a file (Review Screen)                │
 │                                                                            │
 └────────────────────────────────────────────────────────────────────────────┘
 (Press ? or Esc to close)
```

**Key Features & Interactions:**
*   **Modal Overlay:** It appears on top of the current screen, which is visible but dimmed/inactive in the background.
*   **Contextually Grouped:** Shortcuts are grouped by the screen where they are active, making it easy to find relevant commands.
*   **Discoverability:** It teaches users advanced features they might not know exist (e.g., `(C)opy Mode`).
*   **Easy Dismissal:** Pressing `?` again or `Esc` closes the overlay and returns the user to their previous state instantly.
