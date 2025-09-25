import { Box, Text } from 'ink';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';
import type { ScriptResult, FileItem, FileChangeType } from '../types/domain.types';
import { useReviewScreen } from '../hooks/useReviewScreen';
import ActionFooter from './ActionFooter';
import type { ActionItem } from '../types/actions.types';

// --- Sub-components ---

const FileItemRow = ({ file, reviewStatus, reviewError, reviewDetails, isFocused }: {
    file: FileItem;
    reviewStatus: string;
    reviewError?: string;
    reviewDetails?: string;
    isFocused: boolean;
}) => {
    let icon;
    let iconColor;
    switch (reviewStatus) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
        case 'AWAITING': icon = '[●]'; iconColor = 'yellow'; break;
        case 'RE_APPLYING': icon = '[●]'; iconColor = 'cyan'; break;
    }

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

    if (reviewStatus === 'FAILED') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({reviewError})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'AWAITING') {
        return (
            <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} AWAITING {file.path}</Text>
                    <Text color="yellow">    ({reviewDetails})</Text>
                </Text>
            </Box>
        );
    }

    if (reviewStatus === 'RE_APPLYING') {
        return (
             <Box>
                <Text {...colorProps}>
                    {prefix}<Text color={iconColor}>{icon} RE-APPLYING... {file.path}</Text>
                    <Text color="cyan"> (using &apos;replace&apos; strategy)</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text {...colorProps}>
                {prefix}<Text color={iconColor}>{icon}</Text> {file.type}{' '}
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
        isDiffExpanded,
        reasoningScrollIndex,
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
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningText = reasoning || '';
            const reasoningLinesCount = reasoningText.split('\n').length;
            const visibleLinesCount = 10;
            return (
                <Box flexDirection="column">
                    <ReasonScreen
                        reasoning={reasoningText}
                        scrollIndex={contentScrollIndex}
                        visibleLinesCount={Math.max(1, availableBodyHeight)}
                    />
                    {reasoningLinesCount > visibleLinesCount && (
                        <Text color="gray">
                            Showing lines {reasoningScrollIndex + 1}-{Math.min(reasoningScrollIndex + visibleLinesCount, reasoningLinesCount)}{' '}
                            of {reasoningLinesCount}
                        </Text>
                    )}
                </Box>
            );
        }
        
        if (bodyView === 'diff') {
            const currentItem = navigableItems[selectedItemIndex];
            const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                    scrollIndex={contentScrollIndex}
                    maxHeight={Math.max(1, availableBodyHeight)}
                />
            );
        }

        if (bodyView === 'script_output') {
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

        if (bodyView === 'confirm_handoff') {
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

        if (bodyView === 'bulk_repair') {
            const failedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'FAILED');
            const repairOptions = [
                '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
                '(2) Bulk Change Strategy & Re-apply',
                '(3) Handoff to External Agent',
                '(4) Bulk Abandon All Failed Files',
                '(Esc) Cancel',
            ];

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
                        {repairOptions.map((opt, i) => (
                            <Text key={i} color={selectedBulkRepairOptionIndex === i ? 'cyan' : undefined}>
                                {selectedBulkRepairOptionIndex === i ? '> ' : '  '}
                                {opt}
                            </Text>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (bodyView === 'bulk_instruct') {
            const rejectedFiles = files.filter((f: FileItem) => fileReviewStates.get(f.id)?.status === 'REJECTED');
            const instructOptions = [
                '(1) Copy Bulk Re-instruct Prompt (for single-shot AI)',
                '(2) Handoff to External Agent',
                '(3) Bulk Un-reject All Files (revert to original)',
                '(4) Cancel',
            ];

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
                        {instructOptions.map((opt, i) => (
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
        if (bodyView === 'diff') {
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Nav' },
                { key: 'X', label: 'Expand' },
                { key: 'D/Esc', label: 'Back' },
            ]}/>;
        }
        if (bodyView === 'reasoning') {
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Scroll Text' },
                { key: 'R', label: 'Collapse View' },
                { key: 'C', label: 'Copy Mode' },
            ]}/>;
        }
        if (bodyView === 'script_output') {
            return <ActionFooter actions={[
                { key: '↑↓', label: 'Nav' },
                { key: 'J↓/K↑', label: 'Next/Prev Error' },
                { key: 'C', label: 'Copy Output' },
                { key: 'Ent/Esc', label: 'Back' },
            ]}/>;
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel</Text>;
        }
        if (bodyView === 'bulk_instruct') {
            return <Text>Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel</Text>;
        }
        if (bodyView === 'confirm_handoff') {
            return <ActionFooter actions={[
                { key: 'Enter', label: 'Confirm Handoff' },
                { key: 'Esc', label: 'Cancel' },
            ]}/>;
        }

        // Main footer
        const actions: ActionItem[] = [{ key: '↑↓', label: 'Nav' }];

        const currentItem = navigableItems[selectedItemIndex];
        
        if (currentItem?.type === 'file') {
            const selectedFile = files.find(f => f.id === currentItem.id);
            const fileState = fileReviewStates.get(currentItem.id);
            if (fileState?.status !== 'FAILED') {
                actions.push({ key: 'Spc', label: 'Toggle' });
            }
            actions.push({ key: 'D', label: 'Diff' });
            
            // Add repair options for failed files
            if (selectedFile && fileState?.status === 'FAILED') {
                actions.push({ key: 'T', label: 'Try Repair' });
            }
            if (selectedFile && fileState?.status === 'REJECTED') {
                actions.push({ key: 'I', label: 'Instruct' });
            }
        } else if (currentItem?.type === 'script') {
            actions.push({ key: 'Ent', label: 'Expand Details' });
        } else { // Prompt or Reasoning
            actions.push({ key: 'Ent', label: 'Expand' });
        }

        if (currentItem?.type !== 'reasoning') {
            actions.push({ key: 'R', label: 'Reasoning' });
        }

        // Add bulk repair if there are failed files
        const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
        if (hasFailedFiles) {
            actions.push({ key: 'Shift+T', label: 'Bulk Repair' });
        }
        // Add bulk instruct if there are rejected files
        if (hasRejectedFiles) {
            actions.push({ key: 'Shift+I', label: 'Bulk Instruct' });
        }
        
        actions.push({ key: 'C', label: 'Copy' });

        if (approvedFilesCount > 0) {
            actions.push({ key: 'A', label: 'Approve' });
        }

        if (Array.from(fileReviewStates.values()).some(s => s.status === 'APPROVED' || s.status === 'FAILED')) {
            actions.push({ key: 'Shift+R', label: 'Reject All' });
        }
        actions.push({ key: 'Q', label: 'Quit' });

        return <ActionFooter actions={actions} />;
    };

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column" marginY={1}>
                <Box flexDirection="column">
                    <Text>{hash} · {message}</Text>
                    <Text>
                        (<Text color="green">+{totalLinesAdded}</Text>/<Text color="red">-{totalLinesRemoved}</Text>
                        ) · {numFiles} Files · ({approvedFilesCount}/{numFiles} Appr)
                        · Showing {viewOffset + 1}-
                        {Math.min(viewOffset + navigableItemsInView.length, navigableItems.length)} of {navigableItems.length}
                        {patchStatus === 'PARTIAL_FAILURE' && scripts.length === 0 && <Text> · Scripts: SKIPPED</Text>}
                        {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    </Text>
                </Box>

                <Box flexDirection="column" marginTop={1}>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'prompt' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'prompt' ? '> ' : '  '}
                        (P)rompt ▸ {(prompt || '').substring(0, 60)}...
                    </Text>
                    <Text color={navigableItems[selectedItemIndex]?.type === 'reasoning' ? 'cyan' : undefined}>
                        {navigableItems[selectedItemIndex]?.type === 'reasoning' ? '> ' : '  '}
                        (R)easoning ({(reasoning || '').split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'}{' '}
                        {((reasoning || '').split('\n')[0] ?? '').substring(0, 50)}...
                    </Text>
                </Box>
            </Box>

            <Separator />

            {/* Script Results (if any) */}
            {scripts.length > 0 && navigableItemsInView.some(i => i.type === 'script') && (
                <>
                    <Box flexDirection="column" marginY={1}>
                        {scripts.map((script: ScriptResult) => {
                            const itemInViewIndex = navigableItemsInView.findIndex(i => i.type === 'script' && i.id === script.command);
                            if (itemInViewIndex === -1) return null; // Only render if visible
                            
                            const isSelected = selectedItemIndex === viewOffset + itemInViewIndex;
                            return (
                                <ScriptItemRow key={script.command} script={script} isSelected={isSelected} isExpanded={bodyView === 'script_output' && isSelected} />
                            );
                        })}
                    </Box>
                    <Separator />
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
                        <FileItemRow
                            key={file.id} file={file} isFocused={isFocused}
                            reviewStatus={reviewState?.status || 'AWAITING'}
                            reviewError={reviewState?.error}
                            reviewDetails={reviewState?.details}
                        />
                    );
                })}
            </Box>
            
            <Separator />
            
            {/* Body Viewport */}
            {bodyView !== 'none' && (
                <>
                    <Box marginY={1}>
                        {renderBody()}
                    </Box>
                    <Separator />
                </>
            )}

            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default ReviewScreen;