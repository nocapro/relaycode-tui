import React from 'react';
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useUIStore } from './src/stores/ui.store';
import { useTransactionStore } from './src/stores/transaction.store';
import { useCommitStore } from './src/stores/commit.store';
import { ReviewService } from './src/services/review.service';

const main = () => {
    // Initialize stores
    useTransactionStore.getState().actions.loadTransactions();
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
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewProcessingScreen();
                break;
            case 'ReviewScreen':
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useUIStore.getState().actions.detail_load('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useUIStore.getState().actions.history_load();
                appActions.showTransactionHistoryScreen();
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