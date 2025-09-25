import { useMemo } from 'react';
import { useStdoutDimensions } from '../utils';

export interface LayoutConfig {
    header?: number;
    footer?: number;
    separators?: number;
    marginsY?: number; // Total vertical margin
    paddingY?: number; // Total vertical padding
    fixedRows?: number; // For any other static rows
    dynamicRows?: {
        count: number;
        lineHeight?: number; // Default to 1
    };
}

export interface LayoutInfo {
    totalHeight: number;
    remainingHeight: number;
}

/**
 * Calculates available vertical space based on terminal height and a declarative layout config.
 * @param config A declarative object describing static and dynamic rows to reserve.
 * @returns An object with total terminal height and the calculated remaining height for content.
 */
export const useLayout = (config: LayoutConfig): LayoutInfo => {
    const [, totalHeight] = useStdoutDimensions();

    const reservedHeight = useMemo(() => {
        let reserved = 0;
        reserved += config.header || 0;
        reserved += config.footer || 0;
        reserved += config.separators || 0;
        reserved += config.marginsY || 0;
        reserved += config.paddingY || 0;
        reserved += config.fixedRows || 0;

        if (config.dynamicRows) {
            reserved += config.dynamicRows.count * (config.dynamicRows.lineHeight || 1);
        }
        return reserved;
    }, [config]);

    const remainingHeight = Math.max(1, totalHeight - reservedHeight);

    return {
        totalHeight,
        remainingHeight,
    };
};