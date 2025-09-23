# Directory Structure
```
src/
  components/
    CopyScreen.tsx
    DashboardScreen.tsx
    DebugMenu.tsx
    DiffScreen.tsx
    GitCommitScreen.tsx
    GlobalHelpScreen.tsx
    InitializationScreen.tsx
    ReasonScreen.tsx
    ReviewProcessingScreen.tsx
    ReviewScreen.tsx
    Separator.tsx
    SplashScreen.tsx
    TransactionDetailScreen.tsx
    TransactionHistoryScreen.tsx
  data/
    mocks.ts
  hooks/
    useDashboardScreen.tsx
    useDebugMenu.tsx
    useGitCommitScreen.tsx
    useInitializationScreen.tsx
    useReviewScreen.tsx
    useSplashScreen.tsx
    useTransactionDetailScreen.tsx
    useTransactionHistoryScreen.tsx
  services/
    commit.service.ts
    copy.service.ts
    dashboard.service.ts
    init.service.ts
    review.service.ts
    transaction.service.ts
  stores/
    app.store.ts
    commit.store.ts
    copy.store.ts
    dashboard.store.ts
    init.store.ts
    navigation.utils.ts
    review.store.ts
    transaction-detail.store.ts
    transaction-history.store.ts
  types/
    app.types.ts
    copy.types.ts
    dashboard.types.ts
    debug.types.ts
    file.types.ts
    init.types.ts
    review.types.ts
    transaction-detail.types.ts
    transaction-history.types.ts
    transaction.types.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/CopyScreen.tsx
```typescript
import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import Separator from './Separator';

const CopyScreen = () => {
    const {
        isOpen, title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));

    useInput((input, key) => {
        if (key.escape) {
            actions.close();
            return;
        }
        if (key.upArrow) {
            actions.navigateUp();
            return;
        }
        if (key.downArrow) {
            actions.navigateDown();
            return;
        }
        if (input === ' ') {
            actions.toggleSelection();
            return;
        }
        if (key.return) {
            actions.executeCopy();
            return;
        }
        
        const item = items.find(i => i.key.toLowerCase() === input.toLowerCase());
        if(item) {
            actions.toggleSelectionById(item.id);
        }
    }, { isActive: isOpen });

    // The component is always rendered by App, but we control visibility via isOpen
    if (!isOpen) {
        return null;
    }

    return (
        <Box 
            width="100%"
            height="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Box 
                flexDirection="column" 
                borderStyle="round" 
                borderColor="yellow" 
                paddingX={2}
                width="80%"
            >
                <Text bold color="yellow">▲ relaycode · copy mode</Text>
                <Separator />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {items.map((item, index) => {
                            const isSelected = index === selectedIndex;
                            const isChecked = selectedIds.has(item.id);
                            return (
                                <Text key={item.id} color={isSelected ? 'cyan' : undefined}>
                                    {isSelected ? '> ' : '  '}
                                    [{isChecked ? 'x' : ' '}] ({item.key}) {item.label}
                                </Text>
                            );
                        })}
                    </Box>
                </Box>
                <Separator />
                {lastCopiedMessage && <Text color="green">✓ {lastCopiedMessage}</Text>}
                <Text>(↑↓) Nav · (Spc/Hotkey) Toggle · (Enter) Copy · (Esc) Close</Text>
            </Box>
        </Box>
    );
};

export default CopyScreen;
```

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

## File: src/components/ReviewProcessingScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { useReviewStore, type ApplyStep } from '../stores/review.store';
import Separator from './Separator';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep, isSubstep?: boolean }) => {
    if (isSubstep) {
        let color;
        if (step.status === 'done' && step.title.startsWith('[✓]')) color = 'green';
        if (step.status === 'failed') color = 'red';

        return (
            <Text color={color}>
                {'     └─ '}{step.title}
            </Text>
        );
    }

    let symbol;
    let color;
    switch (step.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = '(●)'; color = 'cyan'; break;
        case 'done': symbol = '[✓]'; color = 'green'; break;
        case 'failed': symbol = '[!]'; color = 'red'; break;
        case 'skipped': symbol = '(-)'; color = 'gray'; break;
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title} {step.duration && !isSubstep && `(${step.duration}s)`}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub, i) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const { hash, message, patchStatus, applySteps } = useReviewStore(state => ({
        hash: state.hash,
        message: state.message,
        patchStatus: state.patchStatus,
        applySteps: state.applySteps,
    }));

    const totalDuration = applySteps.reduce((acc, step) => acc + (step.duration || 0), 0);
    const failureCase = patchStatus === 'PARTIAL_FAILURE';
    const footerText = failureCase
        ? `Elapsed: ${totalDuration.toFixed(1)}s · Transitioning to repair workflow...`
        : `Elapsed: ${totalDuration.toFixed(1)}s · Processing... Please wait.`;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode apply</Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {hash}... ({message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map(step => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;
```

## File: src/hooks/useDashboardScreen.tsx
```typescript
import { useMemo, useState, useEffect } from 'react';
import { useApp, useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useTransactionHistoryStore } from '../stores/transaction-history.store';
import { useStdoutDimensions } from '../utils';

export const useDashboardScreen = () => {
    const [, rows] = useStdoutDimensions();
    const [viewOffset, setViewOffset] = useState(0);
    const NON_EVENT_STREAM_HEIGHT = 9; // Header, separators, status, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_EVENT_STREAM_HEIGHT);
    const { status, transactions, selectedTransactionIndex, showHelp } = useDashboardStore();
    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        confirmAction,
        cancelAction,
        toggleHelp,
    } = useDashboardStore(s => s.actions);
    const { exit } = useApp();
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const detailActions = useTransactionDetailStore(s => s.actions);
    const historyActions = useTransactionHistoryStore(s => s.actions);

    const pendingApprovals = useMemo(() => transactions.filter(t => t.status === 'PENDING').length, [transactions]);
    const pendingCommits = useMemo(() => transactions.filter(t => t.status === 'APPLIED').length, [transactions]);

    const isModal = status === 'CONFIRM_APPROVE';
    const isProcessing = status === 'APPROVING';

    useEffect(() => {
        if (selectedTransactionIndex < viewOffset) {
            setViewOffset(selectedTransactionIndex);
        } else if (selectedTransactionIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedTransactionIndex - viewportHeight + 1);
        }
    }, [selectedTransactionIndex, viewOffset, viewportHeight]);

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
            const selectedTx = transactions[selectedTransactionIndex];
            if (selectedTx?.status === 'PENDING') {
                // For PENDING transactions, we still go to the review screen.
                appActions.showReviewScreen();
            } else if (selectedTx) {
                detailActions.loadTransaction(selectedTx.id);
                appActions.showTransactionDetailScreen();
            }
        }
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) {
            commitActions.prepareCommitScreen();
            appActions.showGitCommitScreen();
        }
        if (input.toLowerCase() === 'l') {
            historyActions.load();
            appActions.showTransactionHistoryScreen();
        }
    });
    
    const transactionsToConfirm = useMemo(() => {
        if (status === 'CONFIRM_APPROVE') return transactions.filter(t => t.status === 'PENDING');
        return [];
    }, [status, transactions]);

    return {
        status,
        transactions,
        selectedTransactionIndex,
        showHelp,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    };
};
```

## File: src/hooks/useGitCommitScreen.tsx
```typescript
import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';

export const useGitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useCommitStore();
    const { commit } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    useInput((input, key) => {
        if (isCommitting) return;

        if (key.escape) {
            showDashboardScreen();
        }
        if (key.return) {
            commit().then(() => {
                showDashboardScreen();
            });
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting };
};
```

## File: src/hooks/useSplashScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';

export const useSplashScreen = () => {
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

    return { countdown };
};
```

## File: src/services/copy.service.ts
```typescript
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';
import type { Transaction } from '../types/transaction.types';
import type { ReviewFileItem, FileChange } from '../types/file.types';

// A type for the data that can be passed to the copy service from the review screen
// since it doesn't have a full transaction object in its state.
type ReviewTransactionInfo = Pick<Transaction, 'hash' | 'message' | 'prompt' | 'reasoning'>;

