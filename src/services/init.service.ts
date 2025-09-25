import { useInitStore } from '../stores/init.store';
import { sleep } from '../utils';
import { INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS } from '../constants/init.constants';

const runInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    actions.resetInit();
    actions.setTasks(INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS);

    actions.setPhase('ANALYZE');
    for (const task of INITIAL_ANALYZE_TASKS) {
        actions.updateAnalyzeTask(task.id, 'active');
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    const configTasksUntilInteractive = INITIAL_CONFIGURE_TASKS.slice(0, 2);
    for (const task of configTasksUntilInteractive) {
        actions.updateConfigureTask(task.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(task.id, 'done');
    }
    await sleep(500);

    actions.setPhase('INTERACTIVE');
};

const resumeInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    
    actions.setPhase('CONFIGURE');
    const lastTask = INITIAL_CONFIGURE_TASKS[2];
    if (lastTask) {
        actions.updateConfigureTask(lastTask.id, 'active');
        await sleep(800);
        actions.updateConfigureTask(lastTask.id, 'done');
        await sleep(500);

        actions.setPhase('FINALIZE');
    }
};

export const InitService = {
    runInitializationProcess,
    resumeInitializationProcess,
};