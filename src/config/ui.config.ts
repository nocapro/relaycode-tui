/**
 * Centralized UI configuration.
 * This object is the single source of truth for layout constants, thresholds,
 * and other UI-related magic numbers.
 */
export const UI_CONFIG = {
    diffScreen: {
        collapseThreshold: 20, // Lines before collapsing
        collapseShowLines: 8,  // Lines to show at top/bottom when collapsed
    },
    dashboard: {
        reservedRows: 9, // Non-event stream vertical space (header, footer, etc.)
    },
    history: {
        reservedRows: 8, // Non-content vertical space (header, footer, filter)
    },
    splash: {
        initialCountdown: 3, // Seconds before auto-skip
    },
    footer: {
        horizontalPadding: 2, // Minimum space from the left/right edges of the screen
        actionSeparator: ' · ',
    },
} as const;