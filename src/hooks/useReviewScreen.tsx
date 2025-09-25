import { useMemo } from 'react';
import { useInput, useApp, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useViewStore } from '../stores/view.store';
import { useAppStore } from '../stores/app.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';

export const useReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const transactionId = useViewStore(s => s.selectedTransactionId);
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
    } = store;

    const transaction = useTransactionStore(state => state.transactions.find(t => t.id === transactionId));
    const { showDashboardScreen } = useAppStore(s => s.actions);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
            approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
            approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files, fileReviewStates]);

    const { numFiles, approvedFilesCount } = reviewStats;

    const scripts = transaction?.scripts || [];

    const {
        moveSelectionUp,
        moveSelectionDown,
        expandDiff,
        toggleBodyView,
        setBodyView,
        startApplySimulation,
        approve,
        tryRepairFile,
        showBulkRepair,
        executeBulkRepairOption,
        confirmHandoff,
        scrollReasoningUp,
        scrollReasoningDown,
        navigateScriptErrorUp,
        navigateScriptErrorDown,
        toggleFileApproval,
        rejectAllFiles,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1') { // For demo purposes
            startApplySimulation('success'); return true;
        }
        if (input === '2') { // For demo purposes
            startApplySimulation('failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        if (key.escape) {
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff') {
                toggleBodyView(bodyView);
            } else if (bodyView !== 'none') {
                setBodyView('none');
            }
            return true;
        }
        return false;
    };

    const handleHandoffConfirmInput = (_input: string, key: Key): void => {
        if (key.return) confirmHandoff();
    };

    const handleBulkRepairInput = (input: string) => {
        if (input >= '1' && input <= '4') {
            executeBulkRepairOption(parseInt(input));
        }
    };

    const handleReasoningInput = (input: string, key: Key): void => {
        if (key.upArrow) scrollReasoningUp();
        if (key.downArrow) scrollReasoningDown();
        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');
    };

    const handleScriptOutputInput = (input: string, key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (key.return) toggleBodyView('script_output');
        if (input.toLowerCase() === 'c') {
            const scriptIndex = selectedItemIndex - numFiles;
            const selectedScript = scripts[scriptIndex];
            if (selectedScript) {
                // eslint-disable-next-line no-console
                console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
            }
        }
    };

    const handleDiffInput = (input: string) => {
        if (input.toLowerCase() === 'x') expandDiff();
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transactionId) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();
        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');

        if (input === ' ') {
            if (selectedItemIndex < numFiles) {
                const file = files[selectedItemIndex];
                const fileState = file ? fileReviewStates.get(file.id) : undefined;
                if (file && fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(file.id);
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < numFiles) {
                toggleBodyView('diff');
            }
        }

        if (key.return) { // Enter key
            if (selectedItemIndex >= numFiles) { // It's a script
                toggleBodyView('script_output');
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }

        if (input.toLowerCase() === 't') {
            if (key.shift) { // Bulk repair
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    const fileState = file ? fileReviewStates.get(file.id) : undefined;
                    if (file && fileState?.status === 'FAILED') tryRepairFile();
                }
            }
        }
    };

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) {
            return;
        }

        switch (bodyView) {
            case 'confirm_handoff': return handleHandoffConfirmInput(input, key);
            case 'bulk_repair': return handleBulkRepairInput(input);
            case 'reasoning': return handleReasoningInput(input, key);
            case 'script_output': return handleScriptOutputInput(input, key);
            case 'diff': return handleDiffInput(input);
            default: return handleMainNavigationInput(input, key);
        }
    });

    return {
        ...store,
        fileReviewStates,
        selectedItemIndex,
        transaction,
        files,
        scripts,
        patchStatus,
        ...reviewStats,
    };
};