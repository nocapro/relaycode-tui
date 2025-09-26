import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useHistoryStore } from '../stores/history.store';
import { useAppStore } from '../stores/app.store';
import { useNotificationStore } from '../stores/notification.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useDetailStore } from '../stores/detail.store';
import { useCopyStore } from '../stores/copy.store';
import type { TransactionStatus } from '../types/domain.types';
import { EditorService } from '../services/editor.service';
import { getVisibleItemPaths } from '../stores/navigation.utils';
import { HISTORY_VIEW_MODES, HISTORY_ITEM_PATH_SEGMENTS } from '../constants/history.constants';
import { UI_CONFIG } from '../config/ui.config';
import { useViewport } from './useViewport';

export const useTransactionHistoryScreen = () => {
    const store = useHistoryStore();
    const { mode, selectedItemPath, expandedIds, filterQuery, selectedForAction, loadingPaths, actions } = store;
    const { showTransactionDetailScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, expandedIds),
        [transactions, expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(selectedItemPath);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: visibleItemPaths.length,
        layoutConfig: UI_CONFIG.layout.history,
    });

    const openCopyMode = () => {
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        useCopyStore.getState().actions.openForHistory(transactionsToCopy);
    };

    const handleFilterInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode(HISTORY_VIEW_MODES.LIST);
        if (key.return) actions.applyFilter();
    };

    const handleBulkActionsInput = (input: string, key: Key): void => {
        if (key.escape) { //
            actions.setMode(HISTORY_VIEW_MODES.LIST);
            return;
        }
        if (input >= '1' && input <= '3') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Mock Action',
                message: `Bulk action #${input} would be performed here.`,
            });
            actions.setMode(HISTORY_VIEW_MODES.LIST);
        }
    };

    const handleListInput = (input: string, key: Key): void => {
        if (key.upArrow) actions.navigateUp();
        if (key.downArrow) actions.navigateDown();
        if (key.rightArrow) actions.expandOrDrillDown();
        if (key.leftArrow) actions.collapseOrBubbleUp();
        if (key.pageUp) actions.navigatePageUp(viewportHeight);
        if (key.pageDown) actions.navigatePageDown(viewportHeight);
        if (input === ' ') actions.toggleSelection();
        if (key.return) {
            const txId = selectedItemPath.split('/')[0];
            if (txId && !selectedItemPath.includes('/')) { //
                useDetailStore.getState().actions.load(txId);
                showTransactionDetailScreen();
            }
        }
        if (input.toLowerCase() === 'o') {
            const txId = selectedItemPath.split('/')[0];
            const tx = transactions.find(t => t.id === txId);
            if (!tx) return;

            if (selectedItemPath.includes(HISTORY_ITEM_PATH_SEGMENTS.FILE)) {
                const fileId = selectedItemPath.split('/')[2];
                const file = tx.files?.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else {
                const yamlPath = EditorService.getTransactionYamlPath(tx.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        if (input.toLowerCase() === 'f') actions.setMode(HISTORY_VIEW_MODES.FILTER);
        if (input.toLowerCase() === 'c' && selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && selectedForAction.size > 0) actions.setMode(HISTORY_VIEW_MODES.BULK_ACTIONS);
    };

    useInput((input: string, key: Key) => { //
        if (mode === HISTORY_VIEW_MODES.FILTER) {
            handleFilterInput(input, key);
            return;
        }
        if (mode === HISTORY_VIEW_MODES.BULK_ACTIONS) {
            handleBulkActionsInput(input, key);
            return;
        }
        handleListInput(input, key);
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => transactions.filter(tx => txIdsInView.has(tx.id)),
        [transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatusText = filterQuery ? filterQuery : '(none)';
    const startItem = Math.min(viewOffset + 1, visibleItemPaths.length);
    const endItem = Math.min(viewOffset + itemsInView.length, visibleItemPaths.length);
    const showingStatusText = `Showing ${startItem}-${endItem} of ${visibleItemPaths.length} items`;
    
    const hasSelection = selectedForAction.size > 0;

    const statsStatus = useMemo(() => {
        const stats = transactions.reduce((acc, tx) => {
            acc[tx.status] = (acc[tx.status] || 0) + 1;
            return acc;
        }, {} as Record<TransactionStatus, number>);
        
        const parts = [];
        if (stats.COMMITTED) parts.push(`${stats.COMMITTED} Cmt`);
        if (stats.HANDOFF) parts.push(`${stats.HANDOFF} H/O`);
        if (stats.REVERTED) parts.push(`${stats.REVERTED} Rev`);
        if (stats.APPLIED) parts.push(`${stats.APPLIED} App`);
        if (stats.PENDING) parts.push(`${stats.PENDING} Pend`);
        if (stats.FAILED) parts.push(`${stats.FAILED} Fail`);

        return parts.length > 0 ? `Stats: ${parts.join(', ')}` : '';
    }, [transactions]);

    return {
        mode,
        filterQuery,
        selectedForAction,
        selectedItemPath,
        expandedIds,
        actions,
        transactions,
        viewOffset,
        itemsInView,
        loadingPaths,
        transactionsInView,
        pathsInViewSet,
        filterStatus: filterStatusText,
        showingStatus: showingStatusText,
        statsStatus,
        hasSelection,
        visibleItemPaths,
    };
};