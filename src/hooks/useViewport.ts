import { useState, useEffect } from 'react';
import { useStdoutDimensions } from '../utils';
import { useLayout, type LayoutConfig } from './useLayout';

interface UseViewportOptions {
	selectedIndex: number;
	itemCount: number;
	layoutConfig: LayoutConfig;
}

export const useViewport = ({ selectedIndex, itemCount, layoutConfig }: UseViewportOptions) => {
	const { remainingHeight: viewportHeight } = useLayout(layoutConfig);
	const [viewOffset, setViewOffset] = useState(0);

	useEffect(() => {
		setViewOffset(0);
	}, [itemCount]);

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
        width: useStdoutDimensions()[0],
    };
};