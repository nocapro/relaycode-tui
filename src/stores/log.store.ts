import { create } from 'zustand';
import type { LogEntry, LogLevel } from '../types/log.types';

interface LogState {
    logs: LogEntry[];
    actions: {
        addLog: (level: LogLevel, message: string) => void;
        clearLogs: () => void;
    };
}

const MAX_LOGS = 200;

export const useLogStore = create<LogState>((set) => ({
    logs: [],
    actions: {
        addLog: (level, message) => {
            set(state => {
                const newLog: LogEntry = {
                    level,
                    message,
                    timestamp: Date.now(),
                };
                // Prepend new log and trim the array to max size
                const updatedLogs = [newLog, ...state.logs].slice(0, MAX_LOGS);
                return { logs: updatedLogs };
            });
        },
        clearLogs: () => set({ logs: [] }),
    },
}));