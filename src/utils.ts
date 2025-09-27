import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Dimensions = { columns: number; rows: number };
const subscribers = new Set<(dims: Dimensions) => void>();
let currentDimensions: Dimensions = {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
};

let listenerAttached = false;
let debounceTimeout: NodeJS.Timeout | null = null;

const updateAndNotify = () => {
    const newDimensions = {
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
    };

    if (newDimensions.columns !== currentDimensions.columns || newDimensions.rows !== currentDimensions.rows) {
        currentDimensions = newDimensions;
        subscribers.forEach(subscriber => subscriber(currentDimensions));
    }
};

const debouncedUpdateAndNotify = () => {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(updateAndNotify, 150); // Debounce resize event
};

if (!listenerAttached) {
    process.stdout.on('resize', debouncedUpdateAndNotify);
    listenerAttached = true;
}

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState(currentDimensions);

    useEffect(() => {
        const subscriber = (newDims: Dimensions) => setDimensions(newDims);
        subscribers.add(subscriber);

        // On mount, check if dimensions are stale and update if needed for this hook instance.
        setDimensions(dims => {
            const latestDims = {
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            };
            if (latestDims.columns !== dims.columns || latestDims.rows !== dims.rows) {
                return latestDims;
            }
            return dims;
        });

        return () => {
            subscribers.delete(subscriber);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};