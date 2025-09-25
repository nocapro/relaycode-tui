import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useGitCommitScreen();

    const transactionLines = transactionsToCommit.map(tx => (
        <Text key={tx.id}>- {tx.hash}: {tx.message}</Text>
    ));

    return (
        <Box flexDirection="column">
            <Text color="cyan">▲ relaycode git commit</Text>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text bold>TRANSACTIONS INCLUDED</Text>
                    {transactionLines}
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text bold>FINAL COMMIT MESSAGE</Text>
                <Box marginTop={1}>
                    <Text>{finalCommitMessage}</Text>
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} paddingX={2}>
                 <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>
            </Box>
            <Separator />
            {isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={[
                    { key: 'Enter', label: 'Confirm & Commit' },
                    { key: 'Esc', label: 'Cancel' },
                ]}/>
            }
        </Box>
    );
};

export default GitCommitScreen;