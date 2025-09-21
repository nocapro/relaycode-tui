# Directory Structure
```
src/
  components/
    DashboardScreen.tsx
    DiffScreen.tsx
    GlobalHelpScreen.tsx
    InitializationScreen.tsx
    ReasonScreen.tsx
    ReviewScreen.tsx
    Separator.tsx
    SplashScreen.tsx
  stores/
    app.store.ts
    dashboard.store.ts
    init.store.ts
    review.store.ts
  App.tsx
  utils.ts
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/DiffScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
}

const DiffScreen = ({ filePath, diffContent, isExpanded }: DiffScreenProps) => {
    const lines = diffContent.split('\n');
    const COLLAPSE_THRESHOLD = 20;
    const COLLAPSE_SHOW_LINES = 8;

    const renderContent = () => {
        if (!isExpanded && lines.length > COLLAPSE_THRESHOLD) {
            const topLines = lines.slice(0, COLLAPSE_SHOW_LINES);
            const bottomLines = lines.slice(lines.length - COLLAPSE_SHOW_LINES);
            const hiddenLines = lines.length - (COLLAPSE_SHOW_LINES * 2);

            return (
                <>
                    {topLines.map((line, i) => renderLine(line, i))}
                    <Text color="gray">... {hiddenLines} lines hidden ...</Text>
                    {bottomLines.map((line, i) => renderLine(line, i + topLines.length + 1))}
                </>
            );
        }
        return lines.map((line, i) => renderLine(line, i));
    };

    const renderLine = (line: string, key: number) => {
        let color = 'white';
        if (line.startsWith('+')) color = 'green';
        if (line.startsWith('-')) color = 'red';
        if (line.startsWith('@@')) color = 'cyan';
        return <Text key={key} color={color}>{line}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text>DIFF: {filePath}</Text>
            <Box flexDirection="column" marginTop={1}>
                {renderContent()}
            </Box>
        </Box>
    );
};

export default DiffScreen;
```

## File: src/components/ReasonScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string;
}

const ReasonScreen = ({ reasoning }: ReasonScreenProps) => {
    return (
        <Box flexDirection="column">
            <Text>REASONING</Text>
            <Box flexDirection="column" marginTop={1}>
                <Text>{reasoning}</Text>
            </Box>
        </Box>
    );
};

export default ReasonScreen;
```

## File: src/components/ReviewScreen.tsx
```typescript
import React, { useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useReviewStore, type FileItem, type ScriptResult } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';

// --- Sub-components ---

const FileItemRow = ({ file, isSelected }: { file: FileItem, isSelected: boolean }) => {
    let icon;
    let color;
    switch (file.status) {
        case 'APPROVED': icon = '[✓]'; color = 'green'; break;
        case 'REJECTED': icon = '[✗]'; color = 'red'; break;
        case 'FAILED': icon = '[!]'; color = 'red'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;

    const fileDetails = <Text color={color}>{icon} MOD {file.path}</Text>;;
    const strategyDetails = file.error ?
        (<Text color="red">({file.error})</Text>) :
        (<Text>{diffStats} [{strategy}]</Text>);

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{isSelected ? '> ' : '  '}{fileDetails}</Text>
            <Box flexGrow={1} />
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}> {strategyDetails}</Text>
        </Box>
    );
};

const ScriptItemRow = ({ script, isSelected, isExpanded }: { script: ScriptResult, isSelected: boolean, isExpanded: boolean }) => {
    const icon = script.success ? <Text color="green">✓</Text> : <Text color="red">✗</Text>;
    const arrow = isExpanded ? '▾' : '▸';

    const content = (
        <Text>
            {icon} {script.command} ({script.duration}s) {arrow} {script.summary}
        </Text>
    );
    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
};

// --- Main Component ---

const ReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        linesAdded, linesRemoved, duration,
        selectedItemIndex, bodyView, isDiffExpanded,
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval,
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff,
        rejectAllFiles, approve,
    } = store.actions;

    const numFiles = files.length;
    const approvedFilesCount = useMemo(() => files.filter(f => f.status === 'APPROVED').length, [files]);
    const canBeRejected = useMemo(() => files.some(f => f.status === 'APPROVED'), [files]);
    
    useInput((input, key) => {
        if (input.toLowerCase() === 'q') exit();

        if (key.escape) {
            if (bodyView !== 'none') {
                if (bodyView === 'diff') toggleDiffView();
                if (bodyView === 'reasoning') toggleReasoningView();
                if (bodyView === 'script_output') toggleScriptView(selectedItemIndex);
            } else if (canBeRejected) {
                rejectAllFiles();
            } else {
                showDashboardScreen(); // Go back if nothing to reject
            }
            return;
        }

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleReasoningView();

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                toggleFileApproval();
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleDiffView();
            }
        }

        if (input.toLowerCase() === 'x' && bodyView === 'diff') {
            expandDiff();
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleScriptView(selectedItemIndex);
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) approve();
            showDashboardScreen();
        }
    });

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            return <ReasonScreen reasoning={reasoning} />;
        }
        
        if (bodyView === 'diff') {
            const selectedFile = files[selectedItemIndex];
            if (!selectedFile) return null;
            return <DiffScreen filePath={selectedFile.path} diffContent={selectedFile.diff} isExpanded={isDiffExpanded} />;
        }

        if (bodyView === 'script_output') {
             const scriptIndex = selectedItemIndex - numFiles;
             const selectedScript = scripts[scriptIndex];
             if (!selectedScript) return null;
             return (
                <Box flexDirection="column">
                    <Text>OUTPUT: `{selectedScript.command}`</Text>
                    <Box marginTop={1}><Text>{selectedScript.output}</Text></Box>
                </Box>
             );
        };
        
        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        if (bodyView === 'diff') {
            return <Text>(↑↓) Nav · {isDiffExpanded ? '(X)Collapse' : '(X)pand Diff'} · (D/Esc)Collapse View</Text>;
        }
        if (bodyView === 'reasoning') return <Text>(↑↓) Scroll (not implemented) · (R/Esc)Collapse View</Text>;
        if (bodyView === 'script_output') return <Text>(↑↓) Nav · (Ent/Esc)Collapse</Text>;

        // Main footer
        if (bodyView !== 'none') return null; // Should be handled by contextual footers above

        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            if (selectedFile && selectedFile.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
        } else { // script selected
             const isExpanded = selectedItemIndex >= numFiles; // We know bodyView is 'none' here
             actions.push(isExpanded ? '(Ent)Collapse' : '(Ent)Expand');
        }

        actions.push('(R)easoning');

        if (approvedFilesCount > 0) {
            actions.push('(A)pprove');
        }
        if (canBeRejected) {
            actions.push('(Esc)Reject All');
        }

        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator */}
            <Box flexDirection="column" marginY={1}>
                <Box>
                    <Text>{hash} · {message}</Text>
                    {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                </Box>
                <Text>
                    <Text color="green">+{linesAdded}</Text>/<Text color="red">-{linesRemoved}</Text>
                    {' · '}
                    {approvedFilesCount}/{numFiles} Files
                    {' · '}
                    {duration}s
                </Text>
                <Box marginY={1}>
                    <Text>{'▸'} (P)rompt: {prompt.substring(0, 50)}...</Text>
                    <Text>{bodyView === 'reasoning' ? '▾' : '▸'} (R)easoning ({reasoning.split('\n\n').length} steps): {reasoning.split('\n')[0]}</Text>
                </Box>
                <Separator/>
                {scripts.map((script, index) => (
                    <ScriptItemRow 
                        key={script.command} 
                        script={script}
                        isSelected={selectedItemIndex === numFiles + index}
                        isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                    />
                ))}
                <Separator/>
                <Text>FILES</Text>
                 {files.map((file, index) => (
                    <FileItemRow 
                        key={file.id} 
                        file={file} 
                        isSelected={selectedItemIndex === index}
                    />
                ))}
            </Box>
            
            <Separator/>
            
            {/* Body */}
            <Box marginY={1}>
                {renderBody()}
            </Box>

            {(bodyView !== 'none' && renderBody() !== null) && <Separator />}

            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default ReviewScreen;
```

## File: src/components/Separator.tsx
```typescript
import React, { useState, useEffect } from 'react';
import {Text} from 'ink';

const useStdoutDimensions = () => {
	const [dimensions, setDimensions] = useState({ columns: 80, rows: 24 });

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				columns: process.stdout.columns || 80,
				rows: process.stdout.rows || 24,
			});
		};

		updateDimensions();
		process.stdout.on('resize', updateDimensions);

		return () => {
			process.stdout.off('resize', updateDimensions);
		};
	}, []);

	return [dimensions.columns, dimensions.rows];
};

