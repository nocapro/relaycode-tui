import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Separator from './Separator';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';
import { COMMIT_FOOTER_ACTIONS } from '../constants/commit.constants';

const GitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting, commitError } = useGitCommitScreen();

    const messageParts = finalCommitMessage.split('\n');
    const subject = messageParts[0] || '';
    const body = messageParts.slice(1).join('\n');

    const renderError = () => (
        <Box 
            flexDirection="column" 
            borderStyle="round" 
            borderColor="red" 
            paddingX={2} 
            marginY={1}
        >
            <Text bold color="red">COMMIT FAILED</Text>
            <Text wrap="wrap">The git operation failed. Please check the error message below and resolve any issues before retrying.</Text>
            <Box marginTop={1}>
                <Text color="red">{commitError}</Text>
            </Box>
        </Box>
    );

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
            {commitError && renderError()}
            <Separator />
            {!commitError && <Box marginY={1} paddingX={2}>
                 <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>
            </Box>}
            <Separator />
            {isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={commitError ? COMMIT_FOOTER_ACTIONS.FAILURE : COMMIT_FOOTER_ACTIONS.BASE} />
            }
        </Box>
    );
};

export default GitCommitScreen;