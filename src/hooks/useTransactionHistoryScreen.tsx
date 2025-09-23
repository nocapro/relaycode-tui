import { useState, useMemo, useEffect } from 'react';
import { useInput } from 'ink';
import { useTransactionHistoryStore, getVisibleItemPaths } from '../stores/transaction-history.store';
import { useAppStore } from '../stores/app.store';
import { useStdoutDimensions } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';

export const useTransactionHistoryScreen = () => {
    const [, rows] = useStdoutDimensions();
    const store = useTransactionHistoryStore();
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const transactions = useTransactionStore(s => s.transactions);

    const [viewOffset, setViewOffset] = useState(0);

    const visibleItemPaths = useMemo(
        () => getVisibleItemPaths(store.transactions, store.expandedIds),
        [store.transactions, store.expandedIds],
    );
    const selectedIndex = visibleItemPaths.indexOf(store.selectedItemPath);

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
        const { selectedForAction } = store;
        const transactionsToCopy = store.transactions.filter(tx => selectedForAction.has(tx.id));

        if (transactionsToCopy.length === 0) return;
        
        const title = `Select data to copy from ${transactionsToCopy.length} transactions:`;
        const items: CopyItem[] = [
            { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactionsToCopy.map(tx => tx.message).join('\n'), isDefaultSelected: true },
            { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactionsToCopy.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
            { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactionsToCopy.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
            { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactionsToCopy.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
            { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactionsToCopy.map(tx => tx.id).join('\n') },
            { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
        ];

        useCopyStore.getState().actions.open(title, items);
    };

    useInput((input, key) => {
        if (store.mode === 'FILTER') {
            if (key.escape) store.actions.setMode('LIST');
            if (key.return) store.actions.applyFilter();
            return;
        }
        if (store.mode === 'BULK_ACTIONS') {
            if (key.escape) store.actions.setMode('LIST');
            // Add number handlers...
            return;
        }

        // LIST mode inputs
        if (key.upArrow) store.actions.navigateUp();
        if (key.downArrow) store.actions.navigateDown();
        if (key.rightArrow) store.actions.expandOrDrillDown();
        if (key.leftArrow) store.actions.collapseOrBubbleUp();
        if (input === ' ') store.actions.toggleSelection();

        if (input.toLowerCase() === 'f') store.actions.setMode('FILTER');
        if (input.toLowerCase() === 'c' && store.selectedForAction.size > 0) openCopyMode();
        if (input.toLowerCase() === 'b' && store.selectedForAction.size > 0) store.actions.setMode('BULK_ACTIONS');
        
        if (key.escape || input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    const itemsInView = visibleItemPaths.slice(viewOffset, viewOffset + viewportHeight);
    const txIdsInView = useMemo(() => new Set(itemsInView.map(p => p.split('/')[0])), [itemsInView]);
    const transactionsInView = useMemo(
        () => store.transactions.filter(tx => txIdsInView.has(tx.id)),
        [store.transactions, txIdsInView],
    );
    const pathsInViewSet = useMemo(() => new Set(itemsInView), [itemsInView]);

    const filterStatus = store.filterQuery ? store.filterQuery : '(none)';
    const showingStatus = `Showing ${viewOffset + 1}-${viewOffset + itemsInView.length} of ${visibleItemPaths.length} items`;
    
    return {
        store,
        viewOffset,
        itemsInView,
        transactionsInView,
        pathsInViewSet,
        filterStatus,
        showingStatus,
        visibleItemPaths,
    };
};