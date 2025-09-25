import { useInput, type Key } from 'ink';
import { useDetailStore } from '../stores/detail.store';
import { useViewStore } from '../stores/view.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useMemo } from 'react';
import { useCopyStore } from '../stores/copy.store';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useDetailStore();
    const selectedTransactionId = useViewStore(s => s.selectedTransactionId);
    const {
        bodyView,
    } = store;

    const transaction = useTransactionStore(s => s.transactions.find(tx => tx.id === selectedTransactionId));
    const files = useMemo(() => transaction?.files || [], [transaction]);

    const {
        // Main nav
        navigateUp,
        navigateDown,
        handleEnterOrRight,
        handleEscapeOrLeft,
        toggleRevertConfirm,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const { selectedFileIndex } = store;
        const selectedFile = files[selectedFileIndex];
        useCopyStore.getState().actions.openForDetail(transaction, selectedFile);
    };

    const handleRevertConfirmInput = (_input: string, key: Key): void => {
        if (key.escape) toggleRevertConfirm();
        if (key.return) confirmRevert();
    };

    const handleMainInput = (input: string, key: Key): void => {
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
    };

    useInput((input: string, key: Key) => {
        if (bodyView === 'REVERT_CONFIRM') {
            return handleRevertConfirmInput(input, key);
        }
        return handleMainInput(input, key);
    });

    return {
        transaction,
        files,
        navigatorFocus: store.navigatorFocus,
        expandedSection: store.expandedSection,
        selectedFileIndex: store.selectedFileIndex,
        bodyView: store.bodyView,
        actions: {
            showDashboardScreen,
        },
    };
};