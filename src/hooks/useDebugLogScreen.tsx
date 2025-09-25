import { useState, useEffect } from 'react';
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

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        reservedRows: 6, // Header, borders, footer
    });

    useInput((input, key) => {
        if (key.escape) {
            setActiveOverlay('none');
            return;
        }
        if (key.upArrow) {
            setSelectedIndex(i => moveIndex(i, 'up', logs.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex(i => moveIndex(i, 'down', logs.length));
            return;
        }
        if (input.toLowerCase() === 'c') {
            clearLogs();
            setSelectedIndex(0);
        }
    });

    useEffect(() => {
        LoggerService.startSimulator();
        return () => {
            LoggerService.stopSimulator();
        };
    }, []);

    const logsInView = logs.slice(viewOffset, viewOffset + viewportHeight);

    return {
        logsInView,
        logCount: logs.length,
        selectedIndex,
    };
};