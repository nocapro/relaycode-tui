import React, { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { InitService } from '../services/init.service';

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
            if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
        }
    });

    useEffect(() => {
        InitService.runInitializationProcess();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            InitService.resumeInitializationProcess();
        }
    }, [interactiveChoice, phase]);

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