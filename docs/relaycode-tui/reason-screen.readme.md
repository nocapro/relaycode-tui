# REASON-SCREEN.README.MD

## Relaycode TUI: The Reasoning View Component

This document specifies the design and behavior of the Reasoning View. This is a simple but essential **component** for displaying the AI's step-by-step thought process. It renders within the Body of parent screens like the **Review Screen** as a dedicated body view.

### 1. Core Philosophy

The reasoning behind a change is as important as the change itself. The philosophy of this component is to present the AI's narrative with maximum **readability and clarity**.

-   **Readability:** The text should be formatted cleanly, respecting newlines and list structures from the source data to be easily digestible.
-   **Clarity:** The view should be uncluttered, presenting only the reasoning text under a clear header, free from other UI noise.
-   **Focus:** When active, the component should allow for focused interaction (scrolling) without interference from the parent screen's navigation.
-   **Context:** The reasoning should be presented with sufficient context about the AI's thought process and decision-making.

### 2. Technical Implementation

#### Component Architecture

-   **Integration:** Built into `ReviewScreen.tsx` as a body view (lines 168-188)
-   **Component:** Uses `ContentView` component for consistent rendering and scrolling
-   **State Management:** Part of the Review Screen's state management system
-   **Navigation:** Accessible via `(R)` key or Enter when reasoning item is selected

#### Key Features

- **Scrollable Content:** Supports long reasoning text with PgUp/PgDn navigation
- **Line Numbering:** Shows current position within the reasoning text
- **Progress Indicator:** Displays visible line range when content is longer than viewport
- **Consistent Styling:** Uses the same styling and interaction patterns as other content views

### 3. Context of Use

The Reasoning View is activated and rendered within the Body of the Review Screen when the user requests to see the AI's reasoning, typically by pressing `(R)` or selecting the reasoning item in the navigator. It replaces any previous content in the Body.

### 4. UI Layout & Components

1.  **Header:** A single, static line: `REASONING`
2.  **Content Area:** The main rendering surface for the reasoning text. It displays formatted, multi-line text with proper line breaks and formatting.
3.  **Progress Indicator:** Shows line count and visible range for long content

### 5. States & Interactions

The Reasoning View is simpler than the Diff View and has two primary interactive states.

#### **State 5.1: Expanded View**

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

#### **State 5.2: Scrolling Content**

**Trigger:** The reasoning text is too long to fit in the available space, and the user presses `(↑)` or `(↓)`.

-   **Behavior:** The text within the Content Area scrolls up or down. The rest of the UI (parent navigator, headers, footer) remains static. This provides a seamless reading experience for long explanations.
-   **Progress Indicator:** Shows the current visible line range (e.g., "Showing lines 11-20 of 45")
-   **Focus Management:** While the Reasoning View is active, it "captures" the arrow keys for scrolling. Pressing `(R)` again or `(Esc)` would release this capture, returning arrow key control to the parent screen's file navigator.

#### **State 5.3: Navigator Integration**

The reasoning view is also accessible through the navigator section:

```
 ▲ relaycode review
 ──────────────────────────────────────────────────────────────────────────────
  4b9d8f03 · refactor: simplify clipboard logic
  (+22/-11) · 2 Files · 2/2 Approved · 3.9s

 (P)rompt ▸ Simplify the clipboard logic using an external library...
> (R)easoning (3 steps) ▾ 1. Identified a potential uncaught exception...
 ──────────────────────────────────────────────────────────────────────────────
  ✓ Post-Command: `bun run test` (2.3s) ▸ Passed (37 tests)
  ✗ Linter: `bun run lint` (1.2s) ▸ 1 Error, 3 Warnings
```
-   **Behavior:** The reasoning item shows the step count and a preview of the first line
-   **Expansion:** Pressing `Enter` or `R` expands the view to show full reasoning
-   **Visual Indicator:** Shows `▾` when expanded, `▸` when collapsed

### 6. Content Rendering

#### Text Formatting

- **Line Breaks:** Preserves original line breaks from the reasoning text
- **Indentation:** Maintains proper indentation for lists and nested content
- **Numbered Lists:** Displays numbered steps with proper alignment
- **Paragraph Spacing:** Maintains paragraph structure for readability

#### Display Logic

```typescript
// Implementation details from ReviewScreen.tsx
if (bodyView === REVIEW_BODY_VIEWS.REASONING) {
    const reasoningText = reasoning || '';
    const reasoningLinesCount = reasoningText.split('\n').length;
    const visibleLinesCount = 10;
    return (
        <Box flexDirection="column">
            <ContentView
                title="REASONING"
                content={reasoningText}
                scrollIndex={contentScrollIndex}
                maxHeight={Math.max(1, availableBodyHeight)}
            />
            {reasoningLinesCount > visibleLinesCount && (
                <Text color="gray">
                    Showing lines {contentScrollIndex + 1}-{Math.min(contentScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
                    of {reasoningLinesCount}
                </Text>
            )}
        </Box>
    );
}
```

### 7. Navigation Controls

#### Keyboard Shortcuts

- **R:** Toggle reasoning view (expand/collapse)
- **↑/↓:** Scroll through reasoning text when view is active
- **PgUp/PgDn:** Navigate through long reasoning content
- **Esc:** Collapse view and return to navigator
- **C:** Enter copy mode (when view is active)

#### Footer Actions

When reasoning view is active, the footer shows:
- **Scroll Controls:** `(↑↓) Scroll Text`
- **View Controls:** `(R)Collapse View`
- **Copy Mode:** `(C)opy Mode`

### 8. Integration Points

#### Store Integration

- **Reasoning Data:** Retrieved from transaction store
- **View State:** Managed through Review Screen's body view state
- **Scroll Position:** Tracked in content scroll index

#### Component Integration

- **ContentView:** Reusable component for consistent text rendering
- **Review Screen:** Parent screen that manages the reasoning view
- **ActionFooter:** Provides contextual actions based on active view

#### Data Flow

1. **User Action:** Press `R` or select reasoning item
2. **State Update:** Review screen updates body view to reasoning
3. **Content Render:** ContentView displays reasoning text with scrolling
4. **Footer Update:** Action footer shows reasoning-specific actions
5. **Interaction:** User can scroll, copy, or collapse the view

### 9. Performance Considerations

- **Efficient Rendering:** Only visible portion of text is rendered
- **Memory Management:** Large reasoning texts are handled with virtual scrolling
- **State Optimization:** Scroll position is maintained without unnecessary re-renders
- **Content Caching:** Reasoning text is cached to avoid repeated processing

### 10. Accessibility Features

- **Keyboard Navigation:** Full keyboard support for all interactions
- **Visual Feedback:** Clear indicators for active view and scroll position
- **Progress Information:** Line count and visible range for long content
- **Consistent Patterns:** Follows same interaction patterns as other content views

### 11. Error Handling

#### Empty Content

- When reasoning text is empty, displays placeholder or informative message
- Gracefully handles missing or malformed reasoning data
- Maintains UI consistency even with incomplete data

#### Display Issues

- Handles extremely long lines by wrapping or truncating
- Manages special characters and formatting issues
- Provides fallback rendering for complex content structures

### 12. Future Enhancements

#### Potential Improvements

- **Syntax Highlighting:** Could highlight code snippets within reasoning
- **Search Functionality:** Allow searching within reasoning text
- **Export Options:** Export reasoning to file or clipboard
- **Formatting Options:** Different display modes for reasoning content

#### Extension Points

- **Plugin System:** Support for custom reasoning formatters
- **Theme Support:** Reasoning-specific styling options
- **Annotation Support:** Allow users to annotate reasoning content
- **Version Control:** Track reasoning changes across transaction versions