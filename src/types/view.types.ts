// --- UI / View-Specific Types ---

// app.store
export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review' | 'review-processing' | 'git-commit' | 'transaction-detail' | 'transaction-history';

// dashboard.store
export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';

// init.store
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';
export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}

// review.store
export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    duration?: number;
}
export type ReviewBodyView = 'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff' | 'none';
export type PatchStatus = 'SUCCESS' | 'PARTIAL_FAILURE';
export type ApplyUpdate =
    | { type: 'UPDATE_STEP'; payload: { id: string; status: ApplyStep['status']; duration?: number; details?: string } }
    | { type: 'ADD_SUBSTEP'; payload: { parentId: string; substep: Omit<ApplyStep, 'substeps'> } };

// transaction-detail.store
export type NavigatorSection = 'PROMPT' | 'REASONING' | 'FILES';
export type DetailBodyView = 'PROMPT' | 'REASONING' | 'FILES_LIST' | 'DIFF_VIEW' | 'REVERT_CONFIRM' | 'NONE';

// transaction-history.store
export type HistoryViewMode = 'LIST' | 'FILTER' | 'BULK_ACTIONS';