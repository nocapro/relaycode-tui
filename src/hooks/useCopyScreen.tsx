import { useState, useEffect } from 'react';
import { useCopyStore } from '../stores/copy.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { UI_CONFIG } from '../config/ui.config';
import { OVERLAYS } from '../constants/view.constants';
import { useListNavigator } from './useListNavigator.js';

export const useCopyScreen = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const {
        title, items, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));
    
    useEffect(() => setSelectedIndex(0), [items]);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: items.length,
        layoutConfig: UI_CONFIG.layout.copyScreen,
    });

    useListNavigator({
        itemCount: items.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: useViewStore.getState().activeOverlay === OVERLAYS.COPY,
        onKey: (input, key) => {
            if (key.escape || key.leftArrow) {
                actions.close();
                return;
            }
            if (input === ' ') {
                const currentItem = items[selectedIndex];
                if (!currentItem) return;
                actions.toggleSelectionById(currentItem.id);
                return;
            }
            if (key.return) {
                actions.executeCopy();
                return;
            }
            const item = items.find(i => i.key.toLowerCase() === input.toLowerCase());
            if (item) {
                actions.toggleSelectionById(item.id);
            }
        },
    });

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