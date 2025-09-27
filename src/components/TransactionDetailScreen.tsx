import { Box, Text } from 'ink';
import ContentView from './ContentView';
import type { FileChangeType } from '../types/domain.types';
import { useTransactionDetailScreen } from '../hooks/useTransactionDetailScreen';
import { DETAIL_BODY_VIEWS, DETAIL_FOOTER_ACTIONS } from '../constants/detail.constants';
import ActionFooter from './ActionFooter';
import { FILE_CHANGE_ICONS } from '../constants/ui.constants';
import ScreenLayout from './layout/ScreenLayout';

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

const typeColor = (type: FileChangeType) => {
    switch (type) {
        case 'ADD': return 'green';
        case 'DEL': return 'red';
        case 'REN': return 'yellow';
        default: return 'white';
    }
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
                    {isPromptExpanded ? '▾' : '▸'} (<Text color="cyan" bold>P</Text>)rompt
                </Text>
                <Text color={isReasoningFocused ? 'cyan' : undefined}>
                    {isReasoningFocused ? '> ' : '  '}
                    {isReasoningExpanded ? '▾' : '▸'} (<Text color="cyan" bold>R</Text>)easoning{' '}
                    ({transaction.reasoning?.split('\n\n').length || 0} steps)
                </Text>
                <Text color={isFilesFocused ? 'cyan' : undefined}>
                    {isFilesFocused && !focusedItemPath.includes('/') ? '> ' : '  '}
                    {isFilesExpanded ? '▾' : '▸'} (<Text color="cyan" bold>F</Text>)iles ({files.length})
                </Text>
                {isFilesExpanded && (
                    <Box flexDirection="column" paddingLeft={2}>
                        {files.map((file) => {
                             const fileId = `FILES/${file.id}`;
                             const isFileSelected = focusedItemPath === fileId;
                             const stats = file.type === 'DEL' ? ''
                                : ` (+${file.linesAdded}/-${file.linesRemoved})`;
                             return (
                                <Text key={file.id} color={isFileSelected ? 'cyan' : undefined}>
                                    {isFileSelected ? '> ' : '  '}
                                    {FILE_CHANGE_ICONS[file.type]} <Text color={typeColor(file.type)}>{file.path}</Text>{stats}
                                </Text>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    const renderBody = () => {
        if (bodyView === DETAIL_BODY_VIEWS.NONE) {
            return <Text color="gray">(Press → to expand a section and view its contents)</Text>;
        }
        if (bodyView === DETAIL_BODY_VIEWS.PROMPT) {
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
        if (bodyView === DETAIL_BODY_VIEWS.REASONING) {
            if (!transaction.reasoning) return <Text color="gray">No reasoning provided.</Text>;
            return <ContentView title="REASONING" content={transaction.reasoning} scrollIndex={contentScrollIndex} maxHeight={Math.max(1, availableBodyHeight)} />;
        }
        if (bodyView === DETAIL_BODY_VIEWS.FILES_LIST) {
             return <Text color="gray">(Select a file and press → to view the diff)</Text>;
        }
        if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
            const fileId = focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            if (!file) return null;
            return <ContentView
                title={`DIFF: ${file.path}`}
                content={file.diff}
                highlight='diff'
                isExpanded={true}
                scrollIndex={contentScrollIndex}
                maxHeight={Math.max(1, availableBodyHeight)}
            />;
        }
        return null;
    };

    const renderFooter = () => {
        if (bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM) {
            return <ActionFooter actions={DETAIL_FOOTER_ACTIONS.REVERT_CONFIRM} />;
        }
        
        const isFileFocused = focusedItemPath.includes('/');
        const openActionLabel = isFileFocused ? 'Open File' : 'Open YAML';
        const isRevertable = ['APPLIED', 'FAILED'].includes(transaction.status);
        const baseActions = DETAIL_FOOTER_ACTIONS.BASE({
            openActionLabel,
            isRevertable,
        });

        if (isFileFocused) { // Is a file
            if (bodyView === DETAIL_BODY_VIEWS.DIFF_VIEW) {
                return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.DIFF_VIEW, ...baseActions]} />;
            } else {
                const actions = [...DETAIL_FOOTER_ACTIONS.FILE_LIST_VIEW, ...baseActions];
                return <ActionFooter actions={actions} />;
            }
        }
        
        if (expandedItemPaths.has(focusedItemPath)) {
            return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.SECTION_EXPANDED, ...baseActions]} />;
        }
        return <ActionFooter actions={[...DETAIL_FOOTER_ACTIONS.SECTION_COLLAPSED, ...baseActions]} />;
    };

    const { message, timestamp, status } = transaction;
    const date = new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
    const fileStats = `${files.length} Files · +${files.reduce((a, f) => a + f.linesAdded, 0)} lines, -${files.reduce((a, f) => a + f.linesRemoved, 0)} lines`;

    return (
        <ScreenLayout
            title="TRANSACTION DETAILS"
            footer={renderFooter()}
        >
            {/* Modal takeover for Revert */}
            {bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM && <RevertModal transactionHash={transaction.hash} />}

            {/* Main view */}
            <Box flexDirection="column" display={bodyView === DETAIL_BODY_VIEWS.REVERT_CONFIRM ? 'none' : 'flex'}>
                <Box flexDirection="column">
                    <Text><Text color="gray">UUID:</Text> {transaction.id}</Text>
                    <Text><Text color="gray">Git:</Text> {message}</Text>
                    <Text><Text color="gray">Date:</Text> {date} · <Text color="gray">Status:</Text> {status}</Text>
                    <Text><Text color="gray">Stats:</Text> {fileStats}</Text>
                </Box>

                <Box marginY={1}>
                    {renderNavigator()}
                </Box>

                {/* Body */}
                <Box marginY={1}>
                    {renderBody()}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default TransactionDetailScreen;