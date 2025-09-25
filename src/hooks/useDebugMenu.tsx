import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useUIStore } from '../stores/ui.store';
import { useInitStore } from '../stores/init.store';
import { useCommitStore } from '../stores/commit.store';
import { useCopyStore } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';
import { CopyService } from '../services/copy.service';
import { ReviewService } from '../services/review.service';
import type { MenuItem } from '../types/debug.types';
import { useTransactionStore } from '../stores/transaction.store';
import type { Transaction } from '../types/domain.types';
import { moveIndex } from '../stores/navigation.utils';
export type { MenuItem } from '../types/debug.types';

const useDebugMenuActions = () => {
    const { actions: appActions } = useAppStore();
    const { actions: initActions } = useInitStore();
    const { actions: commitActions } = useCommitStore();
    const { actions: uiActions } = useUIStore();

    const menuItems: MenuItem[] = [
        {
            title: 'Splash Screen',
            action: () => appActions.showSplashScreen(),
        },
        {
            title: 'Init: Analyze Phase',
            action: () => {
                initActions.setPhase('ANALYZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Interactive Phase',
            action: () => {
                initActions.setPhase('INTERACTIVE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Finalize Phase',
            action: () => {
                initActions.setPhase('FINALIZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Dashboard: Listening',
            action: () => {
                uiActions.dashboard_setStatus('LISTENING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Confirm Approve',
            action: () => {
                uiActions.dashboard_startApproveAll();
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Approving',
            action: () => {
                uiActions.dashboard_setStatus('APPROVING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                ReviewService.loadTransactionForReview('2');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                uiActions.review_setBodyView('diff');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                ReviewService.loadTransactionForReview('1', { bodyView: 'reasoning' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '1');
                if (!tx) return;
                // On load, selected index is 0, so we can assume the first file.
                const selectedFile = tx.files && tx.files.length > 0
                    ? tx.files[0]
                    : undefined;
                const items = CopyService.getCopyItemsForReview(tx, tx.files || [], selectedFile);
                useCopyStore.getState().actions.open(
                    'Select data to copy from review:', items);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                ReviewService.loadTransactionForReview('2');
                appActions.showReviewScreen();
                uiActions.review_setBodyView('script_output');
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                ReviewService.loadTransactionForReview('1', { bodyView: 'bulk_repair' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                ReviewService.loadTransactionForReview('1', { bodyView: 'confirm_handoff' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing',
            action: () => {
                ReviewService.loadTransactionForReview('2'); // Use tx '2' which has scripts
                appActions.showReviewProcessingScreen();
            },
        },
        {
            title: 'Git Commit Screen',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            },
        },
        {
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                uiActions.detail_load('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Transaction History Screen',
            action: () => {
                uiActions.history_load();
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L1 Drilldown',
            action: () => {
                uiActions.history_prepareDebugState('l1-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Diff)',
            action: () => {
                uiActions.history_prepareDebugState('l2-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Filter Mode',
            action: () => {
                uiActions.history_prepareDebugState('filter');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Copy Mode',
            action: () => {
                uiActions.history_prepareDebugState('copy');
                appActions.showTransactionHistoryScreen();
                const allTxs = useTransactionStore.getState().transactions;
                // The 'copy' debug state sets selectedForAction to ['3', '6']. We'll use that directly.
                const txsToCopy = allTxs.filter((tx: Transaction) => ['3', '6'].includes(tx.id));
                const items = CopyService.getCopyItemsForHistory(txsToCopy);
                useCopyStore.getState().actions.open(
                    `Select data to copy from ${txsToCopy.length} transactions:`, items);
            },
        },
    ];
    return { menuItems, appActions };
};

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { menuItems, appActions } = useDebugMenuActions();
    
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', menuItems.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', menuItems.length));
            return;
        }
        if (key.return) {
            const item = menuItems[selectedIndex];
            if (item) {
                item.action();
                useUIStore.getState().actions.setActiveOverlay('none');
            }
            return;
        }
        if (key.escape) {
            useUIStore.getState().actions.setActiveOverlay('none');
            return;
        }

        // No ctrl/meta keys for selection shortcuts, and only single characters
        if (key.ctrl || key.meta || input.length !== 1) return;

        if (input >= '1' && input <= '9') {
            const targetIndex = parseInt(input, 10) - 1;
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        } else if (input.toLowerCase() >= 'a' && input.toLowerCase() <= 'z') {
            const targetIndex = 9 + (input.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
            if (targetIndex < menuItems.length) {
                setSelectedIndex(targetIndex);
            }
        }
    });

    return {
        selectedIndex,
        menuItems,
    };
};