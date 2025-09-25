# Directory Structure
```
src/
  components/
    ActionFooter.tsx
    CopyScreen.tsx
    DashboardScreen.tsx
    DebugLogScreen.tsx
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
  config/
    ui.config.ts
  constants/
    app.constants.ts
    copy.constants.ts
    detail.constants.ts
    init.constants.ts
    review.constants.ts
  data/
    mocks.ts
  hooks/
    useCopyScreen.tsx
    useDashboardScreen.tsx
    useDebugLogScreen.tsx
    useDebugMenu.tsx
    useGitCommitScreen.tsx
    useGlobalHotkeys.tsx
    useInitializationScreen.tsx
    useReviewScreen.tsx
    useSplashScreen.tsx
    useTransactionDetailScreen.tsx
    useTransactionHistoryScreen.tsx
    useViewport.ts
  services/
    commit.service.ts
    copy.service.ts
    dashboard.service.ts
    editor.service.ts
    fs.service.ts
    init.service.ts
    logger.service.ts
    review.service.ts
    transaction.service.ts
  stores/
    app.store.ts
    commit.store.ts
    copy.store.ts
    dashboard.store.ts
    detail.store.ts
    history.store.ts
    init.store.ts
    log.store.ts
    navigation.utils.ts
    review.store.ts
    transaction.store.ts
    view.store.ts
  types/
    actions.types.ts
    copy.types.ts
    debug.types.ts
    domain.types.ts
    log.types.ts
    view.types.ts
  App.tsx
  utils.ts
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/hooks/useCopyScreen.tsx
```typescript
import { useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';

// Header, separator, title, margin, separator, status, footer
const RESERVED_ROWS = 8;

export const useCopyScreen = () => {
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const {
        title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: RESERVED_ROWS,
    });

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
        if (key.pageUp) {
            actions.navigatePageUp(viewportHeight);
            return;
        }
        if (key.pageDown) {
            actions.navigatePageDown(viewportHeight);
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
    }, { isActive: activeOverlay === 'copy' });

    const itemsInView = items.slice(viewOffset, viewOffset + viewportHeight);

    return {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    };
};
```

## File: src/components/ActionFooter.tsx
```typescript
import { Box, Text } from 'ink';
import { useStdoutDimensions } from '../utils';
import { UI_CONFIG } from '../config/ui.config';
import type { ActionItem } from '../types/actions.types';

interface ActionFooterProps {
    actions: ActionItem[];
}

const Action = ({ item }: { item: ActionItem }) => (
    <Text>
        (<Text color="cyan" bold>{item.key}</Text>) {item.label}
    </Text>
);

const ActionFooter = ({ actions }: ActionFooterProps) => {
    const [width] = useStdoutDimensions();
    const { horizontalPadding, actionSeparator } = UI_CONFIG.footer;
    const separatorWidth = actionSeparator.length;

    // Calculate required width for a single line
    const formattedActions = actions.map(a => `(${a.key}) ${a.label}`);
    const singleLineWidth = formattedActions.join(actionSeparator).length;

    // 1. Render horizontally if it fits
    if (singleLineWidth <= width - horizontalPadding * 2) {
        return (
            <Box>
                {actions.map((item, index) => (
                    <Text key={item.key}>
                        <Action item={item} />
                        {index < actions.length - 1 && <Text>{actionSeparator}</Text>}
                    </Text>
                ))}
            </Box>
        );
    }

    // 2. If it doesn't fit, calculate multi-column layout
    const itemWidths = formattedActions.map(a => a.length);
    const maxItemWidth = Math.max(...itemWidths);
    
    // Determine how many columns can fit, ensuring at least one
    const availableWidth = width - horizontalPadding * 2;
    // Calculate columns based on the widest item, ensuring we don't try to make more columns than items
    const numColumns = Math.min(
        actions.length,
        Math.max(1, Math.floor(availableWidth / (maxItemWidth + separatorWidth))),
    );
    
    const itemsPerColumn = Math.ceil(actions.length / numColumns);
    const columns: ActionItem[][] = Array.from({ length: numColumns }, () => []);

    actions.forEach((action, index) => {
        const columnIndex = Math.floor(index / itemsPerColumn);
        if (columns[columnIndex]) {
            columns[columnIndex].push(action);
        }
    });

    return (
        <Box flexDirection="row" width="100%">
            {columns.map((column, colIndex) => (
                <Box
                    key={colIndex}
                    flexDirection="column"
                    // Use a flex-basis approach for more even distribution if needed,
                    // but fixed width is better for alignment.
                    width={maxItemWidth + separatorWidth}
                >
                    {column.map(item => (
                        <Action key={item.key} item={item} />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default ActionFooter;
```

## File: src/constants/detail.constants.ts
```typescript
/**
 * Constants for the Transaction Detail screen.
 */
export const NAVIGATOR_SECTIONS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES: 'FILES',
} as const;

export const DETAIL_BODY_VIEWS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES_LIST: 'FILES_LIST',
    DIFF_VIEW: 'DIFF_VIEW',
    REVERT_CONFIRM: 'REVERT_CONFIRM',
    NONE: 'NONE',
} as const;
```

## File: src/constants/init.constants.ts
```typescript
import type { Task } from '../stores/init.store';

/**
 * Constants for the Initialization process.
 */
export const INITIAL_ANALYZE_TASKS: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

export const INITIAL_CONFIGURE_TASKS: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];
```

## File: src/constants/review.constants.ts
```typescript
import type { ApplyStep } from '../stores/review.store';

/**
 * Constants for the Review screen and process.
 */
export const INITIAL_APPLY_STEPS: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];
```

## File: src/services/fs.service.ts
```typescript
import { sleep } from '../utils';

/**
 * Mock file system service.
 * In a real application, this would interact with the actual filesystem.
 */
const readFileContent = async (filePath: string): Promise<string> => {
    // Simulate async file read
    await sleep(50 + Math.random() * 100);

    const lang = filePath.split('.').pop() || '';
    
    return `// Mock content for ${filePath}
// Language: ${lang}
// In a real implementation, this would read from the filesystem.

function helloWorld() {
    console.log("Hello from ${filePath}!");
}
`;
};

export const FileSystemService = {
    readFileContent,
};
```

## File: src/stores/log.store.ts
```typescript
import { create } from 'zustand';
import type { LogEntry, LogLevel } from '../types/log.types';

const MAX_LOGS = 200;

interface LogState {
    logs: LogEntry[];
    actions: {
        addLog: (level: LogLevel, message: string) => void;
        clearLogs: () => void;
    };
}

export const useLogStore = create<LogState>((set) => ({
    logs: [],
    actions: {
        addLog: (level, message) => {
            set(state => {
                const newLog: LogEntry = {
                    level,
                    message,
                    timestamp: Date.now(),
                };
                // Prepend new log and trim the array to max size
                const updatedLogs = [newLog, ...state.logs].slice(0, MAX_LOGS);
                return { logs: updatedLogs };
            });
        },
        clearLogs: () => set({ logs: [] }),
    },
}));
```

## File: src/types/actions.types.ts
```typescript
/**
 * Represents a single action item for display in a responsive footer.
 */
export interface ActionItem {
    key: string;
    label: string;
}
```

## File: src/types/debug.types.ts
```typescript
export interface MenuItem {
    title: string;
    action: () => void;
}
```

## File: src/types/log.types.ts
```typescript
/**
 * Log level for a log entry.
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Represents a single log entry in the system.
 */
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
}
```

## File: src/components/DebugLogScreen.tsx
```typescript
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Separator from './Separator';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import type { LogEntry } from '../types/log.types';
import { useStdoutDimensions } from '../utils';

const LogLevelColors = {
    DEBUG: 'gray',
    INFO: 'white',
    WARN: 'yellow',
    ERROR: 'red',
};

const LogLevelTag = {
    DEBUG: { color: 'white', backgroundColor: 'gray' },
    INFO: { color: 'black', backgroundColor: 'cyan' },
    WARN: { color: 'black', backgroundColor: 'yellow' },
    ERROR: { color: 'white', backgroundColor: 'red' },
};

const LogEntryRow = ({ entry, isSelected }: { entry: LogEntry; isSelected: boolean }) => {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.replace('Z', '');
    const color = LogLevelColors[entry.level];
    const tagColors = LogLevelTag[entry.level];

    return (
        <Text color={color}>
            {isSelected ? '> ' : '  '}
            <Text color="gray">{time}</Text>
            {' '}
            <Text bold color={tagColors.color} backgroundColor={tagColors.backgroundColor}>
                {' '}{entry.level.padEnd(5, ' ')}{' '}
            </Text>
            {' '}
            {entry.message}
        </Text>
    );
};

const DebugLogScreen = () => {
    const {
        logsInView,
        logCount,
        filteredLogCount,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
        viewOffset,
    } = useDebugLogScreen();
    const [width] = useStdoutDimensions();

    const renderFilter = () => (
        <Box>
            <Text>Filter: </Text>
            {mode === 'FILTER' ? (
                <TextInput
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder="Type to filter log messages..."
                />
            ) : (
                <Text color="gray">{filterQuery || '(none)'}</Text>
            )}
            <Box flexGrow={1} /> 
            <Text>
                Showing {Math.min(viewOffset + 1, filteredLogCount)}-
                {Math.min(viewOffset + logsInView.length, filteredLogCount)} of {filteredLogCount}
            </Text> 
        </Box>
    );

    const footerActions =
        mode === 'FILTER'
            ? [{ key: 'Enter/Esc', label: 'Apply & Close Filter' }]
            : [
                  { key: '↑↓/PgUp/PgDn', label: 'Scroll' },
                  { key: 'F', label: 'Filter' },
                  { key: 'C', label: 'Clear' },
                  { key: 'Esc/Ctrl+L', label: 'Close' },
              ];

    return (
        <Box
            flexDirection="column"
            width="100%"
            height="100%"
            paddingX={2}
            paddingY={1}
        >
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · DEBUG LOG </Text>
            <Separator width={width - 4} />
            <Box marginY={1}>{renderFilter()}</Box>
            <Box flexDirection="column" flexGrow={1}>
                {logsInView.map((entry, index) => (
                    <LogEntryRow
                        key={`${entry.timestamp}-${index}`}
                        entry={entry}
                        isSelected={selectedIndex === index + viewOffset}
                    />
                ))}
                {logCount > 0 && filteredLogCount === 0 && (
                    <Text color="gray">No logs match your filter.</Text>
                )}
                {logCount === 0 && (
                    <Text color="gray">No log entries yet. Waiting for system activity...</Text>
                )}
            </Box>
            <Separator width={width - 4} />
            <ActionFooter actions={footerActions} />
        </Box>
    );
};

export default DebugLogScreen;
```

## File: src/config/ui.config.ts
```typescript
/**
 * Centralized UI configuration.
 * This object is the single source of truth for layout constants, thresholds,
 * and other UI-related magic numbers.
 */
export const UI_CONFIG = {
    diffScreen: {
        collapseThreshold: 20, // Lines before collapsing
        collapseShowLines: 8,  // Lines to show at top/bottom when collapsed
    },
    dashboard: {
        reservedRows: 9, // Non-event stream vertical space (header, footer, etc.)
    },
    history: {
        reservedRows: 8, // Non-content vertical space (header, footer, filter)
    },
    splash: {
        initialCountdown: 3, // Seconds before auto-skip
    },
    footer: {
        horizontalPadding: 2, // Minimum space from the left/right edges of the screen
        actionSeparator: ' · ',
    },
} as const;
```

## File: src/constants/app.constants.ts
```typescript
/**
 * Application-level screens and navigation constants.
 */
export const APP_SCREENS = {
    SPLASH: 'splash',
    INIT: 'init',
    DASHBOARD: 'dashboard',
    REVIEW: 'review',
    REVIEW_PROCESSING: 'review-processing',
    GIT_COMMIT: 'git-commit',
    TRANSACTION_DETAIL: 'transaction-detail',
    TRANSACTION_HISTORY: 'transaction-history',
} as const;

export const MAIN_SCREENS_FOR_QUIT = [
    APP_SCREENS.DASHBOARD,
    APP_SCREENS.INIT,
    APP_SCREENS.TRANSACTION_HISTORY,
];

export const SCREENS_WITH_DASHBOARD_BACK_ACTION = [
    APP_SCREENS.REVIEW,
    APP_SCREENS.GIT_COMMIT,
    APP_SCREENS.TRANSACTION_DETAIL,
];
```

## File: src/constants/copy.constants.ts
```typescript
/**
 * Constants for the Copy/Clipboard feature.
 */
export const COPYABLE_ITEMS = {
    UUID: 'UUID',
    MESSAGE: 'Git Message',
    PROMPT: 'Prompt',
    REASONING: 'Reasoning',
    FILE_DIFF: 'Diff for',
    ALL_DIFFS: 'All Diffs',
    CONTEXT_FILES: 'Context Files (latest)',
    FULL_YAML: 'Full YAML representation',
    // For multi-selection contexts
    MESSAGES: 'Git Messages',
    PROMPTS: 'Prompts',
    REASONINGS: 'Reasonings',
    DIFFS: 'Diffs',
    UUIDS: 'UUIDs',
} as const;
```

## File: src/hooks/useDebugLogScreen.tsx
```typescript
import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useLogStore } from '../stores/log.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { LoggerService } from '../services/logger.service';
import { moveIndex } from '../stores/navigation.utils';

export const useDebugLogScreen = () => {
    const logs = useLogStore(s => s.logs);
    const clearLogs = useLogStore(s => s.actions.clearLogs);
    const setActiveOverlay = useViewStore(s => s.actions.setActiveOverlay);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<'LIST' | 'FILTER'>('LIST');
    const [filterQuery, setFilterQuery] = useState('');

    const filteredLogs = useMemo(() => logs.filter(log =>
        log.message.toLowerCase().includes(filterQuery.toLowerCase()),
    ), [logs, filterQuery]);

    // Reset index if it's out of bounds after filtering
    useEffect(() => {
        if (selectedIndex >= filteredLogs.length) {
            setSelectedIndex(Math.max(0, filteredLogs.length - 1));
        }
    }, [filteredLogs.length, selectedIndex]);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: 8, // Header, borders, footer, filter line
    });

    useInput((input, key) => {
        if (mode === 'FILTER') {
            if (key.escape || key.return) {
                setMode('LIST');
            }
            return;
        }

        if (key.escape) {
            setActiveOverlay('none');
            return;
        }
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', filteredLogs.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', filteredLogs.length));
            return;
        }
        if (key.pageUp) {
            setSelectedIndex(i => Math.max(0, i - viewportHeight));
            return;
        }
        if (key.pageDown) {
            setSelectedIndex(i => Math.min(filteredLogs.length - 1, i + viewportHeight));
            return;
        }
        if (input.toLowerCase() === 'c') {
            clearLogs();
            setFilterQuery('');
            setSelectedIndex(0);
            return;
        }
        if (input.toLowerCase() === 'f') {
            setMode('FILTER');
        }
    });

    useEffect(() => {
        LoggerService.startSimulator();
        return () => {
            LoggerService.stopSimulator();
        };
    }, []);

    const logsInView = filteredLogs.slice(viewOffset, viewOffset + viewportHeight);

    return {
        logsInView,
        logCount: logs.length,
        filteredLogCount: filteredLogs.length,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
        viewOffset,
    };
};
```

## File: src/hooks/useViewport.ts
```typescript
import { useState, useEffect } from 'react';
import { useStdoutDimensions } from '../utils';

