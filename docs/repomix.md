# Directory Structure
```
src/
  components/
    InitializationScreen.tsx
    SplashScreen.tsx
  hooks/
    useDebugMenu.tsx
    useInitializationScreen.tsx
    useSplashScreen.tsx
  services/
    init.service.ts
  stores/
    app.store.ts
    init.store.ts
  App.tsx
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: eslint.config.js
```javascript
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript rules
      'no-unused-vars': 'off', // Must be disabled to use the @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-uses-react': 'off', // Not needed with React 17+ JSX transform
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'off', // Often not needed in Ink components

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'indent': 'off', // Disabled due to stack overflow issues
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'coverage/**',
    ],
  },
];
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Some stricter flags
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

## File: src/hooks/useInitializationScreen.tsx
```typescript
import { useEffect } from 'react';
import { Text, useApp, useInput } from 'ink';
import { useInitStore } from '../stores/init.store';
import { useAppStore } from '../stores/app.store';
import { InitService } from '../services/init.service';

export const useInitializationScreen = () => {
    const phase = useInitStore(s => s.phase);
    const interactiveChoice = useInitStore(s => s.interactiveChoice);
    const actions = useInitStore(s => s.actions);
    const showDashboardScreen = useAppStore(s => s.actions.showDashboardScreen);
    const { exit } = useApp();

    useInput((input, key) => {
        if (phase === 'INTERACTIVE') {
            if (key.return) {
                actions.setInteractiveChoice('ignore');
            } else if (input.toLowerCase() === 's') {
                actions.setInteractiveChoice('share');
            }
        }
        if (phase === 'FINALIZE') {
            if (input.toLowerCase() === 'w') {
                showDashboardScreen();
            }
            if (input.toLowerCase() === 'q') {
                exit();
            }
        }
    });

    useEffect(() => {
        InitService.runInitializationProcess();
    }, []);

    useEffect(() => {
        if (phase === 'INTERACTIVE' && interactiveChoice !== null) {
            InitService.resumeInitializationProcess();
        }
    }, [interactiveChoice, phase]);

    const {
        analyzeTasks,
        configureTasks,
        projectId,
    } = useInitStore();

    let footerText;
    switch (phase) {
        case 'ANALYZE': footerText = 'This utility will configure relaycode for your project.'; break;
        case 'CONFIGURE': footerText = 'Applying configuration based on project analysis...'; break;
        case 'INTERACTIVE': footerText = <Text>(<Text color="cyan" bold>Enter</Text>) No, ignore it (default)      (<Text color="cyan" bold>S</Text>) Yes, share it</Text>; break;
        case 'FINALIZE': footerText = <Text>(<Text color="cyan" bold>W</Text>)atch for Patches · (<Text color="cyan" bold>L</Text>)View Logs · (<Text color="cyan" bold>Q</Text>)uit</Text>; break;
    }

    return {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    };
};
```

## File: src/services/init.service.ts
```typescript
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
```

## File: package.json
```json
{
  "name": "relaycode-tui",
  "module": "index.tsx",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "bun run index.tsx",
    "dev": "bun run --watch index.tsx",
    "debug-screen": "bun run index.tsx debug-screen",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "clipboardy": "^4.0.0",
    "ink": "^6.3.1",
    "ink-select-input": "^4.2.2",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "react": "^19.1.1",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.19.17",
    "@types/react": "^18.3.24",
    "@typescript-eslint/eslint-plugin": "^8.44.0",
    "@typescript-eslint/parser": "^8.44.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "typescript": "^5.9.2"
  }
}
```

