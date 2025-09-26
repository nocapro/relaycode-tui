import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import type { Transaction, TransactionStatus } from '../types/domain.types';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import { UI_CONFIG } from '../config/ui.config'; //
import ActionFooter from './ActionFooter';
import { DASHBOARD_FOOTER_ACTIONS, DASHBOARD_STATUS } from '../constants/dashboard.constants';
import { TRANSACTION_STATUS_UI, FILE_TYPE_MAP } from '../constants/history.constants';

// --- Sub-components & Helpers ---

const getStatusIcon = (status: TransactionStatus) => {
    if (status === 'IN-PROGRESS') return <Spinner type="dots" />;
    const ui = TRANSACTION_STATUS_UI[status as keyof typeof TRANSACTION_STATUS_UI];
    if (!ui) return <Text> </Text>;
    return <Text color={ui.color}>{ui.text.split(' ')[0]}</Text>;
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
                        <Text color="gray">{FILE_TYPE_MAP[file.type]}</Text> {file.path}
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

    if (isSelected) {
        return <Text bold color="cyan">{'> '}{content}</Text>;
    }

    return <Text>{'  '}{content}</Text>;
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
    } = useDashboardScreen({
        layoutConfig: UI_CONFIG.layout.dashboard,
    });

    const renderStatusBar = () => {
        let statusText: string;
        let statusIcon: React.ReactNode;
        switch (status) {
            case DASHBOARD_STATUS.LISTENING: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; break;
            case DASHBOARD_STATUS.PAUSED: statusText = 'PAUSED'; statusIcon = <Text color="yellow">||</Text>; break;
            case DASHBOARD_STATUS.APPROVING: statusText = 'APPROVING...'; statusIcon = <Text color="cyan"><Spinner type="dots"/></Text>; break;
            default: statusText = 'LISTENING'; statusIcon = <Text color="green">●</Text>; //
        }

        let approvalStr: React.ReactNode = String(pendingApprovals).padStart(2, '0');
        const commitStr: React.ReactNode = String(pendingCommits).padStart(2, '0');

        if (status === DASHBOARD_STATUS.APPROVING) approvalStr = <Text color="cyan">(<Spinner type="dots"/>)</Text>;
        if (status === DASHBOARD_STATUS.CONFIRM_APPROVE) {
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
            <ActionFooter actions={DASHBOARD_FOOTER_ACTIONS.MODAL}/>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

		return <ActionFooter actions={DASHBOARD_FOOTER_ACTIONS.STANDARD(status)} />;
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