const openCopyForReview = (
    txInfo: ReviewTransactionInfo,
    files: ReviewFileItem[],
    selectedFile: ReviewFileItem | undefined,
) => {
    const items: CopyItem[] = [
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => `${txInfo.hash ?? ''}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => txInfo.message },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => txInfo.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => txInfo.reasoning || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
    ];
    useCopyStore.getState().actions.open('Select data to copy from review:', items);
};

const openCopyForTransactionDetail = (transaction: Transaction, selectedFile: FileChange | undefined) => {
    const items: CopyItem[] = [
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message, isDefaultSelected: true },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '', isDefaultSelected: true },
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
    useCopyStore.getState().actions.open(`Select data to copy from transaction ${transaction.hash}:`, items);
};

const openCopyForTransactionHistory = (transactions: Transaction[]) => {
    const items: CopyItem[] = [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
    useCopyStore.getState().actions.open(`Select data to copy from ${transactions.length} transactions:`, items);
};


export const CopyService = {
    openCopyForReview,
    openCopyForTransactionDetail,
    openCopyForTransactionHistory,
};
```

## File: src/services/dashboard.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import { sleep } from '../utils';

const approveAll = async () => {
    // Find pending transactions and mark them as in-progress
    const pendingTxIds: string[] = [];
    useDashboardStore.setState(state => {
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
    useDashboardStore.setState(state => {
        const newTxs = state.transactions.map(tx => {
            if (pendingTxIds.includes(tx.id)) {
                return { ...tx, status: 'APPLIED' as const };
            }
            return tx;
        });
        return { transactions: newTxs };
    });
};

export const DashboardService = {
    approveAll,
};
```

## File: src/services/init.service.ts
```typescript
import { useInitStore, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import { sleep } from '../utils';

const runInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    actions.resetInit();

    actions.setPhase('ANALYZE');
    for (const task of initialAnalyzeTasks) {
        actions.updateAnalyzeTask(task.id, 'active');
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
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

const resumeInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    
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

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};
```

## File: src/stores/copy.store.ts
```typescript
import { create } from 'zustand';
import { moveIndex } from './navigation.utils';
import type { CopyItem } from '../types/copy.types';

export type { CopyItem };

interface CopyState {
    isOpen: boolean;
    title: string;
    items: CopyItem[];
    selectedIndex: number;
    selectedIds: Set<string>;
    lastCopiedMessage: string | null;
    onClose?: () => void;

    actions: {
        open: (title: string, items: CopyItem[], onClose?: () => void) => void;
        close: () => void;
        navigateUp: () => void;
        navigateDown: () => void;
        toggleSelection: () => void;
        toggleSelectionById: (id: string) => void;
        executeCopy: () => void;
    };
}

export const useCopyStore = create<CopyState>((set, get) => ({
    isOpen: false,
    title: '',
    items: [],
    selectedIndex: 0,
    selectedIds: new Set(),
    lastCopiedMessage: null,
    onClose: undefined,

    actions: {
        open: (title, items, onClose) => {
            const defaultSelectedIds = new Set(items.filter(i => i.isDefaultSelected).map(i => i.id));
            set({
                isOpen: true,
                title,
                items,
                selectedIndex: 0,
                selectedIds: defaultSelectedIds,
                lastCopiedMessage: null,
                onClose,
            });
        },
        close: () => {
            get().onClose?.();
            set({ isOpen: false, items: [], onClose: undefined });
        },
        navigateUp: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'up', state.items.length),
        })),
        navigateDown: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'down', state.items.length),
        })),
        toggleSelection: () => set(state => {
            const currentItem = state.items[state.selectedIndex];
            if (!currentItem) return {};
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(currentItem.id)) {
                newSelectedIds.delete(currentItem.id);
            } else {
                newSelectedIds.add(currentItem.id);
            }
            return { selectedIds: newSelectedIds };
        }),
        toggleSelectionById: (id: string) => set(state => {
            const newSelectedIds = new Set(state.selectedIds);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                newSelectedIds.add(id);
            }
            return { selectedIds: newSelectedIds };
        }),
        executeCopy: () => {
            const { items, selectedIds } = get();
            const itemsToCopy = items.filter(i => selectedIds.has(i.id));
            if (itemsToCopy.length === 0) return;

            const content = itemsToCopy.map(item => `--- ${item.label} ---\n${item.getData()}`).join('\n\n');
            const message = `Copied ${itemsToCopy.length} item(s) to clipboard.`;
            // eslint-disable-next-line no-console
            console.log(`[CLIPBOARD MOCK] ${message}\n${content.substring(0, 200)}...`);
            set({ lastCopiedMessage: message });
        },
    },
}));
```

## File: src/stores/navigation.utils.ts
```typescript
export const moveIndex = (
    currentIndex: number,
    direction: 'up' | 'down',
    listSize: number,
): number => {
    if (direction === 'up') {
        return Math.max(0, currentIndex - 1);
    }
    return Math.min(listSize - 1, currentIndex + 1);
};
```

## File: src/types/app.types.ts
```typescript
export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review' | 'review-processing' | 'git-commit' | 'transaction-detail' | 'transaction-history';
```

## File: src/types/copy.types.ts
```typescript
export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string;
    isDefaultSelected?: boolean;
}

export const COPYABLE_ITEMS = {
    UUID: 'UUID',
    MESSAGE: 'Git Message',
    PROMPT: 'Prompt',
    REASONING: 'Reasoning',
    FILE_DIFF: 'Diff for',
    ALL_DIFFS: 'All Diffs',
    FULL_YAML: 'Full YAML representation',
    // For multi-selection contexts
    MESSAGES: 'Git Messages',
    PROMPTS: 'Prompts',
    REASONINGS: 'Reasonings',
    DIFFS: 'Diffs',
    UUIDS: 'UUIDs',
} as const;
```

## File: src/types/dashboard.types.ts
```typescript
export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
```

## File: src/types/debug.types.ts
```typescript
export interface MenuItem {
    title: string;
    action: () => void;
}
```

## File: src/types/init.types.ts
```typescript
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';

export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}
```

## File: eslint.config.js
```javascript
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-uses-react': 'off', // Not needed with React 17+ JSX transform
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'off', // Often not needed in Ink components

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'indent': 'off', // Disabled due to stack overflow issues
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'coverage/**',
    ],
  },
];
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

## File: src/hooks/useInitializationScreen.tsx
```typescript
import React, { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { InitService } from '../services/init.service';

export const useInitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
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
        InitService.runInitializationProcess();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            InitService.resumeInitializationProcess();
        }
    }, [interactiveChoice, phase]);

    const {
        analyzeTasks,
        configureTasks,
        projectId,
    } = useInitStore();

    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    };
};
```

## File: src/services/commit.service.ts
```typescript
import { useDashboardStore } from '../stores/dashboard.store';
import type { Transaction } from '../types/transaction.types';
import { sleep } from '../utils';

const generateCommitMessage = (transactions: Transaction[]): string => {
    if (transactions.length === 0) {
        return '';
    }
    // Using a more complex aggregation for better demo, based on the readme
    const title = 'feat: implement new dashboard and clipboard logic';
    const bodyPoints = [
        '- Adds error handling to the core transaction module to prevent uncaught exceptions during snapshot restoration.',
        '- Refactors the clipboard watcher for better performance and cross-platform compatibility, resolving issue #42.',
    ];

    if (transactions.length === 1 && transactions[0]) {
        return transactions[0].message;
    }

    return `${title}\n\n${bodyPoints.join('\n\n')}`;
};

const commit = async (transactionsToCommit: Transaction[]): Promise<void> => {
    // In a real app, this would run git commands.
    // For simulation, we'll just update the dashboard store.
    const { updateTransactionStatus } = useDashboardStore.getState().actions;

    const txIds = transactionsToCommit.map(tx => tx.id);
    
    // A bit of simulation
    await sleep(500);

    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTED');
    });
};

export const CommitService = {
    generateCommitMessage,
    commit,
};
```

## File: src/services/review.service.ts
```typescript
import { useReviewStore } from '../stores/review.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyStep } from '../types/review.types';
import type { ReviewFileItem } from '../types/file.types';

const generateBulkRepairPrompt = (files: ReviewFileItem[]): string => {
    const failedFiles = files.filter(f => f.status === 'FAILED');
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: ${file.error}

ORIGINAL CONTENT:
---
// ... original content of ${file.path} ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff ...'}
---
`).join('\n')}

Please analyze all failed files and provide a complete, corrected response.`;
};

const generateHandoffPrompt = (
    hash: string,
    message: string,
    reasoning: string,
    files: ReviewFileItem[],
): string => {
    const successfulFiles = files.filter(f => f.status === 'APPROVED');
    const failedFiles = files.filter(f => f.status === 'FAILED');

    return `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${message}
Reasoning:
${reasoning}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${f.error})`).join('\n')}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.`;
};

const performHandoff = (hash: string) => {
    // This is a bit of a hack to find the right transaction to update in the demo
    const txToUpdate = useDashboardStore.getState().transactions.find(tx => tx.hash === hash);
    if (txToUpdate) {
        useDashboardStore.getState().actions.updateTransactionStatus(txToUpdate.id, 'HANDOFF');
    }

    useAppStore.getState().actions.showDashboardScreen();
};

