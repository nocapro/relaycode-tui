import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { useGitCommitScreen } from '../hooks/useGitCommitScreen';
import ActionFooter from './ActionFooter';
import ScreenLayout from './layout/ScreenLayout';
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

    const footerActions = commitError ? COMMIT_FOOTER_ACTIONS.FAILURE : COMMIT_FOOTER_ACTIONS.BASE;
    const footer = isCommitting
                ? <Text><Spinner type="dots"/> Committing... please wait.</Text>
                : <ActionFooter actions={footerActions} />;

    return (
        <ScreenLayout
            title="GIT COMMIT"
            footer={footer}
        >
            <Box flexDirection="column" paddingX={2}>
                <Box flexDirection="column">
                    <Text>Found {transactionsToCommit.length} new transactions to commit since last git commit.</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>TRANSACTIONS INCLUDED</Text>
                        {transactionsToCommit.map(tx => (
                            <Text key={tx.id}>- <Text color="gray">{tx.hash}</Text>: {tx.message}</Text>
                        ))}
                    </Box>
                </Box>
                <Box marginY={1} flexDirection="column">
                    <Text bold>FINAL COMMIT MESSAGE</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text color="yellow">{subject}</Text>
                        {body ? <Text>{body}</Text> : null}
                    </Box>
                </Box>
                {commitError && renderError()}
                {!commitError && <Text>This will run &apos;git add .&apos; and &apos;git commit&apos; with the message above.</Text>}
            </Box>
        </ScreenLayout>
    );
};

export default GitCommitScreen;