export const MAX_LOGS = 200;

export const DEBUG_LOG_MODES = {
    LIST: 'LIST',
    FILTER: 'FILTER',
} as const;

export const LOG_LEVEL_COLORS = {
    DEBUG: 'gray',
    INFO: 'white',
    WARN: 'yellow',
    ERROR: 'red',
};

export const LOG_LEVEL_TAGS = {
    DEBUG: { color: 'white', backgroundColor: 'gray' },
    INFO: { color: 'black', backgroundColor: 'cyan' },
    WARN: { color: 'black', backgroundColor: 'yellow' },
    ERROR: { color: 'white', backgroundColor: 'red' },
};

export const DEBUG_LOG_FOOTER_ACTIONS = {
    FILTER_MODE: [{ key: 'Enter/Esc', label: 'Apply & Close Filter' }] as const,
    LIST_MODE: (hasLogs: boolean) => {
        const actions = [
            { key: '↑↓/PgUp/PgDn', label: 'Scroll' },
            { key: 'F', label: 'Filter' },
        ];
        if (hasLogs) actions.push({ key: 'C', label: 'Clear' });
        actions.push({ key: 'Esc/Ctrl+L', label: 'Close' });
        return actions;
    },
};