import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useLogStore } from '../stores/log.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { LoggerService } from '../services/logger.service';
import { moveIndex } from '../stores/navigation.utils';

export const useDebugLogScreen = () => {
    const logs = useLogStore(s => s.logs);
    const clearLogs = useLogStore(s => s.actions.clearLogs);
    const setActiveOverlay = useViewStore(s => s.actions.setActiveOverlay);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<'LIST' | 'FILTER'>('LIST');
    const [filterQuery, setFilterQuery] = useState('');

    const filteredLogs = useMemo(() => logs.filter(log =>
        log.message.toLowerCase().includes(filterQuery.toLowerCase()),
    ), [logs, filterQuery]);

    // Reset index if it's out of bounds after filtering
    useEffect(() => {
        if (selectedIndex >= filteredLogs.length) {
            setSelectedIndex(Math.max(0, filteredLogs.length - 1));
        }
    }, [filteredLogs.length, selectedIndex]);

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: 8, // Header, borders, footer, filter line
    });

    useInput((input, key) => {
        if (mode === 'FILTER') {
            if (key.escape || key.return) {
                setMode('LIST');
            }
            return;
        }

        if (key.escape) {
            setActiveOverlay('none');
            return;
        }
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', filteredLogs.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', filteredLogs.length));
            return;
        }
        if (input.toLowerCase() === 'c') {
            clearLogs();
            setFilterQuery('');
            setSelectedIndex(0);
            return;
        }
        if (input.toLowerCase() === 'f') {
            setMode('FILTER');
        }
    });

    useEffect(() => {
        LoggerService.startSimulator();
        return () => {
            LoggerService.stopSimulator();
        };
    }, []);

    const logsInView = filteredLogs.slice(viewOffset, viewOffset + viewportHeight);

    return {
        logsInView,
        logCount: logs.length,
        filteredLogCount: filteredLogs.length,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
    };
};