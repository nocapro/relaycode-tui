import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useUIStore } from '../stores/ui.store';

const MAIN_SCREENS_FOR_QUIT: string[] = ['dashboard', 'init'];

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { currentScreen } = useAppStore(s => ({
        currentScreen: s.currentScreen,
    }));
    const { activeOverlay, setActiveOverlay } = useUIStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === 'debug' ? 'none' : 'debug');
            return;
        }

        // If debug menu is open, it has its own input handler, so we stop here.
        if (activeOverlay === 'debug') {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === 'help') {
            if (key.escape || input === '?') {
                setActiveOverlay('none');
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay('help');
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q' && MAIN_SCREENS_FOR_QUIT.includes(currentScreen)) {
            exit();
        }
    }, { isActive });
};