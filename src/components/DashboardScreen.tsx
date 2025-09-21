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
            {time} {icon} {statusText} <Text color="gray">{transaction.hash}</Text> · {message}
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
        if (isModal) return (
            <Text>
                ({chalk.cyan.bold('Enter')}) Confirm      ({chalk.cyan.bold('Esc')}) Cancel
            </Text>
        );
        if (isProcessing) return <Text>Processing... This may take a moment.</Text>;

        const pauseAction = status === 'PAUSED' ? `(${chalk.cyan.bold('R')})esume` : `(${chalk.cyan.bold('P')})ause`;;
        return <Text color="gray">
            ({chalk.cyan.bold('↑↓')}) Nav · ({chalk.cyan.bold('Enter')}) Review · ({chalk.cyan.bold('A')})pprove All · ({chalk.cyan.bold('C')})ommit All · {pauseAction} · ({chalk.cyan.bold('Q')})uit
        </Text>
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