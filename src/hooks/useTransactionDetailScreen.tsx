import { useInput } from 'ink';
import { useUIStore } from '../stores/ui.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useUIStore();
    const {
        selectedTransactionId,
        detail_bodyView: bodyView,
    } = store;

    const transaction = useTransactionStore(s => s.transactions.find(tx => tx.id === selectedTransactionId));
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        // Main nav
        detail_navigateUp: navigateUp,
        detail_navigateDown: navigateDown,
        detail_handleEnterOrRight: handleEnterOrRight,
        detail_handleEscapeOrLeft: handleEscapeOrLeft,
        detail_toggleRevertConfirm: toggleRevertConfirm,
        // Revert modal nav
        detail_confirmRevert: confirmRevert,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const { detail_selectedFileIndex: selectedFileIndex } = store;
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
        navigatorFocus: store.detail_navigatorFocus,
        expandedSection: store.detail_expandedSection,
        selectedFileIndex: store.detail_selectedFileIndex,
        bodyView: store.detail_bodyView,
        actions: {
            showDashboardScreen,
        },
    };
};