interface UseViewportOptions {
	selectedIndex: number;
	reservedRows: number; // Vertical padding (headers, footers, etc.)
}

export const useViewport = ({ selectedIndex, reservedRows }: UseViewportOptions) => {
	const [columns, rows] = useStdoutDimensions();
	const [viewOffset, setViewOffset] = useState(0);

	const viewportHeight = Math.max(1, rows - reservedRows);

	useEffect(() => {
		if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);

    return {
        viewOffset,
        viewportHeight,
        width: columns,
    };
};
```

## File: src/services/editor.service.ts
```typescript
import { LoggerService } from './logger.service';

/**
 * Mock editor service.
 * In a real application, this would interact with the user's default editor.
 */
const openFileInEditor = async (filePath: string): Promise<void> => {
    LoggerService.debug(`[EDITOR MOCK] Opening file in default editor: ${filePath}`);
};

const getTransactionYamlPath = (transactionHash: string): string => {
    return `.relay/transactions/${transactionHash}.yml`;
};

export const EditorService = {
    openFileInEditor,
    getTransactionYamlPath,
};
```

## File: src/services/logger.service.ts
```typescript
import { useLogStore } from '../stores/log.store';

let simulatorInterval: ReturnType<typeof setInterval> | null = null;

const mockClipboardContents = [
    'feat(dashboard): implement new UI components',
    'const clipboardy = require(\'clipboardy\');',
    'diff --git a/src/App.tsx b/src/App.tsx\nindex 12345..67890 100644\n--- a/src/App.tsx\n+++ b/src/App.tsx\n@@ -1,5 +1,6 @@\n import React from \'react\';',
    'All changes have been applied successfully. You can now commit them.',
    '{\n  "id": "123",\n  "status": "PENDING"\n}',
    'Can you refactor this to use a switch statement?',
];
let currentClipboardIndex = 0;

const startSimulator = () => {
    if (simulatorInterval) return;

    // Initial burst of logs to populate the view
    LoggerService.info('Log simulator started.');
    LoggerService.debug('Initializing clipboard watcher...');
    setTimeout(() => LoggerService.debug('Clipboard watcher active.'), 250);

    simulatorInterval = setInterval(() => {
        const random = Math.random();
        if (random < 0.6) {
            LoggerService.debug('Clipboard watcher polling...');
        } else if (random < 0.8) {
            LoggerService.debug('No clipboard change detected.');
        } else {
            const newContent = mockClipboardContents[currentClipboardIndex]!;
            currentClipboardIndex = (currentClipboardIndex + 1) % mockClipboardContents.length;
            const excerpt = newContent.replace(/\n/g, ' ').substring(0, 50).trim();
            LoggerService.info(`Clipboard content changed. Excerpt: "${excerpt}..."`);
        }
    }, 2000);
};

const stopSimulator = () => {
    if (simulatorInterval) {
        clearInterval(simulatorInterval);
        simulatorInterval = null;
        LoggerService.info('Log simulator stopped.');
    }
};

const debug = (message: string) => useLogStore.getState().actions.addLog('DEBUG', message);
const info = (message: string) => useLogStore.getState().actions.addLog('INFO', message);
const warn = (message: string) => useLogStore.getState().actions.addLog('WARN', message);
const error = (message: string) => useLogStore.getState().actions.addLog('ERROR', message);


export const LoggerService = {
    debug,
    info,
    warn,
    error,
    startSimulator,
    stopSimulator,
};
```

## File: src/stores/view.store.ts
```typescript
import { create } from 'zustand';

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: 'none' | 'help' | 'copy' | 'debug' | 'log';
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: 'none',
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));
```

## File: src/types/domain.types.ts
```typescript
// --- Core Domain Models ---

/** The type of change applied to a file. */
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';

/** The review status of a file within a transaction. */
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';

/** The result of a script execution. */
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

/** The unified representation of a file change within a transaction. */
export interface FileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    type: FileChangeType;
    strategy?: 'replace' | 'standard-diff';
}

/** The lifecycle status of a transaction. */
export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

/** The central data model for a code modification transaction. */
export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    files?: FileItem[];
    scripts?: ScriptResult[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
```

## File: src/utils.ts
```typescript
import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Dimensions = { columns: number; rows: number };
const subscribers = new Set<(dims: Dimensions) => void>();
let currentDimensions: Dimensions = {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
};

let listenerAttached = false;

const updateAndNotify = () => {
    const newDimensions = {
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
    };

    if (newDimensions.columns !== currentDimensions.columns || newDimensions.rows !== currentDimensions.rows) {
        currentDimensions = newDimensions;
        subscribers.forEach(subscriber => subscriber(currentDimensions));
    }
};

if (!listenerAttached) {
    process.stdout.on('resize', updateAndNotify);
    listenerAttached = true;
}

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState(currentDimensions);

    useEffect(() => {
        const subscriber = (newDims: Dimensions) => setDimensions(newDims);
        subscribers.add(subscriber);

        // On mount, check if dimensions are stale and update if needed for this hook instance.
        setDimensions(dims => {
            const latestDims = {
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            };
            if (latestDims.columns !== dims.columns || latestDims.rows !== dims.rows) {
                return latestDims;
            }
            return dims;
        });

        return () => {
            subscribers.delete(subscriber);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};
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
      'no-unused-vars': 'off', // Must be disabled to use the @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
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

    // Some stricter flags
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

## File: src/components/DiffScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { UI_CONFIG } from '../config/ui.config';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
    scrollIndex?: number;
    maxHeight?: number;
}
const DiffScreen = ({ filePath, diffContent, isExpanded, scrollIndex = 0, maxHeight }: DiffScreenProps) => {
    const lines = diffContent.split('\n');
    const COLLAPSE_THRESHOLD = UI_CONFIG.diffScreen.collapseThreshold;
    const COLLAPSE_SHOW_LINES = UI_CONFIG.diffScreen.collapseShowLines;

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
        // Handle vertical scrolling for expanded view
        if (isExpanded && maxHeight) {
            const visibleLines = lines.slice(scrollIndex, scrollIndex + maxHeight);
            return visibleLines.map((line, i) => renderLine(line, scrollIndex + i));
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

## File: src/stores/history.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { getVisibleItemPaths, findNextPath, findPrevPath, getParentPath } from './navigation.utils';
import { sleep } from '../utils';

export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';
 
// Omit 'actions' from state type for partial updates
type HistoryStateData = Omit<HistoryState, 'actions'>;

interface HistoryState {
    mode: HistoryViewMode;
    selectedItemPath: string;
    expandedIds: Set<string>;
    loadingPaths: Set<string>;
    filterQuery: string;
    selectedForAction: Set<string>;
    actions: {
        load: (initialState?: Partial<HistoryStateData>) => void;
        navigateDown: () => void;
        navigateUp: () => void;
        navigatePageUp: (viewportHeight: number) => void;
        navigatePageDown: (viewportHeight: number) => void;
        expandOrDrillDown: () => Promise<void>;
        collapseOrBubbleUp: () => void;
        toggleSelection: () => void;
        setMode: (mode: HistoryViewMode) => void;
        setFilterQuery: (query: string) => void;
        applyFilter: () => void;
        prepareDebugState: (stateName: 'l1-drill-content' | 'l2-drill-reasoning' | 'l2-drill-diff' | 'filter' | 'copy' | 'bulk') => void;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    mode: 'LIST',
    selectedItemPath: '',
    expandedIds: new Set(),
    loadingPaths: new Set(),
    filterQuery: '',
    selectedForAction: new Set(),
    actions: {
        load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                selectedItemPath: transactions[0]?.id || '',
                mode: 'LIST',
                expandedIds: new Set(),
                loadingPaths: new Set(),
                selectedForAction: new Set(),
                filterQuery: '',
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findPrevPath(selectedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);
            set({ selectedItemPath: findNextPath(selectedItemPath, visibleItems) });
        },
        navigatePageUp: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.max(0, currentIndex - viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        navigatePageDown: (viewportHeight: number) => {
            const { expandedIds, selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = getVisibleItemPaths(transactions, expandedIds);

            const currentIndex = visibleItems.indexOf(selectedItemPath);
            if (currentIndex === -1) return;

            const newIndex = Math.min(visibleItems.length - 1, currentIndex + viewportHeight);
            set({ selectedItemPath: visibleItems[newIndex]! });
        },
        expandOrDrillDown: async () => {
            const { selectedItemPath, expandedIds } = get();
            if (expandedIds.has(selectedItemPath)) return;

            // Files and content items with potentially large data can show a loading state
            const isLoadable = selectedItemPath.includes('/file/') ||
                               selectedItemPath.includes('/prompt') ||
                               selectedItemPath.includes('/reasoning');

            if (isLoadable) {
                set(state => ({ loadingPaths: new Set(state.loadingPaths).add(selectedItemPath) }));
                await sleep(250); // Simulate loading
                set(state => {
                    const newLoadingPaths = new Set(state.loadingPaths);
                    newLoadingPaths.delete(selectedItemPath);
                    const newExpandedIds = new Set(state.expandedIds).add(selectedItemPath);
                    return { loadingPaths: newLoadingPaths, expandedIds: newExpandedIds };
                });
            } else { // For transactions or simple items, expand immediately
                set(state => ({ expandedIds: new Set(state.expandedIds).add(selectedItemPath) }));
            }
        },
        collapseOrBubbleUp: () => set(state => {
            const { selectedItemPath, expandedIds } = state;
            const newExpandedIds = new Set(expandedIds);
            if (newExpandedIds.has(selectedItemPath)) {
                newExpandedIds.delete(selectedItemPath);
                // Recursively collapse children
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { expandedIds: newExpandedIds };
            }
            const parentId = getParentPath(selectedItemPath);
            if (parentId) {
                return { selectedItemPath: parentId };
            }
            return {};
        }),
        toggleSelection: () => set(state => {
            const { selectedItemPath, selectedForAction } = state;
            const txId = getParentPath(selectedItemPath) || selectedItemPath;
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
            set({ mode: 'LIST' });
        },
        prepareDebugState: (stateName) => {
            const { actions } = get();
            switch (stateName) {
                case 'l1-drill-content':
                    actions.load({ expandedIds: new Set(['3']), selectedItemPath: '3' });
                    break;
                case 'l2-drill-reasoning':
                    actions.load({ expandedIds: new Set(['3', '3/reasoning']), selectedItemPath: '3/reasoning' });
                    break;
                case 'l2-drill-diff':
                    actions.load({ expandedIds: new Set(['3', '3/file/3-1']), selectedItemPath: '3/file/3-1' });
                    break;
                case 'filter':
                    actions.load({ mode: 'FILTER', filterQuery: 'logger.ts status:COMMITTED' });
                    break;
                case 'copy':
                    actions.load({ selectedForAction: new Set(['3', '6']) });
                    break;
                case 'bulk':
                    actions.load({ mode: 'BULK_ACTIONS', selectedForAction: new Set(['3', '6']) });
                    break;
            }
        },
    },
}));
```

## File: src/types/view.types.ts
```typescript
import type { APP_SCREENS } from '../constants/app.constants';

// --- UI / View-Specific Types ---

// app.store
type ObjectValues<T> = T[keyof T];

export type AppScreen = ObjectValues<typeof APP_SCREENS>;
```

## File: src/components/GlobalHelpScreen.tsx
```typescript
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
                        <Text>  <Text color="cyan" bold>Q</Text>        Quit to terminal (or go back)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">DASHBOARD (watch)</Text>
                        <Text>  <Text color="cyan" bold>↑↓</Text>       Navigate event stream</Text>
                        <Text>  <Text color="cyan" bold>Enter</Text>    View details of selected transaction</Text>
                        <Text>  <Text color="cyan" bold>P</Text>        Pause / Resume clipboard watcher</Text>
                        <Text>  <Text color="cyan" bold>A</Text>        Approve all pending transactions</Text>
                        <Text>  <Text color="cyan" bold>C</Text>        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">REVIEW & DETAILS SCREENS</Text>
                        <Text>  <Text color="cyan" bold>D</Text>        Show / Collapse file diff</Text>
                        <Text>  <Text color="cyan" bold>←→</Text>       Collapse / Expand sections or files</Text>
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

## File: src/components/ReasonScreen.tsx
```typescript
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

## File: src/services/dashboard.service.ts
```typescript
import { sleep } from '../utils';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { LoggerService } from './logger.service';

const approveAll = async () => {
    LoggerService.info('Starting bulk approval process...');
    const pendingTransactions = selectTransactionsByStatus('PENDING')(useTransactionStore.getState());
    const pendingTxIds = pendingTransactions.map(tx => tx.id);
    LoggerService.debug(`Found ${pendingTxIds.length} pending transactions to approve.`);
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    pendingTxIds.forEach(id => {
        updateTransactionStatus(id, 'IN-PROGRESS');
        LoggerService.debug(`Transaction ${id} status set to IN-PROGRESS.`);
    });

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
    LoggerService.info(`Bulk approval complete. ${pendingTxIds.length} transactions applied.`);
};

export const DashboardService = {
    approveAll,
};
```

## File: src/stores/navigation.utils.ts
```typescript
import type { Transaction } from '../types/domain.types';

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

export const findNextPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex < visiblePaths.length - 1) {
        return visiblePaths[currentIndex + 1]!;
    }
    return currentPath;
};

export const findPrevPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex > 0) {
        return visiblePaths[currentIndex - 1]!;
    }
    return currentPath;
};

export const getParentPath = (path: string): string | null => path.includes('/') ? path.split('/')[0]! : null;

export const getVisibleItemPaths = (
    transactions: Transaction[],
    expandedIds: Set<string>,
): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id)) {
            paths.push(`${tx.id}/message`);
            paths.push(`${tx.id}/prompt`);
            paths.push(`${tx.id}/reasoning`);
            if (tx.files) {
                for (const file of tx.files) {
                    paths.push(`${tx.id}/file/${file.id}`);
                }
            }
        }
    }
    return paths;
};
```

## File: src/components/CopyScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';
import { useCopyScreen } from '../hooks/useCopyScreen';

const CopyScreen = () => {
    const {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    } = useCopyScreen();
    const [width] = useStdoutDimensions();

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
                <Separator width={Math.floor(width * 0.8) - 4} />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {itemsInView.map((item, index) => {
                            const isSelected = (index + viewOffset) === selectedIndex;
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
                <Separator width={Math.floor(width * 0.8) - 4} />
                {lastCopiedMessage && <Text color="green">✓ {lastCopiedMessage}</Text>}
                <ActionFooter actions={[
                    { key: '↑↓/PgUp/PgDn', label: 'Nav' },
                    { key: 'Spc/Hotkey', label: 'Toggle' },
                    { key: 'Enter', label: 'Copy' },
                    { key: 'Esc', label: 'Close' },
                ]}/>
            </Box>
        </Box>
    );
};

export default CopyScreen;
```

## File: src/data/mocks.ts
```typescript
import type { Transaction } from '../types/domain.types';

const mockReasoning1 = `1. Identified a potential uncaught exception in the \`restoreSnapshot\` function
   if a file operation fails midway through a loop of many files. This could
   leave the project in a partially-reverted, inconsistent state.

2. Wrapped the file restoration loop in a \`Promise.all\` and added a dedicated
   error collection array. This ensures that all file operations are
   attempted and that a comprehensive list of failures is available
   afterward for better error reporting or partial rollback logic.
`;

