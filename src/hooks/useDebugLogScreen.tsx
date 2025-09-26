import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useLogStore } from '../stores/log.store';
import { useViewStore } from '../stores/view.store';
import { useViewport } from './useViewport';
import { LoggerService } from '../services/logger.service';
import { DEBUG_LOG_MODES } from '../constants/log.constants';
import { OVERLAYS } from '../constants/view.constants';
import { UI_CONFIG } from '../config/ui.config';
import { useListNavigator } from './useListNavigator';

export const useDebugLogScreen = () => {
    const logs = useLogStore(s => s.logs);
    const clearLogs = useLogStore(s => s.actions.clearLogs);
    const setActiveOverlay = useViewStore(s => s.actions.setActiveOverlay);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<keyof typeof DEBUG_LOG_MODES>('LIST');
    const [filterQuery, setFilterQuery] = useState('');

    const filteredLogs = useMemo(() => logs.filter(log =>
        log.message.toLowerCase().includes(filterQuery.toLowerCase()),
    ), [logs, filterQuery]);

    // Reset index to top when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filterQuery]);

    // Clamp index if it's out of bounds after logs change for other reasons
    useEffect(() => {
        if (selectedIndex >= filteredLogs.length) {
            setSelectedIndex(Math.max(0, filteredLogs.length - 1));
        }
    }, [filteredLogs.length, selectedIndex]);

    // Header, borders, footer, filter line
    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: filteredLogs.length,
        layoutConfig: UI_CONFIG.layout.debugLog,
    });

    const isOverlayActive = useViewStore.getState().activeOverlay === OVERLAYS.LOG;

    useInput((_input, key) => {
        if (mode === DEBUG_LOG_MODES.FILTER) {
            if (key.escape || key.return) {
                setMode(DEBUG_LOG_MODES.LIST);
            }
        }
    }, { isActive: isOverlayActive && mode === DEBUG_LOG_MODES.FILTER });

    useListNavigator({
        itemCount: filteredLogs.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: isOverlayActive && mode === DEBUG_LOG_MODES.LIST,
        onKey: (input, key) => {
            if (key.escape || key.leftArrow) {
                setActiveOverlay(OVERLAYS.NONE);
                return;
            }
            if (input.toLowerCase() === 'c') {
                clearLogs();
                setFilterQuery('');
                setSelectedIndex(0);
                return;
            }
            if (input.toLowerCase() === 'f') {
                setMode(DEBUG_LOG_MODES.FILTER);
            }
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
        viewOffset,
    };
};