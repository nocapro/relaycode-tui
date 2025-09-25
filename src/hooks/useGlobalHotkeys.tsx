import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { MAIN_SCREENS_FOR_QUIT, SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { currentScreen } = useAppStore(s => ({
        currentScreen: s.currentScreen,
    }));
    const { showDashboardScreen } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
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
        if (input.toLowerCase() === 'q') {
            if ((MAIN_SCREENS_FOR_QUIT as readonly string[]).includes(currentScreen)) {
                exit();
            } else if ((SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
                showDashboardScreen();
            }
        } else if (key.escape && (SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
            showDashboardScreen();
        }
    }, { isActive });
};