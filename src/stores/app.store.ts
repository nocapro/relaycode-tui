import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';
import { SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        navigateBack: () => void;
    };
}

export const useAppStore = create<AppState>((set, get) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showGitCommitScreen: () => set({ currentScreen: 'git-commit' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        showTransactionHistoryScreen: () => set({ currentScreen: 'transaction-history' }),
        showTransactionDetailScreen: () => set({ currentScreen: 'transaction-detail' }),
        navigateBack: () => {
            const { currentScreen } = get();
            if ((SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
                get().actions.showDashboardScreen();
            }
        },
    },
}));