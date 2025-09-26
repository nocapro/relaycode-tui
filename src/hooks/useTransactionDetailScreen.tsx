import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';
import { OVERLAYS } from '../constants/view.constants';
import { UI_CONFIG } from '../config/ui.config';
import { getParentPath } from '../stores/navigation.utils';

export const useTransactionDetailScreen = () => {
    const store = useDetailStore();
    const transaction = useTransactionStore(selectSelectedTransaction);
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        navigateUp,
        navigateDown,
        expandOrDrillDown,
        collapseOrBubbleUp,
        toggleRevertConfirm,
        confirmRevert,
    } = store.actions;

    const isFilesExpanded = store.expandedItemPaths.has('FILES');
    const layoutConfig = useMemo(() => ({
        ...UI_CONFIG.layout.transactionDetail,
        dynamicRows: {
            count: 3 + (isFilesExpanded ? (files.length || 0) : 0), // navigator items
        },
    }), [isFilesExpanded, files.length]); //

    const { remainingHeight: availableBodyHeight } = useLayout(layoutConfig);
    
    const contentLineCount = useMemo(() => {
        if (store.bodyView === 'PROMPT') return (transaction?.prompt || '').split('\n').length;
        if (store.bodyView === 'REASONING') return (transaction?.reasoning || '').split('\n').length;
        if (store.bodyView === 'DIFF_VIEW') { //
            const fileId = store.focusedItemPath.split('/')[1];
            const file = files.find(f => f.id === fileId);
            return (file?.diff || '').split('\n').length;
        }
        return 0;
    }, [store.bodyView, store.focusedItemPath, transaction, files]);

    const viewport = useContentViewport({ contentLineCount, viewportHeight: availableBodyHeight });

    const openCopyMode = () => {
        if (!transaction) return;
        const { focusedItemPath } = store;
        const fileId = focusedItemPath.split('/')[1];
        const selectedFile = fileId ? files.find(f => f.id === fileId) : undefined;
        useCopyStore.getState().actions.openForDetail(transaction, selectedFile);
    };

    useInput((input: string, key: Key) => {
        if (store.bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }
        
        // --- Back/Collapse action has priority ---
        if (key.leftArrow) {
            const { focusedItemPath, expandedItemPaths, bodyView } = store;
            const canCollapseLocally =
                bodyView === 'DIFF_VIEW' ||
                Boolean(getParentPath(focusedItemPath)) ||
                expandedItemPaths.has(focusedItemPath);

            if (canCollapseLocally) {
                collapseOrBubbleUp();
            } else {
                // Nothing to collapse locally, so trigger screen back navigation.
                useAppStore.getState().actions.navigateBack();
            }
            return;
        }

        // --- Content Scrolling ---
        if (['PROMPT', 'REASONING', 'DIFF_VIEW'].includes(store.bodyView)) {
            if (key.upArrow) {
                viewport.actions.scrollUp();
                return;
            }
            if (key.downArrow) {
                viewport.actions.scrollDown();
                return;
            }
            if (key.pageUp) { viewport.actions.pageUp(); return; }
            if (key.pageDown) { viewport.actions.pageDown(); return; }
        }

        // --- Main Input ---
        if (input.toLowerCase() === 'c') {
            openCopyMode();
            return;
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
            return;
        }
        if (input.toLowerCase() === 'o') {
            if (!transaction) return;
            const { focusedItemPath } = store;
            if (focusedItemPath.includes('/')) { //
                const fileId = focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else { // Is a section, open the transaction YAML
                const yamlPath = EditorService.getTransactionYamlPath(transaction.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        // Navigator movement only if not scrolling content
        if (!['PROMPT', 'REASONING', 'DIFF_VIEW'].includes(store.bodyView)) {
            if (key.upArrow) navigateUp();
            if (key.downArrow) navigateDown();
        }
        if (key.rightArrow || key.return) expandOrDrillDown();
    }, { isActive: useViewStore.getState().activeOverlay === OVERLAYS.NONE });

    return {
        transaction,
        files,
        focusedItemPath: store.focusedItemPath,
        expandedItemPaths: store.expandedItemPaths,
        bodyView: store.bodyView,
        contentScrollIndex: viewport.scrollIndex,
        availableBodyHeight,
    };
};