import { useInitStore } from '../stores/init.store';
import { sleep } from '../utils';
import { INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS } from '../constants/init.constants';
import { LoggerService } from './logger.service';

const runInitializationProcess = async () => {
    LoggerService.info('Starting initialization process...');
    const { actions } = useInitStore.getState();
    actions.resetInit();
    actions.setTasks(INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS);

    actions.setPhase('ANALYZE');
    LoggerService.debug('Phase set to ANALYZE');
    for (const task of INITIAL_ANALYZE_TASKS) {
        actions.updateAnalyzeTask(task.id, 'active');
        LoggerService.debug(`Analyzing task active: ${task.title}`);
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    LoggerService.debug('Phase set to CONFIGURE');
    const configTasksUntilInteractive = INITIAL_CONFIGURE_TASKS.slice(0, 2);
    for (const task of configTasksUntilInteractive) {
        actions.updateConfigureTask(task.id, 'active');
        LoggerService.debug(`Configuring task active: ${task.title}`);
        await sleep(800);
        actions.updateConfigureTask(task.id, 'done');
    }
    await sleep(500);

    actions.setPhase('INTERACTIVE');
    LoggerService.debug('Phase set to INTERACTIVE');
};

const resumeInitializationProcess = async () => {
    LoggerService.info('Resuming initialization process...');
    const { actions } = useInitStore.getState();
    
    actions.setPhase('CONFIGURE');
    LoggerService.debug('Phase set to CONFIGURE');
    const lastTask = INITIAL_CONFIGURE_TASKS[INITIAL_CONFIGURE_TASKS.length - 1];
    if (lastTask) {
        actions.updateConfigureTask(lastTask.id, 'active');
        LoggerService.debug(`Configuring task active: ${lastTask.title}`);
        await sleep(800);
        actions.updateConfigureTask(lastTask.id, 'done');
        await sleep(500);

        actions.setPhase('FINALIZE');
        LoggerService.info('Initialization process finalized.');
    }
};

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};