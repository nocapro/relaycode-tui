import { useMemo } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import type { Transaction, FileItem } from '../types/domain.types';
import { useTransactionHistoryScreen } from '../hooks/useTransactionHistoryScreen';
import { HISTORY_FOOTER_ACTIONS, BULK_ACTIONS_OPTIONS, HISTORY_VIEW_MODES } from '../constants/history.constants';
import ActionFooter from './ActionFooter';
import ScreenLayout from './layout/ScreenLayout';
import { TRANSACTION_STATUS_UI, FILE_CHANGE_ICONS } from '../constants/ui.constants';

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

    return (
        <Box flexDirection="column" paddingLeft={6}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}{' '}
                {icon} {FILE_CHANGE_ICONS[file.type]} {file.path}
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
    const uiStatus = TRANSACTION_STATUS_UI[tx.status as keyof typeof TRANSACTION_STATUS_UI] || { text: tx.status, color: 'white' };

    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    const selectionIndicator = isSelectedForAction ? '[x] ' : '[ ] ';
    
    return (
        <Box flexDirection="column" marginBottom={isExpanded ? 1 : 0}>
            <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '> ' : '  '}
                {hasSelection && selectionIndicator}
                {icon} <Text color={uiStatus.color}>{uiStatus.text}</Text> · <Text color="gray">{tx.hash}</Text> · {date} ·{' '}
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
            {BULK_ACTIONS_OPTIONS.map(opt => <Text key={opt}>{opt}</Text>)}
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
    } = useTransactionHistoryScreen();

    const transactionsById = useMemo(() => new Map(transactions.map(tx => [tx.id, tx])), [transactions]);

    const renderFooter = () => {
        if (mode === HISTORY_VIEW_MODES.FILTER) {
            return <ActionFooter actions={HISTORY_FOOTER_ACTIONS.FILTER_MODE} />;
        }
        if (mode === HISTORY_VIEW_MODES.BULK_ACTIONS) {
            return <Text>{HISTORY_FOOTER_ACTIONS.BULK_MODE.text}</Text>;
        }
        
        const openActionLabel = selectedItemPath.includes('/file/') ? 'Open File' : 'Open YAML';
        return (
            <ActionFooter actions={HISTORY_FOOTER_ACTIONS.LIST_MODE(openActionLabel, hasSelection)} />
        );
    };

    return (
        <ScreenLayout title="▲ relaycode · TRANSACTION HISTORY" footer={renderFooter()}>
            <Box>
                <Text>Filter: </Text>
                {mode === HISTORY_VIEW_MODES.FILTER ? (
                    <TextInput value={filterQuery} onChange={actions.setFilterQuery} />
                ) : (
                    <Text>{filterStatus}</Text>
                )}
                <Text> · {showingStatus}</Text>
                {statsStatus && <Text> · <Text color="magenta">{statsStatus}</Text></Text>}
            </Box>

            <Box flexDirection="column" marginY={1}>
                {mode === HISTORY_VIEW_MODES.BULK_ACTIONS && <BulkActionsMode selectedForActionCount={selectedForAction.size} />}

                {mode === HISTORY_VIEW_MODES.LIST && itemsInView.map(path => {
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
        </ScreenLayout>
    );
};

export default TransactionHistoryScreen;