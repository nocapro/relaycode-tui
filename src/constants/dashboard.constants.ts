import type { ActionItem } from '../types/actions.types';

export const DASHBOARD_STATUS = {
    LISTENING: 'LISTENING',
    PAUSED: 'PAUSED',
    CONFIRM_APPROVE: 'CONFIRM_APPROVE',
    APPROVING: 'APPROVING',
} as const;

type DashboardStatusValue = (typeof DASHBOARD_STATUS)[keyof typeof DASHBOARD_STATUS];

export const DASHBOARD_FOOTER_ACTIONS = {
    MODAL: [
        { key: 'Enter', label: 'Confirm' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    STANDARD: (status: DashboardStatusValue): ActionItem[] => [
        { key: '↑↓', label: 'Nav' },
        { key: '→/Ent', label: 'View' },
        { key: '←', label: 'Collapse' },
        { key: 'L', label: 'Log' },
        { key: 'A', label: 'Approve All' },
        { key: 'C', label: 'Commit' },
        { key: 'P', label: status === DASHBOARD_STATUS.PAUSED ? 'Resume' : 'Pause' },
        { key: 'Q', label: 'Quit' },
    ],
};