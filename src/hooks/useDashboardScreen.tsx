import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useUIStore } from '../stores/ui.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useStdoutDimensions } from '../utils';
import { ReviewService } from '../services/review.service';

export const useDashboardScreen = () => {
    const [columns, rows] = useStdoutDimensions();
    const [viewOffset, setViewOffset] = useState(0);
    const NON_EVENT_STREAM_HEIGHT = 9; // Header, separators, status, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_EVENT_STREAM_HEIGHT);
    const {
        dashboard_status: status,
        dashboard_selectedTransactionIndex: selectedTransactionIndex,
    } = useUIStore();
    const transactions = useTransactionStore(s => s.transactions);
    const pendingTransactions = useTransactionStore(selectTransactionsByStatus('PENDING'));
    const appliedTransactions = useTransactionStore(selectTransactionsByStatus('APPLIED'));

    const {
        dashboard_togglePause,
        dashboard_moveSelectionUp,
        dashboard_moveSelectionDown,
        dashboard_startApproveAll,
        dashboard_confirmAction,
        dashboard_cancelAction,
    } = useUIStore(s => s.actions);
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);
    const uiActions = useUIStore(s => s.actions);

    const pendingApprovals = pendingTransactions.length;
    const pendingCommits = appliedTransactions.length;

    const isModal = status === 'CONFIRM_APPROVE';
    const isProcessing = status === 'APPROVING';

    useEffect(() => {
        if (selectedTransactionIndex < viewOffset) {
            setViewOffset(selectedTransactionIndex);
        } else if (selectedTransactionIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedTransactionIndex - viewportHeight + 1);
        }
    }, [selectedTransactionIndex, viewOffset, viewportHeight]);

    useInput((input, key) => {
        if (isModal) {
            if (key.return) dashboard_confirmAction();
            if (key.escape) dashboard_cancelAction();
            return;
        }

        if (isProcessing) return; // No input while processing

        if (key.upArrow) dashboard_moveSelectionUp();
        if (key.downArrow) dashboard_moveSelectionDown();
        
        if (key.return) {
            const selectedTx = transactions[selectedTransactionIndex];
            if (selectedTx?.status === 'PENDING') {
                // For PENDING transactions, we still go to the review screen.
                ReviewService.loadTransactionForReview(selectedTx.id);
                appActions.showReviewScreen();
            } else if (selectedTx) {
                uiActions.detail_load(selectedTx.id);
                appActions.showTransactionDetailScreen();
            }
        }
        
        if (input.toLowerCase() === 'p') dashboard_togglePause();
        if (input.toLowerCase() === 'a' && pendingApprovals > 0) dashboard_startApproveAll();
        if (input.toLowerCase() === 'c' && pendingCommits > 0) {
            commitActions.prepareCommitScreen();
            appActions.showGitCommitScreen();
        }
        if (input.toLowerCase() === 'l') {
            uiActions.history_load();
            appActions.showTransactionHistoryScreen();
        }
    });
    const transactionsToConfirm = status === 'CONFIRM_APPROVE' ? pendingTransactions : [];

    return {
        status,
        transactions,
        selectedTransactionIndex,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
        width: columns,
    };
};