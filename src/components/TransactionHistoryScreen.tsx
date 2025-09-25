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
        
        const footerActions: ActionItem[] = [
            { key: '↑↓', label: 'Nav' },
            { key: '→', label: 'Expand' },
            { key: '←', label: 'Collapse' },
            { key: 'Spc', label: 'Select' },
            { key: 'Ent', label: 'Details' },
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