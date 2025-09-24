import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { type FileChange } from '../stores/transaction-history.store';
import type { Transaction } from '../types/transaction.types';
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
                    {tx.stats && <Text color="gray">Stats: {tx.stats.files} files, +{tx.stats.linesAdded}/-{tx.stats.linesRemoved}</Text>}
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

                {store.mode === 'LIST' && store.transactions.map(tx => {
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