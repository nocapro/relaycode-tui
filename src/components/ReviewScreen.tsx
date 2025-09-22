import React, { useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { useReviewStore, type FileItem, type ScriptResult } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import Separator from './Separator';
import DiffScreen from './DiffScreen';
import ReasonScreen from './ReasonScreen';

// --- Sub-components ---

const FileItemRow = ({ file, isSelected }: { file: FileItem, isSelected: boolean }) => {
    let icon;
    let iconColor;
    switch (file.status) {
        case 'APPROVED': icon = '[✓]'; iconColor = 'green'; break;
        case 'REJECTED': icon = '[✗]'; iconColor = 'red'; break;
        case 'FAILED': icon = '[!]'; iconColor = 'red'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;
    const prefix = isSelected ? '> ' : '  ';

    if (file.status === 'FAILED') {
        return (
            <Box>
                <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                    {prefix}<Text color={iconColor}>{icon} FAILED {file.path}</Text>
                    <Text color="red">    ({file.error})</Text>
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
                {prefix}<Text color={iconColor}>{icon}</Text> MOD {file.path} {diffStats} [{strategy}]
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
                {prefix}<Text color={iconColor}>{icon}</Text> {scriptType}: `{script.command}` ({script.duration}s) {arrow} {script.summary}
            </Text>
        </Box>
    );
};

// --- Main Component ---

const ReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        hash, message, prompt, reasoning, files, scripts, patchStatus,
        linesAdded, linesRemoved, duration,
        selectedItemIndex, bodyView, isDiffExpanded,
        copyModeSelectedIndex, copyModeLastCopied, reasoningScrollIndex, scriptErrorIndex,
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval,
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff,
        rejectAllFiles, approve,
        toggleCopyMode, moveCopySelectionUp, moveCopySelectionDown, copySelectedItem,
        copyUUID, copyMessage, copyPrompt, copyReasoning, copyFileDiff, copyAllDiffs,
        tryRepairFile, showBulkRepair, executeBulkRepairOption,
        scrollReasoningUp, scrollReasoningDown, navigateScriptErrorUp, navigateScriptErrorDown
    } = store.actions;

    const numFiles = files.length;
    const approvedFilesCount = useMemo(() => files.filter(f => f.status === 'APPROVED').length, [files]);
    const canBeRejected = useMemo(() => files.some(f => f.status === 'APPROVED'), [files]);
    
    useInput((input, key) => {
        if (input.toLowerCase() === 'q') exit();

        // Handle Escape key - context-sensitive behavior
        if (key.escape) {
            if (bodyView === 'copy_mode') {
                toggleCopyMode();
            } else if (bodyView === 'bulk_repair') {
                showBulkRepair(); // Close bulk repair modal
            } else if (bodyView !== 'none') {
                if (bodyView === 'diff') toggleDiffView();
                if (bodyView === 'reasoning') toggleReasoningView();
                if (bodyView === 'script_output') toggleScriptView();
            } else if (canBeRejected) {
                rejectAllFiles();
            } else {
                showDashboardScreen();
            }
            return;
        }

        // Copy Mode Navigation
        if (bodyView === 'copy_mode') {
            if (key.upArrow) moveCopySelectionUp();
            if (key.downArrow) moveCopySelectionDown();
            if (key.return) copySelectedItem();
            
            // Hotkey shortcuts
            if (input.toLowerCase() === 'u') copyUUID();
            if (input.toLowerCase() === 'm') copyMessage();
            if (input.toLowerCase() === 'p') copyPrompt();
            if (input.toLowerCase() === 'r') copyReasoning();
            if (input.toLowerCase() === 'f') copyFileDiff();
            if (input.toLowerCase() === 'a') copyAllDiffs();
            if (input.toLowerCase() === 'c') toggleCopyMode();
            return;
        }

        // Bulk Repair Navigation
        if (bodyView === 'bulk_repair') {
            if (input >= '1' && input <= '4') {
                executeBulkRepairOption(parseInt(input));
            }
            return;
        }

        // Reasoning Scroll Navigation
        if (bodyView === 'reasoning') {
            if (key.upArrow) scrollReasoningUp();
            if (key.downArrow) scrollReasoningDown();
            if (input.toLowerCase() === 'r') toggleReasoningView();
            return;
        }

        // Script Output Navigation
        if (bodyView === 'script_output') {
            if (input.toLowerCase() === 'j') navigateScriptErrorDown();
            if (input.toLowerCase() === 'k') navigateScriptErrorUp();
            if (key.return) toggleScriptView();
            if (input.toLowerCase() === 'c') {
                // Copy script output
                const scriptIndex = selectedItemIndex - numFiles;
                const selectedScript = scripts[scriptIndex];
                if (selectedScript) {
                    console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
                }
            }
            return;
        }

        // Diff View Navigation
        if (bodyView === 'diff') {
            if (input.toLowerCase() === 'x') expandDiff();
            if (input.toLowerCase() === 'd') toggleDiffView();
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleReasoningView();

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.status !== 'FAILED') {
                    toggleFileApproval();
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleDiffView();
            }
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleScriptView();
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            toggleCopyMode();
        }

        if (input.toLowerCase() === 't') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.status === 'FAILED') {
                    tryRepairFile();
                }
            }
        }

        // Handle Shift+T for bulk repair
        if (key.shift && input.toLowerCase() === 't') {
            const hasFailedFiles = files.some(f => f.status === 'FAILED');
            if (hasFailedFiles) {
                showBulkRepair();
            }
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            const reasoningLines = reasoning.split('\n');
            const visibleLines = reasoningLines.slice(reasoningScrollIndex, reasoningScrollIndex + 10);
            return (
                <Box flexDirection="column">
                    <Text>REASONING DETAILS</Text>
                    <Box marginTop={1}>
                        {visibleLines.map((line, index) => (
                            <Text key={index}>{line}</Text>
                        ))}
                    </Box>
                    {reasoningLines.length > 10 && (
                        <Text color="gray">
                            Showing lines {reasoningScrollIndex + 1}-{Math.min(reasoningScrollIndex + 10, reasoningLines.length)} of {reasoningLines.length}
                        </Text>
                    )}
                </Box>
            );
        }
        
        if (bodyView === 'diff') {
            const selectedFile = files[selectedItemIndex];
            if (!selectedFile) return null;
            return (
                <DiffScreen
                    filePath={selectedFile.path}
                    diffContent={selectedFile.diff}
                    isExpanded={isDiffExpanded}
                />
            );
        }

        if (bodyView === 'script_output') {
             const scriptIndex = selectedItemIndex - numFiles;
             const selectedScript = scripts[scriptIndex];
             if (!selectedScript) return null;
             
             const outputLines = selectedScript.output.split('\n');
             const errorLines = outputLines.filter(line => 
                line.includes('Error') || line.includes('Warning')
             );
             
             return (
                <Box flexDirection="column">
                    <Text>{selectedScript.command.includes('lint') ? 'LINTER' : 'SCRIPT'} OUTPUT: `{selectedScript.command}`</Text>
                    <Box marginTop={1}>
                        {outputLines.map((line, index) => {
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

        if (bodyView === 'copy_mode') {
            const options = [
                { key: 'U', label: 'UUID', value: `${hash}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
                { key: 'M', label: 'Git Message', value: message },
                { key: 'P', label: 'Prompt', value: prompt.substring(0, 50) + '...' },
                { key: 'R', label: 'Reasoning', value: reasoning.substring(0, 50) + '...' },
                { key: 'F', label: 'Diff for', value: selectedItemIndex < files.length ? files[selectedItemIndex].path : 'N/A' },
                { key: 'A', label: 'All Diffs', value: `${files.length} files` },
            ];

            return (
                <Box flexDirection="column">
                    <Text>Select item to copy to clipboard:</Text>
                    <Box marginTop={1} />
                    
                    {options.map((option, index) => (
                        <Text key={option.key} bold={index === copyModeSelectedIndex} color={index === copyModeSelectedIndex ? 'cyan' : undefined}>
                            {index === copyModeSelectedIndex ? '> ' : '  '}
                            [{option.key}] {option.label}: {option.value}
                        </Text>
                    ))}
                    
                    <Box marginTop={1} />
                    {copyModeLastCopied && (
                        <Text color="green">✓ Copied {copyModeLastCopied} to clipboard.</Text>
                    )}
                </Box>
            );
        }

        if (bodyView === 'bulk_repair') {
            const failedFiles = files.filter(f => f.status === 'FAILED');
            
            return (
                <Box flexDirection="column">
                    <Text>BULK REPAIR ACTION</Text>
                    <Box marginTop={1} />
                    
                    <Text>The following {failedFiles.length} files failed to apply:</Text>
                    {failedFiles.map(file => (
                        <Text key={file.id}>- {file.path}</Text>
                    ))}
                    
                    <Box marginTop={1} />
                    <Text>How would you like to proceed?</Text>
                    <Box marginTop={1} />
                    
                    <Text>{'> (1) Copy Bulk Re-apply Prompt (for single-shot AI)'}</Text>
                    <Text>  (2) Bulk Change Strategy & Re-apply</Text>
                    <Text>  (3) Handoff to External Agent</Text>
                    <Text>  (4) Bulk Abandon All Failed Files</Text>
                    <Text>  (Esc) Cancel</Text>
                </Box>
            );
        }
        
        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        if (bodyView === 'diff') {
            return <Text>(↑↓) Nav · (X)pand · (D/Esc) Back</Text>;
        }
        if (bodyView === 'reasoning') {
            return <Text>(↑↓) Scroll · (R/Esc) Back</Text>;
        }
        if (bodyView === 'script_output') {
            return <Text>(↑↓) Nav · (J↓/K↑) Next/Prev Error · (C)opy Output · (Ent/Esc) Back</Text>;
        }
        if (bodyView === 'copy_mode') {
            return <Text>(↑↓) Nav · (Enter) Copy Selected · (U,M,P,R,F,A) Hotkeys · (C, Esc) Exit</Text>;
        }
        if (bodyView === 'bulk_repair') {
            return <Text>Choose an option [1-4, Esc]:</Text>;
        }

        // Main footer
        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        const hasFailedFiles = files.some(f => f.status === 'FAILED');
        
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            if (selectedFile && selectedFile.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
            
            // Add repair options for failed files
            if (selectedFile && selectedFile.status === 'FAILED') {
                actions.push('(T)ry Repair');
            }
        } else { // script selected
            actions.push('(Ent) Expand Details');
        }

        actions.push('(R)easoning');
        
        // Add bulk repair if there are failed files
        if (hasFailedFiles) {
            actions.push('(Shift+T) Bulk Repair');
        }
        
        actions.push('(C)opy');

        if (approvedFilesCount > 0) {
            actions.push('(A)pprove');
        }
        
        actions.push('(Esc) Reject All');
        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            {/* Header */}
            <Text color="cyan">▲ relaycode review{bodyView === 'copy_mode' ? ' · copy mode' : ''}</Text>
            <Separator />
            
            {/* Navigator Section */}
            <Box flexDirection="column">
                {/* Transaction summary */}
                <Box>
                    <Text>{hash} · {message}</Text>
                </Box>
                <Box>
                    <Text>(<Text color="green">+{linesAdded}</Text>/<Text color="red">-{linesRemoved}</Text>) · {approvedFilesCount}/{numFiles} Files · {duration}s</Text>
                    {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                    {scripts.length === 0 && patchStatus === 'PARTIAL_FAILURE' && <Text> · Scripts: SKIPPED</Text>}
                </Box>
                
                <Box marginTop={1} />
                
                {/* Prompt and Reasoning */}
                <Text>(P)rompt ▸ {prompt.substring(0, 50)}...</Text>
                <Text>(R)easoning ({reasoning.split('\n\n').length} steps) {bodyView === 'reasoning' ? '▾' : '▸'} {reasoning.split('\n')[0].substring(0, 50)}...</Text>
                
                <Separator/>
                
                {/* Script Results (if any) */}
                {scripts.length > 0 && (
                    <>
                        {scripts.map((script, index) => (
                            <ScriptItemRow 
                                key={script.command} 
                                script={script}
                                isSelected={selectedItemIndex === numFiles + index}
                                isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                            />
                        ))}
                        <Separator/>
                    </>
                )}
                
                {/* Files Section */}
                <Text>FILES</Text>
                {files.map((file, index) => (
                    <FileItemRow 
                        key={file.id} 
                        file={file} 
                        isSelected={selectedItemIndex === index}
                    />
                ))}
            </Box>
            
            <Separator/>
            
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