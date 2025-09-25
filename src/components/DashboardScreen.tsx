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
            {time} {expandIcon} {icon} {statusText} <Text color="gray">{transaction.hash}</Text> · {messageNode}
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