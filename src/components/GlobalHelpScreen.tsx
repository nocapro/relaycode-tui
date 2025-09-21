import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

const GlobalHelpScreen = () => {
    return (
        <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
        >
            <Box
                flexDirection="column"
                borderStyle="round"
                paddingX={2}
                paddingY={1}
                width="80%"
            >
                <Box justifyContent="center" marginBottom={1}>
                    <Text bold color="cyan">▲ relaycode · keyboard shortcuts</Text>
                </Box>
                <Box flexDirection="column" gap={1}>
                    <Box flexDirection="column">
                        <Text bold color="cyan">GLOBAL</Text>
                        <Text>  {chalk.cyan.bold('?')}        Toggle this help screen</Text>
                        <Text>  {chalk.cyan.bold('Q')}        Quit to terminal (from main screens)</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">DASHBOARD (watch)</Text>
                        <Text>  {chalk.cyan.bold('↑↓')}       Navigate event stream</Text>
                        <Text>  {chalk.cyan.bold('P')}        Pause / Resume clipboard watcher</Text>
                        <Text>  {chalk.cyan.bold('A')}        Approve all pending transactions</Text>
                        <Text>  {chalk.cyan.bold('C')}        Commit all applied transactions to git</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text bold color="cyan">REVIEW & DETAILS SCREENS</Text>
                        <Text>  {chalk.cyan.bold('D')}        Show / Collapse file diff</Text>
                        <Text>  {chalk.cyan.bold('R')}        Show / Collapse reasoning steps</Text>
                        <Text>  {chalk.cyan.bold('C')}        Enter / Exit Copy Mode (Details Screen)</Text>
                        <Text>  {chalk.cyan.bold('U')}        Undo / Revert Transaction</Text>
                        <Text>  {chalk.cyan.bold('Space')}    Toggle approval state of a file (Review Screen)</Text>
                    </Box>
                </Box>
            </Box>
            <Box marginTop={1}>
                <Text bold>(Press {chalk.cyan.bold('?')} or {chalk.cyan.bold('Esc')} to close)</Text>
            </Box>
        </Box>
    );
};

export default GlobalHelpScreen;