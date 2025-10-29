# COPY-SCREEN.README.MD

## Relaycode TUI: The Copy Mode Screen

This document specifies the design and behavior of the Copy Mode screen, which provides a flexible interface for selecting and copying various types of information from Relaycode to the system clipboard.

### 1. Core Philosophy

The Copy Mode screen transforms Relaycode into a powerful information extraction tool, allowing users to selectively copy and share data from their development workflow.

-   **Selective Information Extraction:** Users can choose exactly what information they want to copy, from single lines to comprehensive transaction summaries.
-   **Context-Aware Selection:** The available copy options dynamically adapt based on the current screen and context, providing relevant choices for each situation.
-   **Multi-Item Selection:** Support for selecting multiple items simultaneously, enabling bulk copying operations.
-   **Clipboard Integration:** Seamless integration with the system clipboard for immediate use in other applications.
-   **Non-Modal Operation:** Functions as an overlay that doesn't disrupt the main workflow, allowing quick access to copy functionality.
-   **Feedback-Driven:** Provides clear feedback when items are successfully copied to the clipboard.

### 2. UI Layout Components

The screen uses a compact, focused modal layout designed for quick selection and copying:

1.  **Header:** `▲ relaycode · COPY MODE` - Clear identification of the copy functionality.
2.  **Title Section:** Context-specific title describing what type of content is available for copying.
3.  **Selection List:** Checkbox-style list of available items with keyboard shortcuts.
4.  **Status Bar:** Shows confirmation messages when items are copied.
5.  **Footer / Action Bar:** Context-sensitive actions for selection and copying.

### 3. Visual Design & States

The screen presents a clean, selection-focused interface with clear visual feedback.

#### **State 3.1: Selection Mode**

This is the primary state where users browse and select items to copy.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ ▲ relaycode · COPY MODE                                                      │
 ──────────────────────────────────────────────────────────────────────────────
 │ Select data to copy from commit:                                             │
 │                                                                             │
 │ > [x] (1) Full commit message                                                │
 │   [ ] (2) File changes summary                                              │
 │   [x] (3) Individual file diffs (3 files)                                   │
 │   [ ] (4) Git commit hash                                                   │
 │   [ ] (5) Author information                                                │
 │   [ ] (6) Timestamp information                                             │
 │                                                                             │
 ──────────────────────────────────────────────────────────────────────────────
 │ (Space) Toggle · (A) Select All · (C) Copy Selected · (Esc) Cancel          │
 └─────────────────────────────────────────────────────────────────────────────┘
```
-   **Behavior:** Users navigate through the list and toggle selection of items using checkboxes.
-   **Visual Feedback:** Selected items are marked with `[x]`, navigation highlights the current item in cyan.
-   **Keyboard Shortcuts:** Each item has a numbered shortcut for quick selection.
-   **Context Sensitivity**: The title and available items change based on the source context.

#### **State 3.2: Copy Confirmation**

When items are successfully copied, the screen shows confirmation feedback.

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ ▲ relaycode · COPY MODE                                                      │
 ──────────────────────────────────────────────────────────────────────────────
 │ Select data to copy from review:                                             │
 │                                                                             │
 │   [x] (1) Code changes with explanations                                     │
 │   [x] (2) File modification summary                                          │
 │ > [ ] (3) AI reasoning for changes                                          │
 │   [ ] (4) Error messages and fixes                                          │
 │   [ ] (5) Performance metrics                                               │
 │                                                                             │
 ──────────────────────────────────────────────────────────────────────────────
 │ ✓ Copied 2 items to clipboard: Code changes with explanations, File mod... │
 │ (Space) Toggle · (A) Select All · (C) Copy Selected · (Esc) Cancel          │
 └─────────────────────────────────────────────────────────────────────────────┘
```
-   **Behavior:** Shows a success message when items are copied to the clipboard.
-   **Feedback Details**: Confirmation message shows what was copied and how many items.
-   **Persistent Selection**: Selected items remain selected for additional operations.
-   **Continue Operation**: Users can continue selecting and copying more items.

### 4. Context-Specific Copy Modes

The Copy Mode screen adapts its content based on the current context and screen:

#### **4.1. Commit Context**
Available from the Git Commit screen, this mode provides:
- Full commit messages with proper formatting
- File change summaries with statistics
- Individual file diffs for specific changes
- Git metadata (hash, author, timestamp)
- Branch and repository information

