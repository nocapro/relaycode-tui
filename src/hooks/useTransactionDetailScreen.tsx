import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo, useState, useEffect } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';
import { useStdoutDimensions } from '../utils';

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
    const [contentScrollIndex, setContentScrollIndex] = useState(0);
    const [, height] = useStdoutDimensions();

    // Reset scroll when body view changes
    useEffect(() => {
        setContentScrollIndex(0);
    }, [store.bodyView]);

    // Header(2) + Meta(4) + Navigator(3+) + Separator(1) + BodyMargin(1) + Separator(1) + Footer(1)
    const availableBodyHeight = Math.max(1, height - 13 - (transaction?.files?.length || 0));

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
             let contentLines = 0;
            if (store.bodyView === 'PROMPT') {
                contentLines = (transaction?.prompt || '').split('\n').length;
            } else if (store.bodyView === 'REASONING') {
                contentLines = (transaction?.reasoning || '').split('\n').length;
            } else if (store.bodyView === 'DIFF_VIEW') {
                const fileId = store.focusedItemPath.split('/')[1];
                const file = files.find(f => f.id === fileId);
                contentLines = (file?.diff || '').split('\n').length;
            }
            
            if (key.upArrow) {
                setContentScrollIndex(i => Math.max(0, i - 1));
                return;
            }
            if (key.downArrow) {
                setContentScrollIndex(i => Math.min(Math.max(0, contentLines - availableBodyHeight), i + 1));
                return;
            }
            if (key.pageUp) {
                setContentScrollIndex(i => Math.max(0, i - availableBodyHeight));
                return;
            }
            if (key.pageDown) {
                setContentScrollIndex(i => Math.min(Math.max(0, contentLines - availableBodyHeight), i + availableBodyHeight));
                return;
            }
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
        contentScrollIndex,
        availableBodyHeight,
    };
};