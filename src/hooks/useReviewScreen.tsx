import { useMemo } from 'react';
import { useInput, useApp } from 'ink';
import { useUIStore } from '../stores/ui.store';
import { useAppStore } from '../stores/app.store';
import { useCopyStore } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import { useTransactionStore, selectReviewStats } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';

export const useReviewScreen = () => {
    const { exit } = useApp();
    const store = useUIStore();
    const {
        selectedTransactionId: transactionId,
        review_selectedItemIndex: selectedItemIndex,
        review_bodyView: bodyView,
        review_patchStatus: patchStatus,
    } = store;

    const transaction = useTransactionStore(state => state.transactions.find(t => t.id === transactionId));
    const transactionActions = useTransactionStore(state => state.actions);
    const reviewStats = useTransactionStore(selectReviewStats(transactionId));
    const { showDashboardScreen } = useAppStore(s => s.actions);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);

    const scripts = transaction?.scripts || [];

    const {
        review_moveSelectionUp: moveSelectionUp,
        review_moveSelectionDown: moveSelectionDown,
        review_expandDiff: expandDiff,
        review_toggleBodyView: toggleBodyView,
        review_setBodyView: setBodyView,
        review_startApplySimulation: startApplySimulation,
        review_approve: approve,
        review_tryRepairFile: tryRepairFile,
        review_showBulkRepair: showBulkRepair,
        review_executeBulkRepairOption: executeBulkRepairOption,
        review_confirmHandoff: confirmHandoff,
        review_scrollReasoningUp: scrollReasoningUp,
        review_scrollReasoningDown: scrollReasoningDown,
        review_navigateScriptErrorUp: navigateScriptErrorUp,
        review_navigateScriptErrorDown: navigateScriptErrorDown,
    } = store.actions;

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
                const scriptIndex = selectedItemIndex - reviewStats.numFiles;
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
            if (reviewStats.approvedFilesCount > 0) {
                if (transactionId) {
                    transactionActions.rejectAllFiles(transactionId);
                }
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp();
        if (key.downArrow) moveSelectionDown();

        if (input.toLowerCase() === 'r') toggleBodyView('reasoning');

        if (input === ' ') {
            if (selectedItemIndex < reviewStats.numFiles) {
                const file = files[selectedItemIndex];
                if (file && file.reviewStatus !== 'FAILED' && transactionId) {
                    transactionActions.toggleFileApproval(transactionId, file.id);
                }
            }
        }

        if (input.toLowerCase() === 'd') {
            if (selectedItemIndex < reviewStats.numFiles) {
                toggleBodyView('diff');
            }
        }

        if (key.return) { // Enter key
             if (selectedItemIndex >= reviewStats.numFiles) { // It's a script
                toggleBodyView('script_output');
            }
        }

        if (input.toLowerCase() === 'a') {
            if (reviewStats.approvedFilesCount > 0) {
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
                if (selectedItemIndex < reviewStats.numFiles) {
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
        ...reviewStats,
    };
};