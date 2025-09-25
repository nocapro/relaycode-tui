import { useMemo, useState, useEffect } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';
import { useViewport } from './useViewport';
import { useStdoutDimensions } from '../utils';

type NavigableItem =
    | { type: 'prompt' }
    | { type: 'reasoning' }
    | { type: 'script'; id: string }
    | { type: 'file'; id: string };

export const useReviewScreen = () => {
    const store = useReviewStore();
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
    } = store;

    const transaction = useTransactionStore(selectSelectedTransaction);
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const [contentScrollIndex, setContentScrollIndex] = useState(0);
    const [height] = useStdoutDimensions();

    // Reset scroll when body view changes
    useEffect(() => {
        setContentScrollIndex(0);
    }, [bodyView]);

    // Header(2) + Meta(3) + Prompt/Reasoning(2) + Separator(1) + Scripts(N) + Separator(1) + FilesHeader(1) + Separator(1) + BodyMargin(1) + Footer(1)
    const scriptCount = transaction?.scripts?.length || 0;
    const RESERVED_ROWS_MAIN = 13 + scriptCount;
    const { viewOffset, viewportHeight } = useViewport({ selectedIndex: selectedItemIndex, reservedRows: RESERVED_ROWS_MAIN });

    // For body content, it's simpler
    const fileCount = transaction?.files?.length || 0;
    const availableBodyHeight = Math.max(1, height - (RESERVED_ROWS_MAIN + fileCount));

    const navigableItems = useMemo((): NavigableItem[] => {
        if (!transaction) return [];
        const scriptItems: NavigableItem[] = (transaction.scripts || []).map(s => ({ type: 'script', id: s.command }));
        const fileItems: NavigableItem[] = (transaction.files || []).map(f => ({ type: 'file', id: f.id }));
        return [{ type: 'prompt' }, { type: 'reasoning' }, ...scriptItems, ...fileItems];
    }, [transaction]);

    const navigableItemsInView = navigableItems.slice(viewOffset, viewOffset + viewportHeight);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            totalFiles: files.length,
            totalLinesAdded: files.reduce((sum, f) => sum + f.linesAdded, 0),
            totalLinesRemoved: files.reduce((sum, f) => sum + f.linesRemoved, 0),
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
        };
    }, [files, fileReviewStates]);

    const hasRejectedFiles = useMemo(() => {
        if (!fileReviewStates) return false;
        return Array.from(fileReviewStates.values()).some(s => s.status === 'REJECTED');
    }, [fileReviewStates]);

    const { approvedFilesCount } = reviewStats;

    const isFileSelected = navigableItems[selectedItemIndex]?.type === 'file';

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
        tryInstruct,
        showBulkRepair,
        showBulkInstruct,
        executeBulkRepairOption,
        executeBulkInstructOption,
        confirmHandoff,
        scrollReasoningUp,
        scrollReasoningDown,
        navigateScriptErrorUp,
        navigateScriptErrorDown,
        toggleFileApproval,
        rejectAllFiles,
        navigateBulkRepairUp,
        navigateBulkRepairDown,
        navigateBulkInstructUp,
        navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
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
            if (bodyView === 'bulk_repair' || bodyView === 'confirm_handoff' || bodyView === 'bulk_instruct') {
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

    const handleBulkRepairInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkRepairUp();
        if (key.downArrow) navigateBulkRepairDown();
        if (key.return) {
            executeBulkRepairOption(selectedBulkRepairOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '4') {
            executeBulkRepairOption(parseInt(input));
        }
    };
    
    const handleBulkInstructInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkInstructUp();
        if (key.downArrow) navigateBulkInstructDown();
        if (key.return) {
            executeBulkInstructOption(selectedBulkInstructOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '3') {
            executeBulkInstructOption(parseInt(input));
        }
    };

    const handleContentScrollInput = (key: Key): boolean => {
        const contentViews = ['reasoning', 'script_output', 'diff'];
        if (!contentViews.includes(bodyView)) return false;

        if (key.upArrow) {
            setContentScrollIndex(i => Math.max(0, i - 1));
            return true;
        }
        if (key.downArrow) {
            // This is a simplification; a real implementation would need content length.
            setContentScrollIndex(i => i + 1);
            return true;
        }
        if (key.pageUp) {
            setContentScrollIndex(i => Math.max(0, i - availableBodyHeight));
            return true;
        }
        if (key.pageDown) {
            setContentScrollIndex(i => i + availableBodyHeight);
            return true;
        }
        return false;
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
        if (input.toLowerCase() === 'c') { // TODO: this copy logic is not great.
            const currentItem = navigableItems[selectedItemIndex];
            const selectedScript = currentItem?.type === 'script' ? scripts.find(s => s.command === currentItem.id) : undefined;
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
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        // Main View Navigation
        if (key.upArrow) moveSelectionUp(navigableItems.length);
        if (key.downArrow) moveSelectionDown(navigableItems.length);

        const currentItem = navigableItems[selectedItemIndex];

        if (input === ' ') {
            if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(currentItem.id);
                }
            }
        }

        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView('diff');
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView('reasoning');
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView('diff');
            } else if (currentItem?.type === 'reasoning') {
                toggleBodyView('reasoning');
            } else if (currentItem?.type === 'script') {
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
            if (key.shift) {
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'FAILED') tryRepairFile(currentItem.id);
            }
        }

        if (input.toLowerCase() === 'i') {
            if (key.shift) {
                if (hasRejectedFiles) showBulkInstruct();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'REJECTED') {
                    tryInstruct(currentItem.id);
                }
            }
        }
    };

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) {
            return;
        }

        // If we are in a scrollable body view, prioritize that input.
        if (handleContentScrollInput(key)) {
            return;
        }

        switch (bodyView) {
            case 'confirm_handoff': return handleHandoffConfirmInput(input, key);
            case 'bulk_repair': return handleBulkRepairInput(input, key);
            case 'bulk_instruct': return handleBulkInstructInput(input, key);
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
        navigableItems,
        isFileSelected,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex,
        availableBodyHeight,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        ...reviewStats,
        hasRejectedFiles,
    };
};