import { create } from 'zustand';
import { useAppStore } from './app.store';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { ReviewService } from '../services/review.service';
import { TransactionService } from '../services/transaction.service';
import { moveIndex, getVisibleItemPaths as history_getVisibleItemPaths } from './navigation.utils';
import type { FileItem, ScriptResult } from '../types/domain.types';
import type {
    DashboardStatus,
    ApplyStep,
    ReviewBodyView,
    PatchStatus,
    NavigatorSection,
    DetailBodyView,
    HistoryViewMode,
} from '../types/view.types';

export const review_initialApplySteps: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

// Omit 'actions' from state type for partial updates
type UIStateData = Omit<UIState, 'actions'>;

interface UIState {
    // --- Global State ---
    selectedTransactionId: string | null;
    activeOverlay: 'none' | 'help' | 'copy' | 'debug';

    // --- Dashboard State ---
    dashboard_status: DashboardStatus;
    dashboard_previousStatus: DashboardStatus;
    dashboard_selectedTransactionIndex: number;

    // --- Review State ---
    review_patchStatus: PatchStatus;
    review_applySteps: ApplyStep[];
    review_selectedItemIndex: number; // Can be file or script
    review_bodyView: ReviewBodyView;
    review_isDiffExpanded: boolean;
    review_reasoningScrollIndex: number;
    review_scriptErrorIndex: number;

    // --- Transaction Detail State ---
    detail_navigatorFocus: NavigatorSection | 'FILES_LIST';
    detail_expandedSection: NavigatorSection | null;
    detail_selectedFileIndex: number;
    detail_bodyView: DetailBodyView;

    // --- Transaction History State ---
    history_mode: HistoryViewMode;
    history_selectedItemPath: string; // e.g. "tx-1" or "tx-1/file-2"
    history_expandedIds: Set<string>; // holds ids of expanded items
    history_filterQuery: string;
    history_selectedForAction: Set<string>; // set of transaction IDs

    // --- Actions ---
    actions: {
        // --- Dashboard Actions ---
        dashboard_togglePause: () => void;
        dashboard_moveSelectionUp: () => void;
        dashboard_moveSelectionDown: () => void;
        dashboard_startApproveAll: () => void;
        dashboard_confirmAction: () => Promise<void>;
        dashboard_cancelAction: () => void;
        dashboard_setStatus: (status: DashboardStatus) => void; // For debug menu

        // --- Review Actions ---
        review_load: (transactionId: string, initialState?: { bodyView: ReviewBodyView }) => void;
        review_moveSelectionUp: () => void;
        review_moveSelectionDown: () => void;
        review_expandDiff: () => void;
        review_toggleBodyView: (
            view: Extract<ReviewBodyView, 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'>
        ) => void;
        review_setBodyView: (view: ReviewBodyView) => void;
        review_approve: () => void;
        review_startApplySimulation: (scenario: 'success' | 'failure') => void;
        review_tryRepairFile: () => void;
        review_showBulkRepair: () => void;
        review_executeBulkRepairOption: (option: number) => Promise<void>;
        review_confirmHandoff: () => void;
        review_scrollReasoningUp: () => void;
        review_scrollReasoningDown: () => void;
        review_navigateScriptErrorUp: () => void;
        review_navigateScriptErrorDown: () => void;
        review_updateApplyStep: (id: string, status: ApplyStep['status'], duration?: number, details?: string) => void;
        review_addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;

        // --- Transaction Detail Actions ---
        detail_load: (transactionId: string) => void;
        detail_navigateUp: () => void;
        detail_navigateDown: () => void;
        detail_handleEnterOrRight: () => void;
        detail_handleEscapeOrLeft: () => void;
        detail_toggleRevertConfirm: () => void;
        detail_confirmRevert: () => void;

        // --- Transaction History Actions ---
        history_load: (initialState?: Partial<UIStateData>) => void;
        history_navigateDown: () => void;
        history_navigateUp: () => void;
        history_expandOrDrillDown: () => void;
        history_collapseOrBubbleUp: () => void;
        history_toggleSelection: () => void;
        history_setMode: (mode: HistoryViewMode) => void;
        history_setFilterQuery: (query: string) => void;
        history_applyFilter: () => void;
        history_prepareDebugState: (stateName: 'l1-drill' | 'l2-drill' | 'filter' | 'copy' | 'bulk') => void;

        // --- Overlay Actions ---
        setActiveOverlay: (overlay: UIState['activeOverlay']) => void;
    };
}

