/**
 * Application-level screens and navigation constants.
 */
export const APP_SCREENS = {
    SPLASH: 'splash',
    INIT: 'init',
    DASHBOARD: 'dashboard',
    REVIEW: 'review',
    REVIEW_PROCESSING: 'review-processing',
    GIT_COMMIT: 'git-commit',
    TRANSACTION_DETAIL: 'transaction-detail',
    TRANSACTION_HISTORY: 'transaction-history',
} as const;

export const SCREENS_WITH_DASHBOARD_BACK_ACTION = [
    APP_SCREENS.REVIEW,
    APP_SCREENS.GIT_COMMIT,
    APP_SCREENS.TRANSACTION_DETAIL,
    APP_SCREENS.TRANSACTION_HISTORY,
];