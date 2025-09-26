import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Transaction Detail screen.
 */
export const NAVIGATOR_SECTIONS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES: 'FILES',
} as const;

export const DETAIL_BODY_VIEWS = {
    PROMPT: 'PROMPT',
    REASONING: 'REASONING',
    FILES_LIST: 'FILES_LIST',
    DIFF_VIEW: 'DIFF_VIEW',
    REVERT_CONFIRM: 'REVERT_CONFIRM',
    NONE: 'NONE',
} as const;

export const FILE_CHANGE_TYPE_ICONS = {
    MOD: '[MOD]',
    ADD: '[ADD]',
    DEL: '[DEL]',
    REN: '[REN]',
} as const;

export const DETAIL_FOOTER_ACTIONS = {
    REVERT_CONFIRM: [
        { key: 'Enter', label: 'Confirm Revert' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    BASE: (options: { openActionLabel: string; isRevertable: boolean }): ActionItem[] => {
        const { openActionLabel, isRevertable } = options;
        const actions: ActionItem[] = [
            { key: 'C', label: 'Copy' },
            { key: 'O', label: openActionLabel },
        ];
        if (isRevertable) {
            actions.push({ key: 'U', label: 'Undo' });
        }
        actions.push({ key: 'Q', label: 'Quit/Back' });
        return actions;
    },
    DIFF_VIEW: [{ key: '↑↓', label: 'Nav Files' }, { key: '←', label: 'Back to List' }] as const,
    FILE_LIST_VIEW: [
        { key: '↑↓', label: 'Nav Files' },
        { key: '→', label: 'View Diff' },
        { key: '←', label: 'Back to Sections' },
    ] as const,
    SECTION_EXPANDED: [{ key: '↑↓', label: 'Nav/Scroll' }, { key: '→', label: 'Drill In' }, { key: '←', label: 'Collapse' }] as const,
    SECTION_COLLAPSED: [{ key: '↑↓', label: 'Nav' }, { key: '→', label: 'Expand' }] as const,
};