export const useUIStore = create<UIState>((set, get) => ({
    // --- Global ---
    selectedTransactionId: null,

    activeOverlay: 'none',
    // --- Dashboard ---
    dashboard_status: 'LISTENING',
    dashboard_previousStatus: 'LISTENING',
    dashboard_selectedTransactionIndex: 0,

    // --- Review ---
    review_patchStatus: 'SUCCESS',
    review_applySteps: review_initialApplySteps,
    review_selectedItemIndex: 0,
    review_bodyView: 'none',
    review_isDiffExpanded: false,
    review_reasoningScrollIndex: 0,
    review_scriptErrorIndex: 0,

    // --- Detail ---
    detail_navigatorFocus: 'PROMPT',
    detail_expandedSection: null,
    detail_selectedFileIndex: 0,
    detail_bodyView: 'NONE',

    // --- History ---
    history_mode: 'LIST',
    history_selectedItemPath: '',
    history_expandedIds: new Set(),
    history_filterQuery: '',
    history_selectedForAction: new Set(),

    actions: {
        // --- Dashboard Actions ---
        dashboard_togglePause: () => set(state => ({
            dashboard_status: state.dashboard_status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        dashboard_moveSelectionUp: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { dashboard_selectedTransactionIndex: moveIndex(state.dashboard_selectedTransactionIndex, 'up', transactions.length) };
        }),
        dashboard_moveSelectionDown: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { dashboard_selectedTransactionIndex: moveIndex(state.dashboard_selectedTransactionIndex, 'down', transactions.length) };
        }),
        dashboard_startApproveAll: () => set(state => ({
            dashboard_status: 'CONFIRM_APPROVE',
            dashboard_previousStatus: state.dashboard_status,
        })),
        dashboard_cancelAction: () => set(state => ({ dashboard_status: state.dashboard_previousStatus })),
        dashboard_setStatus: (status) => set({ dashboard_status: status }),
        dashboard_confirmAction: async () => {
            const { dashboard_status, dashboard_previousStatus } = get();
            if (dashboard_status === 'CONFIRM_APPROVE') {
                set({ dashboard_status: 'APPROVING' });
                await DashboardService.approveAll();
                set({ dashboard_status: dashboard_previousStatus });
            }
        },

        // --- Review Actions ---
        review_load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;
            const isFailureCase = transaction.id === '1';
            const patchStatus = isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS';
            set({
                selectedTransactionId: transaction.id,
                review_patchStatus: patchStatus,
                review_selectedItemIndex: 0,
                review_bodyView: initialState?.bodyView ?? 'none',
                review_isDiffExpanded: false,
                review_reasoningScrollIndex: 0,
                review_scriptErrorIndex: 0,
                review_applySteps: JSON.parse(JSON.stringify(review_initialApplySteps)),
            });
        },
        review_moveSelectionUp: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.selectedTransactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { review_selectedItemIndex: moveIndex(state.review_selectedItemIndex, 'up', listSize) };
        }),
        review_moveSelectionDown: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.selectedTransactionId);
            if (!tx) return {};
            const listSize = (tx.files?.length || 0) + (tx.scripts?.length || 0);
            return { review_selectedItemIndex: moveIndex(state.review_selectedItemIndex, 'down', listSize) };
        }),
        review_toggleBodyView: (view) => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.selectedTransactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.review_selectedItemIndex >= files.length) return {};
            return {
                review_bodyView: state.review_bodyView === view ? 'none' : view,
                review_isDiffExpanded: false,
            };
        }),
        review_setBodyView: (view) => set({ review_bodyView: view }),
        review_expandDiff: () => set(state => ({ review_isDiffExpanded: !state.review_isDiffExpanded })),
        review_approve: () => {
            const { selectedTransactionId } = get();
            if (selectedTransactionId) {
                useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'APPLIED');
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        review_startApplySimulation: async (scenario) => {
            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            const { review_updateApplyStep, review_addApplySubstep } = get().actions;
            set({ review_applySteps: JSON.parse(JSON.stringify(review_initialApplySteps)) });
            showReviewProcessingScreen();
            const simulationGenerator = ReviewService.runApplySimulation(scenario);
            for await (const update of simulationGenerator) {
                if (update.type === 'UPDATE_STEP') {
                    review_updateApplyStep(
                        update.payload.id,
                        update.payload.status,
                        update.payload.duration,
                        update.payload.details,
                    );
                } else if (update.type === 'ADD_SUBSTEP') {
                    review_addApplySubstep(update.payload.parentId, update.payload.substep);
                }
            }
            showReviewScreen();
        },
        review_tryRepairFile: () => {
            const { selectedTransactionId, review_selectedItemIndex } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.[review_selectedItemIndex];
            if (!file || file.reviewStatus !== 'FAILED') return;
            const repairedFile = ReviewService.tryRepairFile(file);
            useTransactionStore.getState().actions.updateFileReviewStatus(
                selectedTransactionId, file.id, repairedFile.reviewStatus || 'AWAITING', undefined
            );
        },
        review_showBulkRepair: () => get().actions.review_toggleBodyView('bulk_repair'),
        review_executeBulkRepairOption: async (option) => {
            const { selectedTransactionId } = get();
            let tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx) return;
            switch (option) {
                case 1:
                    if (!tx.files) break;
                    ReviewService.generateBulkRepairPrompt(tx.files);
                    set({ review_bodyView: 'none' });
                    break;
                case 2: {
                    const { updateFileReviewStatus } = useTransactionStore.getState().actions;
                    set({ review_bodyView: 'none' });
                    if (!tx.files) break;
                    const failedFileIds = new Set(tx.files.filter(f => f.reviewStatus === 'FAILED').map(f => f.id));
                    if (failedFileIds.size === 0) break;
                    failedFileIds.forEach(id => updateFileReviewStatus(selectedTransactionId!, id, 'RE_APPLYING'));
                    tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId)!;
                    const finalFiles = await ReviewService.runBulkReapply(tx.files!);
                    finalFiles.forEach(file => updateFileReviewStatus(selectedTransactionId!, file.id, file.reviewStatus || 'AWAITING', file.reviewError));
                    break;
                }
                case 3:
                    get().actions.review_setBodyView('confirm_handoff');
                    break;
                case 4:
                    if (!tx.files) break;
                    tx.files.forEach(file => {
                        if (file.reviewStatus === 'FAILED') {
                            useTransactionStore.getState().actions.updateFileReviewStatus(selectedTransactionId!, file.id, 'REJECTED');
                        }
                    });
                    set({ review_bodyView: 'none' });
                    break;
                default:
                    set({ review_bodyView: 'none' });
            }
        },
        review_confirmHandoff: () => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === get().selectedTransactionId);
            if (!tx?.files) return;
            ReviewService.generateHandoffPrompt(tx.hash, tx.message, tx.reasoning || '', tx.files);
            ReviewService.performHandoff(tx.hash);
        },
        review_scrollReasoningUp: () => set(state => ({ review_reasoningScrollIndex: Math.max(0, state.review_reasoningScrollIndex - 1) })),
        review_scrollReasoningDown: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.selectedTransactionId);
            if (!tx?.reasoning) return {};
            const maxLines = tx.reasoning.split('\n').length;
            return { review_reasoningScrollIndex: Math.min(maxLines - 1, state.review_reasoningScrollIndex + 1) };
        }),
        review_navigateScriptErrorUp: () => set(state => ({ review_scriptErrorIndex: Math.max(0, state.review_scriptErrorIndex - 1) })),
        review_navigateScriptErrorDown: () => set(state => {
            const tx = useTransactionStore.getState().transactions.find(t => t.id === state.selectedTransactionId);
            if (!tx?.scripts || !tx?.files) return {};
            const selectedScript = tx.scripts[state.review_selectedItemIndex - tx.files.length];
            if (selectedScript?.output) {
                const errorLines = selectedScript.output
                    .split('\n')
                    .filter(line => line.includes('Error') || line.includes('Warning'));
                return { review_scriptErrorIndex: Math.min(errorLines.length - 1, state.review_scriptErrorIndex + 1) };
            }
            return {};
        }),
        review_updateApplyStep: (id, status, duration, details) => {
            set(state => ({
                review_applySteps: state.review_applySteps.map(s => {
                    if (s.id === id) {
                        const newStep = { ...s, status };
                        if (duration !== undefined) newStep.duration = duration;
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                }),
            }));
        },
        review_addApplySubstep: (parentId, substep) => {
            set(state => ({
                review_applySteps: state.review_applySteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },

        // --- Transaction Detail Actions ---
        detail_load: (transactionId) => set({
            selectedTransactionId: transactionId,
            detail_navigatorFocus: 'PROMPT',
            detail_expandedSection: null,
            detail_selectedFileIndex: 0,
            detail_bodyView: 'NONE',
        }),
        detail_navigateUp: () => {
            const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
            const { detail_navigatorFocus, detail_selectedFileIndex } = get();
            if (detail_navigatorFocus === 'FILES_LIST') {
                set({ detail_selectedFileIndex: Math.max(0, detail_selectedFileIndex - 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(detail_navigatorFocus as NavigatorSection);
                if (currentIndex > 0) {
                    set({ detail_navigatorFocus: navigatorOrder[currentIndex - 1] });
                }
            }
        },
        detail_navigateDown: () => {
            const navigatorOrder: NavigatorSection[] = ['PROMPT', 'REASONING', 'FILES'];
            const { detail_navigatorFocus, detail_selectedFileIndex, selectedTransactionId } = get();
            const transaction = useTransactionStore.getState().transactions.find(tx => tx.id === selectedTransactionId);
            const files = transaction?.files || [];
            if (detail_navigatorFocus === 'FILES_LIST') {
                set({ detail_selectedFileIndex: Math.min(files.length - 1, detail_selectedFileIndex + 1) });
            } else {
                const currentIndex = navigatorOrder.indexOf(detail_navigatorFocus as NavigatorSection);
                if (currentIndex < navigatorOrder.length - 1) {
                    set({ detail_navigatorFocus: navigatorOrder[currentIndex + 1]! });
                }
            }
        },
        detail_handleEnterOrRight: () => {
            const { detail_navigatorFocus, detail_expandedSection } = get();
            if (detail_navigatorFocus === 'FILES_LIST') {
                set({ detail_bodyView: 'DIFF_VIEW' });
                return;
            }
            if (detail_expandedSection === detail_navigatorFocus) {
                if (detail_navigatorFocus === 'FILES') {
                    set({ detail_navigatorFocus: 'FILES_LIST', detail_bodyView: 'FILES_LIST' });
                }
                return;
            }
            set({ detail_expandedSection: detail_navigatorFocus });
            if (detail_navigatorFocus === 'PROMPT') set({ detail_bodyView: 'PROMPT' });
            if (detail_navigatorFocus === 'REASONING') set({ detail_bodyView: 'REASONING' });
            if (detail_navigatorFocus === 'FILES') set({ detail_bodyView: 'FILES_LIST' });
        },
        detail_handleEscapeOrLeft: () => {
            const { detail_navigatorFocus, detail_expandedSection, detail_bodyView } = get();
            if (detail_bodyView === 'DIFF_VIEW') {
                set({ detail_bodyView: 'FILES_LIST' });
                return;
            }
            if (detail_navigatorFocus === 'FILES_LIST') {
                set({ detail_navigatorFocus: 'FILES', detail_bodyView: 'NONE' });
                return;
            }
            if (detail_expandedSection) {
                set({ detail_expandedSection: null, detail_bodyView: 'NONE' });
            }
        },
        detail_toggleRevertConfirm: () => set(state => ({
            detail_bodyView: state.detail_bodyView === 'REVERT_CONFIRM' ? 'NONE' : 'REVERT_CONFIRM',
        })),
        detail_confirmRevert: () => {
            const { selectedTransactionId } = get();
            if (!selectedTransactionId) return;
            TransactionService.revertTransaction(selectedTransactionId);
            useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REVERTED');
            set({ detail_bodyView: 'NONE' });
        },

        // --- Transaction History Actions ---
        history_load: (initialState) => {
            const { transactions } = useTransactionStore.getState();
            set({
                history_selectedItemPath: transactions[0]?.id || '',
                history_mode: 'LIST',
                history_expandedIds: new Set(),
                history_selectedForAction: new Set(),
                history_filterQuery: '',
                ...initialState,
            });
        },
        history_navigateUp: () => {
            const { history_expandedIds, history_selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = history_getVisibleItemPaths(transactions, history_expandedIds);
            const currentIndex = visibleItems.indexOf(history_selectedItemPath);
            if (currentIndex > 0) {
                set({ history_selectedItemPath: visibleItems[currentIndex - 1]! });
            }
        },
        history_navigateDown: () => {
            const { history_expandedIds, history_selectedItemPath } = get();
            const { transactions } = useTransactionStore.getState();
            const visibleItems = history_getVisibleItemPaths(transactions, history_expandedIds);
            const currentIndex = visibleItems.indexOf(history_selectedItemPath);
            if (currentIndex < visibleItems.length - 1) {
                set({ history_selectedItemPath: visibleItems[currentIndex + 1]! });
            }
        },
        history_expandOrDrillDown: () => set(state => {
            const { history_selectedItemPath, history_expandedIds } = state;
            const newExpandedIds = new Set(history_expandedIds);
            if (!newExpandedIds.has(history_selectedItemPath)) {
                newExpandedIds.add(history_selectedItemPath);
            }
            return { history_expandedIds: newExpandedIds };
        }),
        history_collapseOrBubbleUp: () => set(state => {
            const { history_selectedItemPath, history_expandedIds } = state;
            const newExpandedIds = new Set(history_expandedIds);
            if (newExpandedIds.has(history_selectedItemPath)) {
                newExpandedIds.delete(history_selectedItemPath);
                for (const id of newExpandedIds) {
                    if (id.startsWith(`${history_selectedItemPath}/`)) {
                        newExpandedIds.delete(id);
                    }
                }
                return { history_expandedIds: newExpandedIds };
            } else if (history_selectedItemPath.includes('/')) {
                const parentId = history_selectedItemPath.split('/')[0];
                return { history_selectedItemPath: parentId || '' };
            }
            return {};
        }),
        history_toggleSelection: () => set(state => {
            const { history_selectedItemPath, history_selectedForAction } = state;
            const txId = history_selectedItemPath.split('/')[0];
            if (!txId) return {};
            const newSelection = new Set(history_selectedForAction);
            if (newSelection.has(txId)) {
                newSelection.delete(txId);
            } else {
                newSelection.add(txId);
            }
            return { history_selectedForAction: newSelection };
        }),
        history_setMode: (mode) => set({ history_mode: mode }),
        history_setFilterQuery: (query) => set({ history_filterQuery: query }),
        history_applyFilter: () => {
            set({ history_mode: 'LIST' });
        },
        history_prepareDebugState: (stateName) => {
            const { actions } = get();
            switch (stateName) {
                case 'l1-drill':
                    actions.history_load({ history_expandedIds: new Set(['3']), history_selectedItemPath: '3' });
                    break;
                case 'l2-drill':
                    actions.history_load({ history_expandedIds: new Set(['3', '3/3-1']), history_selectedItemPath: '3/3-1' });
                    break;
                case 'filter':
                    actions.history_load({ history_mode: 'FILTER', history_filterQuery: 'logger.ts status:COMMITTED' });
                    break;
                case 'copy':
                    actions.history_load({ history_selectedForAction: new Set(['3', '6']) });
                    break;
                case 'bulk':
                    actions.history_load({ history_mode: 'BULK_ACTIONS', history_selectedForAction: new Set(['3', '6']) });
                    break;
            }
        },

        // --- Overlay Actions ---
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));