import { useInput, type Key } from 'ink';

const moveIndex = (
    currentIndex: number,
    direction: 'up' | 'down',
    listSize: number,
): number => {
    if (direction === 'up') {
        return Math.max(0, currentIndex - 1);
    }
    return Math.min(listSize - 1, currentIndex + 1);
};

interface ListNavigatorOptions {
    itemCount: number;
    viewportHeight: number;
    selectedIndex: number;
    onIndexChange: (newIndex: number) => void;
    onKey?: (input: string, key: Key) => void;
    isActive: boolean;
}

export const useListNavigator = ({
    itemCount,
    viewportHeight,
    selectedIndex,
    onIndexChange,
    onKey,
    isActive,
}: ListNavigatorOptions) => {
    useInput((input, key) => {
        if (key.upArrow) {
            onIndexChange(moveIndex(selectedIndex, 'up', itemCount));
            return;
        }
        if (key.downArrow) {
            onIndexChange(moveIndex(selectedIndex, 'down', itemCount));
            return;
        }
        if (key.pageUp) {
            onIndexChange(Math.max(0, selectedIndex - viewportHeight));
            return;
        }
        if (key.pageDown) {
            onIndexChange(Math.min(itemCount - 1, selectedIndex + viewportHeight));
            return;
        }

        if (onKey) {
            onKey(input, key);
        }
    }, { isActive });
};