import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';
import { CopyService } from '../services/copy.service';

export const useTransactionDetailScreen = () => {
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const store = useTransactionDetailStore();
    const {
        transaction,
        files,
        bodyView,
    } = store;

    const {
        // Main nav
        navigateUp, navigateDown, handleEnterOrRight, handleEscapeOrLeft,
        toggleRevertConfirm,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    const openCopyMode = () => {
        const { transaction, files, selectedFileIndex } = store;
        if (!transaction) return;
        const selectedFile = files[selectedFileIndex];
        CopyService.openCopyForTransactionDetail(transaction, selectedFile);
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
        ...store,
        actions: {
            ...store.actions,
            showDashboardScreen,
        },
    };
};