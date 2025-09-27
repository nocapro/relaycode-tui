import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';
import { UI_CONFIG } from '../config/ui.config';
import { REVIEW_BODY_VIEWS } from '../constants/review.constants';
import { useListNavigator } from './useListNavigator';
import type { ReviewBodyView } from '../stores/review.store';
import { useViewport } from './useViewport';

type NavigableItem =
    | { type: 'commit_message' }
    | { type: 'prompt' }
    | { type: 'reasoning' }
    | { type: 'script'; id: string }
    | { type: 'file'; id: string };

export const useReviewScreen = () => { // eslint-disable-line max-lines-per-function
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

    const scriptCount = transaction?.scripts?.length || 0;
    const fileCount = transaction?.files?.length || 0;

    const layout = UI_CONFIG.layout.review;

    // Layout for the main navigable item list (prompt, reasoning, files, etc.)
    const mainListLayoutConfig = useMemo(() => ({
        header: layout.header,
        fixedRows: layout.fixedRows,
        marginsY: layout.marginsY,
        separators: layout.separators,
        footer: layout.footer,
        dynamicRows: {
            count: bodyView !== REVIEW_BODY_VIEWS.NONE ? layout.bodyHeightReservation : 0,
        },
    }), [bodyView, layout]);

    const { remainingHeight: listViewportHeight } = useLayout(mainListLayoutConfig);
    const { viewOffset } = useViewport({
        selectedIndex: selectedItemIndex,
        itemCount: 100,
        layoutConfig: mainListLayoutConfig,
    });

    // Layout for the body content (diff, reasoning, etc.)
    const bodyLayoutConfig = useMemo(() => ({
        header: layout.header,
        separators: layout.separators,
        fixedRows: 2, // meta
        marginsY: 1 + 1 + 1, // meta, scripts, files
        footer: 2,
        dynamicRows: { count: 2 + scriptCount + 1 + fileCount }, // prompt, reasoning, scripts, 'FILES' header, files
    }), [layout, scriptCount, fileCount]);

    const { remainingHeight: availableBodyHeight } = useLayout(bodyLayoutConfig);

    const navigableItems = useMemo((): NavigableItem[] => {
        if (!transaction) return [];
        const scriptItems: NavigableItem[] = (transaction.scripts || []).map(s => ({ type: 'script', id: s.command }));
        const fileItems: NavigableItem[] = (transaction.files || []).map(f => ({ type: 'file', id: f.id }));
        return [{ type: 'commit_message' }, { type: 'prompt' }, { type: 'reasoning' }, ...scriptItems, ...fileItems];
    }, [transaction]);

    const contentLineCount = useMemo(() => {
        const currentItem = navigableItems[selectedItemIndex];
        switch (bodyView) { //
            case REVIEW_BODY_VIEWS.COMMIT_MESSAGE:
                return (transaction?.message || '').split('\n').length;
            case REVIEW_BODY_VIEWS.REASONING:
                return (transaction?.reasoning || '').split('\n').length;
            case REVIEW_BODY_VIEWS.PROMPT:
                return (transaction?.prompt || '').split('\n').length;
            case REVIEW_BODY_VIEWS.DIFF: {
                if (currentItem?.type !== 'file') return 0;
                const selectedFile = (transaction?.files || []).find(f => f.id === currentItem.id);
                return (selectedFile?.diff || '').split('\n').length;
            }
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: {
                if (currentItem?.type !== 'script') return 0;
                const selectedScript = (transaction?.scripts || []).find(s => s.command === currentItem.id);
                return (selectedScript?.output || '').split('\n').length;
            }
            default: return 0;
        }
    }, [bodyView, navigableItems, selectedItemIndex, transaction]);
    const contentViewport = useContentViewport({ contentLineCount, viewportHeight: availableBodyHeight });

    const navigableItemsInView = navigableItems.slice(viewOffset, viewOffset + listViewportHeight);

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
        setSelectedItemIndex, toggleBodyView, setBodyView, startApplySimulation, approve,
        rejectTransaction, tryRepairFile, tryInstruct, showBulkRepair, showBulkInstruct,
        executeBulkRepairOption, executeBulkInstructOption, confirmHandoff,
        navigateScriptErrorUp, navigateScriptErrorDown, toggleFileApproval,
        rejectAllFiles, navigateBulkRepairUp, navigateBulkRepairDown,
        navigateBulkInstructUp, navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    const handleIndexChange = (newIndex: number) => {
        setSelectedItemIndex(newIndex);
        contentViewport.actions.resetScroll();
    };

    const navigateToNextFile = () => {
        const nextFileIndex = navigableItems.findIndex(
            (item, index) => index > selectedItemIndex && item.type === 'file',
        );
        if (nextFileIndex !== -1) {
            setSelectedItemIndex(nextFileIndex);
        }
    };

    const navigateToPreviousFile = () => {
        // Find the last index of a file before the current one
        const prevFileIndex = navigableItems
            .slice(0, selectedItemIndex)
            .findLastIndex(item => item.type === 'file');

        if (prevFileIndex !== -1) {
            setSelectedItemIndex(prevFileIndex);
        }
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'success'); return true;
        }
        if (input === '2' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        const currentItem = navigableItems[selectedItemIndex];
        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            return true;
        }

        if (key.escape) {
            switch (bodyView) {
                case REVIEW_BODY_VIEWS.BULK_REPAIR:
                case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF:
                case REVIEW_BODY_VIEWS.BULK_INSTRUCT:
                    toggleBodyView(bodyView);
                    break;
                default:
                    if (bodyView !== REVIEW_BODY_VIEWS.NONE) {
                        setBodyView(REVIEW_BODY_VIEWS.NONE);
                    }
                    break;
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
        const contentViews: ReviewBodyView[] = [
            REVIEW_BODY_VIEWS.REASONING,
            REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
            REVIEW_BODY_VIEWS.DIFF,
            REVIEW_BODY_VIEWS.PROMPT,
        ];
        if (!contentViews.includes(bodyView)) return false;

        if (key.pageUp) { contentViewport.actions.pageUp(); return true; }
        if (key.pageDown) { contentViewport.actions.pageDown(); return true; }
        return false;
    };

    const handleReasoningInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'r') toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
    };

    const handleScriptOutputInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (input.toLowerCase() === 'c') { // TODO: this copy logic is not great.
            const currentItem = navigableItems[selectedItemIndex];
            const selectedScript = currentItem?.type === 'script' ? scripts.find(s => s.command === currentItem.id) : undefined;
            if (selectedScript) {
                useNotificationStore.getState().actions.show({
                    type: 'success',
                    title: 'Copied to Clipboard',
                    message: `Copied script output for: ${selectedScript.command}`,
                });
            }
        }
    };

    const handleDiffInput = (input: string, key: Key) => {
        if (key.upArrow) {
            navigateToPreviousFile();
            return;
        }
        if (key.downArrow) {
            navigateToNextFile();
            return;
        }
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        if (key.leftArrow) {
            showDashboardScreen();
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        const currentItem = navigableItems[selectedItemIndex];

        if (input === ' ') {
            if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(currentItem.id);
                }
            }
        }

        if (input.toLowerCase() === 'm') {
            toggleBodyView(REVIEW_BODY_VIEWS.COMMIT_MESSAGE);
        }

        if (input.toLowerCase() === 'p') {
            toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            } else if (currentItem?.type === 'commit_message') {
                toggleBodyView(REVIEW_BODY_VIEWS.COMMIT_MESSAGE);
            } else if (currentItem?.type === 'prompt') {
                toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
            } else if (currentItem?.type === 'reasoning') {
                toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
            } else if (currentItem?.type === 'script') {
                toggleBodyView(REVIEW_BODY_VIEWS.SCRIPT_OUTPUT);
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'x') {
            rejectTransaction();
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

    const listNavigableBodyViews: ReviewBodyView[] = [
        REVIEW_BODY_VIEWS.PROMPT,
        REVIEW_BODY_VIEWS.REASONING,
        REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
    ];
    const isListNavigationActive = bodyView === REVIEW_BODY_VIEWS.NONE || listNavigableBodyViews.includes(bodyView);
    const arePageKeysForListNav = bodyView === REVIEW_BODY_VIEWS.NONE;

    useListNavigator({
        itemCount: navigableItems.length,
        viewportHeight: listViewportHeight,
        selectedIndex: selectedItemIndex,
        onIndexChange: handleIndexChange,
        isActive: isListNavigationActive,
        disablePageKeys: !arePageKeysForListNav,
        onKey: arePageKeysForListNav ? handleMainNavigationInput : undefined,
    });

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) return;

        if (key.leftArrow) {
            // Allow left arrow to collapse any open body view
            setBodyView(REVIEW_BODY_VIEWS.NONE);
            return;
        }

        // Global "Enter to collapse" handler for non-modal views
        if (key.return) {
            if (
                bodyView !== REVIEW_BODY_VIEWS.BULK_REPAIR &&
                bodyView !== REVIEW_BODY_VIEWS.BULK_INSTRUCT &&
                bodyView !== REVIEW_BODY_VIEWS.CONFIRM_HANDOFF &&
                bodyView !== REVIEW_BODY_VIEWS.NONE
            ) {
                setBodyView(REVIEW_BODY_VIEWS.NONE);
                return;
            }
        }
        // Handle content scrolling (PgUp/PgDn)
        if (handleContentScrollInput(key)) return;

        switch (bodyView) {
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF: return handleHandoffConfirmInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_REPAIR: return handleBulkRepairInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT: return handleBulkInstructInput(input, key);
            case REVIEW_BODY_VIEWS.REASONING: return handleReasoningInput(input, key);
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: return handleScriptOutputInput(input, key);
            case REVIEW_BODY_VIEWS.DIFF: return handleDiffInput(input, key);
        }
    }, { isActive: bodyView !== REVIEW_BODY_VIEWS.NONE });

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
        contentScrollIndex: contentViewport.scrollIndex,
        availableBodyHeight,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        ...reviewStats,
        hasRejectedFiles,
    };
};