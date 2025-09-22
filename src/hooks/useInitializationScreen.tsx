import React, { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore, initialAnalyzeTasks, initialConfigureTasks } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { sleep } from '../utils';

export const useInitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const actions = useInitStore(s => s.actions);
    const showDashboardScreen = useAppStore(s => s.actions.showDashboardScreen);
    const { exit } = useApp();

    useInput((input, key) => {
        if (phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (phase === 'FINALIZE') {
            if (input.toLowerCase() === 'q') {
                exit();
            } else if (input.toLowerCase() === 'w') {
                showDashboardScreen();
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
            actions.setAnalysisResults('relaycode (from package.json)', true);
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
    }, [actions]);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            const resumeSimulation = async () => {
                actions.setPhase('CONFIGURE');
                const lastTask = initialConfigureTasks[2];
                if (lastTask) {
                    actions.updateConfigureTask(lastTask.id, 'active');
                    await sleep(800);
                    actions.updateConfigureTask(lastTask.id, 'done');
                    await sleep(500);

                    actions.setPhase('FINALIZE');
                }
            };
            resumeSimulation();
        }
    }, [interactiveChoice, phase, actions]);

    const {
        analyzeTasks,
        configureTasks,
        projectId,
    } = useInitStore();

    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    };
};