const runApplySimulation = async (scenario: 'success' | 'failure') => {
    const { actions } = useReviewStore.getState();
    const { _updateApplyStep, _addApplySubstep, simulateSuccessScenario, simulateFailureScenario } = actions;

    if (scenario === 'success') {
        simulateSuccessScenario();
        
        _updateApplyStep('snapshot', 'active'); await sleep(100);
        _updateApplyStep('snapshot', 'done', 0.1);

        _updateApplyStep('memory', 'active'); await sleep(100);
        _addApplySubstep('memory', { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' });
        await sleep(100);
        _addApplySubstep('memory', { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' });
        _updateApplyStep('memory', 'done', 0.3);

        _updateApplyStep('post-command', 'active'); await sleep(1300);
        _addApplySubstep('post-command', { id: 's3', title: '`bun run test` ... Passed', status: 'done' });
        _updateApplyStep('post-command', 'done', 2.3);

        _updateApplyStep('linter', 'active'); await sleep(1200);
        _addApplySubstep('linter', { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' });
        _updateApplyStep('linter', 'done', 1.2);

        await sleep(500);

    } else { // failure scenario
        simulateFailureScenario();
        
        _updateApplyStep('snapshot', 'active'); await sleep(100);
        _updateApplyStep('snapshot', 'done', 0.1);

        _updateApplyStep('memory', 'active'); await sleep(100);
        _addApplySubstep('memory', { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' });
        await sleep(100);
        _addApplySubstep('memory', { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' });
        await sleep(100);
        _addApplySubstep('memory', { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' });
        _updateApplyStep('memory', 'done', 0.5);

        await sleep(100);
        _updateApplyStep('post-command', 'skipped', undefined, 'Skipped due to patch application failure');
        await sleep(100);
        _updateApplyStep('linter', 'skipped', undefined, 'Skipped due to patch application failure');
        
        await sleep(500);
    }
};

const generateSingleFileRepairPrompt = (file: ReviewFileItem): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${file.error}
Strategy: ${file.strategy}

ORIGINAL CONTENT:
---
// ... original file content would be here ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff would be here ...'}
---

Please provide a corrected patch that addresses the error.`;
};

const tryRepairFile = (file: ReviewFileItem, selectedIndex: number): void => {
    const repairPrompt = generateSingleFileRepairPrompt(file);
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied repair prompt for: ${file.path}`);

    // Mock: Update file status to show it's being repaired
    useReviewStore.setState(state => {
        const newFiles = [...state.files];
        newFiles[selectedIndex] = { ...file, status: 'APPROVED' as const, error: undefined, linesAdded: 5, linesRemoved: 2 };
        return { files: newFiles, copyModeLastCopied: 'Repair prompt copied to clipboard' };
    });
};

const runBulkReapply = async (): Promise<void> => {
    const { files } = useReviewStore.getState();
    const failedFileIds = new Set(files.filter(f => f.status === 'FAILED').map(f => f.id));
    if (failedFileIds.size === 0) {
        return;
    }

    useReviewStore.setState(state => ({
        files: state.files.map(file =>
            failedFileIds.has(file.id)
                ? { ...file, status: 'RE_APPLYING' as const }
                : file,
        ),
    }));

    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    useReviewStore.setState(state => ({
        files: state.files.map(file => {
            if (failedFileIds.has(file.id)) {
                if (first) {
                    first = false;
                    return { ...file, status: 'APPROVED' as const, strategy: 'replace' as const, error: undefined, linesAdded: 9, linesRemoved: 2 };
                }
                return { ...file, status: 'FAILED' as const, error: "'replace' failed: markers not found" };
            }
            return file;
        }),
    }));
};

export const ReviewService = {
    generateBulkRepairPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    runBulkReapply,
};
```

## File: src/types/file.types.ts
```typescript
// Common interface for file-based items
export interface BaseFileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

// From transaction-detail.store.ts and transaction-history.store.ts
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileChange extends BaseFileItem {
    type: FileChangeType;
}

// From review.store.ts
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';
export interface ReviewFileItem extends BaseFileItem {
    status: FileReviewStatus;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}
```

## File: src/types/review.types.ts
```typescript
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}

export type ReviewBodyView = 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';
```

## File: src/types/transaction-detail.types.ts
```typescript
export type NavigatorSection = 'PROMPT' | 'REASONING' | 'FILES';
export type DetailBodyView = 'PROMPT' | 'REASONING' | 'FILES_LIST' | 'DIFF_VIEW' | 'REVERT_CONFIRM' | 'NONE';
```

## File: src/types/transaction-history.types.ts
```typescript
export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';
```

## File: src/utils.ts
```typescript
import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStdoutDimensions = (): [number, number] => {
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
```

## File: src/components/GitCommitScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useGitCommitScreen();

    const transactionLines = transactionsToCommit.map(tx => (
        <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
    ));

    const footer = isCommitting
        ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
        : <Text>(Enter) Confirm & Commit      (Esc) Cancel</Text>;

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode git commit</Text>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text bold>TRANSACTIONS INCLUDED</Text>
                    {transactionLines}
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text bold>FINAL COMMIT MESSAGE</Text>
                <Box marginTop={1}>
                    <Text>{finalCommitMessage}</Text>
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} paddingX={2}>
                 <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>
            </Box>
            <Separator />
            {footer}
        </Box>
    );
};

export default GitCommitScreen;
```

## File: src/components/ReasonScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string,
    scrollIndex?: number,
    visibleLinesCount?: number, // if not provided, all lines are shown
}

const ReasonScreen = ({ reasoning, scrollIndex = 0, visibleLinesCount }: ReasonScreenProps) => {
    const lines = reasoning.split('\n');
    const visibleLines = visibleLinesCount ? lines.slice(scrollIndex, scrollIndex + visibleLinesCount) : lines;

    return (
        <Box flexDirection="column">
            <Text>REASONING</Text>
            <Box flexDirection="column" marginTop={1}>
                {visibleLines.map((line, index) => <Text key={index}>{line}</Text>)}
            </Box>
        </Box>
    );
};

export default ReasonScreen;
```

## File: src/components/Separator.tsx
```typescript
import React from 'react';
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = () => {
	const [columns] = useStdoutDimensions();
	return <Text>{'─'.repeat(columns || 80)}</Text>;
};

export default Separator;
```

## File: src/data/mocks.ts
```typescript
import type { Transaction } from '../types/transaction.types';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult } from '../types/review.types';

const mockReasoning1 = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;

const mockReasoning2 = `1. The primary goal was to make the rollback functionality in \`restoreSnapshot\` more robust. The previous implementation used a simple for-loop which would halt on the first error, leaving the project in a partially restored state.

2. I opted for a \`Promise.all\` approach to run file restorations in parallel. This improves performance slightly but, more importantly, ensures all restoration attempts are completed, even if some fail.

3. An \`restoreErrors\` array was introduced to collect any exceptions that occur during the process. If this array is not empty after the \`Promise.all\` completes, a comprehensive error is thrown, informing the user exactly which files failed to restore. This provides much better diagnostics.`;

export const allMockTransactions: Transaction[] = [
    {
        id: '1',
        timestamp: Date.now() - 15 * 1000,
        status: 'PENDING',
        hash: 'e4a7c112',
        message: 'fix: add missing error handling',
        prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
        reasoning: mockReasoning1,
        files: [
            { id: '1-1', path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
        ],
        stats: { files: 1, linesAdded: 18, linesRemoved: 5 },
    },
    {
        id: '2',
        timestamp: Date.now() - 2 * 60 * 1000,
        status: 'APPLIED',
        hash: '4b9d8f03',
        message: 'refactor: simplify clipboard logic',
        prompt: 'Simplify the clipboard logic using an external library...',
        reasoning: 'The existing clipboard logic was complex and platform-dependent. Using the `clipboardy` library simplifies the code and improves reliability across different operating systems.',
        files: [
            { id: '2-1', path: 'src/core/clipboard.ts', type: 'MOD', linesAdded: 15, linesRemoved: 8, diff: '... diff ...' },
            { id: '2-2', path: 'src/utils/shell.ts', type: 'MOD', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
        ],
        stats: { files: 2, linesAdded: 22, linesRemoved: 11 },
    },
    {
        id: '3',
        timestamp: Date.now() - 5 * 60 * 1000,
        status: 'COMMITTED',
        hash: '8a3f21b8',
        message: 'feat: implement new dashboard UI',
        prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
        reasoning: mockReasoning2,
        files: [
            { id: '3-1', path: 'src/core/transaction.ts', type: 'MOD', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
            { id: '3-2', path: 'src/utils/logger.ts', type: 'MOD', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
            { id: '3-3', path: 'src/utils/old-helper.ts', type: 'DEL', linesAdded: 0, linesRemoved: 30, diff: '... diff ...' },
        ],
        stats: { files: 3, linesAdded: 25, linesRemoved: 38 },
    },
    { id: '4', timestamp: Date.now() - 8 * 60 * 1000, status: 'REVERTED', hash: 'b2c9e04d', message: 'Reverting transaction 9c2e1a05' },
    { id: '5', timestamp: Date.now() - 9 * 60 * 1000, status: 'FAILED', hash: '9c2e1a05', message: 'style: update button component (Linter errors: 5)' },
    { id: '6', timestamp: Date.now() - 12 * 60 * 1000, status: 'COMMITTED', hash: 'c7d6b5e0', message: 'docs: update readme with TUI spec' },
];

/**
 * Creates a deep copy of the mock transactions to prevent state mutations.
 */
export const createMockTransactions = (): Transaction[] => {
    return JSON.parse(JSON.stringify(allMockTransactions));
};


// From review.store.ts
export const mockReviewFiles: ReviewFileItem[] = [
    {
        id: '1',
        path: 'src/core/transaction.ts',
        status: 'APPROVED',
        linesAdded: 18,
        linesRemoved: 5,
        diff: `--- a/src/core/transaction.ts
+++ b/src/core/transaction.ts
@@ -15,7 +15,7 @@ export class Transaction {
   }

-  calculateChanges(): ChangeSet {
+  computeDelta(): ChangeSet {
     return this.changes;
   }
 }`,
        strategy: 'replace',
    },
    {
        id: '2',
        path: 'src/utils/logger.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Hunk #1 failed to apply',
        strategy: 'standard-diff',
    },
    {
        id: '3',
        path: 'src/commands/apply.ts',
        status: 'FAILED',
        linesAdded: 0,
        linesRemoved: 0,
        diff: '',
        error: 'Context mismatch at line 92',
        strategy: 'standard-diff',
    },
];

export const mockReviewScripts: ScriptResult[] = [
    { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
    { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: `src/core/clipboard.ts
  45:12  Error    'clipboardy' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
  88:5   Warning  Unexpected console statement. (no-console)` },
];

export const mockReviewReasoning = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.`;
```

## File: src/hooks/useReviewScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, useApp } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { CopyService } from '../services/copy.service';

export const useReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        selectedItemIndex, bodyView,
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval, expandDiff,
        toggleBodyView, setBodyView,
        startApplySimulation, rejectAllFiles, approve,
        tryRepairFile, showBulkRepair, executeBulkRepairOption, confirmHandoff,
        scrollReasoningUp, scrollReasoningDown, navigateScriptErrorUp, navigateScriptErrorDown,
    } = store.actions;

    const {
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useMemo(() => {
        const approvedFiles = files.filter(f => f.status === 'APPROVED');
        return {
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
            approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
            approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files]);

    const openCopyMode = () => {
        const { hash, message, prompt, reasoning, files, selectedItemIndex } = store;
        const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
        CopyService.openCopyForReview({
            hash, message, prompt, reasoning,
        }, files, selectedFile);
    };

    useInput((input, key) => {
        // For demo purposes: Pressing 1 or 2 triggers the processing screen simulation.
        if (input === '1') {
            startApplySimulation('success');
            return;
        }
        if (input === '2') {
            // The store's default is failure, but to re-trigger the processing screen
            startApplySimulation('failure');
            return;
        }

        if (input.toLowerCase() === 'q') exit();

        // Handle Escape key - context-sensitive behavior
        if (key.escape) {
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff') {
                toggleBodyView(bodyView); // Close modal
            } else if (bodyView !== 'none') {
                setBodyView('none');
            } else {
                showDashboardScreen();
            }
            return;
        }

        // Handoff Confirmation
        if (bodyView === 'confirm_handoff') {
            if (key.return) {
                confirmHandoff();
            }
            return;
        }

        // Bulk Repair Navigation
        if (bodyView === 'bulk_repair') {
            if (input >= '1' && input <= '4') {
                executeBulkRepairOption(parseInt(input));
            }
            return;
        }

        // Reasoning Scroll Navigation
        if (bodyView === 'reasoning') {
            if (key.upArrow) scrollReasoningUp();
            if (key.downArrow) scrollReasoningDown();
            if (input.toLowerCase() === 'r') toggleBodyView('reasoning');
            return;
        }

        // Script Output Navigation
        if (bodyView === 'script_output') {
            if (input.toLowerCase() === 'j') navigateScriptErrorDown();
            if (input.toLowerCase() === 'k') navigateScriptErrorUp();
            if (key.return) toggleBodyView('script_output');
            if (input.toLowerCase() === 'c') {
                // Copy script output
                const scriptIndex = selectedItemIndex - numFiles;
                const selectedScript = scripts[scriptIndex];
                if (selectedScript) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
                }
            }
            return;
        }

        // Diff View Navigation
        if (bodyView === 'diff') {
            if (input.toLowerCase() === 'x') expandDiff();
            if (input.toLowerCase() === 'd') toggleBodyView('diff');
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.status !== 'FAILED') {
                    toggleFileApproval();
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleBodyView('diff');
            }
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleBodyView('script_output');
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }

        // Handle T for single repair and Shift+T for bulk repair
        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = files.some(f => f.status === 'FAILED');
                if (hasFailedFiles) {
                    showBulkRepair();
                }
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    if (file && file.status === 'FAILED') {
                        tryRepairFile();
                    }
                }
            }
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    return { ...store, numFiles, approvedFilesCount, approvedLinesAdded, approvedLinesRemoved };
};
```

## File: src/hooks/useTransactionDetailScreen.tsx
```typescript
import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';
import { CopyService } from '../services/copy.service';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useTransactionDetailStore();
    const {
        transaction,
        files,
        bodyView,
    } = store;

    const {
        // Main nav
        navigateUp, navigateDown, handleEnterOrRight, handleEscapeOrLeft,
        toggleRevertConfirm,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    const openCopyMode = () => {
        const { transaction, files, selectedFileIndex } = store;
        if (!transaction) return;
        const selectedFile = files[selectedFileIndex];
        CopyService.openCopyForTransactionDetail(transaction, selectedFile);
    };

    useInput((input, key) => {
        if (bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }

        // Main view input
        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) handleEnterOrRight();
        if (key.escape || key.leftArrow) handleEscapeOrLeft();
    });

    return {
        ...store,
        actions: {
            ...store.actions,
            showDashboardScreen,
        },
    };
};
```

## File: src/stores/commit.store.ts
```typescript
import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import type { Transaction } from '../types/transaction.types';
import { CommitService } from '../services/commit.service';

interface CommitState {
    transactionsToCommit: Transaction[];
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

export const useCommitStore = create<CommitState>((set, get) => ({
    transactionsToCommit: [],
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const { transactions } = useDashboardStore.getState();
            const appliedTransactions = transactions.filter(tx => tx.status === 'APPLIED');
            
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);

            set({
                transactionsToCommit: appliedTransactions,
                finalCommitMessage,
            });
        },
        commit: async () => {
            set({ isCommitting: true });
            const { transactionsToCommit } = get();
            await CommitService.commit(transactionsToCommit);
            set({ isCommitting: false });
        },
    },
}));
```

## File: src/hooks/useTransactionHistoryScreen.tsx
```typescript
import { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import { useTransactionHistoryStore, getVisibleItemPaths } from '../stores/transaction-history.store';
import { useAppStore } from '../stores/app.store';
import { useStdoutDimensions } from '../utils';
import { CopyService } from '../services/copy.service';

export const useTransactionHistoryScreen = () => {
    const [, rows] = useStdoutDimensions();
    const store = useTransactionHistoryStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const [viewOffset, setViewOffset] = useState(0);
    
    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(store.transactions, store.expandedIds),
        [store.transactions, store.expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(store.selectedItemPath);

    const NON_CONTENT_HEIGHT = 8; // Header, filter, separators, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_CONTENT_HEIGHT);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);

    const openCopyMode = () => {
        const { transactions, selectedForAction } = store;
        const selectedTxs = transactions.filter(tx => selectedForAction.has(tx.id));

        if (selectedTxs.length === 0) return;
        CopyService.openCopyForTransactionHistory(selectedTxs);
    };

    useInput((input, key) => {
        if (store.mode === 'FILTER') {
            if (key.escape) store.actions.setMode('LIST');
            if (key.return) store.actions.applyFilter();
            return;
        }
        if (store.mode === 'BULK_ACTIONS') {
            if (key.escape) store.actions.setMode('LIST');
            // Add number handlers...
            return;
        }

        // LIST mode inputs
        if (key.upArrow) store.actions.navigateUp();
        if (key.downArrow) store.actions.navigateDown();
        if (key.rightArrow) store.actions.expandOrDrillDown();
        if (key.leftArrow) store.actions.collapseOrBubbleUp();
        if (input === ' ') store.actions.toggleSelection();

        if (input.toLowerCase() === 'f') store.actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && store.selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && store.selectedForAction.size > 0) store.actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => store.transactions.filter(tx => txIdsInView.has(tx.id)),
        [store.transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatus = store.filterQuery ? store.filterQuery : '(none)';
    const showingStatus = `Showing ${viewOffset + 1}-${viewOffset + itemsInView.length} of ${visibleItemPaths.length} items`;
    
    return {
        store,
        viewOffset,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
    };
};
```

## File: src/stores/init.store.ts
```typescript
import { create } from 'zustand';
import type { Task, TaskStatus, InitPhase, GitignoreChoice } from '../types/init.types';
export type { Task } from '../types/init.types';

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
        setPhase: (_phase: InitPhase) => void;
        updateAnalyzeTask: (_id: string, _status: TaskStatus) => void;
        setAnalysisResults: (_projectId: string, _gitignoreFound: boolean) => void;
        updateConfigureTask: (_id: string, _status: TaskStatus) => void;
        setInteractiveChoice: (_choice: GitignoreChoice) => void;
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

## File: src/types/transaction.types.ts
```typescript
import type { FileChange } from './file.types';

export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    // Fields for history/detail view
    files?: FileChange[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
```

## File: src/components/SplashScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashScreen = () => {
    const { countdown } = useSplashScreen();

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

## File: src/hooks/useDebugMenu.tsx
```typescript
import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useInitStore } from '../stores/init.store';
import { useReviewStore } from '../stores/review.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useCopyStore } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';
import { useTransactionHistoryStore } from '../stores/transaction-history.store';
import type { MenuItem } from '../types/debug.types';
import { moveIndex } from '../stores/navigation.utils';
export type { MenuItem } from '../types/debug.types';

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const appActions = useAppStore(s => s.actions);
    const dashboardActions = useDashboardStore(s => s.actions);
    const initActions = useInitStore(s => s.actions);
    const reviewActions = useReviewStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const detailActions = useTransactionDetailStore(s => s.actions);
    const historyActions = useTransactionHistoryStore(s => s.actions);

    const menuItems: MenuItem[] = [
        {
            title: 'Splash Screen',
            action: () => appActions.showSplashScreen(),
        },
        {
            title: 'Init: Analyze Phase',
            action: () => {
                initActions.setPhase('ANALYZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Interactive Phase',
            action: () => {
                initActions.setPhase('INTERACTIVE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Finalize Phase',
            action: () => {
                initActions.setPhase('FINALIZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Dashboard: Listening',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Confirm Approve',
            action: () => {
                dashboardActions.setStatus('CONFIRM_APPROVE');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Approving',
            action: () => {
                dashboardActions.setStatus('APPROVING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                reviewActions.simulateFailureScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.simulateSuccessScenario();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleBodyView('diff');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.toggleBodyView('reasoning');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.simulateFailureScenario();
                // We can't show the screen and then open the modal in the same tick.
                // We show the review screen, and then programmatically open the copy store.
                appActions.showReviewScreen();
                const { hash, message, prompt, reasoning, files } = useReviewStore.getState();
                const items = [
                    { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => `${hash ?? ''}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
                    { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => message },
                    { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => prompt },
                    { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => reasoning },
                    { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}`, getData: () => files[0]?.diff || '' },
                    { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
                ];
                useCopyStore.getState().actions.open('Select data to copy from review:', items);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                reviewActions.simulateSuccessScenario();
                reviewActions.toggleBodyView('script_output');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.showBulkRepair();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.simulateFailureScenario();
                reviewActions.executeBulkRepairOption(3); // Option 3 is Handoff
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => appActions.showReviewProcessingScreen(),
        },
        {
            title: 'Git Commit Screen',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            },
        },
        {
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                detailActions.loadTransaction('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Transaction History Screen',
            action: () => {
                historyActions.load();
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L1 Drilldown',
            action: () => {
                historyActions.prepareDebugState('l1-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Diff)',
            action: () => {
                historyActions.prepareDebugState('l2-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Filter Mode',
            action: () => {
                historyActions.prepareDebugState('filter');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Copy Mode',
            action: () => {
                historyActions.prepareDebugState('copy');
                const { transactions, selectedForAction } = useTransactionHistoryStore.getState();
                const selectedTxs = transactions.filter(tx => selectedForAction.has(tx.id));
                appActions.showTransactionHistoryScreen();
                const items = [
                     { id: 'messages', key: 'M', label: 'Git Messages', getData: () => selectedTxs.map(tx => tx.message).join('\n'), isDefaultSelected: true },
                     { id: 'uuids', key: 'U', label: 'UUIDs', getData: () => selectedTxs.map(tx => tx.id).join('\n') },
                ];
                useCopyStore.getState().actions.open(`Select data to copy from ${selectedTxs.length} transactions:`, items);
            },
        },
    ];

    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', menuItems.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', menuItems.length));
            return;
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                appActions.toggleDebugMenu();
            }
            return;
        }
        if (key.escape || (key.ctrl && input === 'b')) {
            appActions.toggleDebugMenu();
            return;
        }

        // No ctrl/meta keys for selection shortcuts, and only single characters
        if (key.ctrl || key.meta || input.length !== 1) return;

        if (input >= '1' && input <= '9') {
            const targetIndex = parseInt(input, 10) - 1;
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        } else if (input.toLowerCase() >= 'a' && input.toLowerCase() <= 'z') {
            const targetIndex = 9 + (input.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        }
    });

    return {
        selectedIndex,
        menuItems,
    };
};
```

## File: src/services/transaction.service.ts
```typescript
import { createMockTransactions } from '../data/mocks';
import type { Transaction } from '../types/transaction.types';

const revertTransaction = (transactionId: string) => {
    // In a real app, this would perform the revert operation (e.g., API call).
    // The state update is now handled by the calling store.
    // This is a no-op for the simulation, we just need the id.
};

export const TransactionService = {
    revertTransaction,
    getAllTransactions: (): Transaction[] => createMockTransactions(),
};
```

## File: index.tsx
```typescript
import React from 'react';
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useCommitStore } from './src/stores/commit.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionDetailStore } from './src/stores/transaction-detail.store';
import { useTransactionHistoryStore } from './src/stores/transaction-history.store';

const main = () => {
    const args = process.argv.slice(2);

    if (args[0] === 'debug-screen' && args[1]) {
        const screenName = args[1].replace(/\.tsx$/, '');
        const { actions: appActions } = useAppStore.getState();

        switch (screenName) {
            case 'DashboardScreen':
                appActions.showDashboardScreen();
                break;
            case 'GitCommitScreen':
                useCommitStore.getState().actions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                break;
            case 'ReviewProcessingScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useTransactionDetailStore.getState().actions.loadTransaction('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useTransactionHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
```

## File: src/components/InitializationScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { type Task } from '../stores/init.store';
import Separator from './Separator';
import { useInitializationScreen } from '../hooks/useInitializationScreen';

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
    const {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    } = useInitializationScreen();

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

## File: src/components/TransactionHistoryScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { type HistoryTransaction as Transaction, type FileChange } from '../stores/transaction-history.store';
import Separator from './Separator';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';

// --- Sub-components ---

const DiffPreview = ({ diff }: { diff: string }) => {
    const lines = diff.split('\n');
    const previewLines = lines.slice(0, 5);
    const hiddenLines = lines.length > 5 ? lines.length - 5 : 0;

    return (
        <Box flexDirection="column" paddingLeft={8}>
            {previewLines.map((line, i) => {
                let color = 'white';
                if (line.startsWith('+')) color = 'green';
                if (line.startsWith('-')) color = 'red';
                if (line.startsWith('@@')) color = 'cyan';
                return <Text key={i} color={color}>{line}</Text>;
            })}
            {hiddenLines > 0 && <Text color="gray">... {hiddenLines} lines hidden ...</Text>}
        </Box>
    );
};

const FileRow = ({ file, isSelected, isExpanded }: { file: FileChange, isSelected: boolean, isExpanded: boolean }) => {
    const icon = isExpanded ? '▾' : '▸';
    const typeMap = { MOD: '[MOD]', ADD: '[ADD]', DEL: '[DEL]', REN: '[REN]' };
    
    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {icon} {typeMap[file.type]} {file.path}
            </Text>
            {isExpanded && <DiffPreview diff={file.diff} />}
        </Box>
    );
};

const TransactionRow = ({
    tx,
    isSelected,
    isExpanded,
    isSelectedForAction,
}: {
    tx: Transaction,
    isSelected: boolean,
    isExpanded: boolean,
    isSelectedForAction: boolean,
}) => {
    const icon = isExpanded ? '▾' : '▸';
    const statusMap = {
        COMMITTED: <Text color="green">✓ Committed</Text>,
        HANDOFF: <Text color="magenta">→ Handoff</Text>,
        REVERTED: <Text color="gray">↩ Reverted</Text>,
    };
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    const selectionIndicator = isSelectedForAction ? '[x]' : '[ ]';
    
    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {selectionIndicator} {icon} {statusMap[tx.status as keyof typeof statusMap] || tx.status} · {tx.hash} · {date} · {tx.message}
            </Text>
            {isExpanded && (
                <Box flexDirection="column" paddingLeft={8}>
                    {tx.stats && <Text color="gray">Stats: {tx.stats.files} Files · +{tx.stats.linesAdded} lines, -{tx.stats.linesRemoved} lines</Text>}
                    <Text>Files:</Text>
                </Box>
            )}
        </Box>
    );
};

const BulkActionsMode = ({ selectedForActionCount }: { selectedForActionCount: number }) => {
    return (
        <Box flexDirection="column" marginY={1}>
            <Text bold color="yellow">PERFORM BULK ACTION ON {selectedForActionCount} SELECTED ITEMS</Text>
            <Box marginY={1}>
                <Text>This action is often irreversible. Are you sure?</Text>
            </Box>
            <Text>(1) Revert Selected Transactions</Text>
            <Text>(2) Mark as &apos;Git Committed&apos;</Text>
            <Text>(3) Delete Selected Transactions (from Relaycode history)</Text>
            <Text>(Esc) Cancel</Text>
        </Box>
    );
};

// --- Main Component ---

const TransactionHistoryScreen = () => {
    const {
        store,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
    } = useTransactionHistoryScreen();

    const renderFooter = () => {
        if (store.mode === 'FILTER') return <Text>(Enter) Apply Filter & Return      (Esc) Cancel</Text>; 
        if (store.mode === 'BULK_ACTIONS') return <Text>Choose an option [1-3, Esc]:</Text>;
        
        const actions = ['(↑↓) Nav', '(→) Expand', '(←) Collapse', '(Spc) Select', '(Ent) Details', '(F)ilter'];
        if (store.selectedForAction.size > 0) {
            actions.push('(C)opy', '(B)ulk');
        }
        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode transaction history</Text>
            <Separator />

            <Box>
                <Text>Filter: </Text>
                {store.mode === 'FILTER' ? (
                    <TextInput value={store.filterQuery} onChange={store.actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus} ({store.transactions.length} txns)</Text>
            </Box>

            <Box flexDirection="column" marginY={1}>
                {store.mode === 'BULK_ACTIONS' && <BulkActionsMode selectedForActionCount={store.selectedForAction.size} />}

                {store.mode === 'LIST' && transactionsInView.map(tx => {
                    const isTxSelected = store.selectedItemPath.startsWith(tx.id);
                    const isTxExpanded = store.expandedIds.has(tx.id);
                    const isSelectedForAction = store.selectedForAction.has(tx.id);

                    const showTxRow = pathsInViewSet.has(tx.id);

                    return (
                        <Box flexDirection="column" key={tx.id}>
                            {showTxRow && (
                                <TransactionRow
                                    tx={tx}
                                    isSelected={isTxSelected && !store.selectedItemPath.includes('/')}
                                    isExpanded={isTxExpanded}
                                    isSelectedForAction={isSelectedForAction}
                                />
                            )}
                            {isTxExpanded && tx.files?.map(file => {
                                if (!pathsInViewSet.has(`${tx.id}/${file.id}`)) return null;
                                const filePath = `${tx.id}/${file.id}`;
                                const isFileSelected = store.selectedItemPath === filePath;
                                const isFileExpanded = store.expandedIds.has(filePath);
                                return (
                                    <FileRow
                                        key={file.id}
                                        file={file}
                                        isSelected={isFileSelected}
                                        isExpanded={isFileExpanded}
                                    />
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            <Separator />
            {renderFooter()}
        </Box>
    );
};

export default TransactionHistoryScreen;
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
    "debug-screen": "bun run index.tsx debug-screen",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "clipboardy": "^4.0.0",
    "ink": "^6.3.1",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "react": "^19.1.1",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.19.17",
    "@types/react": "^18.3.24",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "typescript": "^5.9.2"
  }
}
```

## File: src/components/TransactionDetailScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { type FileChangeType } from '../types/file.types';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';

const getFileChangeTypeIcon = (type: FileChangeType) => {
    switch (type) {
        case 'MOD': return '[MOD]';
        case 'ADD': return '[ADD]';
        case 'DEL': return '[DEL]';
        case 'REN': return '[REN]';
    }
};

const RevertModal = ({ transactionHash }: { transactionHash: string }) => {
    return (
        <Box 
            borderStyle="round"
            borderColor="yellow"
            flexDirection="column"
            paddingX={2}
            width="80%"
            alignSelf='center'
        >
            <Text bold color="yellow" wrap="wrap" >REVERT THIS TRANSACTION?</Text>
            <Box height={1} />
            <Text wrap="wrap">This will create a NEW transaction that reverses all changes made by {transactionHash}. The original transaction record will be preserved.</Text>
            <Box height={1} />
            <Text wrap="wrap">Are you sure?</Text>
        </Box>
    );
};

const TransactionDetailScreen = () => {
    const {
        transaction, files,
        navigatorFocus, expandedSection, selectedFileIndex, bodyView
    } = useTransactionDetailScreen();

    if (!transaction) {
        return <Text>Loading transaction...</Text>;
    }

    const renderNavigator = () => {
        const isPromptFocused = navigatorFocus === 'PROMPT';
        const isReasoningFocused = navigatorFocus === 'REASONING';
        const isFilesFocused = navigatorFocus === 'FILES' || navigatorFocus === 'FILES_LIST';
        
        const isPromptExpanded = expandedSection === 'PROMPT';
        const isReasoningExpanded = expandedSection === 'REASONING';
        const isFilesExpanded = expandedSection === 'FILES';
        
        return (
            <Box flexDirection="column">
                <Text color={isPromptFocused && !isFilesFocused ? 'cyan' : undefined}>
                    {isPromptFocused && !isFilesFocused ? '> ' : '  '}
                    {isPromptExpanded ? '▾' : '▸'} (P)rompt
                </Text>
                <Text color={isReasoningFocused && !isFilesFocused ? 'cyan' : undefined}>
                    {isReasoningFocused && !isFilesFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (R)easoning ({transaction.reasoning?.split('\n\n').length || 0} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && navigatorFocus !== 'FILES_LIST' ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (F)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file, index) => {
                             const isFileSelected = navigatorFocus === 'FILES_LIST' && selectedFileIndex === index;
                             const stats = file.type === 'DEL' ? '' : ` (+${file.linesAdded}/-${file.linesRemoved})`;
                             return (
                                <Text key={file.id} color={isFileSelected ? 'cyan' : undefined}>
                                    {isFileSelected ? '> ' : '  '}
                                    {`${getFileChangeTypeIcon(file.type)} ${file.path}${stats}`}
                                </Text>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    const renderBody = () => {
        if (bodyView === 'NONE') {
            return <Text color="gray">(Press → to expand a section and view its contents)</Text>;
        }
        if (bodyView === 'PROMPT') {
            return (
                <Box flexDirection="column">
                    <Text>PROMPT</Text>
                    <Box marginTop={1}><Text>{transaction.prompt}</Text></Box>
                </Box>
            );
        }
        if (bodyView === 'REASONING') {
            if (!transaction.reasoning) return <Text color="gray">No reasoning provided.</Text>;
            return <ReasonScreen reasoning={transaction.reasoning} />;
        }
        if (bodyView === 'FILES_LIST') {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === 'DIFF_VIEW') {
            const file = files[selectedFileIndex];
            if (!file) return null;
            return <DiffScreen filePath={file.path} diffContent={file.diff} isExpanded={true} />;
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === 'REVERT_CONFIRM') {
            return <Text>(Enter) Confirm Revert      (Esc) Cancel</Text>;
        }
        
        if (navigatorFocus === 'FILES_LIST') {
            if (bodyView === 'DIFF_VIEW') {
                return <Text>(↑↓) Nav Files · (←) Back to Files · (C)opy Mode · (U)ndo · (Q)uit</Text>;
            }
            return <Text>(↑↓) Nav Files · (→) View Diff · (←) Back to Sections · (C)opy Mode · (Q)uit</Text>;
        }
        
        if (expandedSection) {
            return <Text>(↑↓) Nav/Scroll · (←) Collapse · (C)opy Mode · (U)ndo · (Q)uit</Text>;
        }
        
        return <Text>(↑↓) Nav · (→) Expand · (C)opy Mode · (U)ndo · (Q)uit</Text>;
    };

    const { message, timestamp, status } = transaction;
    const date = new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    const fileStats = `${files.length} Files · +${files.reduce((a, f) => a + f.linesAdded, 0)} lines, -${files.reduce((a, f) => a + f.linesRemoved, 0)} lines`;

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text>▲ relaycode transaction details</Text>
            <Separator />
            
            {/* Modal takeover for Revert */}
            {bodyView === 'REVERT_CONFIRM' && <RevertModal transactionHash={transaction.hash} />}
            
            {/* Main view */}
            <Box flexDirection="column" display={bodyView === 'REVERT_CONFIRM' ? 'none' : 'flex'}>
                {/* Navigator Part A */}
                <Box flexDirection="column" marginY={1}>
                    <Text>UUID: {transaction.id}</Text>
                    <Text>Git: {message}</Text>
                    <Text>Date: {date} · Status: {status}</Text>
                    <Text>Stats: {fileStats}</Text>
                </Box>
                
                {/* Navigator Part B */}
                {renderNavigator()}
                
                <Separator />
                
                {/* Body */}
                <Box marginY={1}>
                    {renderBody()}
                </Box>
                
                <Separator />
            </Box>
            
            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default TransactionDetailScreen;
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/app.types';

interface AppState {
    isDebugMenuOpen: boolean;
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        toggleDebugMenu: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    isDebugMenuOpen: false,
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showGitCommitScreen: () => set({ currentScreen: 'git-commit' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        showTransactionHistoryScreen: () => set({ currentScreen: 'transaction-history' }),
        showTransactionDetailScreen: () => set({ currentScreen: 'transaction-detail' }),
        toggleDebugMenu: () => set(state => ({ isDebugMenuOpen: !state.isDebugMenuOpen })),
    },
}));
```

## File: src/stores/transaction-detail.store.ts
```typescript
import { create } from 'zustand';
import { useDashboardStore } from './dashboard.store';
import { TransactionService } from '../services/transaction.service';
import type { Transaction } from '../types/transaction.types';
import type { FileChange as FileDetail } from '../types/file.types';
export type { FileChangeType } from '../types/file.types';
import type { NavigatorSection, DetailBodyView } from '../types/transaction-detail.types';

interface TransactionDetailState {
    // Data
    transaction: Transaction | null;
    files: FileDetail[];

    // UI State
    navigatorFocus: NavigatorSection | 'FILES_LIST';
    expandedSection: NavigatorSection | null;
    selectedFileIndex: number;
    bodyView: DetailBodyView;

    // Actions
    actions: {
        loadTransaction: (transactionId: string) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        handleEnterOrRight: () => void;
        handleEscapeOrLeft: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    }
}

const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];

export const useTransactionDetailStore = create<TransactionDetailState>((set, get) => ({
    transaction: null,
    files: [],

    navigatorFocus: 'PROMPT',
    expandedSection: null,
    selectedFileIndex: 0,
    bodyView: 'NONE',

    actions: {
        loadTransaction: (transactionId) => {
            const { transactions } = useDashboardStore.getState();
            const transaction = transactions.find(tx => tx.id === transactionId);
            if (transaction) {
                set({
                    transaction,
                    files: transaction.files || [],
                    // Reset UI state
                    navigatorFocus: 'PROMPT',
                    expandedSection: null,
                    selectedFileIndex: 0,
                    bodyView: 'NONE',
                });
            }
        },
        navigateUp: () => {
            const { navigatorFocus, selectedFileIndex } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.max(0, selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ navigatorFocus: navigatorOrder[currentIndex - 1] });
                }
            }
        },
        navigateDown: () => {
            const { navigatorFocus, selectedFileIndex, files } = get();
            if (navigatorFocus === 'FILES_LIST') {
                set({ selectedFileIndex: Math.min(files.length - 1, selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ navigatorFocus: navigatorOrder[currentIndex + 1] });
                }
            }
        },
        handleEnterOrRight: () => {
            const { navigatorFocus, expandedSection } = get();

            if (navigatorFocus === 'FILES_LIST') {
                // Already in file list, now show diff
                set({ bodyView: 'DIFF_VIEW' });
                return;
            }

            if (expandedSection === navigatorFocus) {
                // Section is already expanded, handle nested navigation
                if (navigatorFocus === 'FILES') {
                    set({ navigatorFocus: 'FILES_LIST', bodyView: 'FILES_LIST' });
                }
                return;
            }

            // Expand the focused section
            set({ expandedSection: navigatorFocus });

            switch(navigatorFocus) {
                case 'PROMPT':
                    set({ bodyView: 'PROMPT' });
                    break;
                case 'REASONING':
                    set({ bodyView: 'REASONING' });
                    break;
                case 'FILES':
                    set({ bodyView: 'FILES_LIST' });
                    break;
            }
        },
        handleEscapeOrLeft: () => {
            const { navigatorFocus, expandedSection, bodyView } = get();

            if (bodyView === 'DIFF_VIEW') {
                set({ bodyView: 'FILES_LIST' }); // Go back from diff to file list
                return;
            }

            if (navigatorFocus === 'FILES_LIST') {
                set({ navigatorFocus: 'FILES', bodyView: 'NONE' }); // Go back from file list to files section
                return;
            }

            // If a section is expanded, collapse it
            if (expandedSection) {
                set({ expandedSection: null, bodyView: 'NONE' });
                return;
            }
        },
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        confirmRevert: () => {
            const { transaction } = get();
            if (!transaction) return;
            TransactionService.revertTransaction(transaction.id);
            useDashboardStore.getState().actions.updateTransactionStatus(transaction.id, 'REVERTED');
            set({ bodyView: 'NONE' });
        },
    },
}));
```

## File: src/components/DebugMenu.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDebugMenu, type MenuItem } from '../hooks/useDebugMenu';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems } = useDebugMenu();

    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="yellow"
            width="100%"
            paddingX={2}
        >
            <Text bold color="yellow">▲ relaycode · DEBUG MENU</Text>
            <Separator />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => (
                    <Text key={item.title} color={selectedIndex === index ? 'cyan' : undefined}>
                        {selectedIndex === index ? '> ' : '  '}
                        ({getKeyForIndex(index)}) {item.title}
                    </Text>
                ))}
            </Box>
            <Separator />
            <Text>(↑↓) Nav · (1-9,a-z) Jump · (Enter) Select · (Esc / Ctrl+B) Close</Text>
        </Box>
    );
};

export default DebugMenu;
```

## File: src/components/ReviewScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import { type FileItem, type ScriptResult } from '../stores/review.store';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import { useReviewScreen } from '../hooks/useReviewScreen';

// --- Sub-components ---

const FileItemRow = ({ file, isSelected }: { file: FileItem, isSelected: boolean }) => {
    let icon;
    let iconColor;
    switch (file.status) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
        case 'AWAITING': icon = '[●]'; iconColor = 'yellow'; break;
        case 'RE_APPLYING': icon = '[●]'; iconColor = 'cyan'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isSelected ? '> ' : '  ';

    if (file.status === 'FAILED') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({file.error})</Text>
                </Text>
            </Box>
        );
    }

    if (file.status === 'AWAITING') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    (Bulk re-apply prompt copied!)</Text>
                </Text>
            </Box>
        );
    }

    if (file.status === 'RE_APPLYING') {
        return (
             <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> MOD {file.path} {diffStats} [{strategy}]
            </Text>
        </Box>
    );
};

const ScriptItemRow = ({
    script,
    isSelected,
    isExpanded,
}: {
    script: ScriptResult;
    isSelected: boolean;
    isExpanded: boolean;
}) => {
    const icon = script.success ? '✓' : '✗';
    const iconColor = script.success ? 'green' : 'red';
    const arrow = isExpanded ? '▾' : '▸';
    const prefix = isSelected ? '> ' : '  ';
    
    // Extract script type from command (e.g., "bun run test" -> "Post-Command", "bun run lint" -> "Linter")
    const scriptType = script.command.includes('test') ? 'Post-Command' : 
                      script.command.includes('lint') ? 'Linter' : 
                      'Script';

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> {scriptType}: `{script.command}` ({script.duration}s) {arrow}{' '}
                {script.summary}
            </Text>
        </Box>
    );
};

// --- Main Component ---

const ReviewScreen = () => {
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        linesAdded, linesRemoved, duration,
        selectedItemIndex, bodyView, isDiffExpanded, reasoningScrollIndex, scriptErrorIndex,
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useReviewScreen();

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningLinesCount = reasoning.split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ReasonScreen
                        reasoning={reasoning}
                        scrollIndex={reasoningScrollIndex}
                        visibleLinesCount={visibleLinesCount}
                    />
                    {reasoningLinesCount > visibleLinesCount && (
                        <Text color="gray">
                            Showing lines {reasoningScrollIndex + 1}-{Math.min(reasoningScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
                            of {reasoningLinesCount}
                        </Text>
                    )}
                </Box>
            );
        }
        
        if (bodyView === 'diff') {
            const selectedFile = files[selectedItemIndex];
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                />
            );
        }

        if (bodyView === 'script_output') {
             const scriptIndex = selectedItemIndex - numFiles;
             const selectedScript = scripts[scriptIndex];
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter(line =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>{selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`</Text>
                    <Box marginTop={1}>
                        {outputLines.map((line, index) => {
                            const isError = line.includes('Error');
                            const isWarning = line.includes('Warning');
                            const isHighlighted = errorLines[scriptErrorIndex] === line;
                            
                            return (
                                <Text 
                                    key={index} 
                                    color={isError ? 'red' : isWarning ? 'yellow' : undefined}
                                    bold={isHighlighted}
                                    backgroundColor={isHighlighted ? 'blue' : undefined}
                                >
                                    {line}
                                </Text>
                            );
                        })}
                    </Box>
                    {errorLines.length > 0 && (
                        <Text color="gray">
                            Error {scriptErrorIndex + 1} of {errorLines.length} highlighted
                        </Text>
                    )}
                </Box>
             );
        }

        if (bodyView === 'confirm_handoff') {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>HANDOFF TO EXTERNAL AGENT</Text>
                    <Box flexDirection="column">
                        <Text>This action will:</Text>
                        <Text>1. Copy a detailed prompt to your clipboard for an agentic AI.</Text>
                        <Text>2. Mark the current transaction as &apos;Handoff&apos; and close this review.</Text>
                        <Text>3. Assume that you and the external agent will complete the work.</Text>
                    </Box>
                    <Text>Relaycode will NOT wait for a new patch. This is a final action.</Text>
                    <Text bold color="yellow">Are you sure you want to proceed?</Text>
                </Box>
            );
        }

        if (bodyView === 'bulk_repair') {
            const failedFiles = files.filter(f => f.status === 'FAILED');
            const repairOptions = [
                '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
                '(2) Bulk Change Strategy & Re-apply',
                '(3) Handoff to External Agent',
                '(4) Bulk Abandon All Failed Files',
                '(Esc) Cancel',
            ];

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK REPAIR ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {failedFiles.length} files failed to apply:</Text>
                        {failedFiles.map(file => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>

                    <Text>How would you like to proceed?</Text>

                    <Box flexDirection="column">
                        {repairOptions.map((opt, i) => (
                            <Text key={i}>
                                {i === 0 ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        if (bodyView === 'diff') {
            return <Text>(↑↓) Nav · (X)pand · (D/Esc) Back</Text>;
        }
        if (bodyView === 'reasoning') {
            return <Text>(↑↓) Scroll Text · (R)Collapse View · (C)opy Mode</Text>;
        }
        if (bodyView === 'script_output') {
            return (
                <Text>(↑↓) Nav · (J↓/K↑) Next/Prev Error · (C)opy Output · (Ent/Esc) Back</Text>
            );
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Choose an option [1-4, Esc]:</Text>;
        }
        if (bodyView === 'confirm_handoff') {
            return <Text>(Enter) Confirm Handoff      (Esc) Cancel</Text>;
        }

        // Main footer
        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        const hasFailedFiles = files.some(f => f.status === 'FAILED');
        
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            if (selectedFile && selectedFile.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
            
            // Add repair options for failed files
            if (selectedFile && selectedFile.status === 'FAILED') {
                actions.push('(T)ry Repair');
            }
        } else { // script selected
            actions.push('(Ent) Expand Details');
        }

        actions.push('(R)easoning');
        
        // Add bulk repair if there are failed files
        if (hasFailedFiles) {
            actions.push('(Shift+T) Bulk Repair');
        }
        
        actions.push('(C)opy');

        if (approvedFilesCount > 0) {
            actions.push('(A)pprove');
        }

        if (files.some(f => f.status === 'APPROVED' || f.status === 'FAILED')) {
            actions.push('(Shift+R) Reject All');
        }
        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column" marginY={1}>
                <Box flexDirection="column">
                    <Text>{hash} · {message}</Text>
                    <Text>
                        (<Text color="green">+{approvedLinesAdded}</Text>/<Text color="red">-{approvedLinesRemoved}</Text>) · {approvedFilesCount}/{numFiles} Files · {duration}s
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && <Text> · Scripts: SKIPPED</Text>}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Text>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text>
                        (P)rompt ▸ {prompt.substring(0, 60)}...
                    </Text>
                    <Text>
                        (R)easoning ({reasoning.split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'}{' '}
                        {(reasoning.split('\n')[0] ?? '').substring(0, 50)}...
                    </Text>
                </Box>
            </Box>

            <Separator/>

            {/* Script Results (if any) */}
            {scripts.length > 0 && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script, index) => (
                            <ScriptItemRow
                                key={script.command}
                                script={script}
                                isSelected={selectedItemIndex === numFiles + index}
                                isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                            />
                        ))}
                    </Box>
                    <Separator/>
                </>
            )}

            {/* Files Section */}
            <Box flexDirection="column" marginY={1}>
                <Text bold>FILES</Text>
                {files.map((file, index) => (
                    <FileItemRow
                        key={file.id}
                        file={file}
                        isSelected={selectedItemIndex === index}
                    />
                ))}
            </Box>
            
            <Separator/>
            
            {/* Body Viewport */}
            {bodyView !== 'none' && (
                <>
                    <Box marginY={1}>
                        {renderBody()}
                    </Box>
                    <Separator />
                </>
            )}

            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default ReviewScreen;
```

## File: src/stores/transaction-history.store.ts
```typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction } from '../types/transaction.types';
import type { FileChange } from '../types/file.types';
import type { HistoryViewMode } from '../types/transaction-history.types';

export type { Transaction as HistoryTransaction } from '../types/transaction.types';
export type { FileChange } from '../types/file.types';

// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<TransactionHistoryState, 'actions'>;

interface TransactionHistoryState {
    transactions: Transaction[];
    mode: HistoryViewMode;
    selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    expandedIds: Set<string>; // holds ids of expanded items
    filterQuery: string;
    selectedForAction: Set<string>; // set of transaction IDs

    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void; 
        prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;
    }
}

export const getVisibleItemPaths = (transactions: Transaction[], expandedIds: Set<string>): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id) && tx.files) {
            for (const file of tx.files) {
                paths.push(`${tx.id}/${file.id}`);
            }
        }
    }
    return paths;
};

// --- Store ---
export const useTransactionHistoryStore = create<TransactionHistoryState>((set, get) => ({
    transactions: [],
    mode: 'LIST',
    selectedItemPath: 'tx-0',
    expandedIds: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),

    actions: {
        load: (initialState) => {
            const transactions = TransactionService.getAllTransactions();
            set({
                transactions,
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex > 0) {
                set({ selectedItemPath: visibleItems[currentIndex - 1] });
            }
        },
        navigateDown: () => {
            const { transactions, expandedIds, selectedItemPath } = get();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ selectedItemPath: visibleItems[currentIndex + 1] });
            }
        },
        expandOrDrillDown: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (!newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.add(selectedItemPath);
            }
            return { expandedIds: newExpandedIds };
        }),
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                // If it's expanded, collapse it
                newExpandedIds.delete(selectedItemPath);
                
                // Also collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }

                return { expandedIds: newExpandedIds };
            } else if (selectedItemPath.includes('/')) {
                // If it's a file, move selection to parent transaction
                const parentId = selectedItemPath.split('/')[0];
                return { selectedItemPath: parentId || '' };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = selectedItemPath.split('/')[0];
            if (!txId) return {};

            const newSelection = new Set(selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { selectedForAction: newSelection };
        }),
        setMode: (mode) => set({ mode }),
        setFilterQuery: (query) => set({ filterQuery: query }),
        applyFilter: () => {
            // In a real app, this would filter `transactions`.
            // For the demo, we just go back to LIST mode.
            set({ mode: 'LIST' });
        },
        prepareDebugState: (stateName) => {
            switch (stateName) {
                case 'l1-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0']), selectedItemPath: 'tx-0' });
                    break;
                case 'l2-drill':
                    get().actions.load({ expandedIds: new Set(['tx-0', 'tx-0/0-1']), selectedItemPath: 'tx-0/0-1' });
                    break;
                case 'filter':
                    get().actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:committed' });
                    break;
                case 'copy':
                    get().actions.load({
                        selectedForAction: new Set(['tx-0', 'tx-2']),
                    });
                    break;
                case 'bulk':
                    get().actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['tx-0', 'tx-2']) });
                    break;
            }
        },
    },
}));
```

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { TransactionService } from '../services/transaction.service';
import type { Transaction, TransactionStatus } from '../types/transaction.types';
import type { DashboardStatus } from '../types/dashboard.types';
import { moveIndex } from './navigation.utils';

export type { Transaction, TransactionStatus } from '../types/transaction.types';
export type { DashboardStatus } from '../types/dashboard.types';

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
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    transactions: TransactionService.getAllTransactions(),
    selectedTransactionIndex: 0,
    showHelp: false,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => ({
            selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', state.transactions.length),
        })),
        moveSelectionDown: () => set(state => ({
            selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', state.transactions.length),
        })),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
        setStatus: (status) => set({ status }),
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
            // After updating, move selection to the updated transaction
            const index = get().transactions.findIndex(tx => tx.id === id);
            if (index !== -1) set({ selectedTransactionIndex: index });
        },

        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });

                await DashboardService.approveAll();

                set({ status: previousStatus });
            }
        },
    },
}));
```

