# AI-PROCESSING-SCREEN.README.MD

## Relaycode TUI: The AI Auto-Repair Processing Screen

This document specifies the design and behavior of the AI Auto-Repair Processing screen, which provides real-time feedback during automated AI-powered code repair operations.

### 1. Core Philosophy

The AI Processing screen serves as a sophisticated monitoring interface for AI-powered code repair operations. It transforms complex AI processing into an understandable, transparent user experience.

-   **Real-time Transparency:** Provides live visibility into AI operations that would otherwise be opaque "black boxes."
-   **Step-by-Step Clarity:** Breaks down complex AI workflows into discrete, understandable steps with clear status indicators.
-   **Progress Awareness:** Shows elapsed time and step durations to help users understand operation complexity and expected completion times.
-   **Error Context:** Displays detailed error information and failed sub-steps to aid in debugging and understanding AI limitations.
-   **Non-Blocking Operation:** Allows users to monitor long-running AI operations while maintaining the ability to cancel if needed.
-   **Professional Presentation:** Presents AI capabilities in a structured, confidence-inspiring manner that builds trust in the automation system.

### 2. UI Layout Components

The screen follows a clean, focused layout designed for monitoring complex operations:

1.  **Header:** `▲ relaycode · AI AUTO-REPAIR` - Clear identification of the current operation.
2.  **Status Bar:** Shows elapsed time and current processing state with action guidance.
3.  **Operation Context:** Brief description of what's being repaired and for which transaction.
4.  **Process Steps List:** A hierarchical list showing the AI workflow with main steps and sub-steps.
5.  **Footer / Action Bar:** Dynamic footer showing elapsed time and available actions based on processing state.

### 3. Visual Design & States

The screen presents AI processing as a structured workflow with visual status indicators and timing information.

#### **State 3.1: Active Processing**

This is the primary state during AI auto-repair operations.

```
 ▲ relaycode · AI AUTO-REPAIR
 ──────────────────────────────────────────────────────────────────────────────
 Attempting to auto-repair 3 files... (fix: add missing error handling)

 (●) Analyzing transaction context
 (●) Generating repair prompts (0.3s)
     └─ ● Analyzing file: src/core/transaction.ts
     └─ ○ Analyzing file: src/utils/logger.ts
     └─ ○ Analyzing file: src/commands/apply.ts
 ( ) Requesting AI assistance
 ( ) Processing AI response
 ( ) Applying repairs
 ( ) Validating results

 ──────────────────────────────────────────────────────────────────────────────
 Elapsed: 2.1s · Processing... Please wait.
 ──────────────────────────────────────────────────────────────────────────────
 (Ctrl+C) Cancel Process
```
-   **Behavior:** Steps progress from pending to active to done with real-time timing information.
-   **Visual Feedback:** Active steps show spinners, completed steps show checkmarks, failed steps show error indicators.
-   **Hierarchical Display:** Main steps and sub-steps are visually distinct with proper indentation.
-   **Timing Information:** Real-time elapsed time and step durations help users understand operation progress.

#### **State 3.2: Step Failure**

When individual steps or sub-steps fail, the screen shows detailed error context.

```
 ▲ relaycode · AI AUTO-REPAIR
 ──────────────────────────────────────────────────────────────────────────────
 Attempting to auto-repair 3 files... (fix: add missing error handling)

 [✓] Analyzing transaction context (0.2s)
 [✓] Generating repair prompts (0.3s)
     └─ ✓ Analyzing file: src/core/transaction.ts
     └─ ✓ Analyzing file: src/utils/logger.ts
     └─ ✓ Analyzing file: src/commands/apply.ts
 [!] Requesting AI assistance (failed)
     └─ ✗ API rate limit exceeded
     └─ ○ Retrying in 5s...
 ( ) Processing AI response
 ( ) Applying repairs
 ( ) Validating results

 ──────────────────────────────────────────────────────────────────────────────
 Elapsed: 8.7s · Processing... Please wait.
 ──────────────────────────────────────────────────────────────────────────────
 (Ctrl+C) Cancel Process
```
-   **Behavior:** Failed steps show error indicators with detailed failure information in sub-steps.
-   **Error Context:** Specific error messages help users understand what went wrong and why.
-   **Retry Logic:** Shows automatic retry attempts with countdown timers when applicable.
-   **Visual Hierarchy:** Errors are clearly distinguished with red coloring and appropriate symbols.

#### **State 3.3: Completion**

When processing completes successfully, the screen shows final results before transitioning.

```
 ▲ relaycode · AI AUTO-REPAIR
 ──────────────────────────────────────────────────────────────────────────────
 Attempting to auto-repair 3 files... (fix: add missing error handling)

 [✓] Analyzing transaction context (0.2s)
 [✓] Generating repair prompts (0.3s)
     └─ ✓ Analyzing file: src/core/transaction.ts
     └─ ✓ Analyzing file: src/utils/logger.ts
     └─ ✓ Analyzing file: src/commands/apply.ts
 [✓] Requesting AI assistance (2.1s)
 [✓] Processing AI response (0.5s)
 [✓] Applying repairs (1.2s)
 [✓] Validating results (0.8s)

 ──────────────────────────────────────────────────────────────────────────────
 Elapsed: 5.1s · Repair complete. Transitioning...
```
-   **Behavior:** All steps show as completed with final timing information.
-   **Success Indication:** Clear visual feedback that the operation completed successfully.
-   **Transition State:** Shows that the system is preparing to transition to the next screen.
-   **Final Summary**: Complete timing information helps users understand the total operation cost.

### 4. Step Status Indicators

The screen uses a sophisticated system of status indicators to communicate operation progress:

#### **Main Step Indicators**

| Symbol | Status | Meaning |
| :--- | :--- | :--- |
| `( )` | **PENDING** | Step is waiting to be executed. |
| `(●)` | **ACTIVE** | Step is currently executing with spinner animation. |
| `[✓]` | **COMPLETED** | Step completed successfully with timing. |
| `[!]` | **FAILED** | Step failed with error details in sub-steps. |
| `(-)` | **SKIPPED** | Step was skipped due to preconditions or context. |

#### **Sub-step Indicators**

| Symbol | Status | Meaning |
| :--- | :--- | :--- |
| `○` | **PENDING** | Sub-step is waiting to be executed. |
| `●` | **ACTIVE** | Sub-step is currently executing. |
| `✓` | **COMPLETED** | Sub-step completed successfully. |
| `✗` | **FAILED** | Sub-step failed with error message. |

### 5. AI Processing Workflow

The screen orchestrates a sophisticated AI-powered repair workflow:

#### **5.1. Context Analysis Phase**
- **Transaction Analysis**: Examines the failed transaction to understand the context
- **File Examination**: Analyzes each affected file to identify patterns and issues
- **Error Classification**: Categorizes the type of failure to guide repair strategy

#### **5.2. AI Interaction Phase**
- **Prompt Generation**: Creates detailed prompts for the AI based on analysis
- **API Communication**: Sends requests to AI provider with proper error handling
- **Response Processing**: Parses and validates AI-generated repair suggestions

#### **5.3. Application Phase**
- **Patch Generation**: Converts AI suggestions into applicable code patches
- **File Modification**: Applies repairs to the appropriate files
- **Validation**: Verifies that repairs don't introduce new issues

#### **5.4. Quality Assurance**
- **Syntax Checking**: Ensures modified code is syntactically correct
- **Logic Validation**: Verifies that repairs address the original issue
- **Integration Testing**: Checks that repairs work within the broader codebase

### 6. Error Handling & Recovery

The screen implements comprehensive error handling for AI operations:

#### **6.1. API Errors**
- **Rate Limiting**: Automatic retry with exponential backoff
- **Authentication**: Clear feedback for invalid API keys
- **Network Issues**: Timeout handling and reconnection logic
- **Service Outages**: Graceful degradation with user notification

#### **6.2. Processing Errors**
- **Invalid Responses**: Validation of AI-generated content
- **Malformed Patches**: Syntax checking and repair validation
- **File Conflicts**: Handling of concurrent modifications
- **Resource Limits**: Memory and processing time management

#### **6.3. User Control**
- **Cancellation**: Ability to interrupt long-running operations
- **Retry Options**: Manual retry for failed operations
- **Fallback Paths**: Alternative strategies when AI repair fails
- **Error Logging**: Detailed logging for debugging and improvement

### 7. Performance Optimization

The screen includes several performance optimizations for AI operations:

#### **7.1. Efficient Processing**
- **Parallel Analysis**: Multiple files analyzed simultaneously when possible
- **Caching**: Reuse of analysis results for similar operations
- **Batching**: Grouping of AI requests to minimize API calls
- **Streaming**: Real-time updates for long-running operations

#### **7.2. Resource Management**
- **Memory Monitoring**: Prevention of memory leaks during processing
- **Timeout Handling**: Configurable timeouts for different operation types
- **Cleanup**: Proper resource cleanup after completion or cancellation
- **State Management**: Efficient state updates to prevent UI lag

### 8. Integration Points

The AI Processing screen integrates with multiple system components:

#### **8.1. AI Provider Integration**
- **Provider Selection**: Support for multiple AI providers (OpenAI, Anthropic, etc.)
- **Configuration Management**: Dynamic configuration of AI parameters
- **Cost Monitoring**: Tracking of API usage and costs
- **Model Selection**: Choice of AI models based on task requirements

#### **8.2. Transaction System**
- **State Updates**: Real-time updates to transaction state
- **History Tracking**: Logging of AI repair attempts and outcomes
- **Rollback Support**: Ability to revert AI-generated changes
- **Validation Integration**: Coordination with transaction validation systems

#### **8.3. User Experience**
- **Progress Feedback**: Clear communication of operation progress
- **Error Communication**: User-friendly error messages and suggestions
- **Cancelation Support**: Clean interruption of operations
- **Transition Handling**: Smooth transitions to next logical screens

This comprehensive AI Processing screen design ensures that users have full visibility into AI-powered repair operations, with robust error handling, performance optimization, and seamless integration with the broader Relaycode system.