import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../store';
import chalk from 'chalk';
import Separator from './Separator';

const SplashScreen = () => {
    const { showInitScreen } = useStore(state => state.actions);
    const [countdown, setCountdown] = useState(5);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput(() => {
        handleSkip();
    });

    useEffect(() => {
        if (countdown === 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showInitScreen]);

    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀
`;

    return (
        <Box flexDirection="column">
            <Text>▲ relaycode</Text>
            <Separator />
            <Text>{logo}</Text>
            <Box flexDirection="column" alignItems="center">
                <Text>A zero-friction, AI-native patch engine.</Text>
                <Text>Built by Arman and contributors · https://relay.noca.pro</Text>
            </Box>
            
            <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                <Box flexDirection="column" width="45%">
                    <Text>Version 1.1.5</Text>
                    <Text>─────────────────────────</Text>
                    <Text>relaycode</Text>
                    <Text>relaycode-core</Text>
                    <Text>apply-multi-diff</Text>
                    <Text>konro</Text>
                </Box>
                 <Box flexDirection="column" width="45%">
                    <Text>Build Timestamps</Text>
                    <Text>─────────────────────────</Text>
                    <Text>2025-09-20 13:58:05</Text>
                    <Text>2025-09-20 10:59:05</Text>
                    <Text>(versioned)</Text>
                    <Text>(versioned)</Text>
                </Box>
            </Box>
            
            <Box marginTop={1}><Separator /></Box>
            <Text>If you love this workflow, check out https://www.noca.pro for the full</Text>
            <Text>web app with repo-wide visual context, history, and rollback.</Text>
            <Text>{chalk.bold('(V)')}isit noca.pro</Text>
            <Separator />
            <Text>Follow {chalk.bold('(X)')} · Join {chalk.bold('(D)')}iscord · Star on {chalk.bold('(G)')}itHub</Text>
            <Separator />
            <Text>Loading... {countdown} (Press any key to skip)</Text>
        </Box>
    );
};

export default SplashScreen;