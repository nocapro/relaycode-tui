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
    let color;
    switch (file.status) {
        case 'APPROVED': icon = '[✓]'; color = 'green'; break;
        case 'REJECTED': icon = '[✗]'; color = 'red'; break;
        case 'FAILED': icon = '[!]'; color = 'red'; break;
    }

    const diffStats = `(+${file.linesAdded}/-${file.linesRemoved})`;
    const strategy = file.strategy === 'standard-diff' ? 'diff' : file.strategy;

    const fileDetails = <Text color={color}>{icon} MOD {file.path}</Text>;;
    const strategyDetails = file.error ?
        (<Text color="red">({file.error})</Text>) :
        (<Text>{diffStats} [{strategy}]</Text>);

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{isSelected ? '> ' : '  '}{fileDetails}</Text>
            <Box flexGrow={1} />
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}> {strategyDetails}</Text>
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
    const icon = script.success ? <Text color="green">✓</Text> : <Text color="red">✗</Text>;
    const arrow = isExpanded ? '▾' : '▸';

    const content = (
        <Text>
            {icon} {script.command} ({script.duration}s) {arrow} {script.summary}
        </Text>
    );
    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
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
    } = store;
    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval,
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff,
        rejectAllFiles, approve,
    } = store.actions;

    const numFiles = files.length;
    const approvedFilesCount = useMemo(() => files.filter(f => f.status === 'APPROVED').length, [files]);
    const canBeRejected = useMemo(() => files.some(f => f.status === 'APPROVED'), [files]);
    
    useInput((input, key) => {
        if (input.toLowerCase() === 'q') exit();

        if (key.escape) {
            if (bodyView !== 'none') {
                if (bodyView === 'diff') toggleDiffView();
                if (bodyView === 'reasoning') toggleReasoningView();
                if (bodyView === 'script_output') toggleScriptView();
            } else if (canBeRejected) {
                rejectAllFiles();
            } else {
                showDashboardScreen(); // Go back if nothing to reject
            }
            return;
        }

        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleReasoningView();

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                toggleFileApproval();
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleDiffView();
            }
        }

        if (input.toLowerCase() === 'x' && bodyView === 'diff') {
            expandDiff();
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= numFiles) { // It's a script
                toggleScriptView();
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) approve();
            showDashboardScreen();
        }
    });

    const renderBody = () => {
        if (bodyView === 'none') return null;

        if (bodyView === 'reasoning') {
            return <ReasonScreen reasoning={reasoning} />;
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
             return (
                <Box flexDirection="column">
                    <Text>OUTPUT: `{selectedScript.command}`</Text>
                    <Box marginTop={1}><Text>{selectedScript.output}</Text></Box>
                </Box>
             );
        };
        
        return null;
    };

    const renderFooter = () => {
        // Contextual footer for body views
        if (bodyView === 'diff') {
            return <Text>(↑↓) Nav · {isDiffExpanded ? '(X)Collapse' : '(X)pand Diff'} · (D/Esc)Collapse View</Text>;
        }
        if (bodyView === 'reasoning') return <Text>(↑↓) Scroll (not implemented) · (R/Esc)Collapse View</Text>;
        if (bodyView === 'script_output') return <Text>(↑↓) Nav · (Ent/Esc)Collapse</Text>;

        // Main footer
        if (bodyView !== 'none') return null; // Should be handled by contextual footers above

        const actions = ['(↑↓) Nav'];

        const isFileSelected = selectedItemIndex < numFiles;
        if (isFileSelected) {
            const selectedFile = files[selectedItemIndex];
            if (selectedFile && selectedFile.status !== 'FAILED') {
                actions.push('(Spc) Toggle');
            }
            actions.push('(D)iff');
        } else { // script selected
             const isExpanded = selectedItemIndex >= numFiles; // We know bodyView is 'none' here
             actions.push(isExpanded ? '(Ent)Collapse' : '(Ent)Expand');
        }

        actions.push('(R)easoning');

        if (approvedFilesCount > 0) {
            actions.push('(A)pprove');
        }
        if (canBeRejected) {
            actions.push('(Esc)Reject All');
        }

        actions.push('(Q)uit');

        return <Text>{actions.join(' · ')}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator */}
            <Box flexDirection="column" marginY={1}>
                <Box>
                    <Text>{hash} · {message}</Text>
                    {patchStatus === 'PARTIAL_FAILURE' && <Text color="red" bold> · MULTIPLE PATCHES FAILED</Text>}
                </Box>
                <Text>
                    <Text color="green">+{linesAdded}</Text>/<Text color="red">-{linesRemoved}</Text>
                    {' · '}
                    {approvedFilesCount}/{numFiles} Files
                    {' · '}
                    {duration}s
                </Text>
                <Box marginY={1}>
                    <Text>{'▸'} (P)rompt: {prompt.substring(0, 50)}...</Text>
                    <Text>{bodyView === 'reasoning' ? '▾' : '▸'} (R)easoning ({reasoning.split('\n\n').length} steps): {reasoning.split('\n')[0]}</Text>
                </Box>
                <Separator/>
                {scripts.map((script, index) => (
                    <ScriptItemRow 
                        key={script.command} 
                        script={script}
                        isSelected={selectedItemIndex === numFiles + index}
                        isExpanded={bodyView === 'script_output' && selectedItemIndex === numFiles + index}
                    />
                ))}
                <Separator/>
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
            
            {/* Body */}
            <Box marginY={1}>
                {renderBody()}
            </Box>

            {(bodyView !== 'none' && renderBody() !== null) && <Separator />}

            {/* Footer */}
            <Box>
                {renderFooter()}
            </Box>
        </Box>
    );
};

export default ReviewScreen;