## File: src/stores/init.store.ts
```typescript
import { create } from 'zustand';

// Store Interface
export type TaskStatus = 'pending' | 'active' | 'done';
export type InitPhase = 'ANALYZE' | 'CONFIGURE' | 'INTERACTIVE' | 'FINALIZE';
export type GitignoreChoice = 'ignore' | 'share';
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
    gitignoreFound: boolean | null;
    configureTasks: Task[];
    interactiveChoice: GitignoreChoice | null;

    actions: {
        setPhase: (phase: InitPhase) => void;
        setTasks: (analyzeTasks: Task[], configureTasks: Task[]) => void;
        updateAnalyzeTask: (id: string, status: TaskStatus) => void;
        setAnalysisResults: (projectId: string, gitignoreFound: boolean) => void;
        updateConfigureTask: (id: string, status: TaskStatus) => void;
        setInteractiveChoice: (choice: GitignoreChoice) => void;
        resetInit: () => void;
    };
}

// Create the store
export const useInitStore = create<InitState>((set) => ({
    phase: 'ANALYZE',
    analyzeTasks: [],
    projectId: null,
    gitignoreFound: null,
    configureTasks: [],
    interactiveChoice: null,

    actions: {
        setPhase: (phase) => set({ phase }),
        setTasks: (analyzeTasks, configureTasks) => set({
            analyzeTasks: JSON.parse(JSON.stringify(analyzeTasks)),
            configureTasks: JSON.parse(JSON.stringify(configureTasks)),
        }),
        updateAnalyzeTask: (id, status) => set(state => ({
            analyzeTasks: state.analyzeTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setAnalysisResults: (projectId, gitignoreFound) => set({ projectId, gitignoreFound }),
        updateConfigureTask: (id, status) => set(state => ({
            configureTasks: state.configureTasks.map(t => t.id === id ? { ...t, status } : t),
        })),
        setInteractiveChoice: (choice) => set({ interactiveChoice: choice }),
        resetInit: () => set({
            phase: 'ANALYZE',
            analyzeTasks: [],
            projectId: null,
            gitignoreFound: null,
            configureTasks: [],
            interactiveChoice: null,
        }),
    },
}));
```

## File: src/hooks/useSplashScreen.tsx
```typescript
import { useState, useEffect, useRef } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { SPLASH_TIPS } from '../constants/splash.constants';
import { useNotificationStore } from '../stores/notification.store';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);
    const [visibleLogoLines, setVisibleLogoLines] = useState(0);
    const [tip, setTip] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');
    const [visibleSections, setVisibleSections] = useState(new Set<string>());
    const [animationComplete, setAnimationComplete] = useState(false);

    // Use a ref to manage timeouts to prevent memory leaks on fast unmount/skip
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAllTimeouts = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    };

    const handleSkip = () => {
        clearAllTimeouts();
        setAnimationComplete(true);
        setVisibleLogoLines(100); // A high number to show all lines
        setVisibleSections(new Set(['tagline', 'version', 'updateCheck', 'promo', 'links']));
        setUpdateStatus('✓ You are up to date.');
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening https://relay.noca.pro in your browser...',
            });
            return;
        }
        if (lowerInput === 'x') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening X/Twitter in your browser...',
            });
            return;
        }
        if (lowerInput === 'd') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening Discord invite in your browser...',
            });
            return;
        }
        if (lowerInput === 'g') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening GitHub repository in your browser...',
            });
            return;
        }

        // Any other key skips
        handleSkip(); 
    });

    useEffect(() => {
        const t = (fn: () => void, delay: number) => timeouts.current.push(setTimeout(fn, delay));

        // Pick a random tip on mount
        if (!tip) {
            setTip(SPLASH_TIPS[Math.floor(Math.random() * SPLASH_TIPS.length)]!);
        }

        // 1. Animate logo
        const logoTimer = setInterval(() => {
            setVisibleLogoLines(l => {
                if (l >= 4) { // Fix: was 3, which cut off the last line of the logo
                    clearInterval(logoTimer);
                    
                    // 2. Animate sections
                    t(() => setVisibleSections(s => new Set(s).add('tagline')), 100);
                    t(() => setVisibleSections(s => new Set(s).add('version')), 300);
                    t(() => {
                        setVisibleSections(s => new Set(s).add('updateCheck'));
                        setUpdateStatus('Checking for updates...');
                        t(() => setUpdateStatus('✓ You are up to date.'), 1500);
                    }, 600);

                    t(() => setVisibleSections(s => new Set(s).add('promo')), 800);
                    t(() => setVisibleSections(s => new Set(s).add('links')), 1000);
                    t(() => setAnimationComplete(true), 1200);

                    return l;
                }
                return l + 1;
            });
        }, 80);

        // Cleanup
        return () => {
            clearInterval(logoTimer);
            clearAllTimeouts();
        };
    }, [tip]);

    useEffect(() => {
        if (!animationComplete) return;

        if (countdown <= 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        timeouts.current.push(timer);
        
        return () => clearTimeout(timer);
    }, [countdown, showInitScreen, animationComplete]);

    return { countdown, visibleLogoLines, visibleSections, animationComplete, tip, updateStatus };
};
```

