import React, { useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useStore, Task, initialAnalyzeTasks, initialConfigureTasks, sleep } from '../store';
import chalk from 'chalk';
import Separator from './Separator';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
    let symbol;
    switch (task.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = chalk.cyan('(●)'); break;
        case 'done': symbol = chalk.green(doneSymbol); break;
    }

    const title = task.status === 'done' && doneSymbol?.startsWith('[✓]') ? `Created ${task.title.split(' ')[1]}` : task.title;

    return (
        <Box flexDirection="column">
            <Text>
                {symbol} {title}
            </Text>
            {task.subtext && task.status !== 'done' && (
                <Text>
                    {'     └─ '}{task.subtext}
                </Text>
            )}
        </Box>
    );
};

const InitializationScreen = () => {
    const store = useStore();
    const { actions } = store;
    const { exit } = useApp();

    useInput((input, key) => {
        if (store.phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (store.phase === 'FINALIZE') {
            if (input.toLowerCase() === 'q') {
                exit();
            }
        }
    });

    useEffect(() => {
        actions.resetInit();
        const runSimulation = async () => {
            actions.setPhase('ANALYZE');
            for (const task of initialAnalyzeTasks) {
                actions.updateAnalyzeTask(task.id, 'active');
                await sleep(800);
                actions.updateAnalyzeTask(task.id, 'done');
            }
            actions.setAnalysisResults(`'relaycode' (from package.json)`, true);
            await sleep(500);

            actions.setPhase('CONFIGURE');
            const configTasksUntilInteractive = initialConfigureTasks.slice(0, 2);
            for (const task of configTasksUntilInteractive) {
                actions.updateConfigureTask(task.id, 'active');
                await sleep(800);
                actions.updateConfigureTask(task.id, 'done');
            }
            await sleep(500);

            actions.setPhase('INTERACTIVE');
        };

        runSimulation();
    }, []);

    useEffect(() => {
        if (store.phase === 'INTERACTIVE' && store.interactiveChoice !== null) {
            const resumeSimulation = async () => {
                actions.setPhase('CONFIGURE');
                const lastTask = initialConfigureTasks[2];
                actions.updateConfigureTask(lastTask.id, 'active');
                await sleep(800);
                actions.updateConfigureTask(lastTask.id, 'done');
                await sleep(500);
                
                actions.setPhase('FINALIZE');
            };
            resumeSimulation();
        }
    }, [store.interactiveChoice, store.phase]);

    const renderAnalyze = () => (
        <Box flexDirection="column">
            <Text bold>PHASE 1: ANALYZE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {store.analyzeTasks.map(t => <TaskItem key={t.id} task={t} />)}
            </Box>
        </Box>
    );

    const renderContext = () => (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold>CONTEXT</Text>
            <Text>  {chalk.green('✓')} Project ID: {store.projectId}</Text>
            <Text>  {chalk.green('✓')} Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold>PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {store.configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold>PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {store.configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol="[✓]" />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text>{chalk.cyan('>')} The .relay/ directory is usually ignored by git.</Text>
                    <Text>  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = store.interactiveChoice === 'share'
            ? ".relay/ directory initialized. It will be committed to git."
            : ".relay/ directory initialized and added to .gitignore.";
        const stateSubText = store.interactiveChoice === 'share'
            ? undefined
            : "Local transaction history will be stored here.";
        
        return (
            <Box flexDirection="column">
                <Text bold> SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Config:   relay.config.json created.</Text>
                        <Text>          {chalk.gray('›')} Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} State:    {stateText}</Text>
                        {stateSubText && <Text>          {chalk.gray('›')} {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text>{chalk.green('✓')} Prompt:   System prompt generated at .relay/prompts/system-prompt.md.</Text>
                        <Text>          {chalk.gray('›')} Copied to clipboard. Paste into your AI's custom instructions.</Text>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderPhase = () => {
        switch (store.phase) {
            case 'ANALYZE': return renderAnalyze();
            case 'CONFIGURE': return renderConfigure();
            case 'INTERACTIVE': return renderInteractive();
            case 'FINALIZE': return renderFinalize();
        }
    };
    
    let footerText;
    switch (store.phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = `(${chalk.bold('Enter')}) No, ignore it (default)      (${chalk.bold('S')}) Yes, share it`; break;
        case 'FINALIZE': footerText = `(${chalk.bold('W')})atch for Patches · (${chalk.bold('L')})View Logs · (${chalk.bold('Q')})uit`; break;
    }

    return (
        <Box flexDirection="column">
            <Text>{store.phase === 'FINALIZE' ? '▲ relaycode bootstrap complete' : '▲ relaycode bootstrap'}</Text>
            <Separator />
            <Box marginY={1}>{renderPhase()}</Box>
            <Separator />
            <Text>{footerText}</Text>
        </Box>
    );
};

export default InitializationScreen;