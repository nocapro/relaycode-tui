import { useInitStore } from '../stores/init.store';
import type { Task } from '../types/init.types';
import { sleep } from '../utils';

const initialAnalyzeTasks: Task[] = [
    { id: 'scan', title: 'Scanning project structure...', subtext: 'Finding package.json', status: 'pending' },
    { id: 'project-id', title: 'Determining Project ID', status: 'pending' },
    { id: 'gitignore', title: 'Checking for existing .gitignore', status: 'pending' },
];

const initialConfigureTasks: Task[] = [
    { id: 'config', title: 'Creating relay.config.json', subtext: 'Writing default configuration with Project ID', status: 'pending' },
    { id: 'state-dir', title: 'Initializing .relay state directory', status: 'pending' },
    { id: 'prompt', title: 'Generating system prompt template', status: 'pending' },
];

const runInitializationProcess = async () => {
    const { actions } = useInitStore.getState();
    actions.resetInit();
    actions.setTasks(initialAnalyzeTasks, initialConfigureTasks);

    actions.setPhase('ANALYZE');
    for (const task of initialAnalyzeTasks) {
        actions.updateAnalyzeTask(task.id, 'active');
        await sleep(800);
        actions.updateAnalyzeTask(task.id, 'done');
    }
    actions.setAnalysisResults('relaycode (from package.json)', true);
    await sleep(500);

    actions.setPhase('CONFIGURE');
    const configTasksUntilInteractive = initialConfigureTasks.slice(0, 2);
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
    const lastTask = initialConfigureTasks[2];
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