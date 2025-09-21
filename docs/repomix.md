# Directory Structure
```
src/
  components/
    CommandBar.tsx
    ConfirmationDialog.tsx
    DiffView.tsx
    FileListView.tsx
    Panel.tsx
    StatusBar.tsx
    TransactionListView.tsx
  views/
    HistoryView.tsx
    ReadyView.tsx
    ReviewView.tsx
    WorkingView.tsx
  App.tsx
  constants.ts
  store.ts
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/ConfirmationDialog.tsx
```typescript
import React, { type PropsWithChildren } from 'react';
import { Box, Text, useInput } from 'ink';

interface ConfirmationDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({ onConfirm, onCancel, children }: PropsWithChildren<ConfirmationDialogProps>) {
  useInput((input, key) => {
    if (input.toLowerCase() === 'y') onConfirm();
    if (input.toLowerCase() === 'n' || key.escape) onCancel();
  });

  // Use a Box that covers the whole screen to trap focus, though Ink doesn't really have focus trapping.
  // The absolute positioning and high-level rendering will make it appear on top.
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      justifyContent="center"
      alignItems="center"
    >
        <Box
          borderStyle="double"
          borderColor="yellow"
          flexDirection="column"
          padding={1}
          width="50%"
        >
          <Text bold>{children}</Text>
          <Text color="gray" marginTop={1}>
            Confirm? (Y/N)
          </Text>
        </Box>
    </Box>
  );
}
```

## File: src/components/CommandBar.tsx
```typescript
import React from 'react';
import {Box, Text} from 'ink';
import chalk from 'chalk';

interface Command {
  key: string;
  label: string;
}

interface CommandBarProps {
  commands: Command[];
}

export default function CommandBar({commands}: CommandBarProps) {
  return (
    <Box>
      {commands.map((cmd, i) => (
        <Box key={cmd.key} marginLeft={i > 0 ? 4 : 0}>
          <Text>{chalk.inverse(` ${cmd.key} `)}</Text>
          <Text> {cmd.label}</Text>
        </Box>
      ))}
    </Box>
  );
}
```

## File: src/components/DiffView.tsx
```typescript
import React from 'react';
import {Box, Text} from 'ink';

const DiffView = ({diff}: {diff: string}) => {
  const lines = diff.split('\n');
  return (
    <Box flexDirection="column">
      {lines.map((line, index) => {
        let color: string | undefined = undefined;
        if (line.startsWith('+')) {
          color = 'green';
        } else if (line.startsWith('-')) {
          color = 'red';
        } else if (line.startsWith('@@') || line.startsWith('diff --git')) {
          color = 'cyan';
        }
        return (
          <Text key={index} color={color}>
            {line}
          </Text>
        );
      })}
    </Box>
  );
};
export default DiffView;
```

## File: src/components/FileListView.tsx
```typescript
import React from 'react';
import {Box, Text} from 'ink';

const getDiffStats = (diff: string) => {
  if (!diff) return {added: 0, removed: 0};
  const lines = diff.split('\n');
  const added = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const removed = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
  return {added, removed};
};

const getFileColor = (type: string) => {
  switch (type) {
    case 'A':
      return 'green';
    case 'M':
      return 'yellow';
    case 'D':
      return 'red';
    default:
      return 'white';
  }
};

interface FileListProps {
  files: {type: string; path: string; diff: string}[];
  selectedIndex: number;
}

export default function FileListView({files, selectedIndex}: FileListProps) {
  return (
    <Box flexDirection="column">
      {files.map((file, index) => {
        const {added, removed} = getDiffStats(file.diff);
        return (
          <Box key={file.path} backgroundColor={index === selectedIndex ? 'gray' : undefined} paddingX={1}>
            <Box flexGrow={1}>
              <Text color={getFileColor(file.type)} bold>
                {file.type}{' '}
              </Text>
              <Text>{file.path}</Text>
            </Box>
            <Box>
              {added > 0 && <Text color="green"> +{added}</Text>}
              {removed > 0 && <Text color="red"> -{removed}</Text>}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
```

## File: src/components/Panel.tsx
```typescript
import React, {type PropsWithChildren} from 'react';
import {Box, Text} from 'ink';

interface PanelProps {
  title: string;
}

export default function Panel({
  title,
  children,
}: PropsWithChildren<PanelProps>) {
  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      flexDirection="column"
      paddingX={1}
      flexGrow={1}
    >
      <Box marginTop={-1} marginLeft={1}>
        <Text color="cyan"> {title} </Text>
      </Box>
      <Box flexGrow={1}>{children}</Box>
    </Box>
  );
}
```

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App.tsx';

render(<App />);
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
    "jsx": "react",
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

## File: src/components/StatusBar.tsx
```typescript
import React from 'react';
import {Box, Text} from 'ink';
import {useStore} from '../store';
import chalk from 'chalk';

export default function StatusBar() {
  const statusMessage = useStore(state => state.statusMessage);

  let statusColor = 'gray';
  let finalMessage = statusMessage;
  let boxColor = 'gray';

  const lowerCaseMessage = statusMessage.toLowerCase();

  if (lowerCaseMessage.startsWith('[watching]')) {
    statusColor = 'cyan';
    boxColor = 'cyan';
    finalMessage = chalk.bold(statusMessage);
  } else if (lowerCaseMessage.startsWith('[confirmation]')) {
    statusColor = 'yellow';
    boxColor = 'yellow';
  } else if (lowerCaseMessage.startsWith('[error]')) {
    statusColor = 'red';
    boxColor = 'red';
  } else if (lowerCaseMessage.startsWith('[success]')) {
    statusColor = 'green';
    boxColor = 'green';
  } else if (lowerCaseMessage.startsWith('[pending]')) {
    statusColor = 'gray';
    boxColor = 'gray';
  }

  return (
    <Box borderStyle="round" borderColor={boxColor} paddingX={1} flexDirection="row">
      <Box marginRight={2}>
        <Text color="gray">relaycode-tui | main</Text>
      </Box>
      <Text color={statusColor} flexGrow={1}>{finalMessage}</Text>
    </Box>
  );
}
```

## File: src/views/WorkingView.tsx
```typescript
import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import Spinner from 'ink-spinner';
import {useStore} from '../store';
import Panel from '../components/Panel';

const steps = [
  '[1/5] Taking file snapshot...',
  '      Snapshot created for 3 files.',
  '[2/5] Applying file operations...',
  '[3/5] Running pre-commit command: `bun tsc --noEmit`...',
  '      Linter found 0 errors. Build successful.',
  '[4/5] Committing transaction...',
  '[5/5] ✅ Patch applied successfully!',
];

export default function WorkingView() {
    const {returnToReady} = useStore(state => state.actions);
    const [output, setOutput] = useState<string[]>([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (stepIndex >= steps.length) {
            setDone(true);
            return;
        }

        const timeout = setTimeout(() => {
            setOutput(prev => [...prev, steps[stepIndex] || '']);
            setStepIndex(stepIndex + 1);
        }, Math.random() * 500 + 200);

        return () => clearTimeout(timeout);
    }, [stepIndex]);

    useInput(() => {
        if (done) {
            returnToReady();
        }
    });

    return (
      <Panel title="Applying Patch...">
        <Box flexDirection="column">
          {output.map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
          {!done && <Text><Spinner type="dots" /> Running...</Text>}
          {done && (
              <Box marginTop={1}>
                  <Text color="gray">Press any key to return to the main screen.</Text>
              </Box>
          )}
        </Box>
      </Panel>
    );
}
```

## File: src/App.tsx
```typescript
import React from 'react';
import {useApp, useInput, Box} from 'ink';
import {useStore} from './store';
import ReadyView from './views/ReadyView';
import ReviewView from './views/ReviewView';
import WorkingView from './views/WorkingView';
import HistoryView from './views/HistoryView';
import StatusBar from './components/StatusBar';

export default function App() {
  const mode = useStore(state => state.mode);
  const {exit} = useApp();

  useInput((input, key) => {
    // Global quit handlers
    if (input === 'q' && (mode === 'ready' || mode === 'working')) {
      exit();
    }
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  let view;
  switch (mode) {
    case 'ready':
      view = <ReadyView />;
      break;
    case 'review':
      view = <ReviewView />;
      break;
    case 'working':
      view = <WorkingView />;
      break;
    case 'history':
      view = <HistoryView />;
      break;
    default:
      view = null;
  }

  return (
    <Box paddingX={1} paddingTop={1} width="100%" height="100%" flexDirection="column">
      <Box flexGrow={1}>
        {view}
      </Box>
      <StatusBar />
    </Box>
  );
}
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
    "dev": "bun run --watch index.tsx"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "react-reconciler": "^0.29.0",
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
```

## File: src/components/TransactionListView.tsx
```typescript
import React from 'react';
import {Box, Text} from 'ink';
import {type MockTransaction} from '../constants';

interface TransactionListProps {
  transactions: MockTransaction[];
  selectedIndex: number;
}

export default function TransactionListView({transactions, selectedIndex}: TransactionListProps) {
  const revertedUuids = new Set(transactions.map(tx => tx.revertedFrom).filter(Boolean));

  return (
    <Box flexDirection="column">
      {transactions.map((tx, index) => {
        const isReverted = revertedUuids.has(tx.uuid);
        return (
          <Box 
            key={tx.uuid} 
            flexDirection="column" 
            paddingY={index === selectedIndex ? 0 : 1}
            paddingX={1}
            borderStyle={index === selectedIndex ? 'round' : undefined}
            borderColor={index === selectedIndex ? 'cyan' : undefined}
          >
            <Text bold color={index === selectedIndex ? 'cyan' : (isReverted ? 'gray' : undefined)}>
              {isReverted ? (
                  <Text strikethrough>
                    <Text color="gray">↩️ Reverted: </Text>{tx.commit}
                  </Text>
              ) : (
                <Text>
                  {tx.type === 'revert' && <Text color="yellow">⮂ Revert: </Text>}
                  {tx.commit}
                </Text>
              )}
               {' '}{tx.committed && !isReverted && (
                <Text color="green" bold>✓ git</Text>
              )}
            </Text>
            <Text color={isReverted ? 'gray' : 'gray'}>{tx.date}</Text>
          </Box>
        )
      })}
    </Box>
  );
}
```

## File: src/views/ReadyView.tsx
```typescript
import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useStore} from '../store';
import Panel from '../components/Panel';
import TransactionListView from '../components/TransactionListView';
import CommandBar from '../components/CommandBar';

export default function ReadyView() {
  const {actions, history} = useStore(state => ({actions: state.actions, history: state.history}));
  const recentHistory = history.slice(0, 4);

  useInput(input => {
    if (input === 'p') {
      actions.pasteFromClipboard();
    }
    if (input === 'h') {
      actions.viewHistory();
    }
  });

  const commands = [
    {key: 'P', label: 'Paste from Clipboard'},
    {key: 'H', label: 'View Full History'},
    {key: 'Q', label: 'Quit'},
  ];

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexGrow={1} flexDirection="row">
        <Box flexDirection="column" width="40%" marginRight={1}>
          <Panel title="ℹ️ Project Info">
            <Box flexDirection="column">
              <Text><Text bold>Path:</Text> {process.cwd()}</Text>
              <Text><Text bold>Git Branch:</Text> main</Text>
              <Text><Text bold>Config:</Text> Auto-approve: off, Linter: `bun tsc`</Text>
            </Box>
          </Panel>
        </Box>
        <Box flexGrow={1}>
          <Panel title="Recent Transactions">
            <TransactionListView transactions={recentHistory} selectedIndex={-1} />
          </Panel>
        </Box>
      </Box>
      <Box marginTop={1}>
        <CommandBar commands={commands} />
      </Box>
    </Box>
  );
}
```

## File: src/constants.ts
```typescript
type CheckStatus = 'success' | 'error' | 'warning';

export const MOCK_PATCH = {
  summary: {
    reasoning: 'Refactored the main logic to improve performance.',
    gitCommit: 'feat: Optimize core processing loop',
  },
  preflight: {
    linter: {
      status: 'error' as CheckStatus,
      output: 'Linter Dry-Run: Found 2 errors in `src/core/transaction.ts`.',
    },
    build: {
      status: 'success' as CheckStatus,
      output: 'Build Check: OK',
    },
    warnings: ['1 code block ignored (malformed header).'],
  },
  changes: [
    {
      type: 'M',
      path: 'src/core/transaction.ts',
      diff: `diff --git a/src/core/transaction.ts b/src/core/transaction.ts
index 123..456 100644
--- a/src/core/transaction.ts
+++ b/src/core/transaction.ts
@@ -50,7 +50,8 @@
 const snapshot = await createSnapshot(affectedFilePaths, cwd);
 const stateFile: StateFile = {
   uuid,
-  approved: false,
+  approved: false, // Default state
+  status: 'pending',
 };
 
 try {`,
    },
    {
      type: 'A',
      path: 'src/utils/new-helper.ts',
      diff: `diff --git a/src/utils/new-helper.ts b/src/utils/new-helper.ts
new file mode 100644
index 0000000..abcdef
--- /dev/null
+++ b/src/utils/new-helper.ts
@@ -0,0 +1,5 @@
+export function newHelper() {
+  // This is a new helper function
+  return true;
+}
+`,
    },
    {
      type: 'D',
      path: 'src/old.ts',
      diff: `diff --git a/src/old.ts b/src/old.ts
deleted file mode 100644
index 1234567..0000000
--- a/src/old.ts
+++ /dev/null
@@ -1,3 +0,0 @@
-function oldFunction() {
-  console.log("I am old");
-}
-`,
    },
  ],
};

export const MOCK_HISTORY = [
    {
        type: 'apply' as const,
        uuid: 'a1b2c3d4',
        commit: 'fix: Correctly handle user logout',
        date: '2023-10-27 10:30:15',
        patch: MOCK_PATCH,
        committed: true,
    },
    {
        type: 'apply' as const,
        uuid: 'e5f6g7h8',
        commit: 'feat: Add new dashboard component',
        date: '2023-10-26 15:12:45',
        patch: MOCK_PATCH, // Using same patch for demo purposes
        committed: true,
    },
    {
        type: 'revert' as const,
        uuid: 'i9j10k11',
        commit: 'revert: feat: Add broken feature',
        date: '2023-10-25 11:00:00',
        patch: MOCK_PATCH,
        revertedFrom: 'z2y3x4w5',
        committed: false,
    },
    {
        type: 'apply' as const,
        uuid: 'z2y3x4w5',
        commit: 'feat: Add broken feature',
        date: '2023-10-24 09:00:00',
        patch: MOCK_PATCH,
        committed: false,
    },
];

export type MockTransaction = (typeof MOCK_HISTORY)[0] & {
    revertedFrom?: string;
    committed?: boolean;
};
```

## File: src/store.ts
```typescript
import {create} from 'zustand';
import {MOCK_PATCH, MOCK_HISTORY, type MockTransaction} from './constants';

type AppMode = 'ready' | 'review' | 'working' | 'history';

interface AppState {
  mode: AppMode;
  statusMessage: string;
  patch: typeof MOCK_PATCH | null;
  history: typeof MOCK_HISTORY;
  actions: {
    setStatusMessage: (message: string) => void;
    pasteFromClipboard: () => void;
    approvePatch: () => void;
    rejectPatch: () => void;
    revertTransaction: (uuid: string) => void;
    viewHistory: () => void;
    returnToReady: () => void;
  };
}

export const useStore = create<AppState>(set => ({
  mode: 'ready',
  statusMessage: '[WATCHING] Ready for patch from clipboard...',
  patch: null,
  history: MOCK_HISTORY,
  actions: {
    setStatusMessage: (message: string) => set({ statusMessage: message }),
    pasteFromClipboard: () => set({mode: 'review', patch: MOCK_PATCH, statusMessage: 'Patch loaded. Reviewing changes...'}),
    approvePatch: () => set({mode: 'working', statusMessage: 'Patch approved. Applying changes...'}),
    rejectPatch: () => set({mode: 'ready', patch: null, statusMessage: '[WATCHING] Patch rejected. Ready for new patch...' }),
    revertTransaction: (uuid: string) => set(state => {
      const txToRevert = state.history.find(tx => tx.uuid === uuid);
      if (!txToRevert) return {};

      const revertCommitMsg = `revert: ${txToRevert.commit}`;
      const newRevertTx: MockTransaction = {
        type: 'revert',
        uuid: `revert-${txToRevert.uuid}-${Math.random()}`, // Mock UUID
        commit: revertCommitMsg,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        patch: txToRevert.patch, // In reality, this would be an inverse patch
        revertedFrom: txToRevert.uuid,
        committed: false,
      };

      return {
        history: [newRevertTx, ...state.history],
        statusMessage: `[SUCCESS] Reverted "${txToRevert.commit}"`
      };
    }),
    viewHistory: () => set({mode: 'history', statusMessage: 'Viewing transaction history.'}),
    returnToReady: () => set({mode: 'ready', patch: null, statusMessage: '[WATCHING] Ready for patch from clipboard...'}),
  },
}));
```

## File: src/views/HistoryView.tsx
```typescript
import React, {useState} from 'react';
import {Box, useInput} from 'ink';
import {useStore} from '../store';
import Panel from '../components/Panel';
import CommandBar from '../components/CommandBar';
import DiffView from '../components/DiffView';
import TransactionListView from '../components/TransactionListView';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function HistoryView() {
    const {history, actions} = useStore(state => ({history: state.history, actions: state.actions}));
    const setStatusMessage = useStore(state => state.actions.setStatusMessage);
    const [selectedTxIndex, setSelectedTxIndex] = useState(0);
    const [isConfirmingRevert, setIsConfirmingRevert] = useState(false);

    const selectedTx = history[selectedTxIndex];
    const fullDiff = selectedTx?.patch.changes.map(c => c.diff).join('\n\n') || '';

    useInput((input, key) => {
        // Disable main input when confirming
        if (isConfirmingRevert) return;

        if (key.upArrow || input === 'k') {
          setSelectedTxIndex(Math.max(0, selectedTxIndex - 1));
        } else if (key.downArrow || input === 'j') {
          setSelectedTxIndex(Math.min(history.length - 1, selectedTxIndex + 1));
        } else if (input === 'u') {
          if (selectedTx) {
            setIsConfirmingRevert(true);
            setStatusMessage(`[CONFIRMATION] Revert "${selectedTx.commit}"? (Y/N)`);
          }
        } else if (input === 'q') {
          actions.returnToReady();
        }
    });

    const handleRevertConfirm = () => {
      if (selectedTx) {
          setStatusMessage(`[PENDING] Reverting transaction: ${selectedTx.commit}...`);
          actions.revertTransaction(selectedTx.uuid);
      }
      setIsConfirmingRevert(false);
    };

    const handleRevertCancel = () => {
        setIsConfirmingRevert(false);
        setStatusMessage('Revert cancelled.');
    };
    
    const commands = isConfirmingRevert ? [
        {key: 'Y', label: 'Yes, Revert'},
        {key: 'N', label: 'No, Cancel'},
    ] : [
        {key: 'U', label: 'Undo/Revert'},
        {key: '↑↓/JK', label: 'Navigate'},
        {key: 'Q', label: 'Quit to Main'},
    ];

    return (
      <>
        <Box flexDirection="column" flexGrow={1}>
            <Box flexGrow={1} flexDirection="row">
                <Box width="40%" marginRight={1}>
                    <Panel title={isConfirmingRevert ? `Revert "${selectedTx?.commit || ''}"?` : `Transactions (${selectedTxIndex + 1}/${history.length})`}>
                        <TransactionListView transactions={history} selectedIndex={selectedTxIndex} />
                    </Panel>
                </Box>
                <Box flexGrow={1}>
                    <Panel title={`Diff for: ${selectedTx?.commit || ''}`}>
                        <DiffView diff={fullDiff} />
                    </Panel>
                </Box>
            </Box>
            <Box marginTop={1}>
                <CommandBar commands={commands} />
            </Box>
        </Box>
        {isConfirmingRevert && selectedTx && (
            <ConfirmationDialog onConfirm={handleRevertConfirm} onCancel={handleRevertCancel}>
                Are you sure you want to revert transaction "{selectedTx.commit}"?
            </ConfirmationDialog>
        )}
      </>
    );
}
```

## File: src/views/ReviewView.tsx
```typescript
import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {useStore} from '../store';
import Panel from '../components/Panel';
import CommandBar from '../components/CommandBar';
import DiffView from '../components/DiffView';
import FileListView from '../components/FileListView';

export default function ReviewView() {
    const {patch, actions} = useStore(state => ({patch: state.patch, actions: state.actions}));
    const [selectedIndex, setSelectedIndex] = useState(0);

    const changes = patch?.changes || [];

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(Math.max(0, selectedIndex - 1));
        }
        if (key.downArrow) {
            setSelectedIndex(Math.min(changes.length - 1, selectedIndex + 1));
        }
        if (input === 'a') {
            actions.approvePatch();
        }
        if (input === 'r') {
            actions.rejectPatch();
        }
        if (input === 'q') {
            actions.returnToReady();
        }
    });

    if (!patch) {
        return <Text>Loading patch...</Text>;
    }
    
    const selectedChange = changes[selectedIndex];

    const commands = [
        {key: 'A', label: 'Approve & Apply'},
        {key: 'R', label: 'Reject'},
        {key: '↑↓', label: 'Navigate'},
        {key: 'Q', label: 'Quit to Main'},
    ];

    return (
        <Box flexDirection="column" flexGrow={1}>
            <Box flexGrow={1} flexDirection="row">
                <Box width="40%" marginRight={1} flexDirection="column">
                    <Box height="35%" marginBottom={1}>
                         <Panel title="Pre-flight Checks">
                            <Box flexDirection="column">
                                <Text color={patch.preflight.build.status === 'success' ? 'green' : 'red'}>
                                    {patch.preflight.build.status === 'success' ? '✓' : '✗'} {patch.preflight.build.output}
                                </Text>
                                <Text color={patch.preflight.linter.status === 'success' ? 'green' : patch.preflight.linter.status === 'error' ? 'red' : 'yellow'}>
                                    {patch.preflight.linter.status === 'success' 
                                        ? '✓' 
                                        : patch.preflight.linter.status === 'error' 
                                        ? '✗' 
                                        : '!'} {patch.preflight.linter.output}
                                </Text>
                                
                                {patch.preflight.warnings.map((warning, i) => (
                                    <Text key={i} color="yellow">  ! Warning: {warning}</Text>
                                ))}
                            </Box>
                        </Panel>
                    </Box>
                    <Box flexGrow={1}>
                        <Panel title={`Changes (${selectedIndex + 1}/${changes.length})`}>
                            <FileListView files={changes} selectedIndex={selectedIndex} />
                        </Panel>
                    </Box>
                </Box>
                <Box flexGrow={1} flexDirection="column">
                    <Box height="25%" marginBottom={1}>
                        <Panel title="Patch Summary">
                            <Box flexDirection="column">
                                <Text><Text bold>Reasoning: </Text>{patch.summary.reasoning}</Text>
                                <Text><Text bold>Git Commit: </Text>{patch.summary.gitCommit}</Text>
                            </Box>
                        </Panel>
                    </Box>
                    <Panel title={`Diff: ${selectedChange?.path || ''}`}>
                        <DiffView diff={selectedChange?.diff || ''} />
                    </Panel>
                </Box>
            </Box>
            <Box marginTop={1}>
                <CommandBar commands={commands} />
            </Box>
        </Box>
    );
}
```
