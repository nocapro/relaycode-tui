import type { ApplyStep } from '../stores/review.store';
import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Review screen and process.
 */
export const INITIAL_APPLY_STEPS: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

export const REVIEW_BODY_VIEWS = {
    DIFF: 'diff',
    REASONING: 'reasoning',
    SCRIPT_OUTPUT: 'script_output',
    BULK_REPAIR: 'bulk_repair',
    CONFIRM_HANDOFF: 'confirm_handoff',
    BULK_INSTRUCT: 'bulk_instruct',
    NONE: 'none',
} as const;

export const PATCH_STATUS = {
    SUCCESS: 'SUCCESS',
    PARTIAL_FAILURE: 'PARTIAL_FAILURE',
} as const;

export const BULK_REPAIR_OPTIONS = [
    '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
    '(2) Bulk Change Strategy & Re-apply',
    '(3) Handoff to External Agent',
    '(4) Bulk Abandon All Failed Files',
    '(Esc) Cancel',
] as const;

export const BULK_INSTRUCT_OPTIONS = [
    '(1) Copy Bulk Re-instruct Prompt (for single-shot AI)',
    '(2) Handoff to External Agent',
    '(3) Bulk Un-reject All Files (revert to original)',
    '(4) Cancel',
] as const;

interface ReviewFooterConfig {
    isFileSelected: boolean;
    fileStatus?: 'FAILED' | 'REJECTED' | 'OTHER';
    currentItemType?: 'file' | 'script' | 'reasoning' | 'prompt';
    hasFailedFiles: boolean;
    hasRejectedFiles: boolean;
    hasApprovedFiles: boolean;
}

export const REVIEW_FOOTER_ACTIONS = {
    DIFF_VIEW: [
        { key: '↑↓', label: 'Next/Prev File' },
        { key: 'X', label: 'Expand' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: 'D/Esc', label: 'Back' },
    ] as const,
    REASONING_VIEW: [
        { key: '↑↓', label: 'Scroll Text' },
        { key: 'R', label: 'Collapse View' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    SCRIPT_OUTPUT_VIEW: [
        { key: '↑↓', label: 'Nav' },
        { key: 'J↓/K↑', label: 'Next/Prev Error' },
        { key: 'C', label: 'Copy Output' },
        { key: 'Ent/Esc', label: 'Back' },
    ] as const,
    BULK_REPAIR_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    BULK_INSTRUCT_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    HANDOFF_CONFIRM_VIEW: [
        { key: 'Enter', label: 'Confirm Handoff' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    MAIN_VIEW: (config: ReviewFooterConfig): ActionItem[] => {
        const actions: ActionItem[] = [{ key: '↑↓', label: 'Nav' }];

        if (config.isFileSelected) {
            if (config.fileStatus !== 'FAILED') actions.push({ key: 'Spc', label: 'Toggle' });
            actions.push({ key: 'D/Ent', label: 'Diff' });
            if (config.fileStatus === 'FAILED') actions.push({ key: 'T', label: 'Try Repair' });
            if (config.fileStatus === 'REJECTED') actions.push({ key: 'I', label: 'Instruct' });
        } else if (config.currentItemType === 'script') {
            actions.push({ key: 'Ent', label: 'Expand Details' });
        } else {
            actions.push({ key: 'Ent', label: 'Expand' });
        }

        if (config.currentItemType !== 'reasoning') actions.push({ key: 'R', label: 'Reasoning' });
        if (config.hasFailedFiles) actions.push({ key: 'Shift+T', label: 'Bulk Repair' });
        if (config.hasRejectedFiles) actions.push({ key: 'Shift+I', label: 'Bulk Instruct' });

        actions.push({ key: 'C', label: 'Copy' });

        if (config.hasApprovedFiles) actions.push({ key: 'A', label: 'Approve' });
        actions.push({ key: 'Q', label: 'Quit' });
        return actions;
    },
};

export const getReviewProcessingFooterActions = (
    isSkippable: boolean,
): readonly ActionItem[] => {
    const actions: ActionItem[] = [{ key: 'Ctrl+C', label: 'Cancel Process' }];
    if (isSkippable) {
        actions.push({ key: 'S', label: 'Skip Script' });
    }
    return actions;
};