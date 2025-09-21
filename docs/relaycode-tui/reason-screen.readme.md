

# REASONING-VIEW.README.MD

## Relaycode TUI: The Reasoning View Component

This document specifies the design and behavior of the Reasoning View. This is a simple but essential **component** for displaying the AI's step-by-step thought process. It renders within the Body of parent screens like the **Review Screen** and **Transaction Details Screen**.

### 1. Core Philosophy

The reasoning behind a change is as important as the change itself. The philosophy of this component is to present the AI's narrative with maximum **readability and clarity**.

-   **Readability:** The text should be formatted cleanly, respecting newlines and list structures from the source data to be easily digestible.
-   **Clarity:** The view should be uncluttered, presenting only the reasoning text under a clear header, free from other UI noise.
-   **Focus:** When active, the component should allow for focused interaction (scrolling) without interference from the parent screen's navigation.

### 2. Context of Use

The Reasoning View is activated and rendered within the Body of a parent screen when the user requests to see the AI's reasoning, typically by pressing `(R)`. It replaces any previous content in the Body.

### 3. UI Layout & Components

1.  **Header:** A single, static line: `REASONING`.
2.  **Content Area:** The main rendering surface for the reasoning text. It displays formatted, multi-line text.

### 4. States & Interactions

The Reasoning View is simpler than the Diff View and has two primary interactive states.

#### **State 4.1: Expanded View**

This is the primary state of the component when it is active.

```
 ... (Parent Screen Navigator, Reasoning section shows '▾') ...
 ──────────────────────────────────────────────────────────────────────────────
  REASONING

  1. Identified a potential uncaught exception in the `restoreSnapshot` function
     if a file operation fails midway through a loop of many files. This could
     leave the project in a partially-reverted, inconsistent state.

  2. Wrapped the file restoration loop in a `Promise.all` and added a dedicated
     error collection array. This ensures that all file operations are
     attempted and that a comprehensive list of failures is available
     afterward for better error reporting or partial rollback logic.

  3. Improved the `getErrorMessage` utility to handle non-Error objects more
     gracefully, as this was a related minor issue found during analysis of
     the error handling pathways.

 ──────────────────────────────────────────────────────────────────────────────
 (↑↓) Scroll Text · (R)Collapse View · (C)opy Mode
```
-   **Behavior:** The component renders the full reasoning text, preserving formatting like numbered lists and paragraph breaks from the transaction file.
-   **Footer Update:** The parent screen's footer updates to show that `(↑↓)` keys are now repurposed for scrolling.

#### **State 4.2: Scrolling Content**

**Trigger:** The reasoning text is too long to fit in the available space, and the user presses `(↑)` or `(↓)`.

-   **Behavior:** The text within the Content Area scrolls up or down. The rest of the UI (parent navigator, headers, footer) remains static. This provides a seamless reading experience for long explanations.
-   **Focus Management:** While the Reasoning View is active, it "captures" the arrow keys for scrolling. Pressing `(R)` again or `(Esc)` would release this capture, returning arrow key control to the parent screen's file navigator.

### 5. Implementation Notes

-   **Data Formatting:** The component should expect the reasoning data as an array of strings or a single multi-line string and be responsible for rendering it with correct line breaks.
-   **Scrolling Logic:** A state variable will need to track the current scroll position (the top visible line). Re-rendering will slice the full text array/string to display the correct "viewport" of text.
-   **Copy Integration:** When the user enters `(C)opy Mode`, one of the available options must be to copy the *entire* reasoning text to the clipboard with a single keystroke.
