import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';
import { COMMIT_SCREEN_FOOTER_ACTIONS } from '../constants/commit.constants';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useGitCommitScreen();

    const messageParts = finalCommitMessage.split('\n');
    const subject = messageParts[0] || '';
    const body = messageParts.slice(1).join('\n');

    return (
        <Box flexDirection="column">
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · GIT COMMIT </Text>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text bold>TRANSACTIONS INCLUDED</Text>
                    {transactionsToCommit.map(tx => (
                        <Text key={tx.id}>- <Text color="gray">{tx.hash}</Text>: {tx.message}</Text>
                    ))}
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} flexDirection="column" paddingX={2}>
                <Text bold>FINAL COMMIT MESSAGE</Text>
                <Box marginTop={1} flexDirection="column">
                    <Text color="yellow">{subject}</Text>
                    {body ? <Text>{body}</Text> : null}
                </Box>
            </Box>
            <Separator />
            <Box marginY={1} paddingX={2}>
                 <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>
            </Box>
            <Separator />
            {isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={COMMIT_SCREEN_FOOTER_ACTIONS}/>
            }
        </Box>
    );
};

export default GitCommitScreen;