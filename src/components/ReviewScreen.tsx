import { Box, Text } from 'ink';
import ContentView from './ContentView';
import type { ScriptResult, FileItem, FileChangeType } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';
import { REVIEW_BODY_VIEWS, REVIEW_FOOTER_ACTIONS, BULK_REPAIR_OPTIONS, BULK_INSTRUCT_OPTIONS } from '../constants/review.constants';
import ActionFooter from './ActionFooter';
import { FILE_STATUS_UI } from '../constants/ui.constants';
import ScreenLayout from './layout/ScreenLayout';

// --- Sub-components ---

const FileItemRow = ({ file, reviewState, isFocused }: {
    file: FileItem;
    reviewState: { status: string; error?: string; details?: string };
    isFocused: boolean;
}) => {
    const ui = FILE_STATUS_UI[reviewState.status as keyof typeof FILE_STATUS_UI] || { icon: '[?]', color: 'gray' };

    const typeColor = (type: FileChangeType) => {
        switch (type) {
            case 'ADD': return 'green';
            case 'DEL': return 'red';
            case 'REN': return 'yellow';
            default: return 'white';
        }
    };

    const diffStats = <Text>(+<Text color="green">{file.linesAdded}</Text>/-<Text color="red">{file.linesRemoved}</Text>)</Text>;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isFocused ? '> ' : '  ';
    const colorProps = isFocused ? { bold: true, color: 'cyan' } : {};

    if (reviewState.status === 'FAILED') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} FAILED {file.path}</Text>
                    <Text color="red">    ({reviewState.error})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewState.status === 'AWAITING') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    ({reviewState.details})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewState.status === 'RE_APPLYING') {
        return (
             <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={ui.color}>{ui.icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text {...colorProps}>
                {prefix}<Text color={ui.color}>{ui.icon}</Text> {file.type}{' '}
                <Text color={typeColor(file.type)}>{file.path}</Text>{' '}
                {diffStats} [{strategy}]
            </Text>
        </Box>
    );
};

const ScriptItemRow = ({
    script,
    isSelected,
    isExpanded,
}: {
    script: ScriptResult;
    isSelected: boolean;
    isExpanded: boolean;
}) => {
    const icon = script.success ? '✓' : '✗';
    const iconColor = script.success ? 'green' : 'red';
    const arrow = isExpanded ? '▾' : '▸';
    const prefix = isSelected ? '> ' : '  ';
    
    // Extract script type from command (e.g., "bun run test" -> "Post-Command", "bun run lint" -> "Linter")
    const scriptType = script.command.includes('test') ? 'Post-Command' : 
                      script.command.includes('lint') ? 'Linter' : 
                      'Script';

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> {scriptType}: `{script.command}` ({script.duration}s) {arrow}{' '}
                {script.summary}
            </Text>
        </Box>
    );
};

// --- Main Component ---