#### **4.2. Review Context**
Available from the Review screen, this mode offers:
- Code changes with AI-generated explanations
- File modification summaries with line counts
- AI reasoning and decision-making process
- Error messages and proposed fixes
- Performance metrics and improvement suggestions

#### **4.3. Transaction Detail Context**
Available from Transaction Detail screen, this mode includes:
- Complete transaction information and metadata
- File-specific changes and modifications
- Commit history and related transactions
- Error logs and debugging information
- Performance statistics and timing data

#### **4.4. History Context**
Available from Transaction History screen, this mode provides:
- Multiple transaction summaries
- Bulk transaction statistics
- Timeline information and patterns
- Success/failure rates and metrics
- Exportable data formats for analysis

### 5. Selection Features

The screen provides sophisticated selection capabilities for efficient copying:

#### **5.1. Individual Selection**
- **Checkbox Interface**: Clear visual indication of selected items
- **Keyboard Navigation**: Arrow keys for navigation, Space for toggling
- **Numbered Shortcuts**: Quick access to specific items (1-9, a-z)
- **Visual Feedback**: Selected items highlighted and clearly marked

#### **5.2. Bulk Operations**
- **Select All**: Quick selection of all available items
- **Clear All**: Deselect all items with a single command
- **Range Selection**: Select multiple consecutive items efficiently
- **Smart Defaults**: Pre-selection of commonly copied items

#### **5.3. Smart Grouping**
- **Related Items**: Groups related items together logically
- **Dependencies**: Automatically includes dependent items when needed
- **Hierarchy**: Maintains hierarchical relationships in copied content
- **Formatting**: Preserves proper formatting and structure

### 6. Clipboard Integration

The screen provides robust clipboard functionality with proper error handling:

#### **6.1. Content Preparation**
- **Format Optimization**: Content is formatted for easy pasting into other applications
- **Structure Preservation**: Maintains proper indentation, line breaks, and formatting
- **Character Encoding**: Proper handling of special characters and Unicode
- **Size Limitations**: Intelligent handling of large content with truncation warnings

#### **6.2. Error Handling**
- **Clipboard Access**: Proper error handling when clipboard is unavailable
- **Permission Issues**: User feedback for clipboard permission problems
- **Content Validation**: Validation of content before copying
- **Retry Logic**: Automatic retry for temporary clipboard failures

#### **6.3. Multi-Format Support**
- **Plain Text**: Basic text format for maximum compatibility
- **Rich Text**: Formatted text with styling when supported
- **Markdown**: Structured markup for documentation and communication
- **Code Blocks**: Properly formatted code for development environments

### 7. Keyboard Navigation

The screen provides comprehensive keyboard navigation for efficient operation:

#### **7.1. Navigation Controls**
- **↑/↓** - Navigate up and down through the item list
- **Page Up/Down** - Jump through the list in larger increments
- **Home/End** - Jump to the beginning or end of the list
- **1-9, a-z** - Quick selection of items by keyboard shortcut

#### **7.2. Selection Controls**
- **Space** - Toggle selection of current item
- **A** - Select all available items
- **C** - Copy selected items to clipboard
- **Esc** - Cancel and close the copy mode

#### **7.3. Advanced Features**
- **Ctrl+A** - Select all (alternative to A)
- **Ctrl+C** - Copy selected (alternative to C)
- **Enter** - Copy selected and close
- **Tab** - Cycle through available sections

### 8. Integration Points

The Copy Mode screen integrates with multiple system components:

#### **8.1. Screen Integration**
- **Context Awareness**: Automatic detection of current screen and context
- **Data Extraction**: Seamless extraction of relevant data from each screen
- **State Preservation**: Maintains screen state when entering and exiting copy mode
- **Transition Handling**: Smooth transitions between screens and copy mode

#### **8.2. Data Services**
- **Transaction Service**: Access to transaction data and metadata
- **Git Service**: Integration with git operations and history
- **AI Service**: Access to AI-generated content and explanations
- **Clipboard Service**: System clipboard integration and management

#### **8.3. User Experience**
- **Feedback System**: Immediate feedback for user actions
- **Error Handling**: Graceful handling of errors and edge cases
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Efficient operation with large datasets

This comprehensive Copy Mode screen design ensures that users can efficiently extract and share information from Relaycode, with context-aware selection, robust clipboard integration, and seamless workflow integration.