## File: src/components/SplashScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Separator from './Separator';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashScreen = () => {
    const { countdown, visibleLogoLines, visibleSections, animationComplete, tip, updateStatus } = useSplashScreen();
    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀`;

    const logoLines = logo.split('\n');

    return (
        <Box flexDirection="column" height="100%" justifyContent="center" alignItems="center">
            <Box flexDirection="column">
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode </Text>
                <Separator />
                <Box flexDirection="column">
                    {logoLines.slice(0, visibleLogoLines).map((line, index) => {
                        if (index === 0) return <Text key={index}>{line}</Text>;
                        if (index === 2) return <Text key={index} color="white">{line}</Text>;
                        return <Text key={index} color="cyan">{line}</Text>;
                    })}
                </Box>
                {visibleSections.has('tagline') && (
                    <Box flexDirection="column" alignItems="center">
                        <Text italic>A zero-friction, AI-native patch engine.</Text>
                        <Text italic color="gray">Built by Arman and contributors · <Text underline color="blue">https://relay.noca.pro</Text></Text>
                    </Box>
                )}
                
                {visibleSections.has('version') && (
                    <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                        <Box flexDirection="column" width="45%">
                            <Text color="yellow">Version 1.1.5</Text>
                            <Text color="gray">─────────────────────────</Text>
                            <Text>relaycode</Text>
                            <Text>relaycode-core</Text>
                            <Text>apply-multi-diff</Text>
                            <Text>konro</Text>
                        </Box>
                         <Box flexDirection="column" width="45%">
                            <Text color="yellow">Build Timestamps</Text>
                            <Text color="gray">─────────────────────────</Text>
                            <Text>2025-09-20 13:58:05</Text>
                            <Text>2025-09-20 10:59:05</Text>
                            <Text>(versioned)</Text>
                            <Text>(versioned)</Text>
                        </Box>
                    </Box>
                )}

                {visibleSections.has('updateCheck') && (
                    <Box marginTop={1}>
                        <Text>{updateStatus}</Text>
                    </Box>
                )}
                
                {visibleSections.has('promo') && (
                    <>
                        <Box marginTop={1}><Separator /></Box>
                        <Text>If you love this workflow, check out <Text underline color="blue">https://www.noca.pro</Text> for the full</Text>
                        <Text>web app with repo-wide visual context, history, and rollback.</Text>
                        <Text><Text color="cyan" bold>(V)</Text>isit noca.pro</Text>
                    </>
                )}

                {visibleSections.has('links') && (
                    <>
                        <Separator />
                        <Text>Follow <Text color="cyan" bold>(X)</Text> · Join <Text color="cyan" bold>(D)</Text>iscord · Star on <Text color="cyan" bold>(G)</Text>itHub</Text>
                    </>
                )}

                <Separator />
                {animationComplete && (
                    <Box marginBottom={1}>
                        <Text italic color="gray">{tip}</Text>
                    </Box>
                )}
                <Text>
                    <Text color="gray">
                        {animationComplete ? 'Loading... ' : 'Loading...'}
                    </Text>
                    {animationComplete && <Text color="yellow">{countdown}</Text>}
                    <Text color="gray"> (Press any key to skip)</Text>
                </Text>
            </Box>
        </Box>
    );
};

export default SplashScreen;
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';
import { SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

interface AppState {
    currentScreen: AppScreen;
    actions: {
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        navigateBack: () => void;
    };
}

export const useAppStore = create<AppState>((set, get) => ({
    currentScreen: 'splash',
    actions: {
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showDashboardScreen: () => set({ currentScreen: 'dashboard' }),
        showReviewScreen: () => set({ currentScreen: 'review' }),
        showGitCommitScreen: () => set({ currentScreen: 'git-commit' }),
        showSplashScreen: () => set({ currentScreen: 'splash' }),
        showTransactionHistoryScreen: () => set({ currentScreen: 'transaction-history' }),
        showTransactionDetailScreen: () => set({ currentScreen: 'transaction-detail' }),
        navigateBack: () => {
            const { currentScreen } = get();
            if ((SCREENS_WITH_DASHBOARD_BACK_ACTION as readonly string[]).includes(currentScreen)) {
                get().actions.showDashboardScreen();
            }
        },
    },
}));
```

