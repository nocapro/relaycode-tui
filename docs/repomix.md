# Directory Structure
```
docs/
  relaycode-tui/
    initialization-screen.readme.md
    splash-screen.readme.md
index.tsx
package.json
tsconfig.json
```

# Files

## File: docs/relaycode-tui/initialization-screen.readme.md
````markdown
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
````

## File: docs/relaycode-tui/splash-screen.readme.md
````markdown
# SPLASH-SCREEN.README.MD

## Relaycode TUI: The Startup Splash Screen

This document specifies the design and behavior of the timed, auto-dismissing splash screen that appears every time the Relaycode application starts.

### 1. Core Philosophy

The splash screen is the very first visual element a user sees. Its purpose is threefold:

1.  **Brand Reinforcement:** It immediately presents the Relaycode name, ASCII art logo, and tagline, establishing a strong and professional brand identity from the first moment.
2.  **Instantaneous Feedback:** It confirms to the user that the command was successful and the application is loading. This is crucial for a fast CLI tool, as it bridges the "empty terminal" gap between command execution and the first interactive screen.
3.  **User-Friendly & Non-Blocking:** The screen is designed to be ephemeral. It provides its information and then gets out of the way *automatically*, requiring no user interaction. It respects the user's time while still serving its purpose. It also provides an explicit "skip" option for power users.

### 2. UI Layout Components

The splash screen is a single, static view with one dynamic element.

1.  **Header:** `▲ relaycode` - The application's root title.
2.  **Body:** A multi-section area containing:
    *   The primary ASCII art logo.
    *   The application tagline and author/community credits.
    *   A structured "About" section with version and build timestamp information.
    *   A promotional section for the `noca.pro` web application.
    *   A community links section (X, Discord, GitHub).
3.  **Footer / Status Bar:** The final line of the screen. This is the only dynamic component, displaying the countdown timer and the prompt to skip.

### 3. Visual Design & States

The screen has a primary visual state and a simple, time-based progression.

#### **State 3.1: Initial Render (T-5 seconds)**

This is the complete view rendered at the moment of application startup.

```
 ▲ relaycode
 ──────────────────────────────────────────────────────────────────────────────

         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀

  A zero-friction, AI-native patch engine.
  Built by Arman and contributors · https://relay.noca.pro

  Version 1.1.5                         Build Timestamps
  ─────────────────────────             ─────────────────────────
  relaycode                             2025-09-20 13:58:05
  relaycode-core                        2025-09-20 10:59:05
  apply-multi-diff                      (versioned)
  konro                                 (versioned)

 ──────────────────────────────────────────────────────────────────────────────
  If you love this workflow, check out https://www.noca.pro for the full
  web app with repo-wide visual context, history, and rollback.
  (V)isit noca.pro
 ──────────────────────────────────────────────────────────────────────────────
 Follow (X) · Join (D)iscord · Star on (G)itHub
 ──────────────────────────────────────────────────────────────────────────────
  Loading... 5 (Press any key to skip)
```

#### **State 3.2: Countdown Progression (T-4 to T-1 seconds)**

The screen remains visually identical except for the final line, which updates every second.

**Example at T-2 seconds:**
```
... (rest of the screen is unchanged) ...
 ──────────────────────────────────────────────────────────────────────────────
  Loading... 2 (Press any key to skip)
```

### 4. Behavior & Technical Implementation

The screen's behavior is governed by a simple timer and a keyboard listener.

#### **4.1. Implementation Flow**

1.  **On Startup:** The application's entry point immediately clears the terminal screen.
2.  **Render Static Content:** The entire multi-line string for the splash screen (Header, Body, and initial Footer) is printed to stdout *once*.
3.  **Initialize Timers & Listeners:**
    *   A `setInterval` function is started with a 1000ms interval to handle the countdown.
    *   A raw keyboard input listener is activated to detect any key press.
4.  **Countdown Loop (on `setInterval` tick):**
    *   The countdown variable is decremented (e.g., `5` becomes `4`).
    *   The code uses terminal control sequences to move the cursor to the beginning of the *last line*.
    *   It clears the last line.
    *   It re-renders the footer string with the new countdown number (e.g., `Loading... 4 (Press any key to skip)`).
    *   **Crucially, it does not re-render the entire screen.** This is efficient and prevents any flickering.
5.  **Termination Conditions:** The loop terminates when one of two conditions is met:
    *   **Timeout:** The countdown variable reaches `0`.
    *   **User Skip:** The keyboard listener detects *any* key press.
6.  **Cleanup & Transition:** Upon termination:
    *   The `setInterval` timer is cleared (`clearInterval`).
    *   The keyboard listener is detached.
    *   The application proceeds to its next logical state (e.g., rendering the Dashboard or the appropriate command's UI).

#### **4.2. Codebase Integration**

-   The version numbers (`1.1.5`, etc.) and timestamps should be dynamically imported from the respective `package.json` and build-time constant files (e.g., `__LAST_MODIFIED__`) to ensure they are always up-to-date.
-   The logic for handling "(versioned)" packages should check if a timestamp constant exists; if not, it displays the placeholder text.
-   This splash screen logic should wrap the main application router/dispatcher in `cli.ts`.

This design ensures a professional, informative, and user-respectful startup experience that strengthens the Relaycode brand and smoothly onboards the user into the application.
````

## File: index.tsx
````typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App.tsx';

render(<App />);
````

## File: package.json
````json
{
  "name": "relaycode-tui",
  "module": "index.tsx",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "bun run index.tsx",
    "dev": "bun run --watch index.tsx"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-use-stdout-dimensions": "^1.0.1",
    "ink-text-input": "^4.0.3",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "chalk": "^5.3.0",
    "clipboardy": "^4.0.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/react": "^18.2.22",
    "@types/node": "^20.5.9",
    "typescript": "^5"
  }
}
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
````
