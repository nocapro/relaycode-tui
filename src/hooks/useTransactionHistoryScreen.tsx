import { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import { useUIStore } from '../stores/ui.store';
import { useAppStore } from '../stores/app.store';
import { useStdoutDimensions } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';
import { useCopyStore } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import { getVisibleItemPaths } from '../stores/navigation.utils';

export const useTransactionHistoryScreen = () => {
    const [columns, rows] = useStdoutDimensions();
    const store = useUIStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const [viewOffset, setViewOffset] = useState(0);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(transactions, store.history_expandedIds),
        [transactions, store.history_expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(store.history_selectedItemPath);

    const NON_CONTENT_HEIGHT = 8; // Header, filter, separators, footer, etc.
    const viewportHeight = Math.max(1, rows - NON_CONTENT_HEIGHT);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);

    const openCopyMode = () => {
        const { history_selectedForAction: selectedForAction } = store;
        const transactionsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        const title = `Select data to copy from ${transactionsToCopy.length} transactions:`;
        const items = CopyService.getCopyItemsForHistory(transactionsToCopy);
        useCopyStore.getState().actions.open(title, items);
    };

    useInput((input, key) => {
        if (store.history_mode === 'FILTER') {
            if (key.escape) store.actions.history_setMode('LIST');
            if (key.return) store.actions.history_applyFilter();
            return;
        }
        if (store.history_mode === 'BULK_ACTIONS') {
            if (key.escape) store.actions.history_setMode('LIST');
            // Add number handlers...
            return;
        }

        // LIST mode inputs
        if (key.upArrow) store.actions.history_navigateUp();
        if (key.downArrow) store.actions.history_navigateDown();
        if (key.rightArrow) store.actions.history_expandOrDrillDown();
        if (key.leftArrow) store.actions.history_collapseOrBubbleUp();
        if (input === ' ') store.actions.history_toggleSelection();

        if (input.toLowerCase() === 'f') store.actions.history_setMode('FILTER');
        if (input.toLowerCase() === 'c' && store.history_selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && store.history_selectedForAction.size > 0) store.actions.history_setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => transactions.filter(tx => txIdsInView.has(tx.id)),
        [transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatus = store.history_filterQuery ? store.history_filterQuery : '(none)';
    const showingStatus = `Showing ${Math.min(viewOffset + 1, visibleItemPaths.length)}-${Math.min(viewOffset + itemsInView.length, visibleItemPaths.length)} of ${visibleItemPaths.length} items`;
    
    return {
        ...store,
        transactions,
        viewOffset,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
        width: columns,
    };
};