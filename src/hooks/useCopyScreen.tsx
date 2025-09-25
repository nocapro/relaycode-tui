import { useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';

// Header, separator, title, margin, separator, status, footer
const RESERVED_ROWS = 8;

export const useCopyScreen = () => {
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const {
        title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: RESERVED_ROWS,
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
    }, { isActive: activeOverlay === 'copy' });

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