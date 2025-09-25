import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';

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
        header: 2, // Header text + separator
        fixedRows: 4, // Meta info
        separators: 2, // after nav, after body
        marginsY: 1, // for body
        footer: 2, // ActionFooter can be tall
        dynamicRows: {
            count: 3 + (isFilesExpanded ? (files.length || 0) : 0), // navigator items
        },
    }), [isFilesExpanded, files.length]);

    const { remainingHeight: availableBodyHeight } = useLayout(layoutConfig);
    
    const contentLineCount = useMemo(() => {
        if (store.bodyView === 'PROMPT') return (transaction?.prompt || '').split('\n').length;
        if (store.bodyView === 'REASONING') return (transaction?.reasoning || '').split('\n').length;
        if (store.bodyView === 'DIFF_VIEW') {
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
        
        // --- Content Scrolling ---
        if (store.bodyView === 'PROMPT' || store.bodyView === 'REASONING' || store.bodyView === 'DIFF_VIEW') {
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
            if (focusedItemPath.includes('/')) { // Is a file
                const fileId = focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                if (file) EditorService.openFileInEditor(file.path);
            } else { // Is a section, open the transaction YAML
                const yamlPath = EditorService.getTransactionYamlPath(transaction.hash);
                EditorService.openFileInEditor(yamlPath);
            }
        }

        // Navigator movement only if not scrolling content
        if (store.bodyView !== 'PROMPT' && store.bodyView !== 'REASONING' && store.bodyView !== 'DIFF_VIEW') {
            if (key.upArrow) navigateUp();
            if (key.downArrow) navigateDown();
        }
        if (key.rightArrow) expandOrDrillDown();
        if (key.leftArrow) collapseOrBubbleUp();
        if (key.return) expandOrDrillDown();
        if (key.escape) collapseOrBubbleUp();
    }, { isActive: useViewStore.getState().activeOverlay === 'none' }); // Prevent input when copy overlay is open

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