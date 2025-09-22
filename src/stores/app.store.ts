import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard' | 'review' | 'review-processing';

interface AppState {
    isDebugMenuOpen: boolean;
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showSplashScreen: () => void;
        toggleDebugMenu: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    isDebugMenuOpen: false,
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        toggleDebugMenu: () => set(state => ({ isDebugMenuOpen: !state.isDebugMenuOpen })),
    },
}));