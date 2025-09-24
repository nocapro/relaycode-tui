import { useMemo, useDebugValue } from 'react';
import { useInput, useApp } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useTransactionStore } from '../stores/transaction.store';
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import type { FileItem } from '../types/domain.types';

export const useReviewScreen = () => {
    const { exit } = useApp();
    const store = useReviewStore();
    const { transactionId, fileReviewStates } = store;
    const transaction = useTransactionStore(s => s.transactions.find(t => t.id === transactionId));
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const {
        selectedItemIndex, bodyView,
    } = store;

    const files: FileItem[] = useMemo(() => {
        if (!transaction?.files) return [];
        return transaction.files.map(file => ({
            ...file,
            reviewStatus: fileReviewStates[file.id]?.status || 'AWAITING',
            reviewError: fileReviewStates[file.id]?.error,
        }));
    }, [transaction, fileReviewStates]);

    const scripts = transaction?.scripts || [];
    const patchStatus = store.patchStatus;

    const {
        moveSelectionUp, moveSelectionDown, toggleFileApproval, expandDiff,
        toggleBodyView, setBodyView,
        startApplySimulation, rejectAllFiles, approve,
        tryRepairFile, showBulkRepair, executeBulkRepairOption, confirmHandoff,
        scrollReasoningUp, scrollReasoningDown, navigateScriptErrorUp, navigateScriptErrorDown,
    } = store.actions;
    const {
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    } = useMemo(() => {
        const approvedFiles = files.filter((f: FileItem) => f.reviewStatus === 'APPROVED');
        return {
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
            approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
            approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
        };
    }, [files]);

    const openCopyMode = () => {
        if (!transaction) return;
        const title = 'Select data to copy from review:';
        const selectedFile = selectedItemIndex < files.length ? files[selectedItemIndex] : undefined;
        const items = CopyService.getCopyItemsForReview(transaction, transaction.files || [], selectedFile);
        useCopyStore.getState().actions.open(title, items);
    };

    useInput((input, key) => {
        // For demo purposes: Pressing 1 or 2 triggers the processing screen simulation.
        if (input === '1') {
            startApplySimulation('success');
            return;
        }
        if (input === '2') {
            // The store's default is failure, but to re-trigger the processing screen
            startApplySimulation('failure');
            return;
        }

        if (input.toLowerCase() === 'q') exit();

        // Handle Escape key - context-sensitive behavior
        if (key.escape) {
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff') {
                toggleBodyView(bodyView); // Close modal
            } else if (bodyView !== 'none') {
                setBodyView('none');
            } else {
                showDashboardScreen();
            }
            return;
        }

        // Handoff Confirmation
        if (bodyView === 'confirm_handoff') {
            if (key.return) {
                confirmHandoff();
            }
            return;
        }

        // Bulk Repair Navigation
        if (bodyView === 'bulk_repair') {
            if (input >= '1' && input <= '4') {
                executeBulkRepairOption(parseInt(input));
            }
            return;
        }

        // Reasoning Scroll Navigation
        if (bodyView === 'reasoning') {
            if (key.upArrow) scrollReasoningUp();
            if (key.downArrow) scrollReasoningDown();
            if (input.toLowerCase() === 'r') toggleBodyView('reasoning');
            return;
        }

        // Script Output Navigation
        if (bodyView === 'script_output') {
            if (input.toLowerCase() === 'j') navigateScriptErrorDown();
            if (input.toLowerCase() === 'k') navigateScriptErrorUp();
            if (key.return) toggleBodyView('script_output');
            if (input.toLowerCase() === 'c') {
                // Copy script output
                const scriptIndex = selectedItemIndex - numFiles;
                const selectedScript = scripts[scriptIndex];
                if (selectedScript) {
                    // eslint-disable-next-line no-console
                    console.log(`[CLIPBOARD] Copied script output: ${selectedScript.command}`);
                }
            }
            return;
        }

        // Diff View Navigation
        if (bodyView === 'diff') {
            if (input.toLowerCase() === 'x') expandDiff();
            if (input.toLowerCase() === 'd') toggleBodyView('diff');
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0) {
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
                if (file && file.reviewStatus !== 'FAILED') {
                    toggleFileApproval();
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

        // Handle T for single repair and Shift+T for bulk repair
        if (input.toLowerCase() === 't') {
            if (key.shift) { // Bulk repair
                const hasFailedFiles = files.some(f => f.reviewStatus === 'FAILED');
                if (hasFailedFiles) {
                    showBulkRepair();
                }
            } else {
                if (selectedItemIndex < numFiles) {
                    const file = files[selectedItemIndex];
                    if (file && file.reviewStatus === 'FAILED') {
                        tryRepairFile();
                    }
                }
            }
        }

        if (input.toLowerCase() === 'q') {
            showDashboardScreen();
        }
    });

    return {
        ...store,
        transaction,
        files,
        scripts,
        patchStatus,
        numFiles,
        approvedFilesCount,
        approvedLinesAdded,
        approvedLinesRemoved,
    };
};