## File: src/components/InitializationScreen.tsx
```typescript
import { Box, Text } from 'ink';
import { useState, useEffect } from 'react';
import Spinner from 'ink-spinner';
import type { Task } from '../stores/init.store';
import { useInitializationScreen } from '../hooks/useInitializationScreen';
import ScreenLayout from './layout/ScreenLayout';

const TaskItem = ({ task, doneSymbol = '✓' }: { task: Task; doneSymbol?: string }) => {
	const [isJustDone, setIsJustDone] = useState(false);

	useEffect(() => {
		if (task.status === 'done') {
			setIsJustDone(true);
			const timer = setTimeout(() => setIsJustDone(false), 300);
			return () => clearTimeout(timer);
		}
	}, [task.status]);

	let symbol: React.ReactNode;
	switch (task.status) {
		case 'pending': symbol = '( )'; break;
		case 'active': symbol = <Text color="cyan"><Spinner type="dots" /></Text>; break;
		case 'done': symbol = <Text color="green">{doneSymbol}</Text>; break;
	}

	const title = task.status === 'done' && doneSymbol?.startsWith('[✓]') ? `Created ${task.title.split(' ')[1]}` : task.title;

	return (
		<Box flexDirection="column">
			<Text color={isJustDone ? 'green' : undefined} bold={isJustDone}>
				{symbol} {title}
			</Text>
			{task.subtext && task.status !== 'done' && (
				<Text italic color="gray">
					{'     └─ '}{task.subtext}
				</Text>
			)}
		</Box>
	);
};

const InitializationScreen = () => {
    const {
        phase,
        analyzeTasks,
        configureTasks,
        interactiveChoice,
        projectId,
        footerText,
    } = useInitializationScreen();

    const renderAnalyze = () => (
        <Box flexDirection="column">
            <Text bold color="cyan">PHASE 1: ANALYZE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {analyzeTasks.map(t => <TaskItem key={t.id} task={t} />)}
            </Box>
        </Box>
    );

    const renderContext = () => (
        <Box flexDirection="column" marginBottom={1}>
            <Text bold color="cyan">CONTEXT</Text>
            <Text>  <Text color="green">✓</Text> Project ID: {projectId}</Text>
            <Text>  <Text color="green">✓</Text> Gitignore:  Found at ./</Text>
        </Box>
    );

    const renderConfigure = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1} gap={1}>
                {configureTasks.map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
            </Box>
        </Box>
    );

    const renderInteractive = () => (
        <Box flexDirection="column">
            {renderContext()}
            <Text bold color="cyan">PHASE 2: CONFIGURE</Text>
            <Box flexDirection="column" marginTop={1}>
                {configureTasks.slice(0, 2).map(t => <TaskItem key={t.id} task={t} doneSymbol='[✓]' />)}
                <Box flexDirection="column" marginTop={1}>
                    <Text><Text color="cyan">&gt;</Text> The .relay/ directory is usually ignored by git.</Text>
                    <Text color="yellow">  Do you want to share its state with your team by committing it?</Text>
                </Box>
            </Box>
        </Box>
    );

    const renderFinalize = () => {
        const stateText = interactiveChoice === 'share'
            ? <Text><Text color="cyan">.relay/</Text> directory initialized. It will be committed to git.</Text>
            : <Text><Text color="cyan">.relay/</Text> directory initialized and added to <Text color="cyan">.gitignore</Text>.</Text>;
        const stateSubText = interactiveChoice === 'share'
            ? undefined
            : 'Local transaction history will be stored here.';
        
        return (
            <Box flexDirection="column">
                <Text bold color="green">✓ SYSTEM READY</Text>
                <Box flexDirection="column" marginTop={1} paddingLeft={2} gap={1}>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> <Text bold>Config:</Text>   <Text color="cyan">relay.config.json</Text> created.</Text>
                        <Text color="gray" italic>          › Edit this file to tune linters, git integration, etc.</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> <Text bold>State:</Text>    {stateText}</Text>
                        {stateSubText && <Text color="gray" italic>          › {stateSubText}</Text>}
                    </Box>
                    <Box flexDirection="column">
                        <Text><Text color="green">✓</Text> <Text bold>Prompt:</Text>   System prompt generated at <Text color="cyan">.relay/prompts/system-prompt.md</Text>.</Text>
                        <Text color="green" italic>          › Copied to clipboard. Paste into your AI&apos;s custom instructions.</Text>
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderPhase = () => {
        switch (phase) {
            case 'ANALYZE': return renderAnalyze();
            case 'CONFIGURE': return renderConfigure();
            case 'INTERACTIVE': return renderInteractive();
            case 'FINALIZE': return renderFinalize();
        }
    };

    return (
        <ScreenLayout
            title={phase === 'FINALIZE' ? 'BOOTSTRAP COMPLETE' : 'BOOTSTRAP'}
            footer={typeof footerText === 'string' ? <Text>{footerText}</Text> : footerText}
        >
            {renderPhase()}
        </ScreenLayout>
    );
};

export default InitializationScreen;
```

