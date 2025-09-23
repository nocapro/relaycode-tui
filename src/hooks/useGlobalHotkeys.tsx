import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';

const MAIN_SCREENS_FOR_QUIT: string[] = ['dashboard', 'init'];

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { isHelpOpen, currentScreen, isDebugMenuOpen, actions } = useAppStore(s => ({
        isHelpOpen: s.isHelpOpen,
        currentScreen: s.currentScreen,
        isDebugMenuOpen: s.isDebugMenuOpen,
        actions: s.actions,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            actions.toggleDebugMenu();
            return;
        }

        // If debug menu is open, it has its own input handler, so we stop here.
        if (isDebugMenuOpen) {
            return;
        }

        // Help screen takes precedence over other keys
        if (isHelpOpen) {
            if (key.escape || input === '?') {
                actions.toggleHelp();
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            actions.toggleHelp();
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q' && MAIN_SCREENS_FOR_QUIT.includes(currentScreen)) {
            exit();
        }
    }, { isActive });
};