export const allMockTransactions: Transaction[] = [
    {
        id: '1',
        timestamp: Date.now() - 10 * 1000,
        status: 'PENDING',
        hash: 'e4a7c112',
        message: 'fix: add missing error handling',
        prompt: 'Rename the `calculateChanges` utility to `computeDelta` across all files and update imports accordingly.',
        reasoning: mockReasoning1,
        files: [
            { id: '1-1', type: 'MOD', path: 'src/core/transaction.ts', linesAdded: 18, linesRemoved: 5, diff: '--- a/src/core/transaction.ts\n+++ b/src/core/transaction.ts\n@@ -15,7 +15,7 @@ export class Transaction {\n   }\n\n-  calculateChanges(): ChangeSet {\n+  computeDelta(): ChangeSet {\n     return this.changes;\n   }\n }', strategy: 'replace' },
            { id: '1-2', type: 'MOD', path: 'src/utils/logger.ts', linesAdded: 0, linesRemoved: 0, diff: '', strategy: 'standard-diff' },
            { id: '1-3', type: 'MOD', path: 'src/commands/apply.ts', linesAdded: 0, linesRemoved: 0, diff: '', strategy: 'standard-diff' },
        ],
        stats: { files: 3, linesAdded: 18, linesRemoved: 5 },
    },
    {
        id: '2',
        timestamp: Date.now() - 15 * 1000,
        status: 'PENDING',
        hash: '4b9d8f03',
        message: 'refactor: simplify clipboard logic',
        prompt: 'Simplify the clipboard logic using an external library...',
        reasoning: 'The existing clipboard logic was complex and platform-dependent. Using the `clipboardy` library simplifies the code and improves reliability across different operating systems.',
        files: [
            { id: '2-1', type: 'MOD', path: 'src/core/clipboard.ts', linesAdded: 15, linesRemoved: 8, diff: '--- a/src/core/clipboard.ts\n+++ b/src/core/clipboard.ts\n@@ -1,5 +1,6 @@\n import { copy as copyToClipboard } from \'clipboardy\';', strategy: 'replace' },
            { id: '2-2', type: 'MOD', path: 'src/utils/shell.ts', linesAdded: 7, linesRemoved: 3, diff: '--- a/src/utils/shell.ts\n+++ b/src/utils/shell.ts', strategy: 'standard-diff' },
        ],
        stats: { files: 2, linesAdded: 22, linesRemoved: 11 },
        scripts: [
            { command: 'bun run test', success: true, duration: 2.3, summary: 'Passed (37 tests)', output: '... test output ...' },
            { command: 'bun run lint', success: false, duration: 1.2, summary: '1 Error, 3 Warnings', output: 'src/core/clipboard.ts\n  45:12  Error    \'clipboardy\' is assigned a value but never used. (@typescript-eslint/no-unused-vars)\n  88:5   Warning  Unexpected console statement. (no-console)' },
        ],
    },
    {
        id: '3',
        timestamp: Date.now() - 5 * 60 * 1000,
        status: 'APPLIED',
        hash: '8a3f21b8',
        message: 'feat: implement new dashboard UI',
        prompt: 'The user requested to add more robust error handling to the `restoreSnapshot` function. Specifically, it should not halt on the first error but instead attempt all file restorations and then report a summary of any failures.',
        reasoning: mockReasoning1,
        files: [
            { id: '3-1', type: 'MOD', path: 'src/core/transaction.ts', linesAdded: 18, linesRemoved: 5, diff: '... diff ...' },
            { id: '3-2', type: 'MOD', path: 'src/utils/logger.ts', linesAdded: 7, linesRemoved: 3, diff: '... diff ...' },
            { id: '3-3', type: 'DEL', path: 'src/utils/old-helper.ts', linesAdded: 0, linesRemoved: 30, diff: '... diff ...' },
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
```

## File: src/hooks/useGitCommitScreen.tsx
```typescript
import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';

export const useGitCommitScreen = () => {
    const { finalCommitMessage, isCommitting } = useCommitStore();
    const transactionsToCommit = useTransactionStore(selectTransactionsByStatus('APPLIED'));
    const { commit } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    useInput((_, key) => {
        if (isCommitting) return;

        if (key.return) {
            commit().then(() => {
                showDashboardScreen();
            });
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting };
};
```

## File: src/services/commit.service.ts
```typescript
import type { Transaction } from '../types/domain.types';
import { sleep } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';
import { LoggerService } from './logger.service';

const generateCommitMessage = (transactions: Transaction[]): string => {
    LoggerService.info(`Generating commit message for ${transactions.length} transactions.`);
    if (transactions.length === 0) {
        LoggerService.warn('generateCommitMessage called with 0 transactions.');
        return '';
    }
    // Using a more complex aggregation for better demo, based on the readme
    const title = 'feat: implement new dashboard and clipboard logic';
    const bodyPoints = [
        '- Adds error handling to the core transaction module to prevent uncaught exceptions during snapshot restoration.',
        '- Refactors the clipboard watcher for better performance and cross-platform compatibility, resolving issue #42.',
    ];

    if (transactions.length === 1 && transactions[0]) {
        LoggerService.debug('Using single transaction message for commit.');
        return transactions[0].message;
    }

    LoggerService.debug('Using aggregated message for commit.');
    return `${title}\n\n${bodyPoints.join('\n\n')}`;
};

const commit = async (transactionsToCommit: Transaction[]): Promise<void> => {
    LoggerService.info(`Committing ${transactionsToCommit.length} transactions to git...`);
    // In a real app, this would run git commands.
    // For simulation, we'll just update the transaction store.
    const { updateTransactionStatus } = useTransactionStore.getState().actions;

    const txIds = transactionsToCommit.map(tx => tx.id);

    // A bit of simulation
    await sleep(500);

    txIds.forEach(id => {
        updateTransactionStatus(id, 'COMMITTED');
    });
    LoggerService.info('Commit successful.');
};

export const CommitService = {
    generateCommitMessage,
    commit,
};
```

## File: src/stores/copy.store.ts
```typescript
import { create } from 'zustand';
import { moveIndex } from './navigation.utils';
import { useViewStore } from './view.store';
import { LoggerService } from '../services/logger.service';
import { CopyService } from '../services/copy.service';
import type { CopyItem } from '../types/copy.types';
import type { Transaction, FileItem } from '../types/domain.types';

export type { CopyItem };

interface CopyState {
    title: string;
    items: CopyItem[];
    selectedIndex: number;
    selectedIds: Set<string>;
    lastCopiedMessage: string | null;
    onClose?: () => void;

    actions: {
        open: (title: string, items: CopyItem[], onClose?: () => void) => void;
        close: () => void;
        openForReview: (transaction: Transaction, files: FileItem[], selectedFile?: FileItem) => void;
        openForDetail: (transaction: Transaction, selectedFile?: FileItem) => void;
        openForHistory: (transactions: Transaction[]) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        navigatePageUp: (viewportHeight: number) => void;
        navigatePageDown: (viewportHeight: number) => void;
        toggleSelection: () => void;
        toggleSelectionById: (id: string) => void;
        executeCopy: () => void;
    };
}

export const useCopyStore = create<CopyState>((set, get) => ({
    title: '',
    items: [],
    selectedIndex: 0,
    selectedIds: new Set(),
    lastCopiedMessage: null,
    onClose: undefined,

    actions: {
        open: (title, items, onClose) => {
            const defaultSelectedIds = new Set(items.filter(i => i.isDefaultSelected).map(i => i.id));
            useViewStore.getState().actions.setActiveOverlay('copy');
            set({
                title,
                items,
                selectedIndex: 0,
                selectedIds: defaultSelectedIds,
                lastCopiedMessage: null,
                onClose,
            });
        },
        close: () => {
            useViewStore.getState().actions.setActiveOverlay('none');
            get().onClose?.();
            set({ items: [], onClose: undefined });
        },
        openForReview: (transaction, files, selectedFile) => {
            const { actions } = get();
            const title = 'Select data to copy from review:';
            const items = CopyService.getCopyItemsForReview(transaction, files, selectedFile);
            actions.open(title, items);
        },
        openForDetail: (transaction, selectedFile) => {
            const { actions } = get();
            const title = `Select data to copy from transaction ${transaction.hash}:`;
            const items = CopyService.getCopyItemsForDetail(transaction, selectedFile);
            actions.open(title, items);
        },
        openForHistory: (transactions) => {
            const { actions } = get();
            const title = `Select data to copy from ${transactions.length} transactions:`;
            const items = CopyService.getCopyItemsForHistory(transactions);
            actions.open(title, items);
        },
        navigateUp: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'up', state.items.length),
        })),
        navigateDown: () => set(state => ({
            selectedIndex: moveIndex(state.selectedIndex, 'down', state.items.length),
        })),
        navigatePageUp: (viewportHeight: number) => set(state => ({
            selectedIndex: Math.max(0, state.selectedIndex - viewportHeight),
        })),
        navigatePageDown: (viewportHeight: number) => set(state => ({
            selectedIndex: Math.min(state.items.length - 1, state.selectedIndex + viewportHeight),
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
        executeCopy: async () => {
            const { items, selectedIds } = get();
            const itemsToCopy = items.filter(i => selectedIds.has(i.id));
            if (itemsToCopy.length === 0) return;

            LoggerService.info(`Copying ${itemsToCopy.length} item(s) to clipboard.`);
            const dataPromises = itemsToCopy.map(item => item.getData());
            const resolvedData = await Promise.all(dataPromises);

            const content = itemsToCopy
                .map((item, index) => `--- ${item.label} ---\n${resolvedData[index]}`)
                .join('\n\n');
            const message = `Copied ${itemsToCopy.length} item(s) to clipboard.`;
            LoggerService.debug(`[CLIPBOARD MOCK] ${message}\n${content.substring(0, 200)}...`);
            set({ lastCopiedMessage: message });
        },
    },
}));
```

## File: src/stores/detail.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { TransactionService } from '../services/transaction.service';
import { NAVIGATOR_SECTIONS, DETAIL_BODY_VIEWS } from '../constants/detail.constants';
import { findNextPath, findPrevPath, getParentPath } from './navigation.utils';

type ObjectValues<T> = T[keyof T];

export type NavigatorSection = ObjectValues<typeof NAVIGATOR_SECTIONS>;
export type DetailBodyView = ObjectValues<typeof DETAIL_BODY_VIEWS>;

// Omit 'actions' from state type for partial updates
type DetailStateData = Omit<DetailState, 'actions'>;
 
interface DetailState {
    focusedItemPath: string; // e.g., 'PROMPT', 'FILES', 'FILES/1-1'
    expandedItemPaths: Set<string>;
    bodyView: DetailBodyView;
    actions: {
        load: (transactionId: string, initialState?: Partial<DetailStateData>) => void;
        navigateUp: () => void;
        navigateDown: () => void;
        expandOrDrillDown: () => void;
        collapseOrBubbleUp: () => void;
        toggleRevertConfirm: () => void;
        confirmRevert: () => void;
    };
}

const getVisibleItemPaths = (expandedItemPaths: Set<string>): string[] => {
    const { selectedTransactionId } = useViewStore.getState();
    const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === selectedTransactionId);
    if (!transaction) return [];

    const paths: string[] = [NAVIGATOR_SECTIONS.PROMPT, NAVIGATOR_SECTIONS.REASONING, NAVIGATOR_SECTIONS.FILES];
    if (expandedItemPaths.has(NAVIGATOR_SECTIONS.FILES) && transaction.files) {
        for (const file of transaction.files) {
            paths.push(`${NAVIGATOR_SECTIONS.FILES}/${file.id}`);
        }
    }
    return paths;
};

export const useDetailStore = create<DetailState>((set, get) => ({
    focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
    expandedItemPaths: new Set(),
    bodyView: DETAIL_BODY_VIEWS.NONE,
    actions: {
        load: (transactionId, initialState) => {
            useViewStore.getState().actions.setSelectedTransactionId(transactionId);
            set({
                focusedItemPath: NAVIGATOR_SECTIONS.PROMPT,
                expandedItemPaths: new Set(),
                bodyView: DETAIL_BODY_VIEWS.NONE,
                ...initialState,
            });
        },
        navigateUp: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findPrevPath(focusedItemPath, visibleItems) });
        },
        navigateDown: () => {
            const { expandedItemPaths, focusedItemPath } = get();
            const visibleItems = getVisibleItemPaths(expandedItemPaths);
            set({ focusedItemPath: findNextPath(focusedItemPath, visibleItems) });
        },
        expandOrDrillDown: () => set(state => {
            const { focusedItemPath, expandedItemPaths } = state;
            const newExpandedPaths = new Set(expandedItemPaths);
            
            if (focusedItemPath.includes('/')) { // Is a file
                return { bodyView: DETAIL_BODY_VIEWS.DIFF_VIEW };
            }

            // Is a section header
            if (newExpandedPaths.has(focusedItemPath)) {
                // Already expanded, drill in if it's FILES
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) {
                    const visibleItems = getVisibleItemPaths(newExpandedPaths);
                    const firstFile = visibleItems.find(item => item.startsWith(`${NAVIGATOR_SECTIONS.FILES}/`));
                    if (firstFile) {
                        return { focusedItemPath: firstFile, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
                    }
                }
                return {}; // No-op for PROMPT/REASONING if already expanded
            } else {
                // Not expanded, so expand it
                newExpandedPaths.add(focusedItemPath);
                let newBodyView: DetailBodyView = DETAIL_BODY_VIEWS.NONE;
                if (focusedItemPath === NAVIGATOR_SECTIONS.PROMPT) newBodyView = DETAIL_BODY_VIEWS.PROMPT;
                if (focusedItemPath === NAVIGATOR_SECTIONS.REASONING) newBodyView = DETAIL_BODY_VIEWS.REASONING;
                if (focusedItemPath === NAVIGATOR_SECTIONS.FILES) newBodyView = DETAIL_BODY_VIEWS.FILES_LIST;
                return { expandedItemPaths: newExpandedPaths, bodyView: newBodyView };
            }
        }),
        collapseOrBubbleUp: () => set(state => {
            const { focusedItemPath, expandedItemPaths, bodyView } = state;
            
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return { bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }

            if (getParentPath(focusedItemPath)) { // Is a file
                return { focusedItemPath: NAVIGATOR_SECTIONS.FILES, bodyView: DETAIL_BODY_VIEWS.FILES_LIST };
            }
            
            // Is a section header
            if (expandedItemPaths.has(focusedItemPath)) {
                const newExpandedPaths = new Set(expandedItemPaths);
                newExpandedPaths.delete(focusedItemPath);
                return { expandedItemPaths: newExpandedPaths, bodyView: DETAIL_BODY_VIEWS.NONE };
            }
            
            return {}; // No-op if not expanded (global back will handle)
        }),
        toggleRevertConfirm: () => set(state => ({
            bodyView: state.bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM
                ? DETAIL_BODY_VIEWS.NONE
                : DETAIL_BODY_VIEWS.REVERT_CONFIRM,
        })),
        confirmRevert: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (!selectedTransactionId) return;
            TransactionService.revertTransaction(selectedTransactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REVERTED');
            set({ bodyView: DETAIL_BODY_VIEWS.NONE });
        },
    },
}));
```

## File: src/types/copy.types.ts
```typescript
export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string | Promise<string>;
    isDefaultSelected?: boolean;
}
```

## File: src/components/ReviewProcessingScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { useTransactionStore } from '../stores/transaction.store';
import { useViewStore } from '../stores/view.store';
import { useReviewStore, type ApplyStep } from '../stores/review.store';
import Separator from './Separator';

const ApplyStepRow = ({ step, isSubstep = false }: { step: ApplyStep; isSubstep?: boolean }) => {
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
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const selectedTransactionId = useViewStore(s => s.selectedTransactionId);
    const { patchStatus, applySteps } = useReviewStore(state => ({
        patchStatus: state.patchStatus,
        applySteps: state.applySteps,
    }));
    const transaction = useTransactionStore(s => s.transactions.find(t => t.id === selectedTransactionId));

    const totalDuration = applySteps.reduce((acc: number, step: ApplyStep) => acc + (step.duration || 0), 0);
    const failureCase = patchStatus === 'PARTIAL_FAILURE';
    const footerText = failureCase
        ? `Elapsed: ${totalDuration.toFixed(1)}s · Transitioning to repair workflow...`
        : `Elapsed: ${totalDuration.toFixed(1)}s · Processing... Please wait.`;

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode apply</Text>
            <Separator />
            <Box marginY={1} flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} />)}
                </Box>
            </Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default ReviewProcessingScreen;
```

## File: src/components/Separator.tsx
```typescript
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = ({ width: propWidth }: { width?: number }) => {
	const [columns] = useStdoutDimensions();
	const width = propWidth ?? columns;
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;
```

## File: src/hooks/useInitializationScreen.tsx
```typescript
import { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore } from '../stores/init.store';
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
            if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
            if (input.toLowerCase() === 'q') {
                exit();
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

## File: src/hooks/useSplashScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { LoggerService } from '../services/logger.service';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            LoggerService.info('[MOCK] Opening noca.pro in browser...');
            return;
        }
        if (lowerInput === 'x') {
            LoggerService.info('[MOCK] Opening X/Twitter in browser...');
            return;
        }
        if (lowerInput === 'd') {
            LoggerService.info('[MOCK] Opening Discord in browser...');
            return;
        }
        if (lowerInput === 'g') {
            LoggerService.info('[MOCK] Opening GitHub in browser...');
            return;
        }

        // Any other key skips
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

## File: src/services/init.service.ts
```typescript
import { useInitStore } from '../stores/init.store';
import { sleep } from '../utils';
import { INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS } from '../constants/init.constants';
import { LoggerService } from './logger.service';

const runInitializationProcess = async () => {
    LoggerService.info('Starting initialization process...');
    const { actions } = useInitStore.getState();
    actions.resetInit();
    actions.setTasks(INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS);

    actions.setPhase('ANALYZE');
    LoggerService.debug('Phase set to ANALYZE');
    for (const task of INITIAL_ANALYZE_TASKS) {
        actions.updateAnalyzeTask(task.id, 'active');
        LoggerService.debug(`Analyzing task active: ${task.title}`);
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    LoggerService.debug('Phase set to CONFIGURE');
    const configTasksUntilInteractive = INITIAL_CONFIGURE_TASKS.slice(0, 2);
    for (const task of configTasksUntilInteractive) {
        actions.updateConfigureTask(task.id, 'active');
        LoggerService.debug(`Configuring task active: ${task.title}`);
        await sleep(800);
        actions.updateConfigureTask(task.id, 'done');
    }
    await sleep(500);

    actions.setPhase('INTERACTIVE');
    LoggerService.debug('Phase set to INTERACTIVE');
};

const resumeInitializationProcess = async () => {
    LoggerService.info('Resuming initialization process...');
    const { actions } = useInitStore.getState();
    
    actions.setPhase('CONFIGURE');
    LoggerService.debug('Phase set to CONFIGURE');
    const lastTask = INITIAL_CONFIGURE_TASKS[INITIAL_CONFIGURE_TASKS.length - 1];
    if (lastTask) {
        actions.updateConfigureTask(lastTask.id, 'active');
        LoggerService.debug(`Configuring task active: ${lastTask.title}`);
        await sleep(800);
        actions.updateConfigureTask(lastTask.id, 'done');
        await sleep(500);

        actions.setPhase('FINALIZE');
        LoggerService.info('Initialization process finalized.');
    }
};

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};
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

## File: src/components/GitCommitScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useGitCommitScreen();

    const transactionLines = transactionsToCommit.map(tx => (
        <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
    ));

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
            {isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={[
                    { key: 'Enter', label: 'Confirm & Commit' },
                    { key: 'Esc', label: 'Cancel' },
                ]}/>
            }
        </Box>
    );
};

export default GitCommitScreen;
```

## File: src/hooks/useGlobalHotkeys.tsx
```typescript
import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { MAIN_SCREENS_FOR_QUIT } from '../constants/app.constants';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { currentScreen } = useAppStore(s => ({
        currentScreen: s.currentScreen,
    }));
    const { navigateBack } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === 'debug' ? 'none' : 'debug');
            return;
        }
        if (key.ctrl && input === 'l') {
            setActiveOverlay(activeOverlay === 'log' ? 'none' : 'log');
            return;
        }

        // If an overlay with its own input is open, stop here.
        if (activeOverlay === 'debug' || activeOverlay === 'log') {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === 'help') {
            if (key.escape || input === '?') {
                setActiveOverlay('none');
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay('help');
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q') {
            if ((MAIN_SCREENS_FOR_QUIT as readonly string[]).includes(currentScreen)) {
                exit();
            }
            navigateBack();
        } else if (key.escape) {
            navigateBack();
        }
    }, { isActive });
};
```

## File: src/services/copy.service.ts
```typescript
import type { Transaction, FileItem } from '../types/domain.types';
import type { CopyItem } from '../types/copy.types';
import { COPYABLE_ITEMS } from '../constants/copy.constants';
import { FileSystemService } from './fs.service';

const formatFileContext = (filePath: string, content: string): string => {
    const lang = filePath.split('.').pop() || '';
    return `--- CONTEXT FOR FILE: ${filePath} ---\n\`\`\`${lang}\n${content}\n\`\`\``;
};

const getContextForFilePaths = async (filePaths: string[]): Promise<string> => {
    const contentPromises = filePaths.map(path => FileSystemService.readFileContent(path));
    const resolvedContents = await Promise.all(contentPromises);
    return filePaths
        .map((path, index) => formatFileContext(path, resolvedContents[index]!))
        .join('\n\n');
};

const createBaseTransactionCopyItems = (transaction: Transaction): CopyItem[] => [
    { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
    { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message },
    { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
    { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '' },
];

const getCopyItemsForReview = (
    transaction: Transaction,
    files: FileItem[],
    selectedFile?: FileItem,
): CopyItem[] => {
    const allFilePaths = [...new Set(files.map(f => f.path))];

    return [
        ...createBaseTransactionCopyItems(transaction),
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
        {
            id: 'context_files',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
    ];
};

const getCopyItemsForDetail = (
    transaction: Transaction,
    selectedFile?: FileItem,
): CopyItem[] => {
    const baseItems = createBaseTransactionCopyItems(transaction);
    const messageItem = { ...baseItems.find(i => i.id === 'message')!, isDefaultSelected: true };
    const promptItem = baseItems.find(i => i.id === 'prompt')!;
    const reasoningItem = { ...baseItems.find(i => i.id === 'reasoning')!, isDefaultSelected: true };
    const uuidItem = baseItems.find(i => i.id === 'uuid')!;

    const allFilePaths = [...new Set((transaction.files || []).map(f => f.path))];

    return [
        messageItem,
        promptItem,
        reasoningItem,
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        {
            id: 'context_files',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
        uuidItem,
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
};

const getCopyItemsForHistory = (
    transactions: Transaction[],
): CopyItem[] => {
    if (transactions.length === 0) return [];

    const allFilePaths = [
        ...new Set(transactions.flatMap(tx => tx.files?.map(f => f.path) || [])),
    ];

    return [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        {
            id: 'context_files_history',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
};

export const CopyService = {
    getCopyItemsForReview,
    getCopyItemsForDetail,
    getCopyItemsForHistory,
};
```

## File: src/services/transaction.service.ts
```typescript
import { createMockTransactions } from '../data/mocks';
import type { Transaction } from '../types/domain.types';

const revertTransaction = (_transactionId: string) => {
    // In a real app, this would perform the revert operation (e.g., API call).
    // The state update is now handled by the calling store.
    // This is a no-op for the simulation, we just need the id.
};

export const TransactionService = {
    revertTransaction,
    getAllTransactions: (): Transaction[] => createMockTransactions(),
};
```

## File: src/stores/transaction.store.ts
```typescript
import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import { useViewStore } from './view.store';
import type { Transaction, TransactionStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;
        clearTransactions: () => void;
    };
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    actions: {
        loadTransactions: () => {
            const transactions = TransactionService.getAllTransactions();
            set({ transactions });
        },
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
        },
        clearTransactions: () => set({ transactions: [] }),
    },
}));

// --- Selectors ---

/** Selects transactions by their status. */
export const selectTransactionsByStatus = (status: TransactionStatus) => (state: TransactionState) =>
    state.transactions.filter(tx => tx.status === status);

/** Selects the transaction currently targeted by the view store. */
export const selectSelectedTransaction = (state: TransactionState): Transaction | undefined => {
    const { selectedTransactionId } = useViewStore.getState();
    return state.transactions.find(t => t.id === selectedTransactionId);
};
```

## File: src/components/SplashScreen.tsx
```typescript
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

## File: src/hooks/useDashboardScreen.tsx
```typescript
import { useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useViewport } from './useViewport';

export const useDashboardScreen = ({ reservedRows }: { reservedRows: number }) => {
    const {
        status,
        selectedTransactionIndex,
        expandedTransactionId,
    } = useDashboardStore();
    const transactions = useTransactionStore(s => s.transactions);
    const pendingTransactions = useTransactionStore(selectTransactionsByStatus('PENDING'));
    const appliedTransactions = useTransactionStore(selectTransactionsByStatus('APPLIED'));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex: selectedTransactionIndex,
        reservedRows,
    });

    const {
        togglePause,
        moveSelectionUp,
        moveSelectionDown,
        startApproveAll,
        confirmAction,
        cancelAction,
        toggleExpand,
    } = useDashboardStore(s => s.actions);
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);

    const pendingApprovals = pendingTransactions.length;
    const pendingCommits = appliedTransactions.length;

    const isModal = status === 'CONFIRM_APPROVE';
    const isProcessing = status === 'APPROVING';

    useInput((input, key) => {
        if (isModal) {
            if (key.return) confirmAction();
            if (key.escape) cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing

        if (key.leftArrow) {
            if (expandedTransactionId) {
                toggleExpand();
            }
            return;
        }
        if (key.rightArrow) {
            if (transactions[selectedTransactionIndex] && !expandedTransactionId) {
                toggleExpand();
            }
            return;
        }

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        
        if (key.return) {
            const selectedTx = transactions[selectedTransactionIndex];
            if (!selectedTx) return;
            
            const isExpanded = expandedTransactionId === selectedTx.id;

            if (isExpanded) {
                if (selectedTx.status === 'PENDING') {
                    useReviewStore.getState().actions.load(selectedTx.id);
                    appActions.showReviewScreen();
                } else {
                    useDetailStore.getState().actions.load(selectedTx.id);
                    appActions.showTransactionDetailScreen();
                }
            } else {
                toggleExpand();
            }
        }
        
        if (input.toLowerCase() === 'p') togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) {
            commitActions.prepareCommitScreen();
            appActions.showGitCommitScreen();
        }
        if (input.toLowerCase() === 'l') {
            useHistoryStore.getState().actions.load();
            appActions.showTransactionHistoryScreen();
        }
    });
    const transactionsToConfirm = status === 'CONFIRM_APPROVE' ? pendingTransactions : [];

    return {
        status,
        transactions,
        selectedTransactionIndex,
        expandedTransactionId,
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

## File: src/stores/commit.store.ts
```typescript
import { create } from 'zustand';
import { CommitService } from '../services/commit.service';
import { useTransactionStore, selectTransactionsByStatus } from './transaction.store';

interface CommitState {
    finalCommitMessage: string;
    isCommitting: boolean;
    actions: {
        prepareCommitScreen: () => void;
        commit: () => Promise<void>;
    }
}

export const useCommitStore = create<CommitState>((set) => ({
    finalCommitMessage: '',
    isCommitting: false,
    actions: {
        prepareCommitScreen: () => {
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            const finalCommitMessage = CommitService.generateCommitMessage(appliedTransactions);
            set({ finalCommitMessage });
        },
        commit: async () => {
            set({ isCommitting: true });
            const appliedTransactions = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
            await CommitService.commit(appliedTransactions);
            set({ isCommitting: false });
        },
    },
}));
```

## File: src/stores/init.store.ts
```typescript
import { create } from 'zustand';

// Store Interface
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';
export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}
 
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (phase: InitPhase) => void;
        setTasks: (analyzeTasks: Task[], configureTasks: Task[]) => void;
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
    analyzeTasks: [],
    projectId: null,
    gitignoreFound: null,
    configureTasks: [],
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        setTasks: (analyzeTasks, configureTasks) => set({
            analyzeTasks: JSON.parse(JSON.stringify(analyzeTasks)),
            configureTasks: JSON.parse(JSON.stringify(configureTasks)),
        }),
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
            analyzeTasks: [],
            projectId: null,
            gitignoreFound: null,
            configureTasks: [],
            interactiveChoice: null,
        }),
    },
}));
```

## File: src/components/InitializationScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import type { Task } from '../stores/init.store';
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

## File: src/hooks/useTransactionDetailScreen.tsx
```typescript
import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo, useState, useEffect } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';
import { useStdoutDimensions } from '../utils';

