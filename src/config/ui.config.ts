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
    splash: {
        initialCountdown: 6, // Seconds before auto-skip
    },
    footer: {
        horizontalPadding: 2, // Minimum space from the left/right edges of the screen
        actionSeparator: ' · ',
    },
    layout: {
        dashboard: {
            header: 1,
            separators: 2,
            fixedRows: 2, // status bar, event stream header
            marginsY: 3, // for status bar, event stream list, separator
            footer: 2,
        },
        transactionDetail: {
            header: 2,
            fixedRows: 4,
            separators: 2,
            marginsY: 1,
            footer: 2,
        },
        copyScreen: {
            header: 1,
            separators: 2,
            fixedRows: 2, // title, status
            marginsY: 1,
            footer: 1,
        },
        debugLog: {
            paddingY: 2,
            header: 1,
            separators: 2,
            fixedRows: 1, // filter line
            marginsY: 1,
            footer: 1,
        },
        debugMenu: {
            paddingY: 2,
            header: 1,
            separators: 2,
            footer: 1,
        },
        history: {
            header: 1,
            separators: 2,
            fixedRows: 1, // filter row
            marginsY: 1,
            footer: 2,
        },
        review: {
            header: 2,
            fixedRows: 3, // meta, prompt, reasoning headers
            marginsY: 2, // meta container, body
            separators: 4, // after title, meta, scripts/files, body
            footer: 2,
            bodyHeightReservation: 10,
        },
    },
} as const;