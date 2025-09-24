import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';

interface AppState {
    isHelpOpen: boolean;
    isDebugMenuOpen: boolean;
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
        toggleDebugMenu: () => void;
        toggleHelp: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    isHelpOpen: false,
    isDebugMenuOpen: false,
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
        toggleDebugMenu: () => set(state => ({ isDebugMenuOpen: !state.isDebugMenuOpen })),
        toggleHelp: () => set(state => ({ isHelpOpen: !state.isHelpOpen })),
    },
}));