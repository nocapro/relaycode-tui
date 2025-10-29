# SPLASH-SCREEN.README.MD

## Relaycode TUI: The Startup Splash Screen

This document specifies the design and behavior of the animated, feature-rich splash screen that appears every time the Relaycode application starts.

### 1. Core Philosophy

The splash screen is the very first visual element a user sees. Its purpose has evolved to be more comprehensive:

1.  **Brand Reinforcement:** It immediately presents the Relaycode name, animated ASCII art logo, and tagline, establishing a strong and professional brand identity from the first moment.
2.  **Instantaneous Feedback:** It confirms to the user that the command was successful and the application is loading. This is crucial for a fast CLI tool, as it bridges the "empty terminal" gap between command execution and the first interactive screen.
3.  **User-Friendly & Non-Blocking:** The screen is designed to be ephemeral. It provides its information and then gets out of the way *automatically*, requiring no user interaction. It respects the user's time while still serving its purpose. It also provides an explicit "skip" option for power users.
4.  **Engaging Animation:** The screen features a progressive animation system that reveals content in stages, creating a more dynamic and engaging startup experience.
5.  **Interactive Elements:** Users can interact with promotional links and community links directly from the splash screen.
6.  **Update System Integration:** The splash screen includes automatic update checking with user feedback.
7.  **Educational Tips:** Rotating tips provide users with helpful keyboard shortcuts and application features.

### 2. UI Layout Components

The splash screen is a single, dynamically animated view with multiple interactive elements.

1.  **Header:** `▲ relaycode` - The application's root title with styling.
2.  **Body:** A multi-section area containing:
    *   The primary ASCII art logo (animated line-by-line).
    *   The application tagline and author/community credits.
    *   A structured "About" section with version and build timestamp information.
    *   An update checking system with status feedback.
    *   A promotional section for the `noca.pro` web application.
    *   A community links section (X, Discord, GitHub).
    *   Educational tips that appear during the countdown.
3.  **Footer / Status Bar:** The final line of the screen. This is the only dynamic component, displaying the countdown timer and the prompt to skip.

### 3. Visual Design & Animation States

The screen has multiple visual states with progressive animation phases.

#### **State 3.1: Logo Animation (T-5 seconds)**

The animation begins with the ASCII art logo appearing line by line.

```
 ▲ relaycode
 ──────────────────────────────────────────────────────────────────────────────
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
```

#### **State 3.2: Content Reveal Animation**

After the logo completes, sections appear progressively:

1.  **Tagline Section** (100ms after logo)
2.  **Version Information** (300ms after logo)
3.  **Update Check** (600ms after logo)
4.  **Promotional Section** (800ms after logo)
5.  **Community Links** (1000ms after logo)

#### **State 3.3: Complete View (T-5 seconds)**

This is the complete view rendered after all animations complete.

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

  Checking for updates...
 ──────────────────────────────────────────────────────────────────────────────
  If you love this workflow, check out https://www.noca.pro for the full
  web app with repo-wide visual context, history, and rollback.
  (V)isit noca.pro
 ──────────────────────────────────────────────────────────────────────────────
 Follow (X) · Join (D)iscord · Star on (G)itHub
 ──────────────────────────────────────────────────────────────────────────────
 Tip: Press Ctrl+V at any time to process a patch from your clipboard.
 Loading... 5 (Press any key to skip)
```

#### **State 3.4: Countdown Progression (T-4 to T-1 seconds)**

The screen remains visually identical except for the final line, which updates every second.

**Example at T-2 seconds:**
```
... (rest of the screen is unchanged) ...
 ──────────────────────────────────────────────────────────────────────────────
 Tip: Use Ctrl+B to open the debug menu and explore different application states.
 Loading... 2 (Press any key to skip)
```

#### **State 3.5: Update Check Failed State**

When the update check fails, the screen shows an error with retry options:

```
... (rest of the screen is unchanged) ...
  ✗ Update check failed. Please check your connection.
  (R)etry · (S)kip
 ──────────────────────────────────────────────────────────────────────────────
 Tip: The "?" key opens a global hotkey reference screen.
 Loading... 999 (Press any key to skip)
