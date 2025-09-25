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