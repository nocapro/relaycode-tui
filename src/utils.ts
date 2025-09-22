import { useState, useEffect } from 'react';

// Utility for simulation
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useStdoutDimensions = (): [number, number] => {
    const [dimensions, setDimensions] = useState({ columns: 80, rows: 24 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                columns: process.stdout.columns || 80,
                rows: process.stdout.rows || 24,
            });
        };

        updateDimensions();
        process.stdout.on('resize', updateDimensions);

        return () => {
            process.stdout.off('resize', updateDimensions);
        };
    }, []);

    return [dimensions.columns, dimensions.rows];
};