import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';
import { CopyService } from '../services/copy.service';
import { useTransactionStore } from '../stores/transaction.store';
import { useMemo } from 'react';

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
        const { selectedFileIndex } = store;
        if (!transaction) return;
        const selectedFile = files[selectedFileIndex];
        CopyService.open('TRANSACTION_DETAIL', { transaction, selectedFile });
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