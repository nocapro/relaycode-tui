import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCopyStore } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import { CommitService } from '../services/commit.service';

export const useGitCommitScreen = () => {
    const { finalCommitMessage, isCommitting, commitError } = useCommitStore();
    const transactionsToCommit = useTransactionStore(selectTransactionsByStatus('APPLIED'));
    const { commit, resetCommitState } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const handleCommit = (forceFailure?: boolean) => {
        showDashboardScreen();
        commit(forceFailure); // Fire-and-forget to allow dashboard to show animation
    };

    const openCopyMode = () => {
        const items = CopyService.getCopyItemsForCommit(transactionsToCommit, finalCommitMessage);
        useCopyStore.getState().actions.open('Select data to copy from commit:', items);
    };

    useInput((_, key) => {
        if (isCommitting) return;

        if (commitError) {
            if (key.escape) {
                resetCommitState();
                showDashboardScreen();
            } else if (_.toLowerCase() === 'r') {
                handleCommit();
            } else if (_.toLowerCase() === 'c') {
                const command = CommitService.getGitCommitCommand(finalCommitMessage);
                useNotificationStore.getState().actions.show({
                    type: 'success',
                    title: 'Copied to Clipboard',
                    // This is a mock clipboard write for the demo
                    message: `Command copied: ${command}`,
                });
            }
            return;
        }

        if (key.return) {
            handleCommit();
        } else if (key.escape) {
            showDashboardScreen();
        } else if (_.toLowerCase() === 'c') {
            openCopyMode();
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting, commitError };
};