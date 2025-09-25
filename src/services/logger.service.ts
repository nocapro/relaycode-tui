import { useLogStore } from '../stores/log.store';

let simulatorInterval: NodeJS.Timeout | null = null;

const startSimulator = () => {
    if (simulatorInterval) return;

    // Initial burst of logs to populate the view
    LoggerService.info('Log simulator started.');
    LoggerService.debug('Initializing clipboard watcher...');
    setTimeout(() => LoggerService.debug('Clipboard watcher active.'), 250);

    simulatorInterval = setInterval(() => {
        const random = Math.random();
        if (random < 0.6) {
            LoggerService.debug('Clipboard watcher polling...');
        } else if (random < 0.8) {
            LoggerService.debug('No clipboard change detected.');
        } else {
            LoggerService.info('Clipboard content changed.');
        }
    }, 2000);
};

const stopSimulator = () => {
    if (simulatorInterval) {
        clearInterval(simulatorInterval);
        simulatorInterval = null;
        LoggerService.info('Log simulator stopped.');
    }
};

const debug = (message: string) => useLogStore.getState().actions.addLog('DEBUG', message);
const info = (message: string) => useLogStore.getState().actions.addLog('INFO', message);
const warn = (message: string) => useLogStore.getState().actions.addLog('WARN', message);
const error = (message: string) => useLogStore.getState().actions.addLog('ERROR', message);


export const LoggerService = {
    debug,
    info,
    warn,
    error,
    startSimulator,
    stopSimulator,
};