# INITIALIZATION-SCREEN.README.MD

## Relaycode TUI: The Stateful Initialization Screen

This document specifies the design and behavior of the stateful initialization screen for Relaycode, triggered by the `relay init` command.

### 1. Core Philosophy

The initialization process is the user's first true impression of the Relaycode application. It must be more than a simple script that prints sequential log lines. Our philosophy is to treat it as a **guided bootstrap sequence**.

-   **Application-like Experience:** The screen has a persistent frame, and content updates in-place, creating the feel of a desktop installer rather than a command-line utility.
-   **Transparency and Confidence:** The user sees what the system is analyzing, what it's about to do, and the results of its actions in real-time. This builds trust and demystifies the setup process.
-   **Stateful Context:** Information discovered in early phases (like the Project ID) is persisted on-screen, providing context for later steps.
-   **Interactive & Intelligent:** The process can pause to ask for user input on key decisions, using sensible defaults and providing clear choices.

### 2. UI Layout Components

The screen maintains a consistent single-column layout, divided into three key regions:

1.  **Header:** `▲ relaycode bootstrap` - A static title that changes to `▲ relaycode bootstrap complete` upon success.
2.  **Body:** The primary dynamic content area. It displays the current phase, analysis results, interactive prompts, and the final summary report.
3.  **Footer / Status Bar:** A single line at the bottom that provides context on the current operation or displays the available keyboard actions.

### 3. The State Machine: A Four-Phase Flow

The initialization process is a state machine that progresses through four distinct phases.

---

#### **Phase 1: Analyze**

The sequence begins by scanning the project environment to gather context. The UI shows this as a live checklist.

**State 1.1: Initial Analysis**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 PHASE 1: ANALYZE

 (●) Scanning project structure...
     └─ Finding package.json
 ( ) Determining Project ID
 ( ) Checking for existing .gitignore

 ──────────────────────────────────────────────────────────────────────────────
 This utility will configure relaycode for your project.
```
-   **Behavior:** The system performs its initial checks. The `(●)` symbol can act as a spinner or simply indicate the current task.
-   **Transition:** Upon completion, the screen seamlessly transitions to Phase 2.

---

#### **Phase 2: Configure**

The results from the analysis are now displayed in a persistent `CONTEXT` panel. The body of the screen updates to show the configuration tasks the system is now performing.

**State 2.1: Configuration in Progress**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./

 PHASE 2: CONFIGURE

 (●) Creating relay.config.json...
     └─ Writing default configuration with Project ID
 ( ) Initializing .relay state directory
 ( ) Generating system prompt template

 ──────────────────────────────────────────────────────────────────────────────
 Applying configuration based on project analysis...
```
-   **Behavior:** The `CONTEXT` panel shows the outcome of Phase 1. The main list shows the file system modifications as they happen.
-   **Transition:** The process may pause and transition to Phase 3 if user input is required. Otherwise, it proceeds directly to Phase 4.

---

#### **Phase 3: Interactive Choice**

This is a blocking state that halts the automated process to request user input. This makes the tool feel intelligent and respectful of user preferences.

**State 3.1: Awaiting User Input**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode'
   ✓ Gitignore:  Found at ./

 PHASE 2: CONFIGURE

 [✓] Created relay.config.json
 [✓] Initialized .relay state directory
 > The .relay/ directory is usually ignored by git.
   Do you want to share its state with your team by committing it?

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) No, ignore it (default)      (S) Yes, share it
```
-   **Behavior:** The focus shifts to the prompt, indicated by `>`. The footer transforms into a contextual action bar, clearly showing the default action (`Enter`) and alternative keyboard shortcuts.
-   **Transition:** Resumes the flow to Phase 4 after receiving valid user input (`Enter` or `S`).

---

#### **Phase 4: Finalize & Hand-off**

The final state. The screen transforms into a summary report, providing confirmation of the setup and clear instructions for the user's next steps. The content of this report is *dynamically generated* based on the choices made in previous phases.

**State 4.1: Success Report (Default Choice)**
```
 ▲ relaycode bootstrap complete
 ──────────────────────────────────────────────────────────────────────────────
  SYSTEM READY

  ✓ Config:   relay.config.json created.
              › Edit this file to tune linters, git integration, etc.

  ✓ State:    .relay/ directory initialized and added to .gitignore.
              › Local transaction history will be stored here.

  ✓ Prompt:   System prompt generated at .relay/prompts/system-prompt.md.
              › Copied to clipboard. Paste into your AI's custom instructions.

 ──────────────────────────────────────────────────────────────────────────────
 (W)atch for Patches · (L)View Logs · (Q)uit
```
-   **Behavior:** The header updates to `...complete`. The Body provides a scannable summary. Crucially, the footer now becomes a menu, guiding the user to the next logical actions within the Relaycode ecosystem.
-   **Dynamic Content:** If the user had chosen to *share* the state in Phase 3, the `State` line would dynamically change to: `✓ State: .relay/ directory initialized. It will be committed to git.`

### 4. Edge Cases & Alternate Flows

A robust TUI must gracefully handle pre-existing conditions.

-   **Scenario: Config File Already Exists**
    -   In Phase 1, the analysis will detect `relay.config.json`.
    -   The flow skips creating the file and instead verifies its contents.
    -   The final report will reflect this: `✓ Config: relay.config.json verified.` The header might say `bootstrap verified`.

-   **Scenario: `package.json` Not Found**
    -   In Phase 1, the analysis fails to find `package.json`.
    -   The system falls back to using the current directory name as the Project ID.
    -   The `CONTEXT` panel in Phase 2 will display: `✓ Project ID: 'my-project' (from directory name)`.

### 5. UI Symbol Legend

| Symbol | Meaning | State |
| :--- | :--- | :--- |
| `▲` | Application Header | Static |
| `( )` | Task Pending | In-Progress |
| `(●)` | Task Active / In-Progress | In-Progress |
| `[✓]` | Task Completed (File Operation) | In-Progress |
| `✓` | Item OK / Verified / Completed | Static / Final |
| `>` | Focused Item / User Prompt | Interactive |
| `›` | Informational Sub-point | Static |
| `─` | Horizontal Separator | Static |
