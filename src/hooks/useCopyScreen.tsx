import { useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { UI_CONFIG } from '../config/ui.config';
import { OVERLAYS } from '../constants/view.constants';

export const useCopyScreen = () => {
    const {
        title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));
    
    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: items.length,
        layoutConfig: UI_CONFIG.layout.copyScreen,
    });

    useInput((input, key) => {
        if (key.escape) {
            actions.close();
            return;
        }
        if (key.upArrow) {
            actions.navigateUp();
            return;
        }
        if (key.downArrow) {
            actions.navigateDown();
            return;
        }
        if (key.pageUp) {
            actions.navigatePageUp(viewportHeight);
            return;
        }
        if (key.pageDown) {
            actions.navigatePageDown(viewportHeight);
            return;
        }
        if (input === ' ') {
            actions.toggleSelection();
            return;
        }
        if (key.return) {
            actions.executeCopy();
            return;
        }
        
        const item = items.find(i => i.key.toLowerCase() === input.toLowerCase());
        if(item) {
            actions.toggleSelectionById(item.id);
        }
    }, { isActive: useViewStore.getState().activeOverlay === OVERLAYS.COPY });

    const itemsInView = items.slice(viewOffset, viewOffset + viewportHeight);

    return {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    };
};