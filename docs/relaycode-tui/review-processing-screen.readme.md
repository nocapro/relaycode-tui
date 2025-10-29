# Review Processing Screen

## Relaycode TUI: Live Patch Application Screen

The **Review Processing Screen** provides real-time, step-by-step feedback during patch application. This screen is the first thing users see when a patch is being processed, giving them confidence that the system is working and transparency into the process.

---

## Live Interface Demonstration

### Active Processing State
```
▲ relaycode
──────────────────────────────────────────────────────────────────────────────
                 APPLYING PATCH
──────────────────────────────────────────────────────────────────────────────
Applying patch 4b9d8f03... (refactor: simplify clipboard logic)

(●) Reading initial file snapshot... (0.1s)
(●) Applying operations to memory... (0.3s)
    └─ ○ write: src/core/clipboard.ts
    └─ ○ write: src/utils/shell.ts
( ) Running post-command script...
( ) Analyzing changes with linter...

──────────────────────────────────────────────────────────────────────────────
Elapsed: 0.4s · Processing... Please wait.

[Ctrl+C] Cancel Process [S] Skip Script
```

### Visual Status Indicators
- `( )` - Pending step (waiting to start)
- `(●)` - Active step with spinner animation (in progress)
- `[✓]` - Completed successfully
- `[!]` - Failed operation with error details
- `(-)` - Skipped (due to previous failure)

### Substep Visualization
Each main step can expand to show detailed substeps:
```
(●) Applying operations to memory... (0.3s)
    └─ ● write: src/core/clipboard.ts (spinner active)
    └─ ○ write: src/utils/shell.ts
```

---

## Real-Time Feedback Flow

### Success Case Timeline
1. **File Snapshot**: `(●) Reading initial file snapshot... (0.1s)` → `[✓] Reading initial file snapshot... (0.1s)`
2. **Memory Operations**: Shows individual file operations with patch strategies
3. **Post-Command**: Executes build/test scripts with live output
4. **Lint Analysis**: Runs validation tools with error counts

### Partial Failure Handling
When patch application fails, dependent steps are automatically skipped:
```
[✓] Reading initial file snapshot... (0.1s)
[!] Applying operations to memory... (0.5s)
    └─ ✗ src/utils/logger.ts (Hunk #1 failed to apply)
    └─ ✗ src/commands/apply.ts (Context mismatch at line 92)
(-) SKIPPED Post-command script...
    └─ Skipped due to patch application failure
(-) SKIPPED Analyzing changes with linter...
    └─ Skipped due to patch application failure
```

---

## Interactive Controls

### Keyboard Shortcuts
- **Ctrl+C**: Cancel the entire patch application process
- **S**: Skip the currently running post-command script (when skippable)

### Dynamic Footer States
- **Processing**: Shows elapsed time and available actions
- **Cancelling**: `Elapsed: 2.3s · Cancelling... Please wait.`
- **Success**: `Elapsed: 3.9s · Patch applied successfully. Transitioning...`
- **Failure**: `Elapsed: 0.6s · Transitioning to repair workflow...`

---

## Technical Implementation

### Component Architecture
```tsx
// Main component structure
<ScreenLayout title="APPLYING PATCH" footer={dynamicFooter}>
  <TransactionInfo />
  <ApplyStepsList>
    {applySteps.map(step => (
      <ApplyStepRow key={step.id} step={step} now={currentTime} />
    ))}
  </ApplyStepsList>
</ScreenLayout>
```

### State Management
- **Real-time Timer**: Updates every 100ms for accurate elapsed time display
- **Step Progression**: Manages status transitions (pending → active → done/failed)
- **Substep Tracking**: Supports nested file operations within main steps
- **Skip Logic**: Determines when post-command scripts can be safely skipped

### Error Handling
- **Graceful Degradation**: Individual file failures don't crash the entire process
- **Clear Messaging**: Each failed operation includes specific error details
- **Dependency Awareness**: Automatically skips dependent steps on failure
- **Repair Integration**: Seamlessly transitions to interactive repair workflow

---

## Animation & UX Details

### Spinner States
- **Main Steps**: Static symbols `(●)` with color changes
- **Substeps**: Animated spinners using Ink's `<Spinner type="dots" />` component
- **Color Coding**: Cyan (active), Green (success), Red (error), Gray (skipped)

### Timing Display
- **Active Steps**: Real-time duration updates every 100ms
- **Completed Steps**: Final duration frozen on completion
- **Precision**: Shows timing to 1 decimal place for granular feedback

### Visual Hierarchy
- **Transaction Info**: Hash and message prominently displayed
- **Step Progression**: Clear top-to-bottom flow with indentation
- **Footer Actions**: Context-sensitive controls separated by separator
- **Status Consistency**: Symbol and color language used throughout app
