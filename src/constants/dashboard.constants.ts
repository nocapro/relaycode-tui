import type { ActionItem } from '../types/actions.types';

export const DASHBOARD_STATUS = {
    LISTENING: 'LISTENING',
    PAUSED: 'PAUSED',
    CONFIRM_APPROVE: 'CONFIRM_APPROVE',
    APPROVING: 'APPROVING',
} as const;

type DashboardStatusValue = (typeof DASHBOARD_STATUS)[keyof typeof DASHBOARD_STATUS];

export interface DashboardStandardActionsOptions {
    status: DashboardStatusValue;
    hasPending: boolean;
    hasApplied: boolean;
}

export const DASHBOARD_FOOTER_ACTIONS = {
    MODAL: [
        { key: 'Enter', label: 'Confirm' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    STANDARD: (options: DashboardStandardActionsOptions): ActionItem[] => {
        const { status, hasPending, hasApplied } = options;
        const actions: ActionItem[] = [
            { key: '↑↓', label: 'Nav' },
            { key: '→/Ent', label: 'View' },
            { key: '←', label: 'Collapse' },
            { key: 'L', label: 'Log' },
        ];
        if (hasPending) actions.push({ key: 'A', label: 'Approve All' });
        if (hasApplied) actions.push({ key: 'C', label: 'Commit' });
        actions.push({ key: 'P', label: status === DASHBOARD_STATUS.PAUSED ? 'Resume' : 'Pause' });
        actions.push({ key: 'Q', label: 'Quit' });
        return actions;
    },
};