## File: src/App.tsx
```typescript
import React, { useEffect } from 'react';
import { Box, useInput } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import GitCommitScreen from './components/GitCommitScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import DebugMenu from './components/DebugMenu'; 
import CopyScreen from './components/CopyScreen';
import { useCopyStore } from './stores/copy.store';

const App = () => {
    const { currentScreen, isDebugMenuOpen, actions } = useAppStore(state => ({
        currentScreen: state.currentScreen,
        isDebugMenuOpen: state.isDebugMenuOpen,
        actions: state.actions,
    }));
    const isCopyModeOpen = useCopyStore(s => s.isOpen);

    useInput((input, key) => {
        if (key.ctrl && input === 'b') {
            actions.toggleDebugMenu();
        }
    }, { isActive: !isCopyModeOpen });

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen, isDebugMenuOpen, isCopyModeOpen]);

    const renderMainScreen = () => {
        if (isDebugMenuOpen) return <DebugMenu />;
        if (currentScreen === 'splash') return <SplashScreen />;
        if (currentScreen === 'init') return <InitializationScreen />;
        if (currentScreen === 'dashboard') return <DashboardScreen />;
        if (currentScreen === 'review') return <ReviewScreen />;
        if (currentScreen === 'review-processing') return <ReviewProcessingScreen />;
        if (currentScreen === 'git-commit') return <GitCommitScreen />;
        if (currentScreen === 'transaction-detail') return <TransactionDetailScreen />;
        if (currentScreen === 'transaction-history') return <TransactionHistoryScreen />;
        return null;
    }

    return (
        <>
            <Box
                width="100%"
                height="100%"
                flexDirection="column"
                display={isCopyModeOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            <CopyScreen />
        </>
    );
};

export default App;
```