## File: index.tsx
```typescript
import { render } from 'ink';
import App from './src/App';
import { useAppStore } from './src/stores/app.store';
import { useViewStore } from './src/stores/view.store';
import { useDetailStore } from './src/stores/detail.store';
import { useHistoryStore } from './src/stores/history.store';
import { useReviewStore } from './src/stores/review.store';
import { useTransactionStore } from './src/stores/transaction.store';
import { useCommitStore } from './src/stores/commit.store';
import { useNotificationStore } from './src/stores/notification.store';

const main = () => {
    // Initialize stores
    useTransactionStore.getState().actions.loadTransactions();
    const args = process.argv.slice(2);

    if (args[0] === 'debug-screen' && args[1]) {
        const screenName = args[1].replace(/\.tsx$/, '');
        const { actions: appActions } = useAppStore.getState();

        switch (screenName) {
            case 'DashboardScreen':
                appActions.showDashboardScreen();
                break;
            case 'GitCommitScreen':
                useCommitStore.getState().actions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                break;
            case 'ReviewProcessingScreen':
                useReviewStore.getState().actions.load('1'); // Tx '1' is failure case
                useReviewStore.getState().actions.startApplySimulation('1', 'failure');
                break;
            case 'ReviewScreen':
                useReviewStore.getState().actions.load('1');
                appActions.showReviewScreen();
                break;
            case 'TransactionDetailScreen':
                useDetailStore.getState().actions.load('3');
                appActions.showTransactionDetailScreen();
                break;
            case 'TransactionHistoryScreen':
                useHistoryStore.getState().actions.load();
                appActions.showTransactionHistoryScreen();
                break;
            case 'InitializationScreen':
                 appActions.showInitScreen();
                 break;
            case 'SplashScreen':
                 appActions.showSplashScreen();
                 break;
            case 'DebugMenu':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('debug');
                break;
            case 'DebugLogScreen':
                appActions.showDashboardScreen();
                useViewStore.getState().actions.setActiveOverlay('log');
                break;
            case 'NotificationScreen':
                appActions.showDashboardScreen();
                useNotificationStore.getState().actions.show({
                    type: 'success', title: 'DEBUG', message: 'This is a test notification.',
                });
                break;
            default:
                process.stderr.write(`Unknown debug screen: ${args[1]}\n`);
                process.exit(1);
        }
    }

    // Check if we're running in an interactive terminal
    if (process.stdin.isTTY && process.stdout.isTTY) {
        // eslint-disable-next-line no-console
        console.clear();
        render(<App />);
    } else {
        process.stderr.write('Interactive terminal required. Please run in a terminal that supports raw input mode.\n');
        process.exit(1);
    }
};

main();
```