const ReviewScreen = () => {
    const {
        transaction,
        files,
        scripts = [],
        patchStatus,
        selectedItemIndex,
        bodyView,
        scriptErrorIndex,
        fileReviewStates,
        numFiles,
        approvedFilesCount,
        totalLinesAdded,
        totalLinesRemoved,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        navigableItems,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex,
        availableBodyHeight,
        hasRejectedFiles,
    } = useReviewScreen();

    if (!transaction) {
        return <Text>Loading review...</Text>;
    }
    const { hash, message, prompt = '', reasoning = '' } = transaction;

    const renderBody = () => {
        if (bodyView === REVIEW_BODY_VIEWS.NONE) return null;

        if (bodyView === REVIEW_BODY_VIEWS.COMMIT_MESSAGE) {
            const messageText = message || '';
            return (
                <Box flexDirection="column">
                    <ContentView
                        title="COMMIT MESSAGE"
                        content={messageText}
                        scrollIndex={contentScrollIndex}
                        maxHeight={Math.max(1, availableBodyHeight)}
                    />
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.PROMPT) {
            const promptText = prompt || '';
            return (
                <Box flexDirection="column">
                    <ContentView
                        title="PROMPT"
                        content={promptText}
                        scrollIndex={contentScrollIndex}
                        maxHeight={Math.max(1, availableBodyHeight)}
                    />
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.REASONING) {
            const reasoningText = reasoning || '';
            const reasoningLinesCount = reasoningText.split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ContentView
                        title="REASONING"
                        content={reasoningText}
                        scrollIndex={contentScrollIndex}
                        maxHeight={Math.max(1, availableBodyHeight)}
                    />
                    {reasoningLinesCount > visibleLinesCount && (
                        <Text color="gray">
                            Showing lines {contentScrollIndex + 1}-{Math.min(contentScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
                            of {reasoningLinesCount}
                        </Text>
                    )}
                </Box>
            );
        }
        
        if (bodyView === REVIEW_BODY_VIEWS.DIFF) {
            const currentItem = navigableItems[selectedItemIndex];
            const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
            if (!selectedFile) return null;
            return (
                <ContentView
                    title={`DIFF: ${selectedFile.path}`}
                    content={selectedFile.diff}
                    highlight="diff"
                    isExpanded={true}
                    scrollIndex={contentScrollIndex}
                />
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT) {
             const currentItem = navigableItems[selectedItemIndex];
             const scriptItems = navigableItems.filter((i): i is { type: 'script'; id: string } => i.type === 'script');
             const scriptIndex = currentItem?.type === 'script'
                ? scriptItems.findIndex(i => i.id === currentItem.id)
                : -1;
             const selectedScript = scripts[scriptIndex] || null;
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter((line: string) =>
                line.includes('Error') || line.includes('Warning'),
             );
             
             return (
                <Box flexDirection="column">
                    <Text>
                        {selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`
                    </Text>
                    <Box marginTop={1} flexDirection="column">
                        {outputLines.map((line: string, index: number) => {
                            const isError = line.includes('Error');
                            const isWarning = line.includes('Warning');
                            const isHighlighted = errorLines[scriptErrorIndex] === line;
                            
                            return (
                                <Text 
                                    key={index} 
                                    color={isError ? 'red' : isWarning ? 'yellow' : undefined}
                                    bold={isHighlighted}
                                    backgroundColor={isHighlighted ? 'blue' : undefined}
                                >
                                    {line}
                                </Text>
                            );
                        })}
                    </Box>
                    {errorLines.length > 0 && (
                        <Text color="gray">
                            Error {scriptErrorIndex + 1} of {errorLines.length} highlighted
                        </Text>
                    )}
                </Box>
             );
        }

        if (bodyView === REVIEW_BODY_VIEWS.CONFIRM_HANDOFF) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>HANDOFF TO EXTERNAL AGENT</Text>
                    <Box flexDirection="column">
                        <Text>This action will:</Text>
                        <Text>1. Copy a detailed prompt to your clipboard for an agentic AI.</Text>
                        <Text>2. Mark the current transaction as &apos;Handoff&apos; and close this review.</Text>
                        <Text>3. Assume that you and the external agent will complete the work.</Text>
                    </Box>
                    <Text>Relaycode will NOT wait for a new patch. This is a final action.</Text>
                    <Text bold color="yellow">Are you sure you want to proceed?</Text>
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.BULK_REPAIR) {
            const failedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'FAILED');

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK REPAIR ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {failedFiles.length} files failed to apply:</Text>
                        {failedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>

                    <Text>How would you like to proceed?</Text>

                    <Box flexDirection="column">
                        {BULK_REPAIR_OPTIONS.map((opt, i) => (
                            <Text key={i} color={selectedBulkRepairOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkRepairOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (bodyView === REVIEW_BODY_VIEWS.BULK_INSTRUCT) {
            const rejectedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'REJECTED');

            return (
                <Box flexDirection="column" gap={1}>
                    <Text bold>BULK INSTRUCTION ACTION</Text>

                    <Box flexDirection="column">
                        <Text>The following {rejectedFiles.length} files were rejected:</Text>
                        {rejectedFiles.map((file: FileItem) => (
                            <Text key={file.id}>- {file.path}</Text>
                        ))}
                    </Box>
                    <Box flexDirection="column" marginTop={1}>
                        {BULK_INSTRUCT_OPTIONS.map((opt, i) => (
                            <Text key={i} color={selectedBulkInstructOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkInstructOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        switch (bodyView) {
            case REVIEW_BODY_VIEWS.COMMIT_MESSAGE:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.COMMIT_MESSAGE_VIEW}/>;
            case REVIEW_BODY_VIEWS.PROMPT:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.PROMPT_VIEW} />;
            case REVIEW_BODY_VIEWS.DIFF:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.DIFF_VIEW}/>;
            case REVIEW_BODY_VIEWS.REASONING:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.REASONING_VIEW}/>;
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.SCRIPT_OUTPUT_VIEW}/>;
            case REVIEW_BODY_VIEWS.BULK_REPAIR:
                return <Text>{REVIEW_FOOTER_ACTIONS.BULK_REPAIR_VIEW.text}</Text>;
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT:
                return <Text>{REVIEW_FOOTER_ACTIONS.BULK_INSTRUCT_VIEW.text}</Text>;
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF:
                return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.HANDOFF_CONFIRM_VIEW}/>;
        }

        // Dynamic Main footer
        const currentItem = navigableItems[selectedItemIndex];
        const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
        const fileState = currentItem?.type === 'file' ? fileReviewStates.get(currentItem.id) : undefined;

        const footerConfig = {
            isFileSelected: currentItem?.type === 'file',
            fileStatus: fileState?.status as 'FAILED' | 'REJECTED' | 'OTHER' | undefined,
            currentItemType: currentItem?.type as 'file' | 'script' | 'reasoning' | 'prompt' | undefined,
            hasFailedFiles,
            hasRejectedFiles,
            hasApprovedFiles: approvedFilesCount > 0,
        };
        return <ActionFooter actions={REVIEW_FOOTER_ACTIONS.MAIN_VIEW(footerConfig)} />;
    };

    return (
        <ScreenLayout title="REVIEW" footer={renderFooter()}>
            {/* Navigator Section */}
            <Box flexDirection="column" marginY={1}>
                <Box flexDirection="column">
                    <Text>{hash} · {message}</Text>
                    <Box>
                        <Text>
                            (<Text color="green">+{totalLinesAdded}</Text>/<Text color="red">-{totalLinesRemoved}</Text>)
                            {' '}| {numFiles} Files · ({approvedFilesCount}/{numFiles} Appr)
                            {' '}| Showing {viewOffset + 1}-
                            {Math.min(viewOffset + navigableItemsInView.length, navigableItems.length)}{' '}
                            of {navigableItems.length}
                        </Text>
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && (
                            <Text> · Scripts: SKIPPED</Text>
                        )}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Box>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'commit_message' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'commit_message' ? '> ' : '  '}
                        (M)essage {bodyView === REVIEW_BODY_VIEWS.COMMIT_MESSAGE ? '▾' : '▸'}{' '}
                        {(message || '').substring(0, 50)}...
                    </Text>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'prompt' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'prompt' ? '> ' : '  '}
                        (P)rompt ▸ {(prompt || '').substring(0, 50)}...
                    </Text>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'reasoning' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'reasoning' ? '> ' : '  '}
                        (R)easoning ({(reasoning || '').split('\n\n').length} steps){' '}
                        {bodyView === REVIEW_BODY_VIEWS.REASONING ? '▾' : '▸'}{' '}
                        {((reasoning || '').split('\n')[0] ?? '').substring(0, 40)}...
                    </Text>
                </Box>
            </Box>

            {/* Script Results (if any) */}
            {scripts.length > 0 && navigableItemsInView.some(i => i.type === 'script') && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script: ScriptResult) => {
                            const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'script' && i.id === script.command);
                            if (itemInViewIndex === -1) return null;
                            
                            const isSelected = selectedItemIndex === viewOffset + itemInViewIndex;
                            return (
                                <ScriptItemRow
                                    key={script.command} script={script}
                                    isSelected={isSelected}
                                    isExpanded={bodyView === REVIEW_BODY_VIEWS.SCRIPT_OUTPUT && isSelected}
                                />
                            );
                        })}
                    </Box>
                </>
            )}
            
            {/* Files Section */}
            <Box flexDirection="column" marginY={1}>
                <Text bold>FILES</Text>
                {files.map((file: FileItem) => {
                    const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'file' && i.id === file.id);
                    if (itemInViewIndex === -1) return null; // Only render if visible

                    const isFocused = selectedItemIndex === viewOffset + itemInViewIndex;
                    const reviewState = fileReviewStates.get(file.id);
                    
                    return (
                        <FileItemRow key={file.id} file={file} isFocused={isFocused} reviewState={reviewState || { status: 'AWAITING' }} />
                    );
                })}
            </Box>

            {/* Body Viewport */}
            {bodyView !== REVIEW_BODY_VIEWS.NONE && (
                <Box marginY={1}>
                    {renderBody()}
                </Box>
            )}
        </ScreenLayout>
    );
};

export default ReviewScreen;