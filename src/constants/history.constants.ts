import type { ActionItem } from '../types/actions.types';

export const HISTORY_VIEW_MODES = {
    LIST: 'LIST',
    FILTER: 'FILTER',
    BULK_ACTIONS: 'BULK_ACTIONS',
} as const;

export const HISTORY_ITEM_PATH_SEGMENTS = {
    FILE: '/file/',
    PROMPT: '/prompt',
    REASONING: '/reasoning',
} as const;

export const BULK_ACTIONS_OPTIONS = [
    '(1) Revert Selected Transactions',
    "(2) Mark as 'Git Committed'",
    '(3) Delete Selected Transactions (from Relaycode history)',
    '(Esc) Cancel',
] as const;

export const HISTORY_FOOTER_ACTIONS = {
    FILTER_MODE: [{ key: 'Enter', label: 'Apply Filter & Return' }, { key: 'Esc', label: 'Cancel' }] as const,
    BULK_MODE: { text: 'Choose an option [1-3] or (Esc) Cancel' } as const,
    LIST_MODE: (openActionLabel: string, hasSelection: boolean): ActionItem[] => {
        const actions: ActionItem[] = [
            { key: '↑↓/PgUp/PgDn', label: 'Nav' },
            { key: '→', label: 'Expand' },
            { key: '←', label: 'Collapse/Up' },
            { key: 'Spc', label: 'Select' },
            { key: 'Ent', label: 'Details' },
            { key: 'O', label: openActionLabel },
            { key: 'F', label: 'Filter' },
        ];
        if (hasSelection) {
            actions.push({ key: 'C', label: 'Copy' }, { key: 'B', label: 'Bulk' });
        }
        return actions;
    },
};