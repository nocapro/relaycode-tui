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

### 3. The State Machine: A Five-Phase Flow

The initialization process is a state machine that progresses through five distinct phases.

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
-   **Transition:** If Git repository initialization is needed, transitions to Phase 2. Otherwise, may pause for user input (Phase 4) or proceed directly to Phase 5.

---

---

#### **Phase 2: Git Repository Init**

This phase handles Git repository initialization when no `.git` directory is detected. It provides an intelligent prompt to help users set up version control.

**State 2.1: Git Init Prompt**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./

 PHASE 1: ANALYZE

 [✓] Scanning project structure...
 [✓] Determining Project ID
 [✓] Checking for existing .gitignore
 [✓] Checking git repository
 > No git repository found in the current directory. relaycode works best with version control. Initialize a new repository?

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Ignore (default)      (I) Initialize repository
```
-   **Behavior:** The system detects the absence of a Git repository and prompts the user to initialize one. The focus shifts to the prompt, indicated by `>`.
-   **Transition:** Resumes the flow to Phase 3 after receiving valid user input (`Enter` to ignore or `I` to initialize).

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
   ✓ Git Repository: Initialized

 PHASE 3: CONFIGURE

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

---

#### **Phase 4: Configure**

This phase handles the actual configuration of relaycode files and directories after all user decisions have been made.

**State 4.1: Configuration in Progress**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./
   ✓ Git Repository: Initialized
   ✓ Share .relay: No (user choice)

 PHASE 4: CONFIGURE

 (●) Creating relay.config.json...
     └─ Writing default configuration with Project ID
 ( ) Initializing .relay state directory
 ( ) Generating system prompt template

 ──────────────────────────────────────────────────────────────────────────────
 Applying configuration based on project analysis...
```
-   **Behavior:** The `CONTEXT` panel shows all user decisions and analysis results. The main list shows the file system modifications as they happen.
-   **Transition:** Proceeds automatically to Phase 5 upon completion.

---

#### **Phase 5: Finalize & Hand-off**

The final state. The screen transforms into a summary report, providing confirmation of the setup and clear instructions for the user's next steps. The content of this report is *dynamically generated* based on the choices made in previous phases.

**State 5.1: Success Report (Default Choice)**
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

### 4. Debug Menu Integration

The initialization screen includes comprehensive debug capabilities accessible via the application debug menu. These test states allow developers and testers to verify all initialization scenarios without requiring actual file system modifications.

#### **Available Debug States**

-   **Init: Git Not Found Prompt** - Simulates missing Git repository scenario
-   **Init: Analyze Phase** - Tests the initial project analysis workflow
-   **Init: Git Init Prompt** - Tests the Git repository initialization prompt
-   **Init: Interactive Choice** - Tests the .relay directory sharing decision
-   **Init: Finalize Phase** - Tests the completion summary screen
-   **Init: All Phases** - Runs through the complete initialization sequence

#### **Debug Features**

-   **Phase Isolation**: Each debug state allows testing of specific phases independently
-   **State Preservation**: Debug states maintain proper context and user choices
-   **Error Simulation**: Test edge cases like missing files or permissions
-   **Quick Navigation**: Jump to any phase for targeted testing
-   **Performance Testing**: Validate timing and animations

### 5. Handling Pre-existing Conditions

The initialization screen is designed to be idempotent and intelligent about detecting when certain steps have already been completed in previous runs. This ensures a smooth user experience even when relaycode is run multiple times on the same project.

#### **Scenario: Complete Setup Already Exists**

When all initialization steps have been completed in a previous run, the system provides a verification flow rather than repeating the setup:

**State 5.1: Verification Mode**
```
 ▲ relaycode bootstrap complete
 ──────────────────────────────────────────────────────────────────────────────
  SYSTEM ALREADY CONFIGURED

  ✓ Config:   relay.config.json found and validated.
              › Configuration is up to date.

  ✓ State:    .relay/ directory exists and is properly initialized.
              › Local transaction history is ready.

  ✓ Git:      Repository already initialized.
              › Version control is active.

  ✓ Prompt:   System prompt exists at .relay/prompts/system-prompt.md.
              › AI integration is ready.

 ──────────────────────────────────────────────────────────────────────────────
 (W)atch for Patches · (L)View Logs · (Q)uit
```

#### **Scenario: Partial Setup Detected**

The system intelligently detects which steps have been completed and skips unnecessary operations while still verifying existing configurations:

**State 2.1: Partial Configuration Detected**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./
   ✓ Git Repository: Already initialized
   ✓ Config: relay.config.json exists (verifying...)

 PHASE 2: CONFIGURE

 [✓] Verifying relay.config.json...
     └─ Configuration is valid and up to date
 (●) Checking .relay state directory
 ( ) Validating system prompt template

 ──────────────────────────────────────────────────────────────────────────────
 Updating existing configuration...
```

#### **Scenario: Git Repository Already Exists**

When a Git repository is already present, the system skips the Git initialization prompt and proceeds to the next steps:

**State 2.2: Git Repository Pre-existing**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./
   ✓ Git Repository: Already exists (active branch: main)

 PHASE 1: ANALYZE

 [✓] Scanning project structure...
 [✓] Determining Project ID
 [✓] Checking for existing .gitignore
 [✓] Checking git repository (found, skipping init)

 ──────────────────────────────────────────────────────────────────────────────
 Git repository detected, continuing with configuration...
```

#### **Scenario: Configuration File with Updates**

When an existing configuration file is found but may need updates, the system provides clear options:

