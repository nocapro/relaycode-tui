import React from 'react';
import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';
import type { FileChangeType } from '../types/domain.types';

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
        navigatorFocus, expandedSection, selectedFileIndex, bodyView,
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