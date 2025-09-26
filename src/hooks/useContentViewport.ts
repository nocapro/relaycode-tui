import { useState, useEffect, useMemo, useCallback } from 'react';

interface ContentViewportConfig {
    contentLineCount: number;
    viewportHeight: number;
}

export interface ContentViewport {
    scrollIndex: number;
    canScrollUp: boolean;
    canScrollDown: boolean;
    actions: {
        scrollUp: (lines?: number) => void;
        scrollDown: (lines?: number) => void;
        pageUp: () => void;
        pageDown: () => void;
        resetScroll: () => void;
    };
}

/**
 * Manages the scrolling state (index) for a block of content within a fixed viewport.
 * @param config Configuration including total content lines and the height of the visible area.
 * @returns State and actions for controlling the scroll position.
 */
export const useContentViewport = ({
    contentLineCount,
    viewportHeight,
}: ContentViewportConfig): ContentViewport => {
    const [scrollIndex, setScrollIndex] = useState(0);

    const maxScrollIndex = useMemo(
        () => Math.max(0, contentLineCount - viewportHeight),
        [contentLineCount, viewportHeight],
    );

    const resetScroll = useCallback(() => {
        setScrollIndex(0);
    }, []);

    // Effect to reset scroll when content changes, which is a good default.
    useEffect(() => {
        resetScroll();
    }, [contentLineCount, resetScroll]);

    // Effect to clamp scrollIndex if content or viewport size changes
    useEffect(() => {
        if (scrollIndex > maxScrollIndex) {
            setScrollIndex(maxScrollIndex);
        }
    }, [scrollIndex, maxScrollIndex]);

    const canScrollUp = useMemo(() => scrollIndex > 0, [scrollIndex]);
    const canScrollDown = useMemo(() => scrollIndex < maxScrollIndex, [scrollIndex, maxScrollIndex]);

    const scrollUp = useCallback((lines = 1) => {
        setScrollIndex(i => Math.max(0, i - lines));
    }, []);

    const scrollDown = useCallback((lines = 1) => {
        setScrollIndex(i => Math.min(maxScrollIndex, i + lines));
    }, [maxScrollIndex]);

    const pageUp = useCallback(() => {
        setScrollIndex(i => Math.max(0, i - viewportHeight));
    }, [viewportHeight]);

    const pageDown = useCallback(() => {
        setScrollIndex(i => Math.min(maxScrollIndex, i + viewportHeight));
    }, [maxScrollIndex, viewportHeight]);

    return {
        scrollIndex,
        canScrollUp,
        canScrollDown,
        actions: {
            scrollUp,
            scrollDown,
            pageUp,
            pageDown,
            resetScroll,
        },
    };
};