## File: src/App.tsx
```typescript
import { Box } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import GitCommitScreen from './components/GitCommitScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import DebugMenu from './components/DebugMenu'; 
import DebugLogScreen from './components/DebugLogScreen';
import GlobalHelpScreen from './components/GlobalHelpScreen';
import CopyScreen from './components/CopyScreen';
import NotificationScreen from './components/NotificationScreen';
import { DimensionsProvider } from './contexts/DimensionsContext';
import { useViewStore } from './stores/view.store';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);
    const activeOverlay = useViewStore(s => s.activeOverlay);
    const isOverlayOpen = activeOverlay !== 'none';

    // Global hotkeys are active if no modal-like component is open
    const areGlobalHotkeysActive = activeOverlay !== 'copy' && activeOverlay !== 'log' && activeOverlay !== 'notification'; // These overlays have their own input handlers
    useGlobalHotkeys({ isActive: areGlobalHotkeysActive });

    const renderMainScreen = () => {
        if (currentScreen === 'splash') return <SplashScreen />;
        if (currentScreen === 'init') return <InitializationScreen />;
        if (currentScreen === 'dashboard') return <DashboardScreen />;
        if (currentScreen === 'review') return <ReviewScreen />;
        if (currentScreen === 'review-processing') return <ReviewProcessingScreen />;
        if (currentScreen === 'git-commit') return <GitCommitScreen />;
        if (currentScreen === 'transaction-detail') return <TransactionDetailScreen />;
        if (currentScreen === 'transaction-history') return <TransactionHistoryScreen />;
        return null;
    };

    return (
        <DimensionsProvider>
            <Box
                width="100%"
                height="100%"
                flexDirection="column"
                display={isOverlayOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            {activeOverlay === 'help' && <GlobalHelpScreen />}
            {activeOverlay === 'copy' && <CopyScreen />}
            {activeOverlay === 'log' && <DebugLogScreen />}
            {activeOverlay === 'debug' && <DebugMenu />}
            {activeOverlay === 'notification' && <NotificationScreen />}
        </DimensionsProvider>
    );
};

export default App;
```

