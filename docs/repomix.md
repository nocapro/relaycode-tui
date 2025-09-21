# Directory Structure
```
src/
  components/
    DashboardScreen.tsx
    GlobalHelpScreen.tsx
    InitializationScreen.tsx
    Separator.tsx
    SplashScreen.tsx
  stores/
    app.store.ts
    dashboard.store.ts
    init.store.ts
  App.tsx
  utils.ts
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/DashboardScreen.tsx
```typescript
import React, { useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import chalk from 'chalk';
import Spinner from 'ink-spinner';
import { useDashboardStore, type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return chalk.yellow('?');
        case 'APPLIED': return chalk.green('✓');
        case 'COMMITTED': return chalk.blue('→');
        case 'FAILED': return chalk.red('✗');
        case 'REVERTED': return chalk.gray('↩');
        case 'IN-PROGRESS': return <Spinner type="dots" />;
        default: return ' ';
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
    
    let message = transaction.message;
    if (transaction.status === 'IN-PROGRESS') {
        message = chalk.cyan(message);
    }
    
    const content = (
        <Text>
            {time} {icon} {statusText} {transaction.hash} · {message}
        </Text>
    );

    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
};

const ConfirmationContent = ({ status, transactionsToConfirm }: { status: DashboardStatus, transactionsToConfirm: Transaction[] }) => {
    const isApprove = status === 'CONFIRM_APPROVE';
    const actionText = isApprove ? 'APPROVE' : 'COMMIT';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold>{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>The following {transactionsToConfirm.length} transaction(s) will be {isApprove ? 'approved' : 'committed'}:</Text>
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
    const { togglePause, moveSelectionUp, moveSelectionDown, startApproveAll, startCommitAll, confirmAction, cancelAction, toggleHelp } = useDashboardStore(s => s.actions);
    const { exit } = useApp();

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
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) startCommitAll();
    });

    const renderStatusBar = () => {
        let statusText, statusIcon;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = chalk.green('●'); break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = chalk.yellow('||'); break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = chalk.cyan(<Spinner type="dots"/>); break;
            case 'COMMITTING': statusText = 'COMMITTING...'; statusIcon = chalk.cyan(<Spinner type="dots"/>); break;
            default: statusText = 'LISTENING'; statusIcon = chalk.green('●');
        }

        let approvalStr = String(pendingApprovals).padStart(2, '0');
        let commitStr = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = `(${chalk.cyan(<Spinner type="dots"/>)})`;
        if (status === 'COMMITTING') commitStr = `(${chalk.cyan(<Spinner type="dots"/>)})`;
        if (status === 'CONFIRM_APPROVE') approvalStr = chalk.bold.yellow(`┌ ${approvalStr} ┐`);
        if (status === 'CONFIRM_COMMIT') commitStr = chalk.bold.yellow(`┌ ${commitStr} ┐`);
        
        return (
            <Text>
                STATUS: {statusIcon} {statusText} · APPROVALS: {approvalStr} · COMMITS: {commitStr}
            </Text>
        )
    }

    const renderFooter = () => {
        if (isModal) return <Text>(Enter) Confirm      (Esc) Cancel</Text>;
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const pauseAction = status === 'PAUSED' ? '(R)esume' : '(P)ause';
        return <Text>(↑↓) Nav · (Enter) Review · (A)pprove All · (C)ommit All · {pauseAction} · (Q)uit</Text>;
    }
    
    const transactionsToConfirm = useMemo(() => {
        if (status === 'CONFIRM_APPROVE') return transactions.filter(t => t.status === 'PENDING');
        if (status === 'CONFIRM_COMMIT') return transactions.filter(t => t.status === 'APPLIED');
        return [];
    }, [status, transactions]);

    return (
        <Box flexDirection="column" height="100%">
            {showHelp && <GlobalHelpScreen />}

            <Box flexDirection="column" display={showHelp ? 'none' : 'flex'}>
                <Text>▲ relaycode dashboard</Text>
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
                
                <Text> EVENT STREAM (Last 15 minutes)</Text>
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
                <Text>{renderFooter()}</Text>
            </Box>
        </Box>
    );
};

export default DashboardScreen;
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
                    <Text bold>▲ relaycode · keyboard shortcuts</Text>
                </Box>
                <Box flexDirection="column" gap={1}>
                    <Box flexDirection="column">
                        <Text bold>GLOBAL</Text>
                        <Text>  ?        Toggle this help screen</Text>
                        <Text>  Q        Quit to terminal (from main screens)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold>DASHBOARD (watch)</Text>
                        <Text>  ↑↓       Navigate event stream</Text>
                        <Text>  P        Pause / Resume clipboard watcher</Text>
                        <Text>  A        Approve all pending transactions</Text>
                        <Text>  C        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold>REVIEW & DETAILS SCREENS</Text>
                        <Text>  D        Show / Collapse file diff</Text>
                        <Text>  R        Show / Collapse reasoning steps</Text>
                        <Text>  C        Enter / Exit Copy Mode (Details Screen)</Text>
                        <Text>  U        Undo / Revert Transaction</Text>
                        <Text>  Space    Toggle approval state of a file (Review Screen)</Text>
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text bold>(Press ? or Esc to close)</Text>
            </Box>
        </Box>
    );
};

export default GlobalHelpScreen;
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showDashboardScreen: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
    },
}));
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
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING'
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: Math.max(0, state.selectedTransactionIndex - 1)
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: Math.min(state.transactions.length - 1, state.selectedTransactionIndex + 1)
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
                let pendingTxIds: string[] = [];
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
                 let appliedTxIds: string[] = [];
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
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t)
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t)
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

## File: src/utils.ts
```typescript
// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

## File: src/components/InitializationScreen.tsx
```typescript
import React, { useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useInitStore, type Task, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import chalk from 'chalk';
import Separator from './Separator';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
	let symbol;
	switch (task.status) {
		case 'pending': symbol = '( )'; break;
		case 'active': symbol = chalk.cyan('(●)'); break;
		case 'done': symbol = chalk.green(doneSymbol); break;
	}

	const title = task.status === 'done' && doneSymbol?.startsWith('[✓]') ? `Created ${task.title.split(' ')[1]}` : task.title;

	return (
		<Box flexDirection="column">
			<Text>
				{symbol} {title}
			</Text>
			{task.subtext && task.status !== 'done' && (
				<Text>
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
    }, []);

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
            <Text bold>PHASE 1: ANALYZE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {analyzeTasks.map(t => <TaskItem key={t.id} task={t} />)}
            </Box>
        </Box>
    );

    const renderContext = () => (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold>CONTEXT</Text>
            <Text>  {chalk.green('✓')} Project ID: {projectId}</Text>
            <Text>  {chalk.green('✓')} Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold>PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold>PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text>{chalk.cyan('>')} The .relay/ directory is usually ignored by git.</Text>
                    <Text>  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = interactiveChoice === 'share'
            ? ".relay/ directory initialized. It will be committed to git."
            : ".relay/ directory initialized and added to .gitignore.";
        const stateSubText = interactiveChoice === 'share'
            ? undefined
            : "Local transaction history will be stored here.";
        
        return (
            <Box flexDirection="column">
                <Text bold> SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Config:   relay.config.json created.</Text>
                        <Text>          {chalk.gray('›')} Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} State:    {stateText}</Text>
                        {stateSubText && <Text>          {chalk.gray('›')} {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Prompt:   System prompt generated at .relay/prompts/system-prompt.md.</Text>
                        <Text>          {chalk.gray('›')} Copied to clipboard. Paste into your AI's custom instructions.</Text>
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
        case 'INTERACTIVE': footerText = `(${chalk.bold('Enter')}) No, ignore it (default)      (${chalk.bold('S')}) Yes, share it`; break;
        case 'FINALIZE': footerText = `(${chalk.bold('W')})atch for Patches · (${chalk.bold('L')})View Logs · (${chalk.bold('Q')})uit`; break;
    }

    return (
        <Box flexDirection="column">
            <Text>{phase === 'FINALIZE' ? '▲ relaycode bootstrap complete' : '▲ relaycode bootstrap'}</Text>
            <Separator />
            <Box marginY={1}>{renderPhase()}</Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default InitializationScreen;
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
				rows: process.stdout.rows || 24
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

## File: src/components/SplashScreen.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import chalk from 'chalk';
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
            <Text>▲ relaycode</Text>
            <Separator />
            <Text>{logo}</Text>
            <Box flexDirection="column" alignItems="center">
                <Text>A zero-friction, AI-native patch engine.</Text>
                <Text>Built by Arman and contributors · https://relay.noca.pro</Text>
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
            <Text>If you love this workflow, check out https://www.noca.pro for the full</Text>
            <Text>web app with repo-wide visual context, history, and rollback.</Text>
            <Text>{chalk.bold('(V)')}isit noca.pro</Text>
            <Separator />
            <Text>Follow {chalk.bold('(X)')} · Join {chalk.bold('(D)')}iscord · Star on {chalk.bold('(G)')}itHub</Text>
            <Separator />
            <Text>Loading... {countdown} (Press any key to skip)</Text>
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

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
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

    return null;
};

export default App;
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

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';

// Check if we're running in an interactive terminal
if (process.stdin.isTTY && process.stdout.isTTY) {
    render(<App />);
} else {
    console.log('Interactive terminal required. Please run in a terminal that supports raw input mode.');
    process.exit(1);
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
