import { create } from 'zustand';

// Store Interface
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'GIT_INIT_PROMPT' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';
export type GitInitChoice = 'init' | 'ignore';
export interface Task {
    id: string;
    title: string;
    subtext?: string;
    status: TaskStatus;
}
 
interface InitState {
    phase: InitPhase;
    analyzeTasks: Task[];
    projectId: string | null;
    gitInitialized: boolean | null;
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;
    gitInitChoice: GitInitChoice | null;

    actions: {
        setPhase: (phase: InitPhase) => void;
        setTasks: (analyzeTasks: Task[], configureTasks: Task[]) => void;
        updateAnalyzeTask: (id: string, status: TaskStatus) => void;
        setAnalysisResults: (projectId: string, gitignoreFound: boolean, gitInitialized: boolean) => void;
        updateConfigureTask: (id: string, status: TaskStatus) => void;
        setInteractiveChoice: (choice: GitignoreChoice) => void;
        setGitInitChoice: (choice: GitInitChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: [],
    projectId: null,
    gitInitialized: null,
    gitignoreFound: null,
    configureTasks: [],
    interactiveChoice: null,
    gitInitChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        setTasks: (analyzeTasks, configureTasks) => set({
            analyzeTasks: JSON.parse(JSON.stringify(analyzeTasks)),
            configureTasks: JSON.parse(JSON.stringify(configureTasks)),
        }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setAnalysisResults: (projectId, gitignoreFound, gitInitialized) => set({ projectId, gitignoreFound, gitInitialized }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setInteractiveChoice: (choice) => set({ interactiveChoice: choice }),
        setGitInitChoice: (choice) => set({ gitInitChoice: choice }),
        resetInit: () => set({
            phase: 'ANALYZE',
            analyzeTasks: [],
            projectId: null,
            gitInitialized: null,
            gitignoreFound: null,
            configureTasks: [],
            interactiveChoice: null,
            gitInitChoice: null,
        }),
    },
}));