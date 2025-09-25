import { useState, useEffect } from 'react';
import { useStdoutDimensions } from '../utils';

interface UseViewportOptions {
    selectedIndex: number;
    padding: number; // Vertical padding (headers, footers, etc.)
}

export const useViewport = ({ selectedIndex, padding }: UseViewportOptions) => {
    const [columns, rows] = useStdoutDimensions();
    const [viewOffset, setViewOffset] = useState(0);

    const viewportHeight = Math.max(1, rows - padding);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < viewOffset) {
            setViewOffset(selectedIndex);
        } else if (selectedIndex >= viewOffset + viewportHeight) {
            setViewOffset(selectedIndex - viewportHeight + 1);
        }
    }, [selectedIndex, viewOffset, viewportHeight]);

    return {
        viewOffset,
        viewportHeight,
        width: columns,
    };
};