## File: src/components/DashboardScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type Transaction, type DashboardStatus, type TransactionStatus } from '../stores/dashboard.store';
import Separator from './Separator';
import GlobalHelpScreen from './GlobalHelpScreen';
import { useDashboardScreen } from '../hooks/useDashboardScreen';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
        case 'PENDING': return <Text color="yellow">?</Text>;
        case 'APPLIED': return <Text color="green">✓</Text>;
        case 'COMMITTED': return <Text color="blue">→</Text>;
        case 'HANDOFF': return <Text color="magenta">→</Text>;
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

const ConfirmationContent = ({
    transactionsToConfirm,
}: {
    transactionsToConfirm: Transaction[];
}) => {
    const actionText = 'APPROVE';
    
    return (
        <Box flexDirection="column" marginY={1} paddingLeft={2}>
            <Text bold color="yellow">{actionText} ALL PENDING TRANSACTIONS?</Text>
            <Text>
                The following {transactionsToConfirm.length} transaction(s) will be approved:
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
    const {
        status,
        transactions,
        selectedTransactionIndex,
        showHelp,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    } = useDashboardScreen();

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case 'LISTENING': statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case 'PAUSED': statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case 'APPROVING': statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>;
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        const commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === 'APPROVING') approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === 'CONFIRM_APPROVE') {
            approvalStr = <Text bold color="yellow">┌ {approvalStr} ┐</Text>;
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
                (<Text color="cyan" bold>↑↓</Text>) Nav · (<Text color="cyan" bold>Enter</Text>) Review · (<Text color="cyan" bold>L</Text>)og · (<Text color="cyan" bold>A</Text>)pprove All · (<Text color="cyan" bold>C</Text>)ommit All · {pauseAction} · (<Text color="cyan" bold>Q</Text>)uit
            </Text>
        );
    };
    
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
                        <ConfirmationContent transactionsToConfirm={transactionsToConfirm} />
                        <Separator />
                    </>
                )}
                
                <Text bold underline> EVENT STREAM (Last 15 minutes)</Text>
                <Box flexDirection="column" marginTop={1}>
                    {transactions.slice(viewOffset, viewOffset + viewportHeight).map((tx, index) => {
                        const actualIndex = viewOffset + index;
                        return (
                            <EventStreamItem
                                key={tx.id}
                                transaction={tx}
                                isSelected={!isModal && actualIndex === selectedTransactionIndex}
                            />
                        );
                    })}
                </Box>

                <Box marginTop={1}><Separator /></Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default DashboardScreen;
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';
import { sleep } from '../utils';
import { useAppStore } from './app.store';
import { useDashboardStore } from './dashboard.store';
import { ReviewService } from '../services/review.service';
import { mockReviewFiles, mockReviewScripts, allMockTransactions } from '../data/mocks';
import { moveIndex } from './navigation.utils';
import type { ReviewFileItem } from '../types/file.types';
import type { ScriptResult, ApplyStep, ReviewBodyView, PatchStatus } from '../types/review.types'; 

