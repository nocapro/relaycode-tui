import { createContext, useContext, useMemo } from 'react';
import { useStdoutDimensions } from '../utils';

interface Dimensions {
    columns: number;
    rows: number;
}

const DimensionsContext = createContext<Dimensions>({ columns: 80, rows: 24 });

export const DimensionsProvider = ({ children }: { children: React.ReactNode }) => {
    const [columns, rows] = useStdoutDimensions();
    const value = useMemo(() => ({ columns, rows }), [columns, rows]);

    return (
        <DimensionsContext.Provider value={value}>
            {children}
        </DimensionsContext.Provider>
    );
};

export const useDimensions = () => {
    const context = useContext(DimensionsContext);
    if (context === undefined) {
        throw new Error('useDimensions must be used within a DimensionsProvider');
    }
    return context;
};