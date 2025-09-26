export const TRANSACTION_STATUS_UI = {
    COMMITTED: { text: '✓ Committed', color: 'green' },
    HANDOFF: { text: '→ Handoff', color: 'magenta' },
    REVERTED: { text: '↩ Reverted', color: 'gray' },
    APPLIED: { text: '✓ Applied', color: 'blue' },
    COMMITTING: { text: '→ Committing', color: 'magenta' },
    PENDING: { text: '? Pending', color: 'yellow' },
    FAILED: { text: '✗ Failed', color: 'red' },
} as const;

export const FILE_STATUS_UI = {
    APPROVED: { icon: '[✓]', color: 'green' },
    REJECTED: { icon: '[✗]', color: 'red' },
    FAILED: { icon: '[!]', color: 'red' },
    AWAITING: { icon: '[●]', color: 'yellow' },
    RE_APPLYING: { icon: '[●]', color: 'cyan' },
} as const;

export const FILE_CHANGE_ICONS = {
    MOD: '[MOD]',
    ADD: '[ADD]',
    DEL: '[DEL]',
    REN: '[REN]',
} as const;