```

### 4. Interactive Features

#### **4.1. Community Links**
- **(V)** - Opens https://relay.noca.pro in browser
- **(X)** - Opens X/Twitter in browser
- **(D)** - Opens Discord invite in browser
- **(G)** - Opens GitHub repository in browser

#### **4.2. Update Check Controls**
- **(R)** - Retry update check (when failed)
- **(S)** - Skip update check and continue (when failed)

#### **4.3. Navigation**
- **Any Key** - Skip splash screen and continue to application
- **Ctrl+C** - Exit application (global)

### 5. Animation & Technical Implementation

#### **5.1. Animation System**
The splash screen uses a sophisticated animation system that reveals content progressively:

1.  **Logo Animation**: ASCII art appears line by line with 80ms intervals
2.  **Section Staggering**: Content sections appear with staggered delays (100-1000ms)
3.  **Complete State**: All content visible with countdown timer active
4.  **Cleanup**: Proper timeout management prevents memory leaks

#### **5.2. Update System Integration**
The splash screen includes an integrated update checking system:

1.  **Initial Check**: Automatically checks for updates during animation
2.  **Status Feedback**: Shows "Checking for updates..." message
3.  **Result Display**: Shows success ("✓ You are up to date.") or error state
4.  **Error Handling**: Provides retry/skip options for failed updates

#### **5.3. Educational Tips System**
Rotating tips provide users with helpful information:

1.  **Random Selection**: Tips are randomly selected from a predefined collection
2.  **Content Focus**: Tips highlight keyboard shortcuts and app features
3.  **Educational Value**: Helps users discover functionality they might otherwise miss

#### **5.4. Implementation Flow**

1.  **On Startup:** The application's entry point immediately clears the terminal screen.
2.  **Component Mount:** React component mounts with initial state (empty screen).
3.  **Logo Animation:** ASCII art logo animates line by line using `setInterval`.
4.  **Section Staggering:** Content sections appear progressively using `setTimeout`.
5.  **Update Check:** Update checking begins during the animation sequence.
6.  **Countdown Timer:** Final countdown begins after animation completes.
7.  **Input Handling:** Keyboard listener for interactive elements and skip functionality.
8.  **Cleanup:** Proper cleanup of timers and intervals on unmount/skip.

#### **5.5. Codebase Integration**

-   The version numbers and timestamps should be dynamically imported from the respective `package.json` and build-time constant files.
-   The logic for handling "(versioned)" packages should check if a timestamp constant exists.
-   Animation timing and delays are configured through constants for easy adjustment.
-   The component integrates with global state management for navigation and notifications.
-   Debug menu integration allows testing of various splash screen states.

### 6. Debug Integration

The splash screen includes debug capabilities accessible via the application debug menu:

#### **Available Debug States**
-   **Update Failed** - Simulates failed update check scenario
-   **Default** - Normal startup sequence
-   **Fast Mode** - Accelerated animation for testing

#### **Debug Features**
-   **State Testing**: Each debug state allows testing of specific scenarios
-   **Performance Testing**: Validate timing and animation behavior
-   **Error Simulation**: Test edge cases like failed updates
-   **Quick Navigation**: Jump to specific states for targeted testing

### 7. Keyboard Shortcuts & Actions

#### **Global Navigation**
- **Any Key** - Skip splash screen and continue to application
- **Ctrl+C** - Exit application (global)

#### **Interactive Links**
- **V** - Open https://relay.noca.pro in browser
- **X** - Open X/Twitter in browser
- **D** - Open Discord invite in browser
- **G** - Open GitHub repository in browser

#### **Update Check Controls**
- **R** - Retry update check (when failed)
- **S** - Skip update check and continue (when failed)

### 8. Technical Architecture

#### **Component Architecture**
- **React Component**: Uses Ink framework for terminal UI rendering
- **Custom Hook**: `useSplashScreen` manages all animation and interaction logic
- **State Management**: Integrates with Zustand stores for application state
- **Notification System**: Uses notification store for link opening feedback

#### **Performance Considerations**
- **Efficient Rendering**: Component memoization to prevent unnecessary re-renders
- **Timeout Management**: Proper cleanup prevents memory leaks
- **Animation Optimization**: Staggered animations prevent overwhelming the UI
- **Resource Management**: Clean separation of concerns for maintainability

#### **Design System**
- **Color Palette**: Yellow for header, cyan for logo, white/gray for secondary text
- **Typography**: Bold headers, italic subtext, clear visual hierarchy
- **Animation Timing**: Optimized intervals for smooth visual experience
- **Interactive Elements**: Clear visual feedback for user interactions

This enhanced design ensures a professional, engaging, and user-respectful startup experience that strengthens the Relaycode brand while providing valuable functionality and education to users.
