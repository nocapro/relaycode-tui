import type { Transaction } from '../types/domain.types';

export const moveIndex = (
    currentIndex: number,
    direction: 'up' | 'down',
    listSize: number,
): number => {
    if (direction === 'up') {
        return Math.max(0, currentIndex - 1);
    }
    return Math.min(listSize - 1, currentIndex + 1);
};

export const findNextPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex < visiblePaths.length - 1) {
        return visiblePaths[currentIndex + 1]!;
    }
    return currentPath;
};

export const findPrevPath = (currentPath: string, visiblePaths: string[]): string => {
    const currentIndex = visiblePaths.indexOf(currentPath);
    if (currentIndex > 0) {
        return visiblePaths[currentIndex - 1]!;
    }
    return currentPath;
};

export const getParentPath = (path: string): string | null => path.includes('/') ? path.split('/')[0]! : null;

export const getVisibleItemPaths = (
    transactions: Transaction[],
    expandedIds: Set<string>,
): string[] => {
    const paths: string[] = [];
    for (const tx of transactions) {
        paths.push(tx.id);
        if (expandedIds.has(tx.id)) {
            paths.push(`${tx.id}/message`);
            paths.push(`${tx.id}/prompt`);
            paths.push(`${tx.id}/reasoning`);
            if (tx.files) {
                for (const file of tx.files) {
                    paths.push(`${tx.id}/file/${file.id}`);
                }
            }
        }
    }
    return paths;
};