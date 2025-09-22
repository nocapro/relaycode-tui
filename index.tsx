import React from 'react';
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useCommitStore } from './src/stores/commit.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionDetailStore } from './src/stores/transaction-detail.store';

const main = () => {
    const args = process.argv.slice(2);

    if (args[0] === 'debug-screen' && args[1]) {
        const screenName = args[1].replace(/\.tsx$/, '');
        const { actions: appActions } = useAppStore.getState();

        switch (screenName) {
            case 'DashboardScreen':
                appActions.showDashboardScreen();
                break;
            case 'GitCommitScreen':
                useCommitStore.getState().actions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                break;
            case 'ReviewProcessingScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.simulateFailureScenario();
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useTransactionDetailStore.getState().actions.loadTransaction('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();