import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { MAIN_SCREENS_FOR_QUIT } from '../constants/app.constants';
import { OVERLAYS } from '../constants/view.constants';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { currentScreen } = useAppStore(s => ({
        currentScreen: s.currentScreen,
    }));
    const { navigateBack } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === OVERLAYS.DEBUG ? OVERLAYS.NONE : OVERLAYS.DEBUG);
            return;
        }
        if (key.ctrl && input === 'l') {
            setActiveOverlay(activeOverlay === OVERLAYS.LOG ? OVERLAYS.NONE : OVERLAYS.LOG);
            return;
        }

        // If an overlay with its own input is open, stop here.
        if (activeOverlay === OVERLAYS.DEBUG || activeOverlay === OVERLAYS.LOG) {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === OVERLAYS.HELP) {
            if (key.escape || input === '?') {
                setActiveOverlay(OVERLAYS.NONE);
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay(OVERLAYS.HELP);
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q') {
            if ((MAIN_SCREENS_FOR_QUIT as readonly string[]).includes(currentScreen)) {
                exit();
            }
            navigateBack();
        } else if (key.escape) {
            navigateBack();
        }
    }, { isActive });
};