export const useTransactionDetailScreen = () => {
    const store = useDetailStore();
    const transaction = useTransactionStore(selectSelectedTransaction);
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        navigateUp,
        navigateDown,
        expandOrDrillDown,
        collapseOrBubbleUp,
        toggleRevertConfirm,
        confirmRevert,
    } = store.actions;
    const [contentScrollIndex, setContentScrollIndex] = useState(0);
    const [, height] = useStdoutDimensions();

    // Reset scroll when body view changes
    useEffect(() => {
        setContentScrollIndex(0);
    }, [store.bodyView]);

    // Header(2) + Meta(4) + Navigator(3+) + Separator(1) + BodyMargin(1) + Separator(1) + Footer(1)
    const availableBodyHeight = Math.max(1, height - 13 - (transaction?.files?.length || 0));

    const openCopyMode = () => {
        if (!transaction) return;
        const { focusedItemPath } = store;
        const fileId = focusedItemPath.split('/')[1];
        const selectedFile = fileId ? files.find(f => f.id === fileId) : undefined;
        useCopyStore.getState().actions.openForDetail(transaction, selectedFile);
    };

    useInput((input: string, key: Key) => {
        if (store.bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }
        
        // --- Content Scrolling ---
        if (store.bodyView === 'PROMPT' || store.bodyView === 'REASONING' || store.bodyView === 'DIFF_VIEW') {
             let contentLines = 0;
            if (store.bodyView === 'PROMPT') {
                contentLines = (transaction?.prompt || '').split('\n').length;
            } else if (store.bodyView === 'REASONING') {
                contentLines = (transaction?.reasoning || '').split('\n').length;
            } else if (store.bodyView === 'DIFF_VIEW') {
                const fileId = store.focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                contentLines = (file?.diff || '').split('\n').length;
            }
            
            if (key.upArrow) {
                setContentScrollIndex(i => Math.max(0, i - 1));
                return;
            }
            if (key.downArrow) {
                setContentScrollIndex(i => Math.min(Math.max(0, contentLines - availableBodyHeight), i + 1));
                return;
            }
            if (key.pageUp) {
                setContentScrollIndex(i => Math.max(0, i - availableBodyHeight));
                return;
            }
            if (key.pageDown) {
                setContentScrollIndex(i => Math.min(Math.max(0, contentLines - availableBodyHeight), i + availableBodyHeight));
                return;
            }
        }

        // --- Main Input ---
        if (input.toLowerCase() === 'c') {
            openCopyMode();
            return;
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
            return;
        }
        if (input.toLowerCase() === 'o') {
            if (!transaction) return;
            const { focusedItemPath } = store;
            if (focusedItemPath.includes('/')) { // Is a file
                const fileId = focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else { // Is a section, open the transaction YAML
                const yamlPath = EditorService.getTransactionYamlPath(transaction.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        // Navigator movement only if not scrolling content
        if (store.bodyView !== 'PROMPT' && store.bodyView !== 'REASONING' && store.bodyView !== 'DIFF_VIEW') {
            if (key.upArrow) navigateUp();
            if (key.downArrow) navigateDown();
        }
        if (key.rightArrow) expandOrDrillDown();
        if (key.leftArrow) collapseOrBubbleUp();
        if (key.return) expandOrDrillDown();
        if (key.escape) collapseOrBubbleUp();
    }, { isActive: useViewStore.getState().activeOverlay === 'none' }); // Prevent input when copy overlay is open

    return {
        transaction,
        files,
        focusedItemPath: store.focusedItemPath,
        expandedItemPaths: store.expandedItemPaths,
        bodyView: store.bodyView,
        contentScrollIndex,
        availableBodyHeight,
    };
};
```

## File: src/services/review.service.ts
```typescript
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';
import type { ApplyUpdate, PatchStatus } from '../stores/review.store';
import type { Transaction, FileItem, FileReviewStatus } from '../types/domain.types';

const generateBulkRepairPrompt = (failedFiles: FileItem[]): string => {
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: Hunk #1 failed to apply // This is a mock error

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
    transaction: Transaction,
    fileReviewStates: Map<
        string, { status: FileReviewStatus; error?: string; details?: string }
    >,
): string => {
    const successfulFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
    const failedFiles = (transaction.files || []).filter(f => ['FAILED', 'REJECTED'].includes(fileReviewStates.get(f.id)?.status || ''));

    return `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${transaction.hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${transaction.message}
Reasoning:
${transaction.reasoning || ''}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${fileReviewStates.get(f.id)?.error})`).join('\n')}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.`;
};

const performHandoff = (hash: string) => {
    // This is a bit of a hack to find the right transaction to update in the demo
    const txToUpdate = useTransactionStore.getState().transactions.find(tx => tx.hash === hash);
    if (txToUpdate) {
        useTransactionStore.getState().actions.updateTransactionStatus(txToUpdate.id, 'HANDOFF');
    }

    useAppStore.getState().actions.showDashboardScreen();
};

async function* runApplySimulation(scenario: 'success' | 'failure'): AsyncGenerator<ApplyUpdate> {
    if (scenario === 'success') {
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's1', title: '[✓] write: src/core/clipboard.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's2', title: '[✓] write: src/utils/shell.ts (strategy: standard-diff)', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(1300);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done', duration: 2.3 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done', duration: 1.2 } };

        await sleep(500);

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done', duration: 0.1 } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f1', title: '[✓] write: src/core/transaction.ts (strategy: replace)', status: 'done' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f2', title: '[!] failed: src/utils/logger.ts (Hunk #1 failed to apply)', status: 'failed' } } };
        await sleep(100);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f3', title: '[!] failed: src/commands/apply.ts (Context mismatch at line 92)', status: 'failed' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done', duration: 0.5 } };

        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped due to patch application failure' } };
        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to patch application failure' } };

        await sleep(500);
    }
}

const prepareTransactionForReview = (
    transaction: Transaction,
): {
    patchStatus: PatchStatus;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;
} => {
    // This simulates the backend determining which files failed or succeeded and sets it ONCE on load.
    // For this demo, tx '1' is the failure case, any other is success.
    const isFailureCase = transaction.id === '1';
    const fileReviewStates = new Map<string, { status: FileReviewStatus; error?: string }>();

    (transaction.files || []).forEach((file, index) => {
        if (isFailureCase) {
            const isFailedFile = index > 0;
            const status = isFailedFile ? 'FAILED' : 'APPROVED';
            const error = isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined;
            fileReviewStates.set(file.id, { status, error });
        } else {
            fileReviewStates.set(file.id, { status: 'APPROVED' });
        }
    });
    return { patchStatus: isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS', fileReviewStates };
};

const generateSingleFileRepairPrompt = (file: FileItem, error?: string): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${error || 'Unknown error'}
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

const tryRepairFile = (file: FileItem, error?: string): FileItem => {
    const repairPrompt = generateSingleFileRepairPrompt(file, error);
    // In a real app: clipboardy.writeSync(repairPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD MOCK] Copied repair prompt for: ${file.path}`, repairPrompt);

    return file;
};

const generateSingleFileInstructPrompt = (file: FileItem, transaction: Transaction): string => {
    return `The user REJECTED the last proposed change for the file \`${file.path}\`.

The original high-level goal was:
---
${transaction.prompt || transaction.message}
---

The rejected change was:
---
${file.diff || '// ... rejected diff would be here ...'}
---

Please provide an alternative solution for \`${file.path}\` that still accomplishes the original goal.
The response MUST be a complete, corrected patch for this file.`;
};

const tryInstructFile = (file: FileItem, transaction: Transaction): void => {
    const instructPrompt = generateSingleFileInstructPrompt(file, transaction);
    // In a real app: clipboardy.writeSync(instructPrompt)
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD MOCK] Copied instruction prompt for: ${file.path}`, instructPrompt);
};

const generateBulkInstructPrompt = (rejectedFiles: FileItem[], transaction: Transaction): string => {
    // Mock implementation for demo. In a real scenario, this would generate a more complex prompt.
    const fileList = rejectedFiles.map(f => `- ${f.path}`).join('\n');
    // eslint-disable-next-line no-console
    console.log(`[CLIPBOARD] Copied bulk instruction prompt for ${rejectedFiles.length} files.`);
    return `The user has rejected changes in multiple files for the goal: "${transaction.message}".\n\nThe rejected files are:\n${fileList}\n\nPlease provide an alternative patch for all of them.`;
};

const runBulkReapply = async (
    failedFiles: FileItem[],
): Promise<{ id: string; status: FileReviewStatus; error?: string }[]> => {
    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    return failedFiles.map(file => {
        if (first) {
            first = false;
            return { id: file.id, status: 'APPROVED' as const };
        } else {
            return {
                id: file.id,
                status: 'FAILED' as const,
                error: "'replace' failed: markers not found",
            };
        }
    });
};

export const ReviewService = {
    prepareTransactionForReview,
    generateBulkRepairPrompt,
    generateBulkInstructPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    generateSingleFileInstructPrompt,
    tryInstructFile,
    runBulkReapply,
};
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';
import { SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

interface AppState {
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
        navigateBack: () => void;
    };
}

export const useAppStore = create<AppState>((set, get) => ({
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
        navigateBack: () => {
            const { currentScreen } = get();
            if ((SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
                get().actions.showDashboardScreen();
            }
        },
    },
}));
```

## File: src/components/DebugMenu.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDebugMenu } from '../hooks/useDebugMenu';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems, viewOffset, totalItems } = useDebugMenu();
    const [width] = useStdoutDimensions();

    return (
        <Box
            flexDirection="column"
            width="100%"
            paddingX={2}
            paddingY={1}
        >
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · DEBUG MENU </Text>
            <Separator width={width - 4} />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => {
                    const absoluteIndex = index + viewOffset;
                    return (
                        <Text key={item.title} color={selectedIndex === absoluteIndex ? 'cyan' : undefined}>
                            {selectedIndex === absoluteIndex ? '> ' : '  '}
                            ({getKeyForIndex(absoluteIndex)}) {item.title}
                        </Text>
                    );
                })}
            </Box>
            <Separator width={width - 4} />
            <Box>
                <ActionFooter actions={[
                    { key: '↑↓/PgUp/PgDn', label: 'Nav' },
                    { key: '1-9,a-z', label: 'Jump' },
                    { key: 'Enter', label: 'Select' },
                    { key: 'Esc/Ctrl+B', label: 'Close' },
                ]}/>
                <Box flexGrow={1} />
                <Text>
                    {Math.min(viewOffset + 1, totalItems)}-
                    {Math.min(viewOffset + menuItems.length, totalItems)} of {totalItems}
                </Text>
            </Box>
        </Box>
    );
};

export default DebugMenu;
```

## File: index.tsx
```typescript
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useViewStore } from './src/stores/view.store';
import { useDetailStore } from './src/stores/detail.store';
import { useHistoryStore } from './src/stores/history.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionStore } from './src/stores/transaction.store';
import { useCommitStore } from './src/stores/commit.store';

const main = () => {
    // Initialize stores
    useTransactionStore.getState().actions.loadTransactions();
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
                useReviewStore.getState().actions.load('1');
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.load('1');
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useDetailStore.getState().actions.load('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            case 'DebugMenu':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('debug');
                break;
            case 'DebugLogScreen':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('log');
                break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        // eslint-disable-next-line no-console
        console.clear();
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
```

## File: src/hooks/useReviewScreen.tsx
```typescript
import { useMemo, useState, useEffect } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';
import { useViewport } from './useViewport';
import { useStdoutDimensions } from '../utils';

type NavigableItem =
    | { type: 'prompt' }
    | { type: 'reasoning' }
    | { type: 'script'; id: string }
    | { type: 'file'; id: string };

export const useReviewScreen = () => {
    const store = useReviewStore();
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
    } = store;

    const transaction = useTransactionStore(selectSelectedTransaction);
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const [contentScrollIndex, setContentScrollIndex] = useState(0);
    const [height] = useStdoutDimensions();

    // Reset scroll when body view changes
    useEffect(() => {
        setContentScrollIndex(0);
    }, [bodyView]);

    // Header(2) + Meta(3) + Prompt/Reasoning(2) + Separator(1) + Scripts(N) + Separator(1) + FilesHeader(1) + Separator(1) + BodyMargin(1) + Footer(1)
    const scriptCount = transaction?.scripts?.length || 0;
    const RESERVED_ROWS_MAIN = 13 + scriptCount;
    const { viewOffset, viewportHeight } = useViewport({ selectedIndex: selectedItemIndex, reservedRows: RESERVED_ROWS_MAIN });

    // For body content, it's simpler
    const fileCount = transaction?.files?.length || 0;
    const availableBodyHeight = Math.max(1, height - (RESERVED_ROWS_MAIN + fileCount));

    const navigableItems = useMemo((): NavigableItem[] => {
        if (!transaction) return [];
        const scriptItems: NavigableItem[] = (transaction.scripts || []).map(s => ({ type: 'script', id: s.command }));
        const fileItems: NavigableItem[] = (transaction.files || []).map(f => ({ type: 'file', id: f.id }));
        return [{ type: 'prompt' }, { type: 'reasoning' }, ...scriptItems, ...fileItems];
    }, [transaction]);

    const navigableItemsInView = navigableItems.slice(viewOffset, viewOffset + viewportHeight);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            totalFiles: files.length,
            totalLinesAdded: files.reduce((sum, f) => sum + f.linesAdded, 0),
            totalLinesRemoved: files.reduce((sum, f) => sum + f.linesRemoved, 0),
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
        };
    }, [files, fileReviewStates]);

    const hasRejectedFiles = useMemo(() => {
        if (!fileReviewStates) return false;
        return Array.from(fileReviewStates.values()).some(s => s.status === 'REJECTED');
    }, [fileReviewStates]);

    const { approvedFilesCount } = reviewStats;

    const isFileSelected = navigableItems[selectedItemIndex]?.type === 'file';

    const scripts = transaction?.scripts || [];

    const {
        moveSelectionUp,
        moveSelectionDown,
        expandDiff,
        toggleBodyView,
        setBodyView,
        startApplySimulation,
        approve,
        tryRepairFile,
        tryInstruct,
        showBulkRepair,
        showBulkInstruct,
        executeBulkRepairOption,
        executeBulkInstructOption,
        confirmHandoff,
        scrollReasoningUp,
        scrollReasoningDown,
        navigateScriptErrorUp,
        navigateScriptErrorDown,
        toggleFileApproval,
        rejectAllFiles,
        navigateBulkRepairUp,
        navigateBulkRepairDown,
        navigateBulkInstructUp,
        navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1') { // For demo purposes
            startApplySimulation('success'); return true;
        }
        if (input === '2') { // For demo purposes
            startApplySimulation('failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        if (key.escape) {
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff' || bodyView === 'bulk_instruct') {
                toggleBodyView(bodyView);
            } else if (bodyView !== 'none') {
                setBodyView('none');
            }
            return true;
        }
        return false;
    };

    const handleHandoffConfirmInput = (_input: string, key: Key): void => {
        if (key.return) confirmHandoff();
    };

    const handleBulkRepairInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkRepairUp();
        if (key.downArrow) navigateBulkRepairDown();
        if (key.return) {
            executeBulkRepairOption(selectedBulkRepairOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '4') {
            executeBulkRepairOption(parseInt(input));
        }
    };
    
    const handleBulkInstructInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkInstructUp();
        if (key.downArrow) navigateBulkInstructDown();
        if (key.return) {
            executeBulkInstructOption(selectedBulkInstructOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '3') {
            executeBulkInstructOption(parseInt(input));
        }
    };

    const handleContentScrollInput = (key: Key): boolean => {
        const contentViews = ['reasoning', 'script_output', 'diff'];
        if (!contentViews.includes(bodyView)) return false;

        if (key.upArrow) {
            setContentScrollIndex(i => Math.max(0, i - 1));
            return true;
        }
        if (key.downArrow) {
            // This is a simplification; a real implementation would need content length.
            setContentScrollIndex(i => i + 1);
            return true;
        }
        if (key.pageUp) {
            setContentScrollIndex(i => Math.max(0, i - availableBodyHeight));
            return true;
        }
        if (key.pageDown) {
            setContentScrollIndex(i => i + availableBodyHeight);
            return true;
        }
        return false;
    };

    const handleReasoningInput = (input: string, key: Key): void => {
        if (key.upArrow) scrollReasoningUp();
        if (key.downArrow) scrollReasoningDown();
        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');
    };

    const handleScriptOutputInput = (input: string, key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (key.return) toggleBodyView('script_output');
        if (input.toLowerCase() === 'c') { // TODO: this copy logic is not great.
            const currentItem = navigableItems[selectedItemIndex];
            const selectedScript = currentItem?.type === 'script' ? scripts.find(s => s.command === currentItem.id) : undefined;
            if (selectedScript) {
                // eslint-disable-next-line no-console
                console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
            }
        }
    };

    const handleDiffInput = (input: string) => {
        if (input.toLowerCase() === 'x') expandDiff();
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp(navigableItems.length);
        if (key.downArrow) moveSelectionDown(navigableItems.length);

        const currentItem = navigableItems[selectedItemIndex];

        if (input === ' ') {
            if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(currentItem.id);
                }
            }
        }

        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView('diff');
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView('reasoning');
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView('diff');
            } else if (currentItem?.type === 'reasoning') {
                toggleBodyView('reasoning');
            } else if (currentItem?.type === 'script') {
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

        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'FAILED') tryRepairFile(currentItem.id);
            }
        }

        if (input.toLowerCase() === 'i') {
            if (key.shift) {
                if (hasRejectedFiles) showBulkInstruct();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'REJECTED') {
                    tryInstruct(currentItem.id);
                }
            }
        }
    };

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) {
            return;
        }

        // If we are in a scrollable body view, prioritize that input.
        if (handleContentScrollInput(key)) {
            return;
        }

        switch (bodyView) {
            case 'confirm_handoff': return handleHandoffConfirmInput(input, key);
            case 'bulk_repair': return handleBulkRepairInput(input, key);
            case 'bulk_instruct': return handleBulkInstructInput(input, key);
            case 'reasoning': return handleReasoningInput(input, key);
            case 'script_output': return handleScriptOutputInput(input, key);
            case 'diff': return handleDiffInput(input);
            default: return handleMainNavigationInput(input, key);
        }
    });

    return {
        ...store,
        fileReviewStates,
        selectedItemIndex,
        transaction,
        files,
        scripts,
        patchStatus,
        navigableItems,
        isFileSelected,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex,
        availableBodyHeight,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        ...reviewStats,
        hasRejectedFiles,
    };
};
```

## File: src/components/TransactionDetailScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';
import type { FileChangeType } from '../types/domain.types';
import ActionFooter from './ActionFooter';
import type { ActionItem } from '../types/actions.types';

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
        focusedItemPath, expandedItemPaths, bodyView, contentScrollIndex, availableBodyHeight,
    } = useTransactionDetailScreen();

    if (!transaction) {
        return <Text>Loading transaction...</Text>;
    }

    const renderNavigator = () => {
        const isPromptFocused = focusedItemPath === 'PROMPT';
        const isReasoningFocused = focusedItemPath === 'REASONING';
        const isFilesFocused = focusedItemPath.startsWith('FILES');
        
        const isPromptExpanded = expandedItemPaths.has('PROMPT');
        const isReasoningExpanded = expandedItemPaths.has('REASONING');
        const isFilesExpanded = expandedItemPaths.has('FILES');
        
        return (
            <Box flexDirection="column">
                <Text color={isPromptFocused ? 'cyan' : undefined}>
                    {isPromptFocused ? '> ' : '  '}
                    {isPromptExpanded ? '▾' : '▸'} (P)rompt
                </Text>
                <Text color={isReasoningFocused ? 'cyan' : undefined}>
                    {isReasoningFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (R)easoning ({transaction.reasoning?.split('\n\n').length || 0} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && !focusedItemPath.includes('/') ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (F)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file) => {
                             const fileId = `FILES/${file.id}`;
                             const isFileSelected = focusedItemPath === fileId;
                             const stats = file.type === 'DEL'
                                ? ''
                                : ` (+${file.linesAdded}/-${file.linesRemoved})`;
                             return (
                                <Text key={file.id} color={isFileSelected ? 'cyan' : undefined}>
                                    {isFileSelected ? '> ' : '  '}
                                    {getFileChangeTypeIcon(file.type)} {file.path}{stats}
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
                    <Box marginTop={1} flexDirection="column">
                        {(transaction.prompt || '').split('\n')
                            .slice(contentScrollIndex, contentScrollIndex + availableBodyHeight)
                            .map((line, i) => <Text key={i}>{line}</Text>)
                        }
                    </Box>
                </Box>
            );
        }
        if (bodyView === 'REASONING') {
            if (!transaction.reasoning) return <Text color="gray">No reasoning provided.</Text>;
            return <ReasonScreen reasoning={transaction.reasoning} scrollIndex={contentScrollIndex} visibleLinesCount={availableBodyHeight} />;
        }
        if (bodyView === 'FILES_LIST') {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === 'DIFF_VIEW') {
            const fileId = focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            if (!file) return null;
            return <DiffScreen filePath={file.path} diffContent={file.diff} isExpanded={true} scrollIndex={contentScrollIndex} maxHeight={availableBodyHeight} />;
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === 'REVERT_CONFIRM') {
            return <ActionFooter actions={[
                { key: 'Enter', label: 'Confirm Revert' },
                { key: 'Esc', label: 'Cancel' },
            ]} />;
        }
        
        const isFileFocused = focusedItemPath.includes('/');
        const baseActions: ActionItem[] = [
            { key: 'C', label: 'Copy' },
            { key: 'O', label: isFileFocused ? 'Open File' : 'Open YAML' },
            { key: 'U', label: 'Undo' },
            { key: 'Q', label: 'Quit/Back' },
        ];
        let contextualActions: ActionItem[] = [];

        if (isFileFocused) { // Is a file
            if (bodyView === 'DIFF_VIEW') {
                contextualActions = [
                    { key: '↑↓', label: 'Nav Files' },
                    { key: '←', label: 'Back to List' },
                ];
            } else {
                contextualActions = [
                    { key: '↑↓', label: 'Nav Files' },
                    { key: '→', label: 'View Diff' },
                    { key: '←', label: 'Back to Sections' },
                ];
            }
            return <ActionFooter actions={[...contextualActions, ...baseActions]} />;
        }
        
        if (expandedItemPaths.has(focusedItemPath)) {
            contextualActions = [
                { key: '↑↓', label: 'Nav/Scroll' },
                { key: '→', label: 'Drill In' },
                { key: '←', label: 'Collapse' },
            ];
        } else {
            contextualActions = [
                { key: '↑↓', label: 'Nav' },
                { key: '→', label: 'Expand' },
            ];
        }
        return <ActionFooter actions={[...contextualActions, ...baseActions]} />;
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

## File: src/components/TransactionHistoryScreen.tsx
```typescript
import { useMemo } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import type { Transaction, FileItem } from '../types/domain.types';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';
import { UI_CONFIG } from '../config/ui.config';
import ActionFooter from './ActionFooter';
import type { ActionItem } from '../types/actions.types';

// --- Sub-components ---

const ContentRow = ({ title, content, isSelected, isExpanded, isLoading }: {
    title: string;
    content: string;
    isSelected: boolean;
    isExpanded: boolean;
    isLoading: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';
    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}{icon} {title}
            </Text>
            {isLoading && <Box paddingLeft={8}><Spinner type="dots" /></Box>}
            {isExpanded && !isLoading && (
                <Box paddingLeft={8} flexDirection="column">
                    {(content || '').split('\n').map((line, i) => <Text key={i}>{line || ' '}</Text>)}
                </Box>
            )}
        </Box>
    );
};

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

const FileRow = ({ file, isSelected, isExpanded, isLoading }: {
    file: FileItem;
    isSelected: boolean;
    isExpanded: boolean;
    isLoading: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';
    const typeMap = { MOD: '[MOD]', ADD: '[ADD]', DEL: '[DEL]', REN: '[REN]' };
    
    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {icon} {typeMap[file.type]} {file.path}
            </Text>
            {isLoading && <Box paddingLeft={8}><Spinner type="dots" /></Box>}
            {isExpanded && !isLoading && <DiffPreview diff={file.diff} />}
        </Box>
    );
};

const TransactionRow = ({
    tx,
    isSelected,
    isExpanded,
    isSelectedForAction,
    hasSelection,
}: {
    tx: Transaction;
    isSelected: boolean;
    isExpanded: boolean;
    isSelectedForAction: boolean;
    hasSelection: boolean;
}) => {
    const icon = isExpanded ? '▾' : '▸';
    const statusMap = {
        COMMITTED: <Text color="green">✓ Committed</Text>,
        HANDOFF: <Text color="magenta">→ Handoff</Text>,
        REVERTED: <Text color="gray">↩ Reverted</Text>,
        APPLIED: <Text color="blue">✓ Applied</Text>,
        PENDING: <Text color="yellow">? Pending</Text>,
        FAILED: <Text color="red">✗ Failed</Text>,
    };
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    const selectionIndicator = isSelectedForAction ? '[x] ' : '[ ] ';
    
    const statusDisplay = statusMap[tx.status as keyof typeof statusMap] || tx.status;

    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {hasSelection && selectionIndicator}
                {icon} {statusDisplay} · {tx.hash} · {date} ·{' '}
                {tx.message}
            </Text>
            {isExpanded && (
                <Box flexDirection="column" paddingLeft={8}>
                    {tx.stats && (
                        <Text color="gray">
                            Stats: {tx.stats.files} files, +{tx.stats.linesAdded}/-{tx.stats.linesRemoved}
                        </Text>
                    )}
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
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        loadingPaths,
        actions,
        transactions,
        itemsInView,
        filterStatus,
        showingStatus,
        statsStatus,
        hasSelection,
    } = useTransactionHistoryScreen({ reservedRows: UI_CONFIG.history.reservedRows });

    const transactionsById = useMemo(() => new Map(transactions.map(tx => [tx.id, tx])), [transactions]);

    const renderFooter = () => {
        if (mode === 'FILTER') return <Text>(Enter) Apply Filter & Return      (Esc) Cancel</Text>; 
        if (mode === 'BULK_ACTIONS') return <Text>Choose an option [1-3] or (Esc) Cancel</Text>;
        
        const openActionLabel = selectedItemPath.includes('/file/') ? 'Open File' : 'Open YAML';
        const footerActions: ActionItem[] = [
            { key: '↑↓/PgUp/PgDn', label: 'Nav' },
            { key: '→', label: 'Expand' },
            { key: '←', label: 'Collapse' },
            { key: 'Spc', label: 'Select' },
            { key: 'Ent', label: 'Details' },
            { key: 'O', label: openActionLabel },
            { key: 'F', label: 'Filter' },
        ];

        if (selectedForAction.size > 0) {
            footerActions.push({ key: 'C', label: 'Copy' }, { key: 'B', label: 'Bulk' });
        }
        return <ActionFooter actions={footerActions} />;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode transaction history</Text>
            <Separator />

            <Box>
                <Text>Filter: </Text>
                {mode === 'FILTER' ? (
                    <TextInput value={filterQuery} onChange={actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus}</Text>
                {statsStatus && <Text> · {statsStatus}</Text>}
            </Box>

            <Box flexDirection="column" marginY={1}>
                {mode === 'BULK_ACTIONS' && <BulkActionsMode selectedForActionCount={selectedForAction.size} />}

                {mode === 'LIST' && itemsInView.map(path => {
                    const txId = path.split('/')[0]!;
                    const tx = transactionsById.get(txId);
                    if (!tx) return <Text key={path}>Error: Missing TX {txId}</Text>;

                    // Is a transaction row
                    if (path === tx.id) {
                        return (
                            <TransactionRow
                                key={path}
                                tx={tx}
                                isSelected={selectedItemPath === path}
                                isExpanded={expandedIds.has(path)}
                                isSelectedForAction={selectedForAction.has(tx.id)}
                                hasSelection={hasSelection}
                            />
                        );
                    }

                    // Is a child row
                    const itemType = path.split('/')[1]!;
                    const isSelected = selectedItemPath === path;
                    const isExpanded = expandedIds.has(path);
                    const isLoading = loadingPaths.has(path);

                    if (itemType === 'file') {
                        const fileId = path.split('/')[2]!;
                        const file = tx.files?.find(f => f.id === fileId);
                        if (!file) return null;
                        return (
                            <FileRow
                                key={path} file={file} isSelected={isSelected}
                                isExpanded={isExpanded} isLoading={isLoading}
                            />
                        );
                    }

                    const contentMap = {
                        message: { title: 'Commit Message', content: tx.message || '' },
                        prompt: { title: 'Prompt', content: tx.prompt || '' },
                        reasoning: { title: 'Reasoning', content: tx.reasoning || '' },
                    };

                    const item = contentMap[itemType as keyof typeof contentMap];
                    if (!item) return null;

                    return (
                        <ContentRow
                            key={path}
                            {...item}
                            isSelected={isSelected}
                            isExpanded={isExpanded}
                            isLoading={isLoading}
                        />
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

## File: src/hooks/useTransactionHistoryScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useHistoryStore } from '../stores/history.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useDetailStore } from '../stores/detail.store';
import { useCopyStore } from '../stores/copy.store';
import type { TransactionStatus } from '../types/domain.types';
import { EditorService } from '../services/editor.service';
import { getVisibleItemPaths } from '../stores/navigation.utils';
import { useViewport } from './useViewport';

export const useTransactionHistoryScreen = ({ reservedRows }: { reservedRows: number }) => {
    const store = useHistoryStore();
    const { mode, selectedItemPath, expandedIds, filterQuery, selectedForAction, loadingPaths, actions } = store;
    const { showDashboardScreen, showTransactionDetailScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, expandedIds),
        [transactions, expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(selectedItemPath);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows,
    });

    const openCopyMode = () => {
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        useCopyStore.getState().actions.openForHistory(transactionsToCopy);
    };

    const handleFilterInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode('LIST');
        if (key.return) actions.applyFilter();
    };

    const handleBulkActionsInput = (input: string, key: Key): void => {
        if (key.escape) {
            actions.setMode('LIST');
            return;
        }
        if (input >= '1' && input <= '3') {
            // eslint-disable-next-line no-console
            console.log(`[MOCK] Bulk action #${input} selected.`);
            actions.setMode('LIST');
        }
    };

    const handleListInput = (input: string, key: Key): void => {
        if (key.upArrow) actions.navigateUp();
        if (key.downArrow) actions.navigateDown();
        if (key.rightArrow) actions.expandOrDrillDown();
        if (key.leftArrow) actions.collapseOrBubbleUp();
        if (key.pageUp) actions.navigatePageUp(viewportHeight);
        if (key.pageDown) actions.navigatePageDown(viewportHeight);
        if (input === ' ') actions.toggleSelection();
        if (key.return) {
            const txId = selectedItemPath.split('/')[0];
            if (txId && !selectedItemPath.includes('/')) {
                useDetailStore.getState().actions.load(txId);
                showTransactionDetailScreen();
            }
        }
        if (input.toLowerCase() === 'o') {
            const txId = selectedItemPath.split('/')[0];
            const tx = transactions.find(t => t.id === txId);
            if (!tx) return;

            if (selectedItemPath.includes('/file/')) {
                const fileId = selectedItemPath.split('/')[2];
                const file = tx.files?.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else {
                const yamlPath = EditorService.getTransactionYamlPath(tx.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        if (input.toLowerCase() === 'f') actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && selectedForAction.size > 0) actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    };

    useInput((input: string, key: Key) => {
        if (mode === 'FILTER') {
            handleFilterInput(input, key);
            return;
        }
        if (mode === 'BULK_ACTIONS') {
            handleBulkActionsInput(input, key);
            return;
        }
        handleListInput(input, key);
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => transactions.filter(tx => txIdsInView.has(tx.id)),
        [transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatusText = filterQuery ? filterQuery : '(none)';
    const showingStatusText = `Showing ${Math.min(viewOffset + 1, visibleItemPaths.length)}-${Math.min(viewOffset + itemsInView.length, visibleItemPaths.length)} of ${visibleItemPaths.length} items`;
    
    const hasSelection = selectedForAction.size > 0;

    const statsStatus = useMemo(() => {
        const stats = transactions.reduce((acc, tx) => {
            acc[tx.status] = (acc[tx.status] || 0) + 1;
            return acc;
        }, {} as Record<TransactionStatus, number>);
        
        const parts = [];
        if (stats.COMMITTED) parts.push(`${stats.COMMITTED} Cmt`);
        if (stats.HANDOFF) parts.push(`${stats.HANDOFF} H/O`);
        if (stats.REVERTED) parts.push(`${stats.REVERTED} Rev`);
        if (stats.APPLIED) parts.push(`${stats.APPLIED} App`);
        if (stats.PENDING) parts.push(`${stats.PENDING} Pend`);
        if (stats.FAILED) parts.push(`${stats.FAILED} Fail`);

        return parts.length > 0 ? `Stats: ${parts.join(', ')}` : '';
    }, [transactions]);

    return {
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        actions,
        transactions,
        viewOffset,
        itemsInView,
        loadingPaths,
        transactionsInView,
        pathsInViewSet,
        filterStatus: filterStatusText,
        showingStatus: showingStatusText,
        statsStatus,
        hasSelection,
        visibleItemPaths,
    };
};
```

## File: src/App.tsx
```typescript
import { Box } from 'ink';
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
import DebugLogScreen from './components/DebugLogScreen';
import GlobalHelpScreen from './components/GlobalHelpScreen';
import CopyScreen from './components/CopyScreen';
import { useViewStore } from './stores/view.store';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const isOverlayOpen = activeOverlay !== 'none';

    // Global hotkeys are active if no modal-like component is open
    const areGlobalHotkeysActive = activeOverlay !== 'copy' && activeOverlay !== 'log'; // These overlays have their own input handlers
    useGlobalHotkeys({ isActive: areGlobalHotkeysActive });

    const renderMainScreen = () => {
        if (currentScreen === 'splash') return <SplashScreen />;
        if (currentScreen === 'init') return <InitializationScreen />;
        if (currentScreen === 'dashboard') return <DashboardScreen />;
        if (currentScreen === 'review') return <ReviewScreen />;
        if (currentScreen === 'review-processing') return <ReviewProcessingScreen />;
        if (currentScreen === 'git-commit') return <GitCommitScreen />;
        if (currentScreen === 'transaction-detail') return <TransactionDetailScreen />;
        if (currentScreen === 'transaction-history') return <TransactionHistoryScreen />;
        return null;
    };

    return (
        <>
            <Box
                width="100%"
                height="100%"
                flexDirection="column"
                display={isOverlayOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            {activeOverlay === 'help' && <GlobalHelpScreen />}
            {activeOverlay === 'copy' && <CopyScreen />}
            {activeOverlay === 'log' && <DebugLogScreen />}
            {activeOverlay === 'debug' && <DebugMenu />}
        </>
    );
};

export default App;
```

## File: src/components/ReviewScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import type { ScriptResult, FileItem, FileChangeType } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';
import ActionFooter from './ActionFooter';
import type { ActionItem } from '../types/actions.types';

// --- Sub-components ---

const FileItemRow = ({ file, reviewStatus, reviewError, reviewDetails, isFocused }: {
    file: FileItem;
    reviewStatus: string;
    reviewError?: string;
    reviewDetails?: string;
    isFocused: boolean;
}) => {
    let icon;
    let iconColor;
    switch (reviewStatus) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
        case 'AWAITING': icon = '[●]'; iconColor = 'yellow'; break;
        case 'RE_APPLYING': icon = '[●]'; iconColor = 'cyan'; break;
    }

    const typeColor = (type: FileChangeType) => {
        switch (type) {
            case 'ADD': return 'green';
            case 'DEL': return 'red';
            case 'REN': return 'yellow';
            default: return 'white';
        }
    };

    const diffStats = <Text>(+<Text color="green">{file.linesAdded}</Text>/-<Text color="red">{file.linesRemoved}</Text>)</Text>;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isFocused ? '> ' : '  ';
    const colorProps = isFocused ? { bold: true, color: 'cyan' } : {};

    if (reviewStatus === 'FAILED') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({reviewError})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'AWAITING') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    ({reviewDetails})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'RE_APPLYING') {
        return (
             <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text {...colorProps}>
                {prefix}<Text color={iconColor}>{icon}</Text> {file.type}{' '}
                <Text color={typeColor(file.type)}>{file.path}</Text>{' '}
                {diffStats} [{strategy}]
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
        transaction,
        files,
        scripts = [],
        patchStatus,
        selectedItemIndex,
        bodyView,
        isDiffExpanded,
        reasoningScrollIndex,
        scriptErrorIndex,
        fileReviewStates,
        numFiles,
        approvedFilesCount,
        totalLinesAdded,
        totalLinesRemoved,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        navigableItems,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex,
        availableBodyHeight,
        hasRejectedFiles,
    } = useReviewScreen();

    if (!transaction) {
        return <Text>Loading review...</Text>;
    }
    const { hash, message, prompt = '', reasoning = '' } = transaction;

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningText = reasoning || '';
            const reasoningLinesCount = reasoningText.split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ReasonScreen
                        reasoning={reasoningText}
                        scrollIndex={contentScrollIndex}
                        visibleLinesCount={availableBodyHeight}
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
            const currentItem = navigableItems[selectedItemIndex];
            const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                    scrollIndex={contentScrollIndex}
                    maxHeight={availableBodyHeight}
                />
            );
        }

        if (bodyView === 'script_output') {
             const currentItem = navigableItems[selectedItemIndex];
             const scriptItems = navigableItems.filter((i): i is { type: 'script'; id: string } => i.type === 'script');
             const scriptIndex = currentItem?.type === 'script'
                ? scriptItems.findIndex(i => i.id === currentItem.id)
                : -1;
             const selectedScript = scripts[scriptIndex] || null;
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter((line: string) =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>
                        {selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`
                    </Text>
                    <Box marginTop={1} flexDirection="column">
                        {outputLines.map((line: string, index: number) => {
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
            const failedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'FAILED');
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
                        {failedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>

                    <Text>How would you like to proceed?</Text>

                    <Box flexDirection="column">
                        {repairOptions.map((opt, i) => (
                            <Text key={i} color={selectedBulkRepairOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkRepairOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (bodyView === 'bulk_instruct') {
            const rejectedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'REJECTED');
            const instructOptions = [
                '(1) Copy Bulk Re-instruct Prompt (for single-shot AI)',
                '(2) Handoff to External Agent',
                '(3) Bulk Un-reject All Files (revert to original)',
                '(4) Cancel',
            ];

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK INSTRUCTION ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {rejectedFiles.length} files were rejected:</Text>
                        {rejectedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>
                    <Box flexDirection="column" marginTop={1}>
                        {instructOptions.map((opt, i) => (
                            <Text key={i} color={selectedBulkInstructOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkInstructOptionIndex === i ? '> ' : '  '}
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
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Nav' },
                { key: 'X', label: 'Expand' },
                { key: 'D/Esc', label: 'Back' },
            ]}/>;
        }
        if (bodyView === 'reasoning') {
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Scroll Text' },
                { key: 'R', label: 'Collapse View' },
                { key: 'C', label: 'Copy Mode' },
            ]}/>;
        }
        if (bodyView === 'script_output') {
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Nav' },
                { key: 'J↓/K↑', label: 'Next/Prev Error' },
                { key: 'C', label: 'Copy Output' },
                { key: 'Ent/Esc', label: 'Back' },
            ]}/>;
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel</Text>;
        }
        if (bodyView === 'bulk_instruct') {
            return <Text>Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel</Text>;
        }
        if (bodyView === 'confirm_handoff') {
            return <ActionFooter actions={[
                { key: 'Enter', label: 'Confirm Handoff' },
                { key: 'Esc', label: 'Cancel' },
            ]}/>;
        }

        // Main footer
        const actions: ActionItem[] = [{ key: '↑↓', label: 'Nav' }];

        const currentItem = navigableItems[selectedItemIndex];
        
        if (currentItem?.type === 'file') {
            const selectedFile = files.find(f => f.id === currentItem.id);
            const fileState = fileReviewStates.get(currentItem.id);
            if (fileState?.status !== 'FAILED') {
                actions.push({ key: 'Spc', label: 'Toggle' });
            }
            actions.push({ key: 'D', label: 'Diff' });
            
            // Add repair options for failed files
            if (selectedFile && fileState?.status === 'FAILED') {
                actions.push({ key: 'T', label: 'Try Repair' });
            }
            if (selectedFile && fileState?.status === 'REJECTED') {
                actions.push({ key: 'I', label: 'Instruct' });
            }
        } else if (currentItem?.type === 'script') {
            actions.push({ key: 'Ent', label: 'Expand Details' });
        } else { // Prompt or Reasoning
            actions.push({ key: 'Ent', label: 'Expand' });
        }

        if (currentItem?.type !== 'reasoning') {
            actions.push({ key: 'R', label: 'Reasoning' });
        }

        // Add bulk repair if there are failed files
        const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
        if (hasFailedFiles) {
            actions.push({ key: 'Shift+T', label: 'Bulk Repair' });
        }
        // Add bulk instruct if there are rejected files
        if (hasRejectedFiles) {
            actions.push({ key: 'Shift+I', label: 'Bulk Instruct' });
        }
        
        actions.push({ key: 'C', label: 'Copy' });

        if (approvedFilesCount > 0) {
            actions.push({ key: 'A', label: 'Approve' });
        }

        if (Array.from(fileReviewStates.values()).some(s => s.status === 'APPROVED' || s.status === 'FAILED')) {
            actions.push({ key: 'Shift+R', label: 'Reject All' });
        }
        actions.push({ key: 'Q', label: 'Quit' });

        return <ActionFooter actions={actions} />;
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
                        (<Text color="green">+{totalLinesAdded}</Text>/<Text color="red">-{totalLinesRemoved}</Text>
                        ) · {numFiles} Files · ({approvedFilesCount}/{numFiles} Appr)
                        · Showing {viewOffset + 1}-
                        {Math.min(viewOffset + navigableItemsInView.length, navigableItems.length)} of {navigableItems.length}
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && <Text> · Scripts: SKIPPED</Text>}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Text>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'prompt' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'prompt' ? '> ' : '  '}
                        (P)rompt ▸ {(prompt || '').substring(0, 60)}...
                    </Text>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'reasoning' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'reasoning' ? '> ' : '  '}
                        (R)easoning ({(reasoning || '').split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'}{' '}
                        {((reasoning || '').split('\n')[0] ?? '').substring(0, 50)}...
                    </Text>
                </Box>
            </Box>

            <Separator />

            {/* Script Results (if any) */}
            {scripts.length > 0 && navigableItemsInView.some(i => i.type === 'script') && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script: ScriptResult) => {
                            const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'script' && i.id === script.command);
                            if (itemInViewIndex === -1) return null; // Only render if visible
                            
                            const isSelected = selectedItemIndex === viewOffset + itemInViewIndex;
                            return (
                                <ScriptItemRow key={script.command} script={script} isSelected={isSelected} isExpanded={bodyView === 'script_output' && isSelected} />
                            );
                        })}
                    </Box>
                    <Separator />
                </>
            )}
            
            {/* Files Section */}
            <Box flexDirection="column" marginY={1}>
                <Text bold>FILES</Text>
                {files.map((file: FileItem) => {
                    const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'file' && i.id === file.id);
                    if (itemInViewIndex === -1) return null; // Only render if visible

                    const isFocused = selectedItemIndex === viewOffset + itemInViewIndex;
                    const reviewState = fileReviewStates.get(file.id);
                    
                    return (
                        <FileItemRow
                            key={file.id} file={file} isFocused={isFocused}
                            reviewStatus={reviewState?.status || 'AWAITING'}
                            reviewError={reviewState?.error}
                            reviewDetails={reviewState?.details}
                        />
                    );
                })}
            </Box>
            
            <Separator />
            
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

## File: src/stores/dashboard.store.ts
```typescript
import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { moveIndex } from './navigation.utils';

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    expandedTransactionId: string | null;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
        toggleExpand: () => void;
        setExpandedTransactionId: (id: string | null) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    selectedTransactionIndex: 0,
    expandedTransactionId: null,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return {
                selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', transactions.length),
                expandedTransactionId: null,
            };
        }),
        moveSelectionDown: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return {
                selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', transactions.length),
                expandedTransactionId: null,
            };
        }),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => { // The `if` is redundant as this is only called from that state.
            const previousStatus = get().previousStatus;
            set({ status: 'APPROVING' });
            await DashboardService.approveAll();
            set({ status: previousStatus });
        },
        toggleExpand: () => {
            const { selectedTransactionIndex, expandedTransactionId } = get();
            const { transactions } = useTransactionStore.getState();
            const selectedTx = transactions[selectedTransactionIndex];
            if (!selectedTx) return;

            if (expandedTransactionId === selectedTx.id) {
                set({ expandedTransactionId: null });
            } else {
                set({ expandedTransactionId: selectedTx.id });
            }
        },
        setExpandedTransactionId: (id) => set({ expandedTransactionId: id }),
    },
}));
```

## File: src/components/DashboardScreen.tsx
```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import type { Transaction, TransactionStatus, FileChangeType } from '../types/domain.types';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { UI_CONFIG } from '../config/ui.config';
import ActionFooter from './ActionFooter';
import type { ActionItem } from '../types/actions.types';

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

const getFileChangeTypeIcon = (type: FileChangeType) => {
    switch (type) {
        case 'MOD': return '[MOD]';
        case 'ADD': return '[ADD]';
        case 'DEL': return '[DEL]';
        case 'REN': return '[REN]';
    }
};

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
};

const ExpandedEventInfo = ({ transaction }: { transaction: Transaction }) => {
    const stats = transaction.stats;
    const files = transaction.files || [];

    return (
        <Box flexDirection="column" paddingLeft={4} marginBottom={1} borderStyle="round" borderLeft={true} borderTop={false} borderRight={false} borderBottom={false} borderColor="gray">
            {stats && (
                <Text color="gray">
                    Stats: {stats.files} files, +{stats.linesAdded}/-{stats.linesRemoved}
                </Text>
            )}
             <Box flexDirection="column" paddingLeft={1}>
                {files.map(file => (
                     <Text key={file.id}>
                        <Text color="gray">{getFileChangeTypeIcon(file.type)}</Text> {file.path}
                    </Text>
                ))}
             </Box>
        </Box>
    );
};

const EventStreamItem = ({ transaction, isSelected, isExpanded }: { transaction: Transaction, isSelected: boolean, isExpanded: boolean }) => {
    const icon = getStatusIcon(transaction.status);
    const time = formatTimeAgo(transaction.timestamp).padEnd(5, ' ');
    const statusText = transaction.status.padEnd(11, ' ');
    const expandIcon = isExpanded ? '▾' : '▸';
    
    const messageNode = transaction.status === 'IN-PROGRESS'
        ? <Text color="cyan">{transaction.message}</Text>
        : transaction.message;
    
    const content = (
        <Text>
            {time} {expandIcon} {icon} {statusText}{' '}
            <Text color="gray">{transaction.hash}</Text>
            {' '}· {messageNode}
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
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
        expandedTransactionId,
    } = useDashboardScreen({ reservedRows: UI_CONFIG.dashboard.reservedRows });

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
            <ActionFooter actions={[
                { key: 'Enter', label: 'Confirm' },
                { key: 'Esc', label: 'Cancel' },
            ]}/>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const footerActions: ActionItem[] = [
            { key: '↑↓', label: 'Nav' },
            { key: '→/Ent', label: 'View' },
            { key: '←', label: 'Collapse' },
            { key: 'L', label: 'Log' },
            { key: 'A', label: 'Approve All' },
            { key: 'C', label: 'Commit' },
            { key: 'P', label: status === 'PAUSED' ? 'Resume' : 'Pause' },
            { key: 'Q', label: 'Quit' },
        ];
		return <ActionFooter actions={footerActions} />;
    };
    
    return (
        <Box flexDirection="column" height="100%">
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
                {transactions.length === 0 && (
                     <Box paddingLeft={2}><Text color="gray">Listening for changes... no events yet.</Text></Box>
                )}
                {transactions.slice(viewOffset, viewOffset + viewportHeight).map((tx, index) => {
                    const actualIndex = viewOffset + index;
                    const isExpanded = expandedTransactionId === tx.id;
                    return (
                        <React.Fragment key={tx.id}>
                            <EventStreamItem
                                transaction={tx}
                                isSelected={!isModal && actualIndex === selectedTransactionIndex}
                                isExpanded={isExpanded}
                            />
                            {isExpanded && <ExpandedEventInfo transaction={tx} />}
                        </React.Fragment>
                    );
                })}
            </Box>

            <Box marginTop={1}><Separator /></Box>
            {renderFooter()}
        </Box>
    );
};

export default DashboardScreen;
```

## File: src/hooks/useDebugMenu.tsx
```typescript
import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useInitStore } from '../stores/init.store';
import { useCommitStore } from '../stores/commit.store';
import { useCopyStore } from '../stores/copy.store';
import type { MenuItem } from '../types/debug.types';
import { useTransactionStore } from '../stores/transaction.store';
import { moveIndex } from '../stores/navigation.utils';
import { useViewport } from './useViewport';
export type { MenuItem } from '../types/debug.types';

const useDebugMenuActions = () => {
    const { actions: appActions } = useAppStore();
    const { actions: initActions } = useInitStore();
    const { actions: commitActions } = useCommitStore();
    const { actions: dashboardActions } = useDashboardStore();
    const { actions: reviewActions } = useReviewStore();
    const { actions: detailActions } = useDetailStore();
    const { actions: historyActions } = useHistoryStore();

    const menuItems: MenuItem[] = [
        {
            title: 'View Debug Log',
            action: () => useViewStore.getState().actions.setActiveOverlay('log'),
        },
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
                dashboardActions.startApproveAll();
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
            title: 'Dashboard: Expanded View',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                dashboardActions.setExpandedTransactionId('1');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.load('1');
                reviewActions.setBodyView('diff');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.load('1', { bodyView: 'reasoning' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '1');
                if (!tx) return;
                // On load, selected index is 0, so we can assume the first file.
                const selectedFile = tx.files && tx.files.length > 0
                    ? tx.files[0]
                    : undefined;
                useCopyStore.getState().actions.openForReview(tx, tx.files || [], selectedFile);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
                reviewActions.setBodyView('script_output');
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Repair (Navigable)',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair', selectedBulkRepairOptionIndex: 1 });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Instruct',
            action: () => {
                reviewActions.load('2'); // Load success case
                // Reject some files to enable the workflow
                reviewActions.toggleFileApproval('2-1');
                reviewActions.toggleFileApproval('2-2');
                reviewActions.showBulkInstruct();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.load('1', { bodyView: 'confirm_handoff' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => {
                reviewActions.load('2'); // Use tx '2' which has scripts
                appActions.showReviewProcessingScreen();
            },
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
                detailActions.load('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Copy Mode',
            action: () => {
                detailActions.load('3');
                appActions.showTransactionDetailScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '3');
                if (!tx) return;
                const selectedFile = tx.files?.[0];
                useCopyStore.getState().actions.openForDetail(tx, selectedFile);
            },
        },
        {
            title: 'Detail: Diff View (for File Open action)',
            action: () => {
                detailActions.load('3', {
                    focusedItemPath: 'FILES/3-1',
                    bodyView: 'DIFF_VIEW',
                    expandedItemPaths: new Set(['FILES']),
                });
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Revert Confirm',
            action: () => {
                detailActions.load('3', { bodyView: 'REVERT_CONFIRM' });
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
            title: 'History: L1 Drilldown (Content)',
            action: () => {
                historyActions.prepareDebugState('l1-drill-content');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Reasoning)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-reasoning');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (for File Open action)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-diff');
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
                appActions.showTransactionHistoryScreen();
                const { transactions } = useTransactionStore.getState();
                const { selectedForAction } = useHistoryStore.getState();
                const txsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));
                useCopyStore.getState().actions.openForHistory(txsToCopy);
            },
        },
        {
            title: 'History: Bulk Actions Mode',
            action: () => {
                historyActions.prepareDebugState('bulk');
                appActions.showTransactionHistoryScreen();
            },
        },
    ];
    return { menuItems };
};

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { menuItems } = useDebugMenuActions();

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: 6, // Header, 2 separators, footer
    });
    
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', menuItems.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', menuItems.length));
            return;
        }
        if (key.pageUp) {
            setSelectedIndex(i => Math.max(0, i - viewportHeight));
            return;
        }
        if (key.pageDown) {
            setSelectedIndex(i => Math.min(menuItems.length - 1, i + viewportHeight));
            return;
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                useViewStore.getState().actions.setActiveOverlay('none');
            }
            return;
        }
        if (key.escape) {
            useViewStore.getState().actions.setActiveOverlay('none');
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

    const menuItemsInView = menuItems.slice(viewOffset, viewOffset + viewportHeight);

    return {
        selectedIndex,
        menuItems: menuItemsInView,
        viewOffset,
        totalItems: menuItems.length,
    };
};
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';
import { useAppStore } from './app.store';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { ReviewService } from '../services/review.service';
import { moveIndex } from './navigation.utils';
import { INITIAL_APPLY_STEPS } from '../constants/review.constants';
import type { FileReviewStatus } from '../types/domain.types';

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}
export type ReviewBodyView = 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff' | 'bulk_instruct' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';
export type ApplyUpdate =
    | { type: 'UPDATE_STEP'; payload: { id: string; status: ApplyStep['status']; duration?: number; details?: string } }
    | { type: 'ADD_SUBSTEP'; payload: { parentId: string; substep: Omit<ApplyStep, 'substeps'> } };

interface ReviewState {
    patchStatus: PatchStatus;
    applySteps: ApplyStep[];
    selectedItemIndex: number;
    bodyView: ReviewBodyView;
    isDiffExpanded: boolean;
    reasoningScrollIndex: number;
    scriptErrorIndex: number;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string; details?: string }>;

    selectedBulkRepairOptionIndex: number;
    selectedBulkInstructOptionIndex: number;

    actions: {
        load: (transactionId: string, initialState?: Partial<Pick<ReviewState, 'bodyView' | 'selectedBulkRepairOptionIndex'>>) => void;
        moveSelectionUp: (listSize: number) => void;
        moveSelectionDown: (listSize: number) => void;
        expandDiff: () => void;
        toggleBodyView: (view: Extract<
            ReviewBodyView, 'bulk_instruct' |
            'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'
        >) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        startApplySimulation: (scenario: 'success' | 'failure') => void;
        tryRepairFile: (fileId: string) => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        tryInstruct: (fileId: string) => void;
        showBulkInstruct: () => void;
        executeBulkInstructOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;
        scrollReasoningUp: () => void;
        scrollReasoningDown: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;
        updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
        updateFileReviewStatus: (fileId: string, status: FileReviewStatus, error?: string, details?: string) => void;
        toggleFileApproval: (fileId: string) => void;
        rejectAllFiles: () => void;
        navigateBulkRepairUp: () => void;
        navigateBulkRepairDown: () => void;
        navigateBulkInstructUp: () => void;
        navigateBulkInstructDown: () => void;
    };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    patchStatus: 'SUCCESS',
    applySteps: INITIAL_APPLY_STEPS,
    selectedItemIndex: 0,
    bodyView: 'none',
    isDiffExpanded: false,
    reasoningScrollIndex: 0,
    scriptErrorIndex: 0,
    fileReviewStates: new Map(),
    selectedBulkRepairOptionIndex: 0,
    selectedBulkInstructOptionIndex: 0,

    actions: {
        load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;
            
            const { patchStatus, fileReviewStates } = ReviewService.prepareTransactionForReview(transaction);

            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                patchStatus,
                fileReviewStates,
                selectedItemIndex: 0,
                bodyView: initialState?.bodyView ?? 'none',
                isDiffExpanded: false,
                reasoningScrollIndex: 0,
                scriptErrorIndex: 0,
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
                selectedBulkRepairOptionIndex: 0,
                selectedBulkInstructOptionIndex: 0,
                ...initialState,
            });
        },
        moveSelectionUp: (listSize) => set(state => {
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'up', listSize) };
        }),
        moveSelectionDown: (listSize) => set(state => {
            return { selectedItemIndex: moveIndex(state.selectedItemIndex, 'down', listSize) };
        }),
        toggleBodyView: (view) => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.selectedItemIndex >= files.length) return {};
            return {
                bodyView: state.bodyView === view ? 'none' : view,
                isDiffExpanded: false,
            };
        }),
        setBodyView: (view) => set({ bodyView: view }),
        expandDiff: () => set(state => ({ isDiffExpanded: !state.isDiffExpanded })),
        approve: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (selectedTransactionId) {
                useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'APPLIED');
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        startApplySimulation: async (scenario) => {
            const { showReviewProcessingScreen } = useAppStore.getState().actions;
            const { updateApplyStep, addApplySubstep } = get().actions;
            set({ applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)) });
            showReviewProcessingScreen();
            const simulationGenerator = ReviewService.runApplySimulation(scenario);
            for await (const update of simulationGenerator) {
                if (update.type === 'UPDATE_STEP') {
                    updateApplyStep(
                        update.payload.id,
                        update.payload.status,
                        update.payload.duration,
                        update.payload.details,
                    );
                } else if (update.type === 'ADD_SUBSTEP') {
                    addApplySubstep(update.payload.parentId, update.payload.substep);
                }
            }
            // Transition back to review screen is handled by the processing screen component or a separate flow
            // For this simulation, we'll assume it transitions back, but the action itself doesn't need to do it.
            // This avoids a direct dependency from the store to app-level navigation.
        },
        tryRepairFile: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!file) return;

            const { status, error } = fileReviewStates.get(file.id) || {};
            if (status !== 'FAILED') return;
            
            ReviewService.tryRepairFile(file, error);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING');
        },
        tryInstruct: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!tx || !file) return;

            const { status } = fileReviewStates.get(file.id) || {};
            if (status !== 'REJECTED') return;
            
            ReviewService.tryInstructFile(file, tx);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING', undefined, 'Instruction prompt copied!');
        },
        showBulkInstruct: () => get().actions.setBodyView('bulk_instruct'),
        executeBulkInstructOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const rejectedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'REJECTED');
            if (rejectedFiles.length === 0) {
                set({ bodyView: 'none' });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkInstructPrompt(rejectedFiles, tx);
                    set({ bodyView: 'none' });
                    break;
                case 2:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 3:
                    rejectedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'APPROVED');
                    });
                    set({ bodyView: 'none' });
                    break;
                default:
                    set({ bodyView: 'none' });
            }
        },

        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const failedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'FAILED');
            if (failedFiles.length === 0) {
                set({ bodyView: 'none' });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkRepairPrompt(failedFiles);
                    set({ bodyView: 'none' });
                    break;
                case 2: {
                    set({ bodyView: 'none' });
                    failedFiles.forEach(f => get().actions.updateFileReviewStatus(f.id, 'RE_APPLYING'));
                    const results = await ReviewService.runBulkReapply(failedFiles);
                    results.forEach(result =>
                        get().actions.updateFileReviewStatus(
                            result.id, result.status, result.error,
                        ),
                    );
                    break;
                }
                case 3:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 4:
                    failedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'REJECTED');
                    });
                    set({ bodyView: 'none' });
                    break;
                default:
                    set({ bodyView: 'none' });
            }
        },
        confirmHandoff: () => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.files) return;
            const { fileReviewStates } = get();
            ReviewService.generateHandoffPrompt(tx, fileReviewStates);
            ReviewService.performHandoff(tx.hash);
        },
        scrollReasoningUp: () => set(state => ({ reasoningScrollIndex: Math.max(0, state.reasoningScrollIndex - 1) })),
        scrollReasoningDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.reasoning) return {};
            const maxLines = tx.reasoning.split('\n').length;
            return { reasoningScrollIndex: Math.min(maxLines - 1, state.reasoningScrollIndex + 1) };
        }),
        navigateScriptErrorUp: () => set(state => ({ scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1) })),
        navigateScriptErrorDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.scripts || !tx?.files) return {};
            const selectedScript = tx.scripts[state.selectedItemIndex - tx.files.length];
            if (selectedScript?.output) {
                const errorLines = selectedScript.output
                    .split('\n')
                    .filter(line => line.includes('Error') || line.includes('Warning'));
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),
        updateApplyStep: (id, status, duration, details) => {
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
        addApplySubstep: (parentId, substep) => {
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
        updateFileReviewStatus: (fileId, status, error, details) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                newStates.set(fileId, { status, error, details });
                return { fileReviewStates: newStates };
            });
        },
        toggleFileApproval: (fileId) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                const current = newStates.get(fileId);
                if (current) {
                    const newStatus: FileReviewStatus = current.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                    newStates.set(fileId, { status: newStatus, error: undefined, details: undefined });
                }
                return { fileReviewStates: newStates };
            });
        },
        rejectAllFiles: () => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                for (const [fileId, reviewState] of newStates.entries()) {
                    if (reviewState.status === 'APPROVED') {
                        newStates.set(fileId, { status: 'REJECTED', error: undefined, details: undefined });
                    }
                }
                return { fileReviewStates: newStates };
            });
        },
        navigateBulkRepairUp: () => set(state => ({
            selectedBulkRepairOptionIndex: moveIndex(state.selectedBulkRepairOptionIndex, 'up', 4),
        })),
        navigateBulkRepairDown: () => set(state => ({
            selectedBulkRepairOptionIndex: moveIndex(state.selectedBulkRepairOptionIndex, 'down', 4),
        })),
        navigateBulkInstructUp: () => set(state => ({
            selectedBulkInstructOptionIndex: moveIndex(state.selectedBulkInstructOptionIndex, 'up', 4),
        })),
        navigateBulkInstructDown: () => set(state => ({
            selectedBulkInstructOptionIndex: moveIndex(state.selectedBulkInstructOptionIndex, 'down', 4),
        })),
    },
}));
```