**State 3.1: Configuration Update Prompt**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./
   ✓ Git Repository: Already initialized

 PHASE 3: CONFIGURE

 [✓] Found existing relay.config.json
 > Existing configuration detected. Your config may need updates.
   Choose how to handle the existing configuration:

 ──────────────────────────────────────────────────────────────────────────────
 (Enter) Keep existing (default)      (U) Update with new defaults      (R) Replace
```

#### **Scenario: Migration from Previous Version**

The system can detect and handle migrations from previous versions of relaycode:

**State 4.1: Migration Mode**
```
 ▲ relaycode bootstrap
 ──────────────────────────────────────────────────────────────────────────────
 CONTEXT
   ✓ Project ID: 'relaycode' (from package.json)
   ✓ Gitignore:  Found at ./
   ✓ Git Repository: Already initialized
   ✓ Legacy Config: Found v1.0 configuration

 PHASE 4: MIGRATE

 (●) Backing up existing configuration...
     └─ Created backup at .relay/backup/config-v1.0.json
 (●) Migrating to v2.0 format...
     └─ Converting configuration structure
 (●) Updating state directory...
     └─ Restructuring .relay/ directory layout

 ──────────────────────────────────────────────────────────────────────────────
 Migrating from v1.0 to v2.0...
```

### 6. State Persistence & Detection

The initialization system maintains state awareness through several mechanisms:

#### **Configuration Detection**
- **File Existence Checks**: Detects existing `relay.config.json`, `.relay/` directory, and other artifacts
- **Content Validation**: Verifies that existing files contain valid, up-to-date configurations
- **Version Detection**: Identifies configuration file versions and determines if updates are needed
- **Integrity Checks**: Ensures existing state is not corrupted and is properly structured

#### **Git Repository Detection**
- **Directory Check**: Looks for `.git/` directory to determine if repository exists
- **Repository Status**: Checks if repository is properly initialized with valid HEAD
- **Remote Detection**: Identifies if repository has remote origins configured
- **Branch Status**: Determines current branch and working tree status

#### **User Preference Memory**
- **Previous Choices**: Remembers user decisions from previous runs (e.g., .relay sharing preference)
- **Default Preservation**: Maintains existing user preferences unless explicitly changed
- **Choice Validation**: Ensures previous choices are still valid in current context
- **Smart Defaults**: Uses previous choices as defaults for new installations

### 7. Edge Cases & Alternate Flows

A robust TUI must gracefully handle pre-existing conditions.

-   **Scenario: Config File Already Exists**
    -   In Phase 1, the analysis will detect `relay.config.json`.
    -   The flow skips creating the file and instead verifies its contents.
    -   The final report will reflect this: `✓ Config: relay.config.json verified.` The header might say `bootstrap verified`.

-   **Scenario: `package.json` Not Found**
    -   In Phase 1, the analysis fails to find `package.json`.
    -   The system falls back to using the current directory name as the Project ID.
    -   The `CONTEXT` panel in Phase 2 will display: `✓ Project ID: 'my-project' (from directory name)`.

### 8. Keyboard Shortcuts & Actions

#### **Global Navigation**
- `Q` - Quit the initialization process at any time
- `Esc` - Cancel current operation or go back (when available)

#### **Phase-Specific Actions**

**Git Init Prompt (Phase 2)**
- `Enter` - Ignore Git initialization (default)
- `I` - Initialize new Git repository

**Interactive Choice (Phase 3)**
- `Enter` - No, ignore .relay directory (default)
- `S` - Yes, share .relay directory by committing it

**Configuration Update Prompt (Phase 3)**
- `Enter` - Keep existing configuration (default)
- `U` - Update with new defaults
- `R` - Replace configuration

**Finalize & Hand-off (Phase 5)**
- `W` - Watch for patches (start monitoring)
- `L` - View logs
- `Q` - Quit application

#### **Navigation Principles**
- **Default Safety**: Enter always provides the safe/default option
- **Context Awareness**: Footer actions change based on current phase
- **Clear Indicators**: Active choices are highlighted with `>` symbol
- **Consistent Layout**: Actions are always displayed in the footer bar

### 9. UI Symbol Legend

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

### 10. Implementation Details

#### **Technical Architecture**

The initialization screen is built using React with TypeScript and follows a component-based architecture:

- **State Management**: Zustand store for phase tracking and user choices
- **UI Components**: Reusable React components with consistent styling
- **Service Layer**: Backend logic for file operations and process control
- **Input Handling**: Custom hooks for keyboard navigation and user interactions
- **Debug Integration**: Comprehensive testing capabilities via debug menu

#### **Key Files**

- `src/components/InitializationScreen.tsx` - Main UI component
- `src/stores/init.store.ts` - State management and phase tracking
- `src/hooks/useInitializationScreen.tsx` - Input handling and phase transitions
- `src/services/init.service.ts` - Backend logic and process control
- `src/hooks/useDebugMenu.tsx` - Debug state integration

#### **Design System**

The initialization screen follows a consistent design system with:
- **Color Palette**: Cyan for active elements, green for completed items, yellow for warnings
- **Typography**: Bold headers, italic subtext, clear visual hierarchy
- **Spacing**: Consistent padding and margins throughout all phases
- **Animation**: Smooth transitions between phases with loading indicators
- **Accessibility**: High contrast, keyboard navigation, clear visual feedback

#### **Performance Considerations**

- **Efficient Rendering**: Component memoization to prevent unnecessary re-renders
- **State Optimization**: Minimal state updates with proper cleanup
- **Resource Management**: Proper cleanup of event listeners and timers
- **Memory Usage**: Optimized data structures for task tracking and phase management
