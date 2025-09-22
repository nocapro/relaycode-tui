import { useInput } from 'ink';
import { useTransactionDetailStore } from '../stores/transaction-detail.store';
import { useAppStore } from '../stores/app.store';

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
        toggleCopyMode, toggleRevertConfirm,
        // Copy mode nav
        copyModeNavigateUp,
        copyModeNavigateDown,
        copyModeToggleSelection,
        copyModeExecuteCopy,
        // Revert modal nav
        confirmRevert,
    } = store.actions;

    useInput((input, key) => {
        if (bodyView === 'COPY_MODE') {
            if (key.upArrow) copyModeNavigateUp();
            if (key.downArrow) copyModeNavigateDown();
            if (input === ' ') copyModeToggleSelection();
            if (key.return) copyModeExecuteCopy();
            if (key.escape || input.toLowerCase() === 'c') toggleCopyMode();
            return;
        }
        
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
            toggleCopyMode();
        }
        if (input.toLowerCase() === 'u') {
            toggleRevertConfirm();
        }

        if (key.upArrow) navigateUp();
        if (key.downArrow) navigateDown();
        if (key.return || key.rightArrow) handleEnterOrRight();
        if (key.escape || key.leftArrow) handleEscapeOrLeft();
    });

    const copyOptions = [
        { key: 'M', label: 'Git Message' },
        { key: 'P', label: 'Prompt' },
        { key: 'R', label: 'Reasoning' },
        { key: 'A', label: `All Diffs (${files.length} files)` },
        { key: 'F', label: `Diff for: ${files[store.selectedFileIndex]?.path || 'No file selected'}` },
        { key: 'U', label: 'UUID' },
        { key: 'Y', label: 'Full YAML representation' },
    ];

    return {
        ...store,
        copyOptions,
        actions: {
            ...store.actions,
            showDashboardScreen,
        },
    };
};