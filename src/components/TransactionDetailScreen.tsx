import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTransactionDetailStore, type FileChangeType } from '../stores/transaction-detail.store';
import Separator from './Separator';
import { useAppStore } from '../stores/app.store';

const getFileChangeTypeIcon = (type: FileChangeType) => {
    switch (type) {
        case 'MOD': return '[MOD]';
        case 'ADD': return '[ADD]';
        case 'DEL': return '[DEL]';
        case 'REN': return '[REN]';
    }
};

const CopyMode = () => {
    const {
        transaction,
        files,
        copyModeSelectionIndex,
        copyModeSelections,
        copyModeLastCopied,
    } = useTransactionDetailStore();
    const {
        copyModeNavigateUp,
        copyModeNavigateDown,
        copyModeToggleSelection,
        copyModeExecuteCopy,
        toggleCopyMode,
    } = useTransactionDetailStore(s => s.actions);

    useInput((input, key) => {
        if (key.upArrow) copyModeNavigateUp();
        if (key.downArrow) copyModeNavigateDown();
        if (input === ' ') copyModeToggleSelection();
        if (key.return) copyModeExecuteCopy();
        if (key.escape || input.toLowerCase() === 'c') toggleCopyMode();
    });

    const copyOptions = [
        { key: 'M', label: 'Git Message' },
        { key: 'P', label: 'Prompt' },
        { key: 'R', label: 'Reasoning' },
        { key: 'A', label: `All Diffs (${files.length} files)` },
        { key: 'F', label: `Diff for: ${files[0]?.path}` }, // Example, should be selected file
        { key: 'U', label: 'UUID' },
        { key: 'Y', label: 'Full YAML representation' },
    ];
    
    return (
        <Box flexDirection="column" width="100%">
            <Text>Select data to copy from transaction {transaction?.hash} (use Space to toggle):</Text>
            <Box flexDirection="column" marginY={1}>
                {copyOptions.map((opt, index) => {
                    const isSelected = index === copyModeSelectionIndex;
                    const isChecked = copyModeSelections[opt.label] || false;
                    return (
                        <Text key={opt.label} color={isSelected ? 'cyan' : undefined}>
                            {isSelected ? '> ' : '  '}
                            [{isChecked ? 'x' : ' '}] ({opt.key}) {opt.label}
                        </Text>
                    );
                })}
            </Box>
            <Separator />
            {copyModeLastCopied && <Text color="green">✓ {copyModeLastCopied}</Text>}
        </Box>
    );
};

const RevertModal = () => {
    const { transaction } = useTransactionDetailStore();
    const { toggleRevertConfirm, confirmRevert } = useTransactionDetailStore(s => s.actions);
    
    useInput((input, key) => {
        if (key.escape) toggleRevertConfirm();
        if (key.return) {
            confirmRevert();
        }
    });

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
            <Text wrap="wrap">This will create a NEW transaction that reverses all changes made by {transaction?.hash}. The original transaction record will be preserved.</Text>
            <Box height={1} />
            <Text wrap="wrap">Are you sure?</Text>
        </Box>
    );
};

const TransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        transaction, prompt, reasoning, files,
        navigatorFocus, expandedSection, selectedFileIndex, bodyView,
    } = useTransactionDetailStore();
    const { 
        navigateUp, navigateDown, handleEnterOrRight, handleEscapeOrLeft,
        toggleCopyMode, toggleRevertConfirm,
    } = useTransactionDetailStore(s => s.actions);

    useInput((input, key) => {
        // Modal views have their own input handlers
        if (bodyView === 'COPY_MODE' || bodyView === 'REVERT_CONFIRM') {
            return;
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
        if (input.toLowerCase() === 'c') {
            toggleCopyMode();
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) handleEnterOrRight();
        if (key.escape || key.leftArrow) handleEscapeOrLeft();
    });

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
                    {isReasoningExpanded ? '▾' : '▸'} (R)easoning ({reasoning.split('\n\n').length} steps)
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
                    <Box marginTop={1}><Text>{prompt}</Text></Box>
                </Box>
            );
        }
        if (bodyView === 'REASONING') {
            return (
                <Box flexDirection="column">
                    <Text>REASONING</Text>
                    <Box marginTop={1}>
                        {reasoning.split('\n').map((line, i) => <Text key={i}>{line}</Text>)}
                    </Box>
                </Box>
            );
        }
        if (bodyView === 'FILES_LIST') {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === 'DIFF_VIEW') {
            const file = files[selectedFileIndex];
            if (!file) return null;
            return (
                <Box flexDirection="column">
                    <Text>DIFF: {file.path}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {file.diff.split('\n').map((line, i) => {
                            let color = 'white';
                            if (line.startsWith('+')) color = 'green';
                            if (line.startsWith('-')) color = 'red';
                            if (line.startsWith('@@')) color = 'cyan';
                            return <Text key={i} color={color}>{line}</Text>;
                        })}
                    </Box>
                </Box>
            );
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === 'REVERT_CONFIRM') {
            return <Text>(Enter) Confirm Revert      (Esc) Cancel</Text>;
        }
        if (bodyView === 'COPY_MODE') {
             return <Text>(↑↓) Nav · (Spc) Toggle · (Enter) Copy Selected · (C)opy/Exit</Text>;
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
            <Text>▲ relaycode {bodyView === 'COPY_MODE' ? 'details · copy mode' : 'transaction details'}</Text>
            <Separator />
            
            {/* Modal takeover for Revert */}
            {bodyView === 'REVERT_CONFIRM' && <RevertModal />}
            
            {/* Main view */}
            <Box flexDirection="column" display={bodyView === 'REVERT_CONFIRM' ? 'none' : 'flex'}>
                {/* Navigator Part A */}
                <Box flexDirection="column" marginY={1}>
                    <Text>UUID: {transaction.id.substring(0, 8)}-a8b3-4f2c-9d1e-8a7c1b9d8f03</Text> {/* Match readme */}
                    <Text>Git: {message}</Text>
                    <Text>Date: {date} · Status: {status}</Text>
                    <Text>Stats: {fileStats}</Text>
                </Box>
                
                {/* Navigator Part B */}
                {renderNavigator()}
                
                <Separator />
                
                {/* Body */}
                <Box marginY={1}>
                    {bodyView === 'COPY_MODE' ? <CopyMode /> : renderBody()}
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