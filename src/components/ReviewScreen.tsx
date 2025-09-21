import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useReviewStore, type FileItem, type ScriptResult } from '../stores/review.store';
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
        case 'MODIFIED': icon = '[~]'; color = 'yellow'; break;
    }

    const fileDetails = <Text color={color}>{icon} MOD {file.path}</Text>;
    const strategyDetails = file.error ? <Text color="red">({file.error})</Text> : <Text>[{file.strategy}]</Text>;

    return (
        <Box>
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{isSelected ? '> ' : '  '}{fileDetails}</Text>
            <Box flexGrow={1} />
            <Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>{strategyDetails}</Text>
        </Box>
    );
}

const ScriptItemRow = ({ script, isSelected, isExpanded }: { script: ScriptResult, isSelected: boolean, isExpanded: boolean }) => {
    const icon = script.success ? <Text color="green">✓</Text> : <Text color="red">✗</Text>;
    const arrow = isExpanded ? '▾' : '▸';

    const content = <Text>{icon} {script.command} ({script.duration}s) {arrow} {script.summary}</Text>;
    return isSelected ? <Text bold color="cyan">{'> '}{content}</Text> : <Text>{'  '}{content}</Text>;
}

// --- Main Component ---

const ReviewScreen = () => {
    const store = useReviewStore();
    const { 
        hash, message, reasoning, files, scripts, 
        selectedItemIndex, bodyView, isDiffExpanded 
    } = store;
    const { 
        moveSelectionUp, moveSelectionDown, toggleFileApproval, 
        toggleDiffView, toggleReasoningView, toggleScriptView, expandDiff
    } = store.actions;
    
    const numFiles = files.length;
    
    useInput((input, key) => {
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
                toggleScriptView(selectedItemIndex);
            }
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
            return <DiffScreen filePath={selectedFile.path} diffContent={selectedFile.diff} isExpanded={isDiffExpanded} />;
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
        }
        
        return null;
    }

    const renderFooter = () => {
        let actions = ["(↑↓) Nav", "(Spc) Toggle"];
        
        if (bodyView === 'diff') {
            actions.push(isDiffExpanded ? "(X)Collapse" : "(X)pand Diff");
            actions.push("(D)Collapse View");
        } else if (selectedItemIndex < numFiles) {
            actions.push("(D)iff");
        }
        
        if (bodyView === 'reasoning') {
            actions.push("(R)Collapse View");
        } else {
            actions.push("(R)easoning");
        }

        if (selectedItemIndex >= numFiles) {
             const isExpanded = bodyView === 'script_output' && selectedItemIndex >= numFiles;
             actions.push(isExpanded ? "(Ent)Collapse" : "(Ent)Expand");
        }
        
        actions.push("(A)pprove");
        
        return <Text>{actions.join(' · ')}</Text>
    }

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode review</Text>
            <Separator />
            
            {/* Navigator */}
            <Box flexDirection="column" marginY={1}>
                <Text>{hash} · {message}</Text>
                <Text>(+22/-11) · 2/3 Files · 3.9s</Text>
                <Box marginY={1}>
                    <Text>{bodyView === 'reasoning' ? '▾' : '▸'} (R)easoning (3 steps)</Text>
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