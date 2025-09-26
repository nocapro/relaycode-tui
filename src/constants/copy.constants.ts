import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Copy/Clipboard feature.
 */
export const COPYABLE_ITEMS = {
    UUID: 'UUID',
    MESSAGE: 'Git Message',
    PROMPT: 'Prompt',
    REASONING: 'Reasoning',
    FILE_DIFF: 'Diff for',
    ALL_DIFFS: 'All Diffs',
    CONTEXT_FILES: 'Context Files (latest)',
    FULL_YAML: 'Full YAML representation',
    // For multi-selection contexts
    MESSAGES: 'Git Messages',
    PROMPTS: 'Prompts',
    REASONINGS: 'Reasonings',
    DIFFS: 'Diffs',
    UUIDS: 'UUIDs',
} as const;

export const COPY_SCREEN_FOOTER_ACTIONS: readonly ActionItem[] = [
    { key: '↑↓/PgUp/PgDn', label: 'Nav' },
    { key: 'Spc/Hotkey', label: 'Toggle' },
    { key: 'Enter', label: 'Copy' },
    { key: 'Esc', label: 'Close' },
];