## File: src/hooks/useDebugMenu.tsx
```typescript
import { useState } from 'react';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useReviewStore } from '../stores/review.store';
import { useDetailStore } from '../stores/detail.store';
import { useHistoryStore } from '../stores/history.store';
import { useInitStore } from '../stores/init.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCommitStore } from '../stores/commit.store';
import { useCopyStore } from '../stores/copy.store';
import { CopyService } from '../services/copy.service';
import type { MenuItem } from '../types/debug.types';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { ClipboardService } from '../services/clipboard.service';
import { UI_CONFIG } from '../config/ui.config';
import { OVERLAYS } from '../constants/view.constants';
import { useViewport } from './useViewport';
import { useListNavigator } from './useListNavigator';
export type { MenuItem } from '../types/debug.types';

const useDebugMenuActions = () => {
    const { actions: appActions } = useAppStore();
    const { actions: initActions } = useInitStore();
    const { actions: notificationActions } = useNotificationStore();
    const { actions: commitActions } = useCommitStore();
    const { actions: dashboardActions } = useDashboardStore();
    const { actions: reviewActions } = useReviewStore();
    const { actions: detailActions } = useDetailStore();
    const { actions: historyActions } = useHistoryStore();

    const menuItems: MenuItem[] = [
        {
            title: 'Simulate Pasting Valid Patch',
            action: () => ClipboardService.processClipboardContent(true),
        },
        {
            title: 'Simulate Pasting Invalid Text',
            action: () => ClipboardService.processClipboardContent(false),
        },
        {
            title: 'View Debug Log',
            action: () => useViewStore.getState().actions.setActiveOverlay(OVERLAYS.LOG),
        },
        {
            title: 'Show Success Notification',
            action: () => notificationActions.show({
                type: 'success',
                title: 'Operation Successful',
                message: 'The requested operation completed without errors.',
            }),
        },
        {
            title: 'Show Error Notification',
            action: () => notificationActions.show({
                type: 'error',
                title: 'Operation Failed',
                message: 'An unexpected error occurred. Check the debug log for details.',
            }),
        },
        {
            title: 'Show Info Notification',
            action: () => notificationActions.show({
                type: 'info',
                title: 'Information',
                message: 'This is an informational message for the user.',
            }),
        },
        {
            title: 'Show Warning Notification',
            action: () => notificationActions.show({
                type: 'warning',
                title: 'Warning',
                message: 'This action may have unintended side effects.',
            }),
        },
        {
            title: 'Splash Screen',
            action: () => appActions.showSplashScreen(),
        },
        {
            title: 'Init: Analyze Phase',
            action: () => {
                initActions.setPhase('ANALYZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Interactive Phase',
            action: () => {
                initActions.setPhase('INTERACTIVE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Finalize Phase',
            action: () => {
                initActions.setPhase('FINALIZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Dashboard: Listening',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Confirm Approve',
            action: () => {
                dashboardActions.startApproveAll();
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Approving',
            action: () => {
                dashboardActions.setStatus('APPROVING');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Dashboard: Expanded View',
            action: () => {
                dashboardActions.setStatus('LISTENING');
                dashboardActions.setExpandedTransactionId('1');
                appActions.showDashboardScreen();
            },
        },
        {
            title: 'Review: Partial Failure (Default)',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Success',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Diff View',
            action: () => {
                reviewActions.load('1');
                reviewActions.setBodyView('diff');
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Reasoning View',
            action: () => {
                reviewActions.load('1', { bodyView: 'reasoning' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Copy Mode',
            action: () => {
                reviewActions.load('1');
                appActions.showReviewScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '1');
                if (!tx) return;
                // On load, selected index is 0, so we can assume the first file.
                const selectedFile = tx.files && tx.files.length > 0
                    ? tx.files[0]
                    : undefined;
                useCopyStore.getState().actions.openForReview(tx, tx.files || [], selectedFile);
            },
        },
        {
            title: 'Review: Script Output',
            action: () => {
                reviewActions.load('2');
                appActions.showReviewScreen();
                reviewActions.setBodyView('script_output');
            },
        },
        {
            title: 'Review: Bulk Repair',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Repair (Navigable)',
            action: () => {
                reviewActions.load('1', { bodyView: 'bulk_repair', selectedBulkRepairOptionIndex: 1 });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Bulk Instruct',
            action: () => {
                reviewActions.load('2'); // Load success case
                // Reject some files to enable the workflow
                reviewActions.toggleFileApproval('2-1');
                reviewActions.toggleFileApproval('2-2');
                reviewActions.showBulkInstruct();
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review: Handoff Confirm',
            action: () => {
                reviewActions.load('1', { bodyView: 'confirm_handoff' });
                appActions.showReviewScreen();
            },
        },
        {
            title: 'Review Processing (Success)',
            action: () => {
                // Use tx '2' which is the success case in prepareTransactionForReview
                reviewActions.load('2');
                reviewActions.startApplySimulation('2', 'success');
            },
        },
        {
            title: 'Review Processing (Failure)',
            action: () => {
                // Use tx '1' which is the failure case in prepareTransactionForReview
                reviewActions.load('1');
                reviewActions.startApplySimulation('1', 'failure');
            },
        },
        {
            title: 'Git Commit Screen',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
            },
        },
        {
            title: 'Git Commit Screen (Failure State)',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                // Fire-and-forget, the UI will update from the store
                commitActions.commit(true);
            },
        },
        {
            title: 'Git Commit: Copy Mode',
            action: () => {
                commitActions.prepareCommitScreen();
                appActions.showGitCommitScreen();
                const transactionsToCommit = selectTransactionsByStatus('APPLIED')(useTransactionStore.getState());
                const { finalCommitMessage } = useCommitStore.getState();
                const items = CopyService.getCopyItemsForCommit(
                    transactionsToCommit,
                    finalCommitMessage,
                );
                useCopyStore.getState().actions.open('Select data to copy from commit:', items);
            },
        },
        {
            title: 'Transaction Detail Screen',
            action: () => {
                // The dashboard store has transactions, we'll just pick one.
                detailActions.load('3'); // 'feat: implement new dashboard UI'
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Copy Mode',
            action: () => {
                detailActions.load('3');
                appActions.showTransactionDetailScreen();
                const tx = useTransactionStore.getState().transactions.find(t => t.id === '3');
                if (!tx) return;
                const selectedFile = tx.files?.[0];
                useCopyStore.getState().actions.openForDetail(tx, selectedFile);
            },
        },
        {
            title: 'Detail: Diff View (for File Open action)',
            action: () => {
                detailActions.load('3', {
                    focusedItemPath: 'FILES/3-1',
                    bodyView: 'DIFF_VIEW',
                    expandedItemPaths: new Set(['FILES']),
                });
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Detail: Revert Confirm',
            action: () => {
                detailActions.load('3', { bodyView: 'REVERT_CONFIRM' });
                appActions.showTransactionDetailScreen();
            },
        },
        {
            title: 'Transaction History Screen',
            action: () => {
                historyActions.load();
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L1 Drilldown (Content)',
            action: () => {
                historyActions.prepareDebugState('l1-drill-content');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (Reasoning)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-reasoning');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: L2 Drilldown (for File Open action)',
            action: () => {
                historyActions.prepareDebugState('l2-drill-diff');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Filter Mode',
            action: () => {
                historyActions.prepareDebugState('filter');
                appActions.showTransactionHistoryScreen();
            },
        },
        {
            title: 'History: Copy Mode',
            action: () => {
                historyActions.prepareDebugState('copy');
                appActions.showTransactionHistoryScreen();
                const { transactions } = useTransactionStore.getState();
                const { selectedForAction } = useHistoryStore.getState();
                const txsToCopy = transactions.filter(tx => selectedForAction.has(tx.id));
                useCopyStore.getState().actions.openForHistory(txsToCopy);
            },
        },
        {
            title: 'History: Bulk Actions Mode',
            action: () => {
                historyActions.prepareDebugState('bulk');
                appActions.showTransactionHistoryScreen();
            },
        },
    ];
    return { menuItems };
};

export const useDebugMenu = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { menuItems } = useDebugMenuActions();

    const { viewOffset, viewportHeight } = useViewport({
        selectedIndex,
        itemCount: menuItems.length,
        layoutConfig: UI_CONFIG.layout.debugMenu,
    });
    
    useListNavigator({
        itemCount: menuItems.length,
        viewportHeight,
        selectedIndex,
        onIndexChange: setSelectedIndex,
        isActive: useViewStore.getState().activeOverlay === OVERLAYS.DEBUG,
        onKey: (input, key) => {
            if (key.return) {
                const item = menuItems[selectedIndex];
                if (item) {
                    useViewStore.getState().actions.setActiveOverlay(OVERLAYS.NONE);
                    item.action();
                }
                return;
            }
            if (key.escape || key.leftArrow) {
                useViewStore.getState().actions.setActiveOverlay(OVERLAYS.NONE);
                return;
            }

            // No ctrl/meta keys for selection shortcuts, and only single characters
            if (key.ctrl || key.meta || input.length !== 1) return;

            if (input >= '1' && input <= '9') {
                const targetIndex = parseInt(input, 10) - 1;
                if (targetIndex < menuItems.length) {
                    setSelectedIndex(targetIndex);
                }
            } else if (input.toLowerCase() >= 'a' && input.toLowerCase() <= 'z') {
                const targetIndex = 9 + (input.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0));
                if (targetIndex < menuItems.length) {
                    setSelectedIndex(targetIndex);
                }
            }
        },
    });

    const menuItemsInView = menuItems.slice(viewOffset, viewOffset + viewportHeight);

    return {
        selectedIndex,
        menuItems: menuItemsInView,
        viewOffset,
        totalItems: menuItems.length,
    };
};
```
