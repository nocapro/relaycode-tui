import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useTransactionDetailStore();
    const { bodyView } = store;

    const transaction = useTransactionStore(s => s.transactions.find(tx => tx.id === store.transactionId));
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        // Main nav
        navigateUp, navigateDown, handleEnterOrRight, handleEscapeOrLeft,
        toggleRevertConfirm,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const { selectedFileIndex } = store;
        const selectedFile = files[selectedFileIndex];
        const title = `Select data to copy from transaction ${transaction.hash}:`;
        const items = CopyService.getCopyItemsForDetail(transaction, selectedFile);
        useCopyStore.getState().actions.open(title, items);
    };

    useInput((input, key) => {
        if (bodyView === 'REVERT_CONFIRM') {
            if (key.escape) toggleRevertConfirm();
            if (key.return) confirmRevert();
            return;
        }

        // Main view input
        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) handleEnterOrRight();
        if (key.escape || key.leftArrow) handleEscapeOrLeft();
    });

    return {
        transaction,
        files,
        ...store,
        actions: {
            ...store.actions,
            showDashboardScreen,
        },
    };
};