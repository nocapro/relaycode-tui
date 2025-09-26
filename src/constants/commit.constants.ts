export const COMMIT_FOOTER_ACTIONS = {
    BASE: [
        { key: 'Enter', label: 'Confirm & Commit' },
        { key: 'C', label: 'Copy' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    FAILURE: [
        { key: 'R', label: 'Retry' }, { key: 'C', label: 'Copy Command' }, { key: 'Esc', label: 'Cancel' },
    ] as const,
};