const Separator = () => {
	const [columns] = useStdoutDimensions();
	return <Text>{'─'.repeat(columns || 80)}</Text>;
};

export default Separator;
```

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { sleep } from '../utils';

// --- Types ---
export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'FAILED' | 'REVERTED' | 'IN-PROGRESS';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
}

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'CONFIRM_COMMIT' | 'APPROVING' | 'COMMITTING';

// --- Initial State (for simulation) ---
const createInitialTransactions = (): Transaction[] => [
    { id: '1', timestamp: Date.now() - 15 * 1000, status: 'PENDING', hash: 'e4a7c112', message: 'fix: add missing error handling' },
    { id: '2', timestamp: Date.now() - 2 * 60 * 1000, status: 'APPLIED', hash: '4b9d8f03', message: 'refactor: simplify clipboard logic' },
    { id: '3', timestamp: Date.now() - 5 * 60 * 1000, status: 'COMMITTED', hash: '8a3f21b8', message: 'feat: implement new dashboard UI' },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    transactions: Transaction[];
    selectedTransactionIndex: number;
    showHelp: boolean;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        startCommitAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: createInitialTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        startCommitAll: () => set(state => ({
            status: 'CONFIRM_COMMIT',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                // Find pending transactions and mark them as in-progress
                const pendingTxIds: string[] = [];
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (tx.status === 'PENDING') {
                            pendingTxIds.push(tx.id);
                            return { ...tx, status: 'IN-PROGRESS' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs };
                });

                await sleep(2000); // Simulate approval process

                // Mark them as applied
                set(state => {
                    const newTxs = state.transactions.map(tx => {
                        if (pendingTxIds.includes(tx.id)) {
                            return { ...tx, status: 'APPLIED' as const };
                        }
                        return tx;
                    });
                    return { transactions: newTxs, status: previousStatus };
                });
            } else if (status === 'CONFIRM_COMMIT') {
                set({ status: 'COMMITTING' });
                 // Find applied transactions and mark them as in-progress
                 const appliedTxIds: string[] = [];
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (tx.status === 'APPLIED') {
                            appliedTxIds.push(tx.id);
                             return { ...tx, status: 'IN-PROGRESS' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs };
                 });
 
                 await sleep(2000); // Simulate commit process
 
                 // Mark them as committed
                 set(state => {
                     const newTxs = state.transactions.map(tx => {
                         if (appliedTxIds.includes(tx.id)) {
                             return { ...tx, status: 'COMMITTED' as const };
                         }
                         return tx;
                     });
                     return { transactions: newTxs, status: previousStatus };
                 });
            }
        },
    },
}));
```

## File: src/stores/init.store.ts
```typescript
import { create } from 'zustand';

// Types
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';

export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}

// Initial State definitions from README
export const initialAnalyzeTasks: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

export const initialConfigureTasks: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];

// Store Interface
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (phase: InitPhase) => void;
        updateAnalyzeTask: (id: string, status: TaskStatus) => void;
        setAnalysisResults: (projectId: string, gitignoreFound: boolean) => void;
        updateConfigureTask: (id: string, status: TaskStatus) => void;
        setInteractiveChoice: (choice: GitignoreChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: initialAnalyzeTasks,
    projectId: null,
    gitignoreFound: null,
    configureTasks: initialConfigureTasks,
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setInteractiveChoice: (choice) => set({ interactiveChoice: choice }),
        resetInit: () => set({
            phase: 'ANALYZE',
            analyzeTasks: JSON.parse(JSON.stringify(initialAnalyzeTasks)),
            projectId: null,
            gitignoreFound: null,
            configureTasks: JSON.parse(JSON.stringify(initialConfigureTasks)),
            interactiveChoice: null,
        }),
    },
}));
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';

// --- Types ---

export type FileStatus = 'FAILED' | 'APPROVED' | 'REJECTED';
export interface FileItem {
    id: string;
    path: string;
    status: FileStatus;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}

export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

export type BodyView = 'diff' | 'reasoning' | 'script_output' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';

interface ReviewState {
    // Transaction Info
    hash: string;
    message: string;
    prompt: string;
    reasoning: string;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
    patchStatus: PatchStatus;

    // File & Script Info
    files: FileItem[];
    scripts: ScriptResult[];

    // UI State
    selectedItemIndex: number; // Can be file or script
    bodyView: BodyView;
    isDiffExpanded: boolean;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        toggleDiffView: () => void;
        toggleReasoningView: () => void;
        toggleScriptView: (itemIndex: number) => void;
        expandDiff: () => void;
        approve: () => void;
    };
}

// --- Mock Data ---

const mockFiles: FileItem[] = [
    { id: '1', path: 'src/core/clipboard.ts', status: 'APPROVED', linesAdded: 15, linesRemoved: 8, diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';
+import { getErrorMessage } from '../utils';
 
 export const copy = async (text: string) => {
   try {
-    await copyToClipboard(text);
+    await copyToClipboard(String(text));
     return { success: true };
   } catch (error) {
-    return { success: false, error: error.message };
+    return { success: false, error: getErrorMessage(error) };
   }
 };`, strategy: 'replace' },
    { id: '2', path: 'src/utils/shell.ts', status: 'APPROVED', linesAdded: 7, linesRemoved: 3, diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts
@@ -10,3 +10,11 @@
 export const executeCommand = async (command: string): Promise<string> => {
   // ... implementation
 };
+
+export const getErrorMessage = (error: unknown): string => {
+  if (error instanceof Error) {
+    return error.message;
+  }
+  return String(error);
+};
`, strategy: 'standard-diff' }, // In the spec, this is called 'diff' in brackets. our enum is 'standard-diff'. I'll keep the enum and adjust display.
    { id: '3', path: 'src/components/Button.tsx', status: 'FAILED', linesAdded: 0, linesRemoved: 0, diff: '', error: 'Hunk #1 failed to apply', strategy: 'standard-diff' },
];

const mockScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

const mockReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

// --- Store Implementation ---

export const useReviewStore = create<ReviewState>((set) => ({
    // Transaction Info
    hash: '4b9d8f03',
    message: 'refactor: simplify clipboard logic',
    prompt: 'Simplify the clipboard logic using an external library...',
    reasoning: mockReasoning,
    linesAdded: 22,
    linesRemoved: 11,
    duration: 3.9,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockFiles,
    scripts: mockScripts,

    // UI State
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none',
    isDiffExpanded: false,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: Math.max(0, state.selectedItemIndex - 1),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: Math.min(state.files.length + state.scripts.length - 1, state.selectedItemIndex + 1),
        })),
        toggleFileApproval: () => set(state => {
            const { selectedItemIndex, files } = state;
            if (selectedItemIndex >= files.length) return {}; // Not a file
            
            const newFiles = [...files];
            const file = newFiles[selectedItemIndex];
            if (file) {
                if (file.status === 'APPROVED') {
                    file.status = 'REJECTED';
                } else if (file.status === 'REJECTED') {
                    file.status = 'APPROVED';
                }
            }
            return { files: newFiles };
        }),
        rejectAllFiles: () => set(state => {
            const newFiles = state.files.map(file => {
                if (file.status === 'APPROVED') {
                    return { ...file, status: 'REJECTED' as const };
                }
                return file;
            });
            return { files: newFiles };
        }),
        toggleDiffView: () => set(state => {
            const { bodyView } = state;
            if (state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: bodyView === 'diff' ? 'none' : 'diff',
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        toggleReasoningView: () => set(state => {
            const { bodyView } = state;
            return {
                bodyView: bodyView === 'reasoning' ? 'none' : 'reasoning',
            };
        }),
        toggleScriptView: (itemIndex: number) => set(state => {
            const { bodyView, selectedItemIndex } = state;
            if (bodyView === 'script_output' && selectedItemIndex === itemIndex) {
                return { bodyView: 'none' };
            }
            return { bodyView: 'script_output' };
        }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
    },
}));
```

## File: src/utils.ts
```typescript
// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

## File: tsconfig.json
```json
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
```

## File: src/components/GlobalHelpScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';

const GlobalHelpScreen = () => {
    return (
        <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
        >
            <Box
                flexDirection="column"
                borderStyle="round"
                paddingX={2}
                paddingY={1}
                width="80%"
            >
                <Box justifyContent="center" marginBottom={1}>
                    <Text bold color="cyan">▲ relaycode · keyboard shortcuts</Text>
                </Box>
                <Box flexDirection="column" gap={1}>
                    <Box flexDirection="column">
                        <Text bold color="cyan">GLOBAL</Text>
                        <Text>  <Text color="cyan" bold>?</Text>        Toggle this help screen</Text>
                        <Text>  <Text color="cyan" bold>Q</Text>        Quit to terminal (from main screens)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">DASHBOARD (watch)</Text>
                        <Text>  <Text color="cyan" bold>↑↓</Text>       Navigate event stream</Text>
                        <Text>  <Text color="cyan" bold>P</Text>        Pause / Resume clipboard watcher</Text>
                        <Text>  <Text color="cyan" bold>A</Text>        Approve all pending transactions</Text>
                        <Text>  <Text color="cyan" bold>C</Text>        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">REVIEW & DETAILS SCREENS</Text>
                        <Text>  <Text color="cyan" bold>D</Text>        Show / Collapse file diff</Text>
                        <Text>  <Text color="cyan" bold>R</Text>        Show / Collapse reasoning steps</Text>
                        <Text>  <Text color="cyan" bold>C</Text>        Enter / Exit Copy Mode (Details Screen)</Text>
                        <Text>  <Text color="cyan" bold>U</Text>        Undo / Revert Transaction</Text>
                        <Text>  <Text color="cyan" bold>Space</Text>    Toggle approval state of a file (Review Screen)</Text>
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text bold>(Press <Text color="cyan" bold>?</Text> or <Text color="cyan" bold>Esc</Text> to close)</Text>
            </Box>
        </Box>
    );
};

export default GlobalHelpScreen;
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
    },
}));
```

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';

// Check if we're running in an interactive terminal
if (process.stdin.isTTY && process.stdout.isTTY) {
    render(<App />);
} else {
    process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
    process.exit(1);
}
```

## File: src/components/DashboardScreen.tsx
```typescript
import React, { useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { useDashboardStore, type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return <Text color="yellow">?</Text>;
        case 'APPLIED': return <Text color="green">✓</Text>;
        case 'COMMITTED': return <Text color="blue">→</Text>;
        case 'FAILED': return <Text color="red">✗</Text>;
        case 'REVERTED': return <Text color="gray">↩</Text>;
        case 'IN-PROGRESS': return <Spinner type="dots" />;
        default: return <Text> </Text>;
    }
};

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `-${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `-${minutes}m`;
};

const EventStreamItem = ({ transaction, isSelected }: { transaction: Transaction, isSelected: boolean }) => {
    const icon = getStatusIcon(transaction.status);
    const time = formatTimeAgo(transaction.timestamp).padEnd(5, ' ');
    const statusText = transaction.status.padEnd(11, ' ');
    
    const messageNode = transaction.status === 'IN-PROGRESS'
        ? <Text color="cyan">{transaction.message}</Text>
        : transaction.message;
    
    const content = (
        <Text>
            {time} {icon} {statusText} <Text color="gray">{transaction.hash}</Text> · {messageNode}
        </Text>
    );

    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
};

const ConfirmationContent = ({ status, transactionsToConfirm }: { status: DashboardStatus, transactionsToConfirm: Transaction[] }) => {
    const isApprove = status === 'CONFIRM_APPROVE';
    const actionText = isApprove ? 'APPROVE' : 'COMMIT';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold color="yellow">{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>
                The following {transactionsToConfirm.length} transaction(s) will be {isApprove ? 'approved' : 'committed'}:
            </Text>
            <Box flexDirection="column" paddingLeft={1} marginTop={1}>
                {transactionsToConfirm.map(tx => (
                    <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
                ))}
            </Box>
        </Box>
    );
};

// --- Main Component ---

const DashboardScreen = () => {
    const { status, transactions, selectedTransactionIndex, showHelp } = useDashboardStore();
    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        startCommitAll,
        confirmAction,
        cancelAction,
        toggleHelp,
    } = useDashboardStore(s => s.actions);
    const { exit } = useApp();
    const showReviewScreen = useAppStore(s => s.actions.showReviewScreen);

    const pendingApprovals = useMemo(() => transactions.filter(t => t.status === 'PENDING').length, [transactions]);
    const pendingCommits = useMemo(() => transactions.filter(t => t.status === 'APPLIED').length, [transactions]);

    const isModal = status === 'CONFIRM_APPROVE' || status === 'CONFIRM_COMMIT';
    const isProcessing = status === 'APPROVING' || status === 'COMMITTING';
    
    useInput((input, key) => {
        if (input === '?') {
            toggleHelp();
            return;
        }

        if (showHelp) {
            if (key.escape || input === '?') toggleHelp();
            return;
        }

        if (isModal) {
            if (key.return) confirmAction();
            if (key.escape) cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing
        
        if (input.toLowerCase() === 'q') exit();

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        
        if (key.return) {
            showReviewScreen();
        }
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) startCommitAll();
    });

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            case 'COMMITTING': statusText = 'COMMITTING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>;
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        let commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'COMMITTING') commitStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'CONFIRM_APPROVE') {
            approvalStr = <Text bold color="yellow">┌ {approvalStr} ┐</Text>;
        }
        if (status === 'CONFIRM_COMMIT') {
            commitStr = <Text bold color="yellow">┌ {commitStr} ┐</Text>;
        }
        
        return (
            <Text>
                STATUS: {statusIcon} {statusText} · APPROVALS: {approvalStr} · COMMITS: {commitStr}
            </Text>
        );
    };

    const renderFooter = () => {
        if (isModal) return (
            <Text>
                (<Text color="cyan" bold>Enter</Text>) Confirm      (<Text color="cyan" bold>Esc</Text>) Cancel
            </Text>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const pauseAction = status === 'PAUSED'
			? <Text>(<Text color="cyan" bold>R</Text>)esume</Text>
			: <Text>(<Text color="cyan" bold>P</Text>)ause</Text>;
		return (
            <Text color="gray">
                (<Text color="cyan" bold>↑↓</Text>) Nav · (<Text color="cyan" bold>Enter</Text>) Review · (<Text color="cyan" bold>A</Text>)pprove All · (<Text color="cyan" bold>C</Text>)ommit All · {pauseAction} · (<Text color="cyan" bold>Q</Text>)uit
            </Text>
        );
    };
    
    const transactionsToConfirm = useMemo(() => {
        if (status === 'CONFIRM_APPROVE') return transactions.filter(t => t.status === 'PENDING');
        if (status === 'CONFIRM_COMMIT') return transactions.filter(t => t.status === 'APPLIED');
        return [];
    }, [status, transactions]);

    return (
        <Box flexDirection="column" height="100%">
            {showHelp && <GlobalHelpScreen />}

            <Box flexDirection="column" display={showHelp ? 'none' : 'flex'}>
                <Text color="cyan">▲ relaycode dashboard</Text>
                <Separator />
                <Box marginY={1}>
                    {renderStatusBar()}
                </Box>
                
                {isModal && (
                    <>
                        <ConfirmationContent status={status} transactionsToConfirm={transactionsToConfirm} />
                        <Separator />
                    </>
                )}
                
                <Text bold underline> EVENT STREAM (Last 15 minutes)</Text>
                <Box flexDirection="column" marginTop={1}>
                    {transactions.map((tx, index) => (
                        <EventStreamItem 
                            key={tx.id} 
                            transaction={tx} 
                            isSelected={!isModal && index === selectedTransactionIndex}
                        />
                    ))}
                </Box>

                <Box marginTop={1}><Separator /></Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default DashboardScreen;
```

## File: src/components/InitializationScreen.tsx
```typescript
import React, { useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useInitStore, type Task, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import Separator from './Separator';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
	let symbol: React.ReactNode;
	switch (task.status) {
		case 'pending': symbol = '( )'; break;
		case 'active': symbol = <Text color="cyan">(●)</Text>; break;
		case 'done': symbol = <Text color="green">{doneSymbol}</Text>; break;
	}

	const title = task.status === 'done' && doneSymbol?.startsWith('[✓]') ? `Created ${task.title.split(' ')[1]}` : task.title;

	return (
		<Box flexDirection="column">
			<Text>
				{symbol} {title}
			</Text>
			{task.subtext && task.status !== 'done' && (
				<Text italic color="gray">
					{'     └─ '}{task.subtext}
				</Text>
			)}
		</Box>
	);
};

const InitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const analyzeTasks = useInitStore(s => s.analyzeTasks);
    const configureTasks = useInitStore(s => s.configureTasks);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const projectId = useInitStore(s => s.projectId);
    const actions = useInitStore(s => s.actions);
    const showDashboardScreen = useAppStore(s => s.actions.showDashboardScreen);
    const { exit } = useApp();

    useInput((input, key) => {
        if (phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (phase === 'FINALIZE') {
            if (input.toLowerCase() === 'q') {
                exit();
            } else if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
        }
    });

    useEffect(() => {
        actions.resetInit();
        const runSimulation = async () => {
            actions.setPhase('ANALYZE');
            for (const task of initialAnalyzeTasks) {
                actions.updateAnalyzeTask(task.id, 'active');
                await sleep(800);
                actions.updateAnalyzeTask(task.id, 'done');
            }
            actions.setAnalysisResults(`'relaycode' (from package.json)`, true);
            await sleep(500);

            actions.setPhase('CONFIGURE');
            const configTasksUntilInteractive = initialConfigureTasks.slice(0, 2);
            for (const task of configTasksUntilInteractive) {
                actions.updateConfigureTask(task.id, 'active');
                await sleep(800);
                actions.updateConfigureTask(task.id, 'done');
            }
            await sleep(500);

            actions.setPhase('INTERACTIVE');
        };

        runSimulation();
    }, [actions]);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            const resumeSimulation = async () => {
                actions.setPhase('CONFIGURE');
                const lastTask = initialConfigureTasks[2];
                if (lastTask) {
                    actions.updateConfigureTask(lastTask.id, 'active');
                    await sleep(800);
                    actions.updateConfigureTask(lastTask.id, 'done');
                    await sleep(500);

                    actions.setPhase('FINALIZE');
                }
            };
            resumeSimulation();
        }
    }, [interactiveChoice, phase, actions]);

    const renderAnalyze = () => (
        <Box flexDirection="column">
            <Text bold color="cyan">PHASE 1: ANALYZE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {analyzeTasks.map(t => <TaskItem key={t.id} task={t} />)}
            </Box>
        </Box>
    );

    const renderContext = () => (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold color="cyan">CONTEXT</Text>
            <Text>  <Text color="green">✓</Text> Project ID: {projectId}</Text>
            <Text>  <Text color="green">✓</Text> Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text><Text color="cyan">&gt;</Text> The .relay/ directory is usually ignored by git.</Text>
                    <Text>  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = interactiveChoice === 'share'
            ? '.relay/ directory initialized. It will be committed to git.'
            : '.relay/ directory initialized and added to .gitignore.';
        const stateSubText = interactiveChoice === 'share'
            ? undefined
            : 'Local transaction history will be stored here.';
        
        return (
            <Box flexDirection="column">
                <Text bold color="green"> SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> Config:   relay.config.json created.</Text>
                        <Text color="gray" italic>          › Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> State:    {stateText}</Text>
                        {stateSubText && <Text color="gray" italic>          › {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> Prompt:   System prompt generated at .relay/prompts/system-prompt.md.</Text>
                        <Text color="gray" italic>          › Copied to clipboard. Paste into your AI&apos;s custom instructions.</Text>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderPhase = () => {
        switch (phase) {
            case 'ANALYZE': return renderAnalyze();
            case 'CONFIGURE': return renderConfigure();
            case 'INTERACTIVE': return renderInteractive();
            case 'FINALIZE': return renderFinalize();
        }
    };
    
    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return (
        <Box flexDirection="column">
            <Text color="cyan">{phase === 'FINALIZE' ? '▲ relaycode bootstrap complete' : '▲ relaycode bootstrap'}</Text>
            <Separator />
            <Box marginY={1}>{renderPhase()}</Box>
            <Separator />
            {typeof footerText === 'string' ? <Text>{footerText}</Text> : footerText}
        </Box>
    );
};

export default InitializationScreen;
```

## File: src/components/SplashScreen.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';

const SplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState(5);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput(() => {
        handleSkip();
    });

    useEffect(() => {
        if (countdown === 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showInitScreen]);

    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀
`;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode</Text>
            <Separator />
            <Text color="cyan">{logo}</Text>
            <Box flexDirection="column" alignItems="center">
                <Text italic>A zero-friction, AI-native patch engine.</Text>
                <Text italic color="gray">Built by Arman and contributors · <Text underline>https://relay.noca.pro</Text></Text>
            </Box>
            
            <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                <Box flexDirection="column" width="45%">
                    <Text>Version 1.1.5</Text>
                    <Text>─────────────────────────</Text>
                    <Text>relaycode</Text>
                    <Text>relaycode-core</Text>
                    <Text>apply-multi-diff</Text>
                    <Text>konro</Text>
                </Box>
                 <Box flexDirection="column" width="45%">
                    <Text>Build Timestamps</Text>
                    <Text>─────────────────────────</Text>
                    <Text>2025-09-20 13:58:05</Text>
                    <Text>2025-09-20 10:59:05</Text>
                    <Text>(versioned)</Text>
                    <Text>(versioned)</Text>
                </Box>
            </Box>
            
            <Box marginTop={1}><Separator /></Box>
            <Text>If you love this workflow, check out <Text underline>https://www.noca.pro</Text> for the full</Text>
            <Text>web app with repo-wide visual context, history, and rollback.</Text>
            <Text><Text color="cyan" bold>(V)</Text>isit noca.pro</Text>
            <Separator />
            <Text>Follow <Text color="cyan" bold>(X)</Text> · Join <Text color="cyan" bold>(D)</Text>iscord · Star on <Text color="cyan" bold>(G)</Text>itHub</Text>
            <Separator />
            <Text>Loading... {countdown} (<Text color="gray">Press any key to skip</Text>)</Text>
        </Box>
    );
};

export default SplashScreen;
```

## File: src/App.tsx
```typescript
import React, { useEffect } from 'react';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen]);
    
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    if (currentScreen === 'dashboard') {
        return <DashboardScreen />;
    }

    if (currentScreen === 'review') {
        return <ReviewScreen />;
    }

    return null;
};

export default App;
```

## File: package.json
```json
{
  "name": "relaycode-tui",
  "module": "index.tsx",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "bun run index.tsx",
    "dev": "bun run --watch index.tsx",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-text-input": "^4.0.3",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "clipboardy": "^4.0.0",
    "zustand": "^4.4.1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.5.9",
    "@types/react": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "typescript": "^5"
  }
}
```
