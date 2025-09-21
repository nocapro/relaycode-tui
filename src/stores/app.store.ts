import { create } from 'zustand';

export type AppScreen = 'splash' | 'init' | 'dashboard';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showDashboardScreen: () => void;
    };
}

export const useAppStore = create<AppState>((set) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
    },
}));