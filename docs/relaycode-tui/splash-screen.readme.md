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
