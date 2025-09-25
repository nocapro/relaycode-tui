import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useHistoryStore } from '../stores/history.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useCopyStore } from '../stores/copy.store';
import { getVisibleItemPaths } from '../stores/navigation.utils';
import { useViewport } from './useViewport';
import { VIEW_CONSTANTS } from '../constants/view.constants';

export const useTransactionHistoryScreen = () => {
    const store = useHistoryStore();
    const { mode, selectedItemPath, expandedIds, filterQuery, selectedForAction, actions } = store;
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, expandedIds),
        [transactions, expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(selectedItemPath);

    const NON_CONTENT_HEIGHT = VIEW_CONSTANTS.HISTORY_NON_CONTENT_HEIGHT;
    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        padding: NON_CONTENT_HEIGHT,
    });

    const openCopyMode = () => {
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        useCopyStore.getState().actions.openForHistory(transactionsToCopy);
    };

    const handleFilterInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode('LIST');
        if (key.return) actions.applyFilter();
    };

    const handleBulkActionsInput = (_input: string, key: Key): void => {
        if (key.escape) actions.setMode('LIST');
        // Add number handlers...
    };

    const handleListInput = (input: string, key: Key): void => {
        if (key.upArrow) actions.navigateUp();
        if (key.downArrow) actions.navigateDown();
        if (key.rightArrow) actions.expandOrDrillDown();
        if (key.leftArrow) actions.collapseOrBubbleUp();
        if (input === ' ') actions.toggleSelection();

        if (input.toLowerCase() === 'f') actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && selectedForAction.size > 0) actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    };

    useInput((input: string, key: Key) => {
        if (mode === 'FILTER') {
            handleFilterInput(input, key);
            return;
        }
        if (mode === 'BULK_ACTIONS') {
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
    const showingStatusText = `Showing ${Math.min(viewOffset + 1, visibleItemPaths.length)}-${Math.min(viewOffset + itemsInView.length, visibleItemPaths.length)} of ${visibleItemPaths.length} items`;
    
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
        transactionsInView,
        pathsInViewSet,
        filterStatus: filterStatusText,
        showingStatus: showingStatusText,
        visibleItemPaths,
    };
};