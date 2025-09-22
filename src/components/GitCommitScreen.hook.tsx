import { useInput } from 'ink';
import { useCommitStore } from '../stores/commit.store';
import { useAppStore } from '../stores/app.store';

export const useGitCommitScreen = () => {
    const { transactionsToCommit, finalCommitMessage, isCommitting } = useCommitStore();
    const { commit } = useCommitStore(s => s.actions);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    useInput((input, key) => {
        if (isCommitting) return;

        if (key.escape) {
            showDashboardScreen();
        }
        if (key.return) {
            commit().then(() => {
                showDashboardScreen();
            });
        }
    });

    return { transactionsToCommit, finalCommitMessage, isCommitting };
};