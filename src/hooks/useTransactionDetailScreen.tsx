import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { EditorService } from '../services/editor.service';

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

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) expandOrDrillDown();
        if (key.escape || key.leftArrow) collapseOrBubbleUp();
    }, { isActive: useViewStore.getState().activeOverlay === 'none' }); // Prevent input when copy overlay is open

    return {
        transaction,
        files,
        focusedItemPath: store.focusedItemPath,
        expandedItemPaths: store.expandedItemPaths,
        bodyView: store.bodyView,
    };
};