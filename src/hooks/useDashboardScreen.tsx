import { useState, useEffect, useRef } from 'react';
import { useInput } from 'ink';
import { useDashboardStore } from '../stores/dashboard.store';
import { useAppStore } from '../stores/app.store';
import { useCommitStore } from '../stores/commit.store';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import type { LayoutConfig } from './useLayout';
import { DASHBOARD_STATUS } from '../constants/dashboard.constants';
import { useViewport } from './useViewport';
import { useListNavigator } from './useListNavigator';

export const useDashboardScreen = ({ layoutConfig }: { layoutConfig: LayoutConfig }) => {
    const {
        status,
        selectedTransactionIndex,
        expandedTransactionId,
    } = useDashboardStore();
    const transactions = useTransactionStore(s => s.transactions);
    const [newTransactionIds, setNewTransactionIds] = useState(new Set<string>());
    const prevTransactionIds = useRef(new Set(transactions.map(t => t.id)));

    const pendingTransactions = useTransactionStore(selectTransactionsByStatus('PENDING'));
    const appliedTransactions = useTransactionStore(selectTransactionsByStatus('APPLIED'));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex: selectedTransactionIndex,
        itemCount: transactions.length,
        layoutConfig,
    });

    useEffect(() => {
        const currentIds = new Set(transactions.map(t => t.id));
        const newIds = new Set<string>();

        for (const id of currentIds) {
            if (!prevTransactionIds.current.has(id)) {
                newIds.add(id);
            }
        }

        if (newIds.size > 0) {
            setNewTransactionIds(current => new Set([...current, ...newIds]));
            newIds.forEach(id => {
                setTimeout(() => {
                    setNewTransactionIds(current => {
                        const next = new Set(current);
                        next.delete(id);
                        return next;
                    });
                }, 1000);
            });
        }

        prevTransactionIds.current = currentIds;
    }, [transactions]);

    const {
        togglePause,
        startApproveAll,
        confirmAction,
        cancelAction,
        toggleExpand,
    } = useDashboardStore(s => s.actions);
    const appActions = useAppStore(s => s.actions);
    const commitActions = useCommitStore(s => s.actions);

    const pendingApprovals = pendingTransactions.length;
    const pendingCommits = appliedTransactions.length;

    const isModal = status === DASHBOARD_STATUS.CONFIRM_APPROVE;
    const isProcessing = status === DASHBOARD_STATUS.APPROVING;

    useInput((_input, key) => {
        if (key.return) confirmAction();
        if (key.escape) cancelAction();
    }, { isActive: isModal });

    useListNavigator({
        itemCount: transactions.length,
        viewportHeight,
        selectedIndex: selectedTransactionIndex,
        onIndexChange: (index) => {
            useDashboardStore.getState().actions.setSelectedIndex(index);
            useDashboardStore.getState().actions.setExpandedTransactionId(null);
        },
        isActive: !isModal && !isProcessing,
        onKey: (input, key) => {
            if (key.leftArrow) {
                if (expandedTransactionId) toggleExpand();
                return;
            }
            if (key.rightArrow) {
                if (transactions[selectedTransactionIndex] && !expandedTransactionId) toggleExpand();
                return;
            }
            if (key.return) {
                const selectedTx = transactions[selectedTransactionIndex];
                if (!selectedTx) return;
                
                const isExpanded = expandedTransactionId === selectedTx.id;

                if (isExpanded) {
                    if (selectedTx.status === 'PENDING') {
                        useReviewStore.getState().actions.load(selectedTx.id);
                        appActions.showReviewScreen();
                    } else {
                        useDetailStore.getState().actions.load(selectedTx.id);
                        appActions.showTransactionDetailScreen();
                    }
                } else {
                    toggleExpand();
                }
                return;
            }
            if (input.toLowerCase() === 'p') togglePause();
            if (input.toLowerCase() === 'a' && pendingApprovals > 0) startApproveAll();
            if (input.toLowerCase() === 'c' && pendingCommits > 0) {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            }
            if (input.toLowerCase() === 'l') {
                useHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
            }
        },
    });

    const transactionsToConfirm = status === DASHBOARD_STATUS.CONFIRM_APPROVE ? pendingTransactions : [];

    return {
        status,
        transactions,
        selectedTransactionIndex,
        expandedTransactionId,
        pendingApprovals,
        pendingCommits,
        isModal,
        isProcessing,
        newTransactionIds,
        viewOffset,
        viewportHeight,
        transactionsToConfirm,
    };
};