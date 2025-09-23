import { useState } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useInitStore } from '../stores/init.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useCopyStore } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';
import { useTransactionHistoryStore } from '../stores/transaction-history.store';
import { ReviewService } from '../services/review.service';
import { CopyService } from '../services/copy.service';
import { useReviewStore } from '../stores/review.store';
import type { MenuItem } from '../types/debug.types';
import { moveIndex } from '../stores/navigation.utils';
export type { MenuItem } from '../types/debug.types';

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const appActions = useAppStore(s => s.actions);
    const dashboardActions = useDashboardStore(s => s.actions);
    const initActions = useInitStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const detailActions = useTransactionDetailStore(s => s.actions);
    const historyActions = useTransactionHistoryStore(s => s.actions);

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
                dashboardActions.setStatus('LISTENING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Confirm Approve',
            action: () => {
                dashboardActions.setStatus('CONFIRM_APPROVE');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Approving',
            action: () => {
                dashboardActions.setStatus('APPROVING');
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
                appActions.showReviewScreen();
                setTimeout(() => {
                    useReviewStore.getState().actions.toggleBodyView('diff');
                }, 100);
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                setTimeout(() => {
                    useReviewStore.getState().actions.toggleBodyView('reasoning');
                }, 100);
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                setTimeout(() => {
                    const { hash, message, prompt, reasoning, files, selectedItemIndex } = useReviewStore.getState();
                    const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
                    CopyService.open('DEBUG_REVIEW', { txInfo: { hash, message, prompt, reasoning }, files, selectedFile });
                }, 100);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                ReviewService.loadTransactionForReview('2');
                appActions.showReviewScreen();
                setTimeout(() => {
                    useReviewStore.getState().actions.toggleBodyView('script_output');
                }, 100);
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                setTimeout(() => {
                    useReviewStore.getState().actions.showBulkRepair();
                }, 100);
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                ReviewService.loadTransactionForReview('1');
                appActions.showReviewScreen();
                setTimeout(() => {
                    useReviewStore.getState().actions.executeBulkRepairOption(3); // Option 3 is Handoff
                }, 100);
            },
        },
        {
            title: 'Review Processing',
            action: () => appActions.showReviewProcessingScreen(),
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
                detailActions.loadTransaction('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Transaction History Screen',
            action: () => {
                historyActions.load();
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L1 Drilldown',
            action: () => {
                historyActions.prepareDebugState('l1-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Diff)',
            action: () => {
                historyActions.prepareDebugState('l2-drill');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Filter Mode',
            action: () => {
                historyActions.prepareDebugState('filter');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Copy Mode',
            action: () => {
                historyActions.prepareDebugState('copy');
                const { transactions, selectedForAction } = useTransactionHistoryStore.getState();
                const selectedTxs = transactions.filter(tx => selectedForAction.has(tx.id));
                appActions.showTransactionHistoryScreen();
                CopyService.open('DEBUG_HISTORY', { transactions: selectedTxs });
            },
        },
    ];

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
                appActions.toggleDebugMenu();
            }
            return;
        }
        if (key.escape || (key.ctrl && input === 'b')) {
            appActions.toggleDebugMenu();
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