export type { ReviewFileItem as FileItem, ReviewFileItem } from '../types/file.types';
export type { ScriptResult, ApplyStep } from '../types/review.types';

export const initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

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
    files: ReviewFileItem[];
    scripts: ScriptResult[];

    // UI State
    applySteps: ApplyStep[];
    selectedItemIndex: number; // Can be file or script
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;

    // Reasoning Scroll State
    reasoningScrollIndex: number;

    // Script Navigation State
    scriptErrorIndex: number;

    actions: {
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        toggleFileApproval: () => void;
        rejectAllFiles: () => void;
        expandDiff: () => void;
        toggleBodyView: (view: Extract<ReviewBodyView, 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'>) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        simulateSuccessScenario: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        simulateFailureScenario: () => void;

        // Repair Actions
        tryRepairFile: () => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;

        // Navigation Actions
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void,

        // "Private" actions for service layer
        _updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        _addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
    };
}

const initialFailureTx = allMockTransactions[0]!;

export const useReviewStore = create<ReviewState>((set, get) => ({
    // Transaction Info
    hash: initialFailureTx.hash,
    message: initialFailureTx.message,
    prompt: initialFailureTx.prompt!,
    reasoning: initialFailureTx.reasoning!,
    linesAdded: 18,
    linesRemoved: 5,
    duration: 0.6,
    patchStatus: 'PARTIAL_FAILURE',

    // File & Script Info
    files: mockReviewFiles,
    scripts: [], // Empty for partial failure scenario

    // UI State
    applySteps: initialApplySteps,
    selectedItemIndex: 0, // Start with first file
    bodyView: 'none' as const,
    isDiffExpanded: false,

    // Reasoning Scroll State
    reasoningScrollIndex: 0,

    // Script Navigation State
    scriptErrorIndex: 0,

    actions: {
        moveSelectionUp: () => set(state => ({
            selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', state.files.length + state.scripts.length),
        })),
        moveSelectionDown: () => set(state => ({
            selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', state.files.length + state.scripts.length),
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
        toggleBodyView: (view) => set(state => {
            if (view === 'diff' && state.selectedItemIndex >= state.files.length) return {}; // Can't show diff for scripts
            return {
                bodyView: state.bodyView === view ? 'none' : view,
                isDiffExpanded: false, // Always start collapsed
            };
        }),
        setBodyView: (view) => set({ bodyView: view }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => { /* NOP for now, would trigger commit and screen change */ },
        startApplySimulation: async (scenario: 'success' | 'failure') => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;

            set({ applySteps: JSON.parse(JSON.stringify(initialApplySteps)) });
            showReviewProcessingScreen();

            await ReviewService.runApplySimulation(scenario);

            showReviewScreen();
        },
        simulateSuccessScenario: () => {
            const tx = allMockTransactions[1]!;
            set(() => ({
            hash: tx.hash,
            message: tx.message,
            prompt: tx.prompt!,
            reasoning: tx.reasoning!,
            linesAdded: 22,
            linesRemoved: 11,
            duration: 3.9,
            patchStatus: 'SUCCESS' as const,
            files: [
                {
                    id: '1',
                    path: 'src/core/clipboard.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 15,
                    linesRemoved: 8,
                    diff: `--- a/src/core/clipboard.ts
+++ b/src/core/clipboard.ts
@@ -1,5 +1,6 @@
 import { copy as copyToClipboard } from 'clipboardy';`,
                    strategy: 'replace' as const,
                },
                {
                    id: '2',
                    path: 'src/utils/shell.ts',
                    status: 'APPROVED' as const,
                    linesAdded: 7,
                    linesRemoved: 3,
                    diff: `--- a/src/utils/shell.ts
+++ b/src/utils/shell.ts`,
                    strategy: 'standard-diff' as const,
                },
            ],
            scripts: mockReviewScripts,
            selectedItemIndex: 0,
            bodyView: 'none' as const,
        }));
    },
        simulateFailureScenario: () => {
            const tx = allMockTransactions[0]!;
            set(() => ({
            hash: tx.hash,
            message: tx.message,
            prompt: tx.prompt!,
            reasoning: tx.reasoning!,
            linesAdded: 18,
            linesRemoved: 5,
            duration: 0.6,
            patchStatus: 'PARTIAL_FAILURE' as const,
            files: mockReviewFiles,
            scripts: [],
            // Reset UI state
            bodyView: 'none',
            isDiffExpanded: false,
            reasoningScrollIndex: 0,
            scriptErrorIndex: 0,
            selectedItemIndex: 0,
        }));
    },

        // Repair Actions
        tryRepairFile: () => {
            const { selectedItemIndex, files } = get();
            if (selectedItemIndex < files.length) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    ReviewService.tryRepairFile(file, selectedItemIndex);
                }
            }
        },
        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option: number) => {
            const { files } = get();

            switch (option) {
                case 1: { // Generate & Copy Bulk Repair Prompt
                    const bulkPrompt = ReviewService.generateBulkRepairPrompt(files);
                    const failedFiles = files.filter(f => f.status === 'FAILED');
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied bulk repair prompt for ${failedFiles.length} files.`);
                    // In a real app, this would use clipboardy.writeSync(bulkPrompt),
                    set({ bodyView: 'none' as const });
                    break;
                }

                case 2: { // Attempt Bulk Re-apply
                    set({ bodyView: 'none' as const });
                    await ReviewService.runBulkReapply();
                    break;
                }

                case 3: { // Handoff to Human
                    get().actions.setBodyView('confirm_handoff');
                    break;
                }

                case 4: { // Reject All Failed
                    set(state => ({
                        files: state.files.map(file =>
                            file.status === 'FAILED'
                                ? { ...file, status: 'REJECTED' as const }
                                : file,
                        ),
                        bodyView: 'none' as const,
                    }));
                    break;
                }

                default: // Close modal
                    set({ bodyView: 'none' as const });
            }
        },
        confirmHandoff: () => {
            const { hash, message, reasoning, files } = get();
            const handoffPrompt = ReviewService.generateHandoffPrompt(hash, message, reasoning, files);

            // eslint-disable-next-line no-console
            console.log('[CLIPBOARD] Copied Handoff Prompt.'); // In real app: clipboardy.writeSync(handoffPrompt)
            ReviewService.performHandoff(hash);
        },

        // Navigation Actions
        scrollReasoningUp: () => set(state => ({
            reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1),
        })),
        scrollReasoningDown: () => set(state => {
            const maxLines = state.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({
            scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1),
        })),
        navigateScriptErrorDown: () => set(state => {
            const selectedScript = state.scripts[state.selectedItemIndex - state.files.length];
            if (selectedScript && selectedScript.output) {
                const errorLines = selectedScript.output.split('\n').filter(line =>
                    line.includes('Error') || line.includes('Warning'),
                );
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),

        // "Private" actions for service layer
        _updateApplyStep: (id, status, duration, details) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep = { ...s, status };
                        if (duration !== undefined) newStep.duration = duration;
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                }),
            }));
        },
        _addApplySubstep: (parentId, substep) => {
             set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
    },
}));
```
