# Directory Structure
```
src/
  components/
    AiProcessingScreen.tsx
    ReviewProcessingScreen.tsx
    SettingsScreen.tsx
  constants/
    review.constants.ts
    settings.constants.ts
  hooks/
    useAiProcessingScreen.tsx
    useDebugMenu.tsx
    useGlobalHotkeys.tsx
    useReviewProcessingScreen.tsx
    useReviewScreen.tsx
    useSettingsScreen.tsx
  services/
    ai.service.ts
    review.service.ts
  stores/
    app.store.ts
    review.store.ts
    settings.store.ts
  types/
    actions.types.ts
    domain.types.ts
    view.types.ts
  App.tsx
eslint.config.js
index.tsx
package.json
tsconfig.json
```

# Files

## File: src/components/AiProcessingScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type ApplyStep } from '../stores/review.store'; // ApplyStep can be reused
import ActionFooter from './ActionFooter';
import { useAiProcessingScreen } from '../hooks/useAiProcessingScreen';
import Separator from './Separator';
import ScreenLayout from './layout/ScreenLayout';

// This component is based on ReviewProcessingScreen's ApplyStepRow,
// but adapted to show durations for substeps as well.
const ProcessingStepRow = ({ step, isSubstep = false, now }: {
    step: ApplyStep;
    isSubstep?: boolean;
    now: number;
}) => {
    if (isSubstep) {
        let color: string | undefined;
        let symbol: React.ReactNode;

        switch (step.status) {
            case 'pending': symbol = '○'; color = 'gray'; break;
            case 'active': symbol = <Text color="cyan"><Spinner type="dots" /></Text>; break;
            case 'done': symbol = '✓'; color = 'green'; break;
            case 'failed': symbol = '✗'; color = 'red'; break;
            default: symbol = ' ';
        }

        return (
            <Text>
                {'     └─ '}<Text color={color}>{symbol}</Text>{' '}{step.title}
            </Text>
        );
    }

    let durationText = '';
    // This logic is kept similar to ReviewProcessingScreen for consistency
    if (!isSubstep) {
        if (step.status === 'active' && step.startTime) {
            durationText = ` (${((now - step.startTime) / 1000).toFixed(1)}s)`;
        } else if (step.duration) {
            durationText = ` (${step.duration.toFixed(1)}s)`;
        }
    }

    let symbol;
    let color;
    switch (step.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = '(●)'; color = 'cyan'; break;
        case 'done': symbol = '[✓]'; color = 'green'; break;
        case 'failed': symbol = '[!]'; color = 'red'; break;
        case 'skipped': symbol = '(-)'; color = 'gray'; break;
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title}{durationText}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ProcessingStepRow key={i} step={sub} isSubstep={true} now={now} />
            ))}
        </Box>
    );
};

const AiProcessingScreen = () => {
    const {
        transaction,
        aiProcessingSteps,
        isProcessing,
        elapsedTime,
        now,
    } = useAiProcessingScreen();

    const renderFooter = () => {
        if (isProcessing) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text>Elapsed: {elapsedTime.toFixed(1)}s · Processing... Please wait.</Text>
                    <Separator />
                    <ActionFooter actions={[{ key: 'Ctrl+C', label: 'Cancel Process' }]} />
                </Box>
            );
        }
        return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Repair complete. Transitioning...</Text>;
    };

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    const failedFilesCount = aiProcessingSteps.find(s => s.id === 'request')?.substeps?.length || 0;

    return (
        <ScreenLayout
            title="AI AUTO-REPAIR"
            footer={renderFooter()}
        >
            <Box flexDirection="column">
                <Text>Attempting to auto-repair {failedFilesCount > 0 ? `${failedFilesCount} ` : ''}files... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {aiProcessingSteps.map((step: ApplyStep) => <ProcessingStepRow key={step.id} step={step} now={now} />)}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default AiProcessingScreen;
```

## File: src/components/SettingsScreen.tsx
```typescript
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import ScreenLayout from './layout/ScreenLayout';
import { useSettingsScreen } from '../hooks/useSettingsScreen';
import { AI_PROVIDERS, SETTINGS_FOOTER_ACTIONS } from '../constants/settings.constants';
import ActionFooter from './ActionFooter';

const SettingsScreen = () => {
    const {
        activeField,
        provider,
        setProvider,
        filteredProviders,
        providerSelectionIndex,
        apiKey,
        setApiKey,
        model,
        setModel,
        isApiKeyFocused,
        isModelFocused,
        filteredModels,
        modelSelectionIndex,
    } = useSettingsScreen();

    return (
        <ScreenLayout
            title="SETTINGS"
            footer={<ActionFooter actions={SETTINGS_FOOTER_ACTIONS} />}
        >
            <Box flexDirection="column" gap={1}>
                <Text>Configure your AI provider. Your API key will be stored locally.</Text>

                <Box flexDirection="column" marginTop={1}>
                    <Text bold={activeField === 'provider'}>
                        {activeField === 'provider' ? '> ' : '  '}AI Provider: (type to search)
                    </Text>
                    <Box paddingLeft={2}>
                        <TextInput
                            value={provider}
                            onChange={setProvider}
                            onSubmit={() => {}}
                            placeholder="OpenRouter"
                            focus={activeField === 'provider'}
                        />
                    </Box>
                    {activeField === 'provider' && filteredProviders.length > 0 && provider !== (filteredProviders[providerSelectionIndex]?.label || '') && (
                        <Box flexDirection="column" paddingLeft={4} marginTop={1}>
                            {filteredProviders.map((p, index) => (
                                <Text key={p.value} color={providerSelectionIndex === index ? 'cyan' : undefined}>
                                    {p.label}
                                </Text>
                            ))}
                        </Box>
                    )}
                </Box>

                <Box flexDirection="column">
                    <Text bold={isApiKeyFocused}>
                        {isApiKeyFocused ? '> ' : '  '}API Key:
                    </Text>
                    <Box paddingLeft={2}>
                        <TextInput
                            value={apiKey}
                            onChange={setApiKey}
                            onSubmit={() => {}}
                            placeholder="sk-or-v1-..."
                            mask="*"
                            focus={isApiKeyFocused}
                        />
                    </Box>
                </Box>

                <Box flexDirection="column">
                    <Text bold={isModelFocused}>
                        {isModelFocused ? '> ' : '  '}Model: (type to search)
                    </Text>
                    <Box paddingLeft={2}>
                         <TextInput
                            value={model}
                            onChange={setModel}
                            onSubmit={() => {}}
                            placeholder="meta-llama/llama-3-8b-instruct"
                            focus={isModelFocused}
                        />
                    </Box>
                    {isModelFocused && filteredModels.length > 0 && model !== (filteredModels[modelSelectionIndex] || '') && (
                        <Box flexDirection="column" paddingLeft={4} marginTop={1}>
                            {filteredModels.map((m, index) => (
                                <Text key={m} color={modelSelectionIndex === index ? 'cyan' : undefined}>
                                    {m}
                                </Text>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default SettingsScreen;
```

## File: src/constants/settings.constants.ts
```typescript
import type { ActionItem } from '../types/actions.types';
import type { AiProvider } from '../stores/settings.store';

export const AI_PROVIDERS: { value: AiProvider; label: string }[] = [
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'groq', label: 'Groq' },
    { value: 'together', label: 'Together AI' },
    { value: 'custom', label: 'Custom (OpenAI compatible)' },
];

export const SETTINGS_FOOTER_ACTIONS: readonly ActionItem[] = [
    { key: '↑↓', label: 'Nav Options' },
    { key: 'Enter', label: 'Select' },
    { key: 'Tab', label: 'Next Field' },
    { key: 'Esc', label: 'Close & Save' },
] as const;

export const AI_MODELS: readonly string[] = [
    'meta-llama/llama-3-70b-instruct',
    'meta-llama/llama-3-8b-instruct',
    'mistralai/mistral-large-latest',
    'mistralai/mixtral-8x22b-instruct',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'google/gemini-pro-1.5',
] as const;
```

## File: src/hooks/useAiProcessingScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useReviewStore } from '../stores/review.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';

export const useAiProcessingScreen = () => {
    const transaction = useTransactionStore(selectSelectedTransaction);
    const { aiProcessingSteps, aiProcessingStartTime } = useReviewStore(s => ({
        aiProcessingSteps: s.aiProcessingSteps,
        aiProcessingStartTime: s.aiProcessingStartTime,
    }));

    const [now, setNow] = useState(Date.now());
    
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(timer);
    }, []);

    const elapsedTime = aiProcessingStartTime ? (now - aiProcessingStartTime) / 1000 : 0;
    
    const isProcessing = !!aiProcessingStartTime;

    return {
        transaction,
        aiProcessingSteps,
        isProcessing,
        elapsedTime,
        now,
    };
};
```

## File: src/hooks/useSettingsScreen.tsx
```typescript
import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useSettingsStore, type AiProvider } from '../stores/settings.store';
import { useAppStore } from '../stores/app.store';
import { AI_PROVIDERS, AI_MODELS } from '../constants/settings.constants';

type SettingsField = 'provider' | 'apiKey' | 'model';

export const useSettingsScreen = () => {
    const { provider, apiKey, model, actions: settingsActions } = useSettingsStore();
    const { showDashboardScreen } = useAppStore((s) => s.actions);

    const [activeField, setActiveField] = useState<SettingsField>('provider');

    // State for inputs and their backing values
    const [providerValue, setProviderValue] = useState<AiProvider>(provider);
    const [providerInput, setProviderInput] = useState(() => AI_PROVIDERS.find((p) => p.value === provider)?.label || '');
    const [localApiKey, setLocalApiKey] = useState<string>(apiKey);
    const [localModel, setLocalModel] = useState<string>(model);

    // State for filtered lists and selection indices
    const [filteredProviders, setFilteredProviders] = useState<{ value: AiProvider; label: string }[]>([]);
    const [providerSelectionIndex, setProviderSelectionIndex] = useState(0);
    const [filteredModels, setFilteredModels] = useState<readonly string[]>([]);
    const [modelSelectionIndex, setModelSelectionIndex] = useState(0);

    // Sync local state with global store when component mounts
    useEffect(() => {
        setProviderValue(provider);
        setProviderInput(AI_PROVIDERS.find((p) => p.value === provider)?.label || '');
        setLocalApiKey(apiKey);
        setLocalModel(model);
    }, [provider, apiKey, model]);

    // Filter providers based on input
    useEffect(() => {
        if (activeField === 'provider') {
            const lowerCaseInput = providerInput.toLowerCase();
            const filtered = AI_PROVIDERS.filter((p) => p.label.toLowerCase().includes(lowerCaseInput));
            setFilteredProviders(filtered);
            setProviderSelectionIndex(0);
        } else {
            setFilteredProviders([]);
        }
    }, [providerInput, activeField]);

    // Filter models based on input
    useEffect(() => {
        if (activeField === 'model' && localModel) {
            const lowerCaseModel = localModel.toLowerCase();
            const filtered = AI_MODELS.filter(m => m.toLowerCase().includes(lowerCaseModel));
            setFilteredModels(filtered);
            setModelSelectionIndex(0);
        } else {
            setFilteredModels([]);
        }
    }, [localModel, activeField]);

    const saveAndExit = () => {
        // On save, determine the provider 'value' from the input 'label'
        const matchedProvider = AI_PROVIDERS.find((p) => p.label.toLowerCase() === providerInput.toLowerCase());
        settingsActions.setProvider(matchedProvider?.value || providerValue);
        settingsActions.setApiKey(localApiKey);
        settingsActions.setModel(localModel);
        showDashboardScreen();
    };

    useInput((_input, key) => {
        if (key.escape) {
            saveAndExit();
            return;
        }

        if (key.tab) {
            setActiveField(current => {
                if (current === 'provider') return 'apiKey';
                if (current === 'apiKey') return 'model';
                return 'provider';
            });
            return;
        }

        if (activeField === 'provider') {
            if (filteredProviders.length > 0) {
                if (key.upArrow) {
                    setProviderSelectionIndex((prev) => (prev > 0 ? prev - 1 : filteredProviders.length - 1));
                }
                if (key.downArrow) {
                    setProviderSelectionIndex((prev) => (prev < filteredProviders.length - 1 ? prev + 1 : 0));
                }
            }
            if (key.return) {
                const selectedProvider = filteredProviders[providerSelectionIndex];
                if (selectedProvider) {
                    setProviderInput(selectedProvider.label);
                    setProviderValue(selectedProvider.value);
                }
                setActiveField('apiKey');
            }
        } else if (activeField === 'model') {
            if (filteredModels.length > 0) {
                if (key.upArrow) {
                    setModelSelectionIndex(prev => (prev > 0 ? prev - 1 : filteredModels.length - 1));
                }
                if (key.downArrow) {
                    setModelSelectionIndex(prev => (prev < filteredModels.length - 1 ? prev + 1 : 0));
                }
            }
            if (key.return) {
                if (filteredModels.length > 0 && filteredModels[modelSelectionIndex]) {
                    setLocalModel(filteredModels[modelSelectionIndex]!);
                }
                setActiveField('provider'); // Cycle to next field
            }
        }
    }, { isActive: true });

    return {
        activeField,
        provider: providerInput,
        setProvider: setProviderInput,
        filteredProviders,
        providerSelectionIndex,

        apiKey: localApiKey,
        setApiKey: setLocalApiKey,

        model: localModel,
        setModel: setLocalModel,

        isProviderFocused: activeField === 'provider',
        isApiKeyFocused: activeField === 'apiKey',
        isModelFocused: activeField === 'model',
        filteredModels,
        modelSelectionIndex,
    };
};
```

## File: src/services/ai.service.ts
```typescript
import { useSettingsStore } from '../stores/settings.store';
import { sleep } from '../utils';
import type { Transaction, FileItem } from '../types/domain.types';

// From review.service.ts to make the simulation more interesting
const mockAiFixFiles = [
    'src/components/Button.tsx',
    'src/components/data-table/DataTable.tsx',
    'src/components/forms/Input.tsx',
    'src/hooks/useForm.ts',
    'src/hooks/useDebounce.ts',
    'src/styles/theme.css',
    'src/utils/string-formatters.ts',
    'src/pages/HomePage.tsx',
    'src/pages/AboutPage.tsx',
    'src/services/api-client.ts',
    'src/stores/user.store.ts',
    'src/constants/routes.ts',
    'src/features/auth/LoginScreen.tsx',
    'src/features/auth/SignupForm.tsx',
    'src/features/dashboard/components/OverviewChart.tsx',
    'src/features/settings/ProfileEditor.tsx',
    'src/core/App.tsx',
    'src/services/payment.gateway.ts',
    'src/services/notification.service.ts',
    'src/components/UserProfile.tsx',
];

// Mock function to simulate running an auto-fix with an AI
export async function* runAutoFix(
    failedFiles: FileItem[],
    _transaction: Transaction,
): AsyncGenerator<any, { newPatch: string }, unknown> {
    const { model } = useSettingsStore.getState();

    yield { type: 'UPDATE_STEP', payload: { id: 'prompt', status: 'active' } };
    await sleep(200);
    yield { type: 'UPDATE_STEP', payload: { id: 'prompt', status: 'done', details: `Generated prompts for ${failedFiles.length} files.` } };

    yield { type: 'UPDATE_STEP', payload: { id: 'request', status: 'active' } };

    const filesToFix: Pick<FileItem, 'id' | 'path'>[] = [
        ...failedFiles,
        ...mockAiFixFiles.slice(0, 20).map(path => ({ id: path, path })),
    ];

    // Start all fixes in parallel
    for (const file of filesToFix) {
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'request', substep: { id: file.id, title: `Fixing: ${file.path}`, status: 'active' }}};
    }

    // Simulate them finishing at different times
    const shuffledFiles = [...filesToFix].sort(() => Math.random() - 0.5);
    for (const file of shuffledFiles) {
        await sleep(Math.random() * 200 + 50); // Simulate network latency + processing time
        const success = Math.random() > 0.1; // 90% success rate
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'request', substepId: file.id, status: success ? 'done' : 'failed' }};
    }

    yield { type: 'UPDATE_STEP', payload: { id: 'request', status: 'done', details: `Received responses for ${filesToFix.length} files from '${model}'` } };

    yield { type: 'UPDATE_STEP', payload: { id: 'parse', status: 'active' } };
    await sleep(300);
    yield { type: 'UPDATE_STEP', payload: { id: 'parse', status: 'done', details: 'Validated and formatted AI responses.' } };

    yield { type: 'UPDATE_STEP', payload: { id: 'apply', status: 'active' } };
    // In a real app, we'd only apply successful responses
    for (const file of filesToFix) {
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'apply', substep: { id: file.id, title: `Applying: ${file.path}`, status: 'active' }}};
    }

    const shuffledApply = [...filesToFix].sort(() => Math.random() - 0.5);
    for (const file of shuffledApply) {
        await sleep(Math.random() * 100 + 25);
        const success = Math.random() > 0.05; // 95% success rate
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'apply', substepId: file.id, status: success ? 'done' : 'failed' }};
    }

    yield { type: 'UPDATE_STEP', payload: { id: 'apply', status: 'done', details: 'Applied patches to memory.' } };

    // The structure of what's returned might change if we are applying multiple patches
    // but for now, we'll keep the existing signature.
    const newPatch = `--- a/src/services/payment.gateway.ts
+++ b/src/services/payment.gateway.ts
@@ -10,7 +10,7 @@
  */
 export class PaymentGateway {
 -    private static instance: PaymentGateway;
+    private static instance: PaymentGateway | null = null;
     private apiKey: string;
 
     private constructor(apiKey: string) {
`;
    yield { type: 'UPDATE_STEP', payload: { id: 'patch', status: 'done', details: 'Validated and formatted new patch.' } };

    await sleep(500);

}
    runAutoFix,
};
```

## File: src/stores/settings.store.ts
```typescript
import { create } from 'zustand';

// In a real app, this would be persisted to a config file.
// For the demo, we'll just keep it in memory.

export type AiProvider = 'openrouter' | 'groq' | 'together' | 'custom';

interface SettingsState {
    provider: AiProvider;
    apiKey: string;
    model: string;
    actions: {
        setProvider: (provider: AiProvider) => void;
        setApiKey: (apiKey: string) => void;
        setModel: (model: string) => void;
    };
}

export const useSettingsStore = create<SettingsState>((set) => ({
    provider: 'openrouter',
    apiKey: '',
    model: 'meta-llama/llama-3-8b-instruct',
    actions: {
        setProvider: (provider) => set({ provider }),
        setApiKey: (apiKey) => set({ apiKey }),
        setModel: (model) => set({ model }),
    },
}));
```

## File: src/hooks/useReviewProcessingScreen.tsx
```typescript
import { useState, useEffect, useMemo } from 'react';
import { useInput } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';

export const useReviewProcessingScreen = () => {
    const {
        applySteps,
        processingStartTime,
        isCancelling,
        patchStatus,
        actions: { cancelProcessing, skipCurrentStep },
    } = useReviewStore();

    const transaction = useTransactionStore(selectSelectedTransaction);
    const isProcessing = processingStartTime !== null;

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!isProcessing) return;
        const timer = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(timer);
    }, [isProcessing]);

    const elapsedTime = isProcessing ? (now - processingStartTime) / 1000 : 0;

    const isSkippable = useMemo(() => {
        const activeStep = applySteps.find(step => step.status === 'active');
        return activeStep?.id === 'post-command';
    }, [applySteps]);

    // --- Input Handling ---

    // Handle Ctrl+C by listening to stdin. This is more reliable than useInput for Ctrl+C,
    // as it prevents the default terminal behavior of exiting the process.
    useEffect(() => {
        const onData = (data: Buffer) => {
            // Check for Ctrl+C
            if (data.toString() === '\u0003') {
                cancelProcessing();
            }
        };

        if (isProcessing && !isCancelling) {
            process.stdin.on('data', onData);
            return () => {
                process.stdin.removeListener('data', onData);
            };
        }
    }, [isProcessing, isCancelling, cancelProcessing]);

    useInput(
        (input) => {
            if (input.toLowerCase() === 's' && isSkippable) {
                skipCurrentStep();
            }
        },
        { isActive: isProcessing && !isCancelling },
    );

    return {
        transaction,
        applySteps,
        isProcessing,
        isCancelling,
        patchStatus,
        elapsedTime,
        now,
        isSkippable,
    };
};
```

## File: src/types/actions.types.ts
```typescript
export interface ActionItem {
    key: string;
    label: string;
}
```

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

## File: src/types/view.types.ts
```typescript
export type AppScreen =
    | 'splash'
    | 'init'
    | 'dashboard'
    | 'review'
    | 'review-processing'
    | 'ai-processing'
    | 'git-commit'
    | 'transaction-detail'
    | 'transaction-history'
    | 'settings';
```

## File: src/types/domain.types.ts
```typescript
// --- Core Domain Models ---

/** The type of change applied to a file. */
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';

/** The review status of a file within a transaction. */
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';

/** The result of a script execution. */
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

/** The unified representation of a file change within a transaction. */
export interface FileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    type: FileChangeType;
    strategy?: 'replace' | 'standard-diff';
}

/** The lifecycle status of a transaction. */
export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTING'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF'
    | 'REJECTED';

/** The central data model for a code modification transaction. */
export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    files?: FileItem[];
    scripts?: ScriptResult[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}
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

## File: src/constants/review.constants.ts
```typescript
import type { ApplyStep } from '../stores/review.store';
import type { ActionItem } from '../types/actions.types';

/**
 * Constants for the Review screen and process.
 */
export const INITIAL_APPLY_STEPS: ApplyStep[] = [
    { id: 'snapshot', title: 'Reading initial file snapshot...', status: 'pending' },
    { id: 'memory', title: 'Applying operations to memory...', status: 'pending', substeps: [] },
    { id: 'post-command', title: 'Running post-command script...', status: 'pending', substeps: [] },
    { id: 'linter', title: 'Analyzing changes with linter...', status: 'pending', substeps: [] },
];

export const INITIAL_AI_PROCESSING_STEPS: ApplyStep[] = [
    { id: 'prompt', title: 'Preparing auto-repair prompts...', status: 'pending' },
    { id: 'request', title: 'Requesting fixes from AI...', status: 'pending', substeps: [] },
    { id: 'parse', title: 'Parsing AI responses...', status: 'pending' },
    { id: 'apply', title: 'Applying new patches...', status: 'pending', substeps: [] },
];

export const REVIEW_BODY_VIEWS = {
    COMMIT_MESSAGE: 'commit_message',
    DIFF: 'diff',
    PROMPT: 'prompt',
    REASONING: 'reasoning',
    SCRIPT_OUTPUT: 'script_output',
    BULK_REPAIR: 'bulk_repair',
    CONFIRM_HANDOFF: 'confirm_handoff',
    BULK_INSTRUCT: 'bulk_instruct',
    NONE: 'none',
} as const;

export const PATCH_STATUS = {
    SUCCESS: 'SUCCESS',
    PARTIAL_FAILURE: 'PARTIAL_FAILURE',
} as const;

export const BULK_REPAIR_OPTIONS = [
    '(1) Copy Bulk Re-apply Prompt (for single-shot AI)',
    '(2) Bulk Change Strategy & Re-apply',
    '(3) Handoff to External Agent',
    '(4) Bulk Abandon All Failed Files',
    '(5) Auto-repair with AI',
    '(Esc) Cancel',
] as const;

export const BULK_INSTRUCT_OPTIONS = [
    '(1) Copy Bulk Re-instruct Prompt (for single-shot AI)',
    '(2) Handoff to External Agent',
    '(3) Bulk Un-reject All Files (revert to original)',
    '(4) Cancel',
] as const;

interface ReviewFooterConfig {
    isFileSelected: boolean;
    fileStatus?: 'FAILED' | 'REJECTED' | 'OTHER';
    currentItemType?: 'file' | 'script' | 'reasoning' | 'prompt' | 'commit_message';
    hasFailedFiles: boolean;
    hasRejectedFiles: boolean;
    hasApprovedFiles: boolean;
}

export const REVIEW_FOOTER_ACTIONS = {
    DIFF_VIEW: [
        { key: '↑↓', label: 'Next/Prev File' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/D/Esc', label: 'Back' },
    ] as const,
    PROMPT_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/P/Ent', label: 'Collapse' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    REASONING_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/R/Ent', label: 'Collapse' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    COMMIT_MESSAGE_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: '←/M/Ent', label: 'Collapse' },
        { key: 'C', label: 'Copy Mode' },
    ] as const,
    SCRIPT_OUTPUT_VIEW: [
        { key: '↑↓', label: 'Next/Prev Item' },
        { key: 'PgUp/PgDn', label: 'Scroll' },
        { key: 'J↓/K↑', label: 'Next/Prev Error' },
        { key: 'C', label: 'Copy Output' },
        { key: '←/Ent/Esc', label: 'Back' },
    ] as const,
    BULK_REPAIR_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    BULK_INSTRUCT_VIEW: { text: 'Use (↑↓) Nav · (Enter) Select · (1-4) Jump · (Esc) Cancel' } as const,
    HANDOFF_CONFIRM_VIEW: [
        { key: 'Enter', label: 'Confirm Handoff' },
        { key: 'Esc', label: 'Cancel' },
    ] as const,
    MAIN_VIEW: (config: ReviewFooterConfig): ActionItem[] => {
        const actions: ActionItem[] = [{ key: '↑↓', label: 'Nav' }];

        if (config.isFileSelected) {
            if (config.fileStatus !== 'FAILED') actions.push({ key: 'Spc', label: 'Toggle' });
            actions.push({ key: 'D/Ent', label: 'Diff' });
            if (config.fileStatus === 'FAILED') actions.push({ key: 'T', label: 'Try Repair' });
            if (config.fileStatus === 'REJECTED') actions.push({ key: 'I', label: 'Instruct' });
        } else if (config.currentItemType === 'script') {
            actions.push({ key: 'Ent', label: 'Expand Details' });
        } else {
            actions.push({ key: 'Ent', label: 'Expand' });
        }

        actions.push({ key: 'M', label: 'Message' });
        actions.push({ key: 'P', label: 'Prompt' });
        actions.push({ key: 'R', label: 'Reasoning' });
        if (config.hasFailedFiles) actions.push({ key: 'Shift+T', label: 'Bulk Repair' });
        if (config.hasRejectedFiles) actions.push({ key: 'Shift+I', label: 'Bulk Instruct' });

        actions.push({ key: 'C', label: 'Copy' });

        if (config.hasApprovedFiles) actions.push({ key: 'A', label: 'Approve' });
        actions.push({ key: 'X', label: 'Reject Tx' });
        actions.push({ key: '←/Q/Esc', label: 'Back' });
        return actions;
    },
};

export const getReviewProcessingFooterActions = (
    isSkippable: boolean,
): readonly ActionItem[] => {
    const actions: ActionItem[] = [{ key: 'Ctrl+C', label: 'Cancel Process' }];
    if (isSkippable) {
        actions.push({ key: 'S', label: 'Skip Script' });
    }
    return actions;
};
```

## File: src/components/ReviewProcessingScreen.tsx
```typescript
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { type ApplyStep } from '../stores/review.store';
import ActionFooter from './ActionFooter';
import { useReviewProcessingScreen } from '../hooks/useReviewProcessingScreen'; // This will be created
import { getReviewProcessingFooterActions } from '../constants/review.constants';
import Separator from './Separator';
import ScreenLayout from './layout/ScreenLayout';

const ApplyStepRow = ({ step, isSubstep = false, now }: {
    step: ApplyStep;
    isSubstep?: boolean;
    now: number;
}) => {
    if (isSubstep) {
        let color: string | undefined;
        let symbol: React.ReactNode;

        switch (step.status) {
            case 'pending':
                symbol = '○';
                color = 'gray';
                break;
            case 'active':
                symbol = <Text color="cyan"><Spinner type="dots" /></Text>;
                break;
            case 'done':
                symbol = '✓';
                color = 'green';
                break;
            case 'failed':
                symbol = '✗';
                color = 'red';
                break;
            default:
                symbol = ' ';
        }

        return (
            <Text color={color}>
                {'     └─ '}{symbol}{' '}{step.title}
            </Text>
        );
    }

    let symbol;
    let color;
    switch (step.status) {
        case 'pending': symbol = '( )'; break;
        case 'active': symbol = '(●)'; color = 'cyan'; break;
        case 'done': symbol = '[✓]'; color = 'green'; break;
        case 'failed': symbol = '[!]'; color = 'red'; break;
        case 'skipped': symbol = '(-)'; color = 'gray'; break;
    }

    let durationText = '';
    if (!isSubstep) {
        if (step.status === 'active' && step.startTime) {
            durationText = ` (${((now - step.startTime) / 1000).toFixed(1)}s)`;
        } else if (step.duration) {
            durationText = ` (${step.duration.toFixed(1)}s)`;
        }
    }

    return (
        <Box flexDirection="column">
            <Text>
                <Text color={color}>{symbol}</Text> {step.title}{durationText}
            </Text>
            {step.details && (
                <Text color="gray">
                    {'     └─ '}{step.details}
                </Text>
            )}
            {step.substeps?.map((sub: ApplyStep, i: number) => (
                <ApplyStepRow key={i} step={sub} isSubstep={true} now={now} />
            ))}
        </Box>
    );
};

const ReviewProcessingScreen = () => {
    const {
        transaction,
        applySteps,
        isProcessing,
        isCancelling,
        patchStatus,
        elapsedTime,
        now,
        isSkippable,
    } = useReviewProcessingScreen();

    const failureCase = patchStatus === 'PARTIAL_FAILURE';

    const renderFooter = () => {
        if (isCancelling) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Cancelling... Please wait.</Text>;
        }
        if (isProcessing) {
            return (
                <Box flexDirection="column" gap={1}>
                    <Text>Elapsed: {elapsedTime.toFixed(1)}s · Processing... Please wait.</Text>
                    <Separator />
                    <ActionFooter actions={getReviewProcessingFooterActions(isSkippable)} />
                </Box>
            );
        }
        if (failureCase) {
            return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Transitioning to repair workflow...</Text>;
        }
        return <Text>Elapsed: {elapsedTime.toFixed(1)}s · Patch applied successfully. Transitioning...</Text>;
    };

    if (!transaction) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScreenLayout
            title="APPLYING PATCH"
            footer={renderFooter()}
        >
            <Box flexDirection="column">
                <Text>Applying patch {transaction.hash}... ({transaction.message})</Text>
                <Box flexDirection="column" marginTop={1} gap={1}>
                    {applySteps.map((step: ApplyStep) => <ApplyStepRow key={step.id} step={step} now={now} />)}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default ReviewProcessingScreen;
```

## File: src/hooks/useGlobalHotkeys.tsx
```typescript
import { useApp, useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { useViewStore } from '../stores/view.store';
import { OVERLAYS } from '../constants/view.constants';
import { ClipboardService } from '../services/clipboard.service';

export const useGlobalHotkeys = ({ isActive }: { isActive: boolean }) => {
    const { exit } = useApp();
    const { navigateBack } = useAppStore(s => s.actions);
    const { activeOverlay, setActiveOverlay } = useViewStore(s => ({
        activeOverlay: s.activeOverlay,
        setActiveOverlay: s.actions.setActiveOverlay,
    }));

    useInput((input, key) => {
        // Debug Menu toggle is the highest priority global key
        if (key.ctrl && input === 'b') {
            setActiveOverlay(activeOverlay === OVERLAYS.DEBUG ? OVERLAYS.NONE : OVERLAYS.DEBUG);
            return;
        }
        if (key.ctrl && input === 'l') {
            setActiveOverlay(activeOverlay === OVERLAYS.LOG ? OVERLAYS.NONE : OVERLAYS.LOG);
            return;
        }
        if (key.ctrl && input === 's') {
            // This is a temporary location. In a real app, this might live elsewhere
            // or be disabled on certain screens.
            useAppStore.getState().actions.showSettingsScreen();
        }

        if (key.ctrl && input === 'v') {
            ClipboardService.processClipboardContent();
            return;
        }

        // If an overlay with its own input is open, stop here.
        if (activeOverlay === OVERLAYS.DEBUG || activeOverlay === OVERLAYS.LOG) {
            return;
        }

        // Help screen takes precedence over other keys
        if (activeOverlay === OVERLAYS.HELP) {
            if (key.escape || input === '?') {
                setActiveOverlay(OVERLAYS.NONE);
            }
            return;
        }

        // --- Global hotkeys when no modal/overlay is open ---
        
        // Open Help
        if (input === '?') {
            setActiveOverlay(OVERLAYS.HELP);
            return;
        }
        
        // Quit from main screens
        if (input.toLowerCase() === 'q' || key.escape) {
            const screenBefore = useAppStore.getState().currentScreen;
            navigateBack();
            const screenAfter = useAppStore.getState().currentScreen;

            // If navigateBack did not change the screen, it means we are on a root screen.
            if (screenBefore === screenAfter) {
                exit();
            }
        }
    }, { isActive });
};
```

## File: src/stores/app.store.ts
```typescript
import { create } from 'zustand';
import type { AppScreen } from '../types/view.types';
import { SCREENS_WITH_DASHBOARD_BACK_ACTION } from '../constants/app.constants';

interface AppState {
    currentScreen: AppScreen;
    splashScreenDebugState: 'default' | 'update-failed';
    actions: {
        showAiProcessingScreen: () => void;
        showInitScreen: () => void;
        showReviewProcessingScreen: () => void;
        showSettingsScreen: () => void;
        showDashboardScreen: () => void;
        showReviewScreen: () => void;
        showGitCommitScreen: () => void;
        showSplashScreen: () => void;
        showTransactionHistoryScreen: () => void;
        showTransactionDetailScreen: () => void;
        navigateBack: () => void;
        setSplashScreenDebugState: (state: 'default' | 'update-failed') => void;
    };
}

export const useAppStore = create<AppState>((set, get) => ({
    currentScreen: 'splash',
    splashScreenDebugState: 'default',
    actions: {
        showAiProcessingScreen: () => set({ currentScreen: 'ai-processing' }),
        showInitScreen: () => set({ currentScreen: 'init' }),
        showReviewProcessingScreen: () => set({ currentScreen: 'review-processing' }),
        showSettingsScreen: () => set({ currentScreen: 'settings' }),
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
        setSplashScreenDebugState: (state) => set({ splashScreenDebugState: state }),
    },
}));
```

## File: src/services/review.service.ts
```typescript
import { useTransactionStore } from '../stores/transaction.store';
import { useAppStore } from '../stores/app.store';
import { useReviewStore } from '../stores/review.store';
import { sleep } from '../utils';
import { useNotificationStore } from '../stores/notification.store';
import type { ApplyUpdate, PatchStatus } from '../stores/review.store';
import type { Transaction, FileItem, FileReviewStatus } from '../types/domain.types';

export interface SimulationResult {
    patchStatus: PatchStatus;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string }>;
}

const mockSuccessFiles = [
    'src/components/Button.tsx',
    'src/components/Input.tsx',
    'src/components/Modal.tsx',
    'src/hooks/useForm.ts',
    'src/hooks/useDebounce.ts',
    'src/styles/theme.css',
    'src/utils/formatters.ts',
    'src/pages/HomePage.tsx',
    'src/pages/AboutPage.tsx',
    'src/services/api.ts',
    'src/stores/user.store.ts',
    'src/constants/routes.ts',
    'src/assets/logo.svg',
    'src/config/firebase.ts',
    'src/types/domain.ts',
    'src/features/auth/Login.tsx',
    'src/features/auth/Signup.tsx',
    'src/features/dashboard/Overview.tsx',
    'src/features/settings/Profile.tsx',
    'src/App.tsx',
];

const mockFailureFiles = [
    'src/services/payment.gateway.ts',
    'src/services/notification.service.ts',
    'src/components/UserProfile.tsx',
    'src/components/complex/DataTable.tsx',
    'src/hooks/useInfiniteScroll.ts',
    'src/hooks/useWebSocket.ts',
    'src/utils/crypto.ts',
    'src/utils/date.helper.ts',
    'src/pages/admin/UserManagement.tsx',
    'src/pages/admin/Analytics.tsx',
    'src/stores/cart.store.ts',
    'src/stores/products.store.ts',
    'src/constants/permissions.ts',
    'src/assets/icon-error.svg',
    'src/config/sentry.ts',
    'src/types/api.ts',
    'src/features/checkout/AddressForm.tsx',
    'src/features/checkout/PaymentForm.tsx',
    'src/features/product/ProductDetail.tsx',
    'src/features/product/ProductList.tsx',
];

const generateBulkRepairPrompt = (failedFiles: FileItem[]): string => {
    return `The previous patch failed to apply to MULTIPLE files. Please generate a new, corrected patch that addresses all the files listed below.

IMPORTANT: The response MUST contain a complete code block for EACH file that needs to be fixed.

${failedFiles.map(file => `--- FILE: ${file.path} ---
Strategy: ${file.strategy}
Error: Hunk #1 failed to apply // This is a mock error

ORIGINAL CONTENT:
---
// ... original content of ${file.path} ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff ...'}
---
`).join('\n')}

Please analyze all failed files and provide a complete, corrected response.`;
};

const generateHandoffPrompt = (
    transaction: Transaction,
    fileReviewStates: Map<
        string, { status: FileReviewStatus; error?: string; details?: string }
    >,
): string => {
    const successfulFiles = (transaction.files || []).filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
    const failedFiles = (transaction.files || []).filter(f => ['FAILED', 'REJECTED'].includes(fileReviewStates.get(f.id)?.status || ''));

    return `I am handing off a failed automated code transaction to you. Your task is to act as my programming assistant and complete the planned changes.

The full plan for this transaction is detailed in the YAML file located at: .relay/transactions/${transaction.hash}.yml. Please use this file as your primary source of truth for the overall goal.

Here is the current status of the transaction:

--- TRANSACTION SUMMARY ---
Goal: ${transaction.message}
Reasoning:
${transaction.reasoning || ''}

--- CURRENT FILE STATUS ---
SUCCESSFUL CHANGES (already applied, no action needed):
${successfulFiles.map(f => `- MODIFIED: ${f.path}`).join('\n') || '  (None)'}

FAILED CHANGES (these are the files you need to fix):
${failedFiles.map(f => `- FAILED: ${f.path} (Error: ${fileReviewStates.get(f.id)?.error})`).join('\n')}

Your job is to now work with me to fix the FAILED files and achieve the original goal of the transaction. Please start by asking me which file you should work on first.`;
};

const performHandoff = (hash: string) => {
    // This is a bit of a hack to find the right transaction to update in the demo
    const txToUpdate = useTransactionStore.getState().transactions.find(tx => tx.hash === hash);
    if (txToUpdate) {
        useTransactionStore.getState().actions.updateTransactionStatus(txToUpdate.id, 'HANDOFF');
    }

    useAppStore.getState().actions.showDashboardScreen();
};

async function* runApplySimulation(
    files: FileItem[],
    scenario: 'success' | 'failure',
): AsyncGenerator<ApplyUpdate, SimulationResult> {
    if (scenario === 'success') {
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done' } };
        if (useReviewStore.getState().isCancelling) { return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates: new Map() }; }

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        if (files.length > 0) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's1', title: `write: ${files[0]!.path} (strategy: replace)`, status: 'pending' } } };
        }
        if (files.length > 1) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 's2', title: `write: ${files[1]!.path} (strategy: standard-diff)`, status: 'pending' } } };
        }
        await sleep(50);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's1', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's2', status: 'active' } };
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            if (useReviewStore.getState().isCancelling) break;
            const file = mockSuccessFiles[i]!;
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: `s${i + 3}`, title: `write: ${file}`, status: 'pending' } } };
        }
        await sleep(50);
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            if (useReviewStore.getState().isCancelling) break;
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'active' } };
            await sleep(50);
        }

        await sleep(200);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's1', status: 'done' } };
        await sleep(150);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 's2', status: 'done' } };
        for (let i = 0; i < mockSuccessFiles.length; i++) {
            if (useReviewStore.getState().isCancelling) break;
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `s${i + 3}`, status: 'done' } };
            await sleep(80);
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done' } };

        const fileReviewStates = new Map<string, { status: FileReviewStatus }>();
        files.forEach(file => {
            fileReviewStates.set(file.id, { status: 'APPROVED' });
        });

        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'active' } }; await sleep(100);
        if (useReviewStore.getState().isCancelling) {
            yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'failed', details: 'Cancelled by user' } };
            yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to cancellation' } };
            return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
        }

        let wasPostCommandSkipped = false;
        const postCommandStartTime = Date.now();
        const scriptDuration = 2500; // Mock script duration
        while (Date.now() - postCommandStartTime < scriptDuration) {
            if (useReviewStore.getState().isSkipping) {
                useReviewStore.getState().actions.resetSkip();
                wasPostCommandSkipped = true;
                break;
            }
            if (useReviewStore.getState().isCancelling) {
                break; // Let the global cancel check after this step handle the state update
            }
            await sleep(50);
        }

        if (wasPostCommandSkipped) {
            yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped by user' } };
        } else if (!useReviewStore.getState().isCancelling) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'post-command', substep: { id: 's3', title: '`bun run test` ... Passed', status: 'done' } } };
            yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'done' } };
        }

        if (useReviewStore.getState().isCancelling) {
             yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to cancellation' } };
             return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'active' } }; await sleep(1200);
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'linter', substep: { id: 's4', title: '`bun run lint` ... 0 Errors', status: 'done' } } };
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'done' } };

        await sleep(500);

        return { patchStatus: 'SUCCESS', fileReviewStates };

    } else { // failure scenario
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'active' } }; await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'snapshot', status: 'done' } };

        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'active' } }; await sleep(100);
        if (files.length > 0) {
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f1', title: `write: ${files[0]!.path} (strategy: replace)`, status: 'pending' } } };
        }
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f2', title: `write: ${(files[1] || { path: '...' }).path}`, status: 'pending' } } };
        yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: 'f3', title: `write: ${(files[2] || { path: '...' }).path}`, status: 'pending' } } };
        await sleep(50);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f1', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f2', status: 'active' } };
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f3', status: 'active' } };
        for (let i = 0; i < mockFailureFiles.length; i++) {
            const file = mockFailureFiles[i]!;
            yield { type: 'ADD_SUBSTEP', payload: { parentId: 'memory', substep: { id: `f${i + 4}`, title: `write: ${file}`, status: 'pending' } } };
        }
        await sleep(50);
        for (let i = 0; i < mockFailureFiles.length; i++) {
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `f${i + 4}`, status: 'active' } };
            await sleep(50);
        }
        await sleep(150);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f1', status: 'done' } };
        await sleep(100);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f2', status: 'failed', title: `${(files[1] || { path: '...' }).path} (Hunk #1 failed to apply)` } };
        await sleep(100);
        yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: 'f3', status: 'failed', title: `${(files[2] || { path: '...' }).path} (Context mismatch at line 92)` } };
        for (let i = 0; i < mockFailureFiles.length; i++) {
            const file = mockFailureFiles[i]!;
            const shouldFail = i % 4 === 0 || i === mockFailureFiles.length - 1; // fail a few, including the last one
            yield { type: 'UPDATE_SUBSTEP', payload: { parentId: 'memory', substepId: `f${i + 4}`, status: shouldFail ? 'failed' : 'done', title: shouldFail ? `${file} (Could not find insertion point)` : undefined } };
            await sleep(80);
        }
        yield { type: 'UPDATE_STEP', payload: { id: 'memory', status: 'done' } };

        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'post-command', status: 'skipped', details: 'Skipped due to patch application failure' } };
        await sleep(100);
        yield { type: 'UPDATE_STEP', payload: { id: 'linter', status: 'skipped', details: 'Skipped due to patch application failure' } };

        await sleep(500);

        const fileReviewStates = new Map<string, { status: FileReviewStatus; error?: string }>();
        files.forEach((file, index) => {
            const isFailedFile = index > 0; // Fail all but the first file
            const status = isFailedFile ? 'FAILED' : 'APPROVED';
            const error = isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined;
            fileReviewStates.set(file.id, { status, error });
        });

        return { patchStatus: 'PARTIAL_FAILURE', fileReviewStates };
    }
}

const generateSingleFileRepairPrompt = (file: FileItem, error?: string): string => {
    return `The patch failed to apply to ${file.path}. Please generate a corrected patch.

Error: ${error || 'Unknown error'}
Strategy: ${file.strategy}

ORIGINAL CONTENT:
---
// ... original file content would be here ...
---

FAILED PATCH:
---
${file.diff || '// ... failed diff would be here ...'}
---

Please provide a corrected patch that addresses the error.`;
};

const tryRepairFile = (file: FileItem, error?: string): FileItem => {
    generateSingleFileRepairPrompt(file, error);
    // Mock clipboard write and show notification
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied Repair Prompt',
        message: `A repair prompt for ${file.path} has been copied to your clipboard.`,
    });
    return file;
};

const generateSingleFileInstructPrompt = (file: FileItem, transaction: Transaction): string => {
    return `The user REJECTED the last proposed change for the file \`${file.path}\`.

The original high-level goal was:
---
${transaction.prompt || transaction.message}
---

The rejected change was:
---
${file.diff || '// ... rejected diff would be here ...'}
---

Please provide an alternative solution for \`${file.path}\` that still accomplishes the original goal.
The response MUST be a complete, corrected patch for this file.`;
};

const tryInstructFile = (file: FileItem, transaction: Transaction): void => {
    generateSingleFileInstructPrompt(file, transaction);
    // Mock clipboard write and show notification
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied Instruction Prompt',
        message: `An instruction prompt for ${file.path} has been copied to your clipboard.`,
    });
};

const generateBulkInstructPrompt = (rejectedFiles: FileItem[], transaction: Transaction): string => {
    // Mock implementation for demo. In a real scenario, this would generate a more complex prompt.
    const fileList = rejectedFiles.map(f => `- ${f.path}`).join('\n');
    useNotificationStore.getState().actions.show({
        type: 'success',
        title: 'Copied to Clipboard',
        message: `Copied bulk instruction prompt for ${rejectedFiles.length} files.`,
        duration: 3,
    });
    return `The user has rejected changes in multiple files for the goal: "${transaction.message}".\n\nThe rejected files are:\n${fileList}\n\nPlease provide an alternative patch for all of them.`;
};

const runBulkReapply = async (
    failedFiles: FileItem[],
): Promise<{ id: string; status: FileReviewStatus; error?: string }[]> => {
    await sleep(1500); // Simulate re-apply

    // Mock a mixed result
    let first = true;
    return failedFiles.map(file => {
        if (first) {
            first = false;
            return { id: file.id, status: 'APPROVED' as const };
        } else {
            return {
                id: file.id,
                status: 'FAILED' as const,
                error: "'replace' failed: markers not found",
            };
        }
    });
};

export const ReviewService = {
    generateBulkRepairPrompt,
    generateBulkInstructPrompt,
    generateHandoffPrompt,
    performHandoff,
    runApplySimulation,
    generateSingleFileRepairPrompt,
    tryRepairFile,
    generateSingleFileInstructPrompt,
    tryInstructFile,
    runBulkReapply,
};
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
            case 'SettingsScreen':
                appActions.showSettingsScreen();
                break;
            case 'AiProcessingScreen':
                useReviewStore.getState().actions.load('1'); // load failure case
                useReviewStore.getState().actions.startAiAutoFix();
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
import SettingsScreen from './components/SettingsScreen';
import AiProcessingScreen from './components/AiProcessingScreen';
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
        if (currentScreen === 'settings') return <SettingsScreen />;
        if (currentScreen === 'ai-processing') return <AiProcessingScreen />;
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

## File: src/hooks/useReviewScreen.tsx
```typescript
import { useMemo } from 'react';
import { useInput, type Key } from 'ink';
import { useReviewStore } from '../stores/review.store';
import { useAppStore } from '../stores/app.store';
import { useNotificationStore } from '../stores/notification.store';
import { useCopyStore } from '../stores/copy.store';
import { useTransactionStore, selectSelectedTransaction } from '../stores/transaction.store';
import type { FileItem } from '../types/domain.types';
import { useLayout } from './useLayout';
import { useContentViewport } from './useContentViewport';
import { UI_CONFIG } from '../config/ui.config';
import { REVIEW_BODY_VIEWS } from '../constants/review.constants';
import { useListNavigator } from './useListNavigator';
import type { ReviewBodyView } from '../stores/review.store';
import { useViewport } from './useViewport';

type NavigableItem =
    | { type: 'commit_message' }
    | { type: 'prompt' }
    | { type: 'reasoning' }
    | { type: 'script'; id: string }
    | { type: 'file'; id: string };

export const useReviewScreen = () => { // eslint-disable-line max-lines-per-function
    const store = useReviewStore();
    const {
        selectedItemIndex,
        bodyView,
        patchStatus,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
    } = store;

    const transaction = useTransactionStore(selectSelectedTransaction);
    const { showDashboardScreen } = useAppStore(s => s.actions);

    const scriptCount = transaction?.scripts?.length || 0;
    const fileCount = transaction?.files?.length || 0;

    const layout = UI_CONFIG.layout.review;

    // Layout for the main navigable item list (prompt, reasoning, files, etc.)
    const mainListLayoutConfig = useMemo(() => ({
        header: layout.header,
        fixedRows: layout.fixedRows,
        marginsY: layout.marginsY,
        separators: layout.separators,
        footer: layout.footer,
        dynamicRows: {
            count: bodyView !== REVIEW_BODY_VIEWS.NONE ? layout.bodyHeightReservation : 0,
        },
    }), [bodyView, layout]);

    const { remainingHeight: listViewportHeight } = useLayout(mainListLayoutConfig);
    const { viewOffset } = useViewport({
        selectedIndex: selectedItemIndex,
        itemCount: 100,
        layoutConfig: mainListLayoutConfig,
    });

    // Layout for the body content (diff, reasoning, etc.)
    const bodyLayoutConfig = useMemo(() => ({
        header: layout.header,
        separators: layout.separators,
        fixedRows: 2, // meta
        marginsY: 1 + 1 + 1, // meta, scripts, files
        footer: 2,
        dynamicRows: { count: 2 + scriptCount + 1 + fileCount }, // prompt, reasoning, scripts, 'FILES' header, files
    }), [layout, scriptCount, fileCount]);

    const { remainingHeight: availableBodyHeight } = useLayout(bodyLayoutConfig);

    const navigableItems = useMemo((): NavigableItem[] => {
        if (!transaction) return [];
        const scriptItems: NavigableItem[] = (transaction.scripts || []).map(s => ({ type: 'script', id: s.command }));
        const fileItems: NavigableItem[] = (transaction.files || []).map(f => ({ type: 'file', id: f.id }));
        return [{ type: 'commit_message' }, { type: 'prompt' }, { type: 'reasoning' }, ...scriptItems, ...fileItems];
    }, [transaction]);

    const contentLineCount = useMemo(() => {
        const currentItem = navigableItems[selectedItemIndex];
        switch (bodyView) { //
            case REVIEW_BODY_VIEWS.COMMIT_MESSAGE:
                return (transaction?.message || '').split('\n').length;
            case REVIEW_BODY_VIEWS.REASONING:
                return (transaction?.reasoning || '').split('\n').length;
            case REVIEW_BODY_VIEWS.PROMPT:
                return (transaction?.prompt || '').split('\n').length;
            case REVIEW_BODY_VIEWS.DIFF: {
                if (currentItem?.type !== 'file') return 0;
                const selectedFile = (transaction?.files || []).find(f => f.id === currentItem.id);
                return (selectedFile?.diff || '').split('\n').length;
            }
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: {
                if (currentItem?.type !== 'script') return 0;
                const selectedScript = (transaction?.scripts || []).find(s => s.command === currentItem.id);
                return (selectedScript?.output || '').split('\n').length;
            }
            default: return 0;
        }
    }, [bodyView, navigableItems, selectedItemIndex, transaction]);
    const contentViewport = useContentViewport({ contentLineCount, viewportHeight: availableBodyHeight });

    const navigableItemsInView = navigableItems.slice(viewOffset, viewOffset + listViewportHeight);

    // Memoize files to prevent re-renders, fixing the exhaustive-deps lint warning.
    const files: FileItem[] = useMemo(() => transaction?.files || [], [transaction]);
    const fileReviewStates = useReviewStore(s => s.fileReviewStates);

    const reviewStats = useMemo(() => {
        const approvedFiles = files.filter(f => fileReviewStates.get(f.id)?.status === 'APPROVED');
        return {
            totalFiles: files.length,
            totalLinesAdded: files.reduce((sum, f) => sum + f.linesAdded, 0),
            totalLinesRemoved: files.reduce((sum, f) => sum + f.linesRemoved, 0),
            numFiles: files.length,
            approvedFilesCount: approvedFiles.length,
        };
    }, [files, fileReviewStates]);

    const hasRejectedFiles = useMemo(() => {
        if (!fileReviewStates) return false;
        return Array.from(fileReviewStates.values()).some(s => s.status === 'REJECTED');
    }, [fileReviewStates]);

    const { approvedFilesCount } = reviewStats;

    const isFileSelected = navigableItems[selectedItemIndex]?.type === 'file';

    const scripts = transaction?.scripts || [];

    const {
        setSelectedItemIndex, toggleBodyView, setBodyView, startApplySimulation, approve,
        rejectTransaction, tryRepairFile, tryInstruct, showBulkRepair, showBulkInstruct,
        executeBulkRepairOption, executeBulkInstructOption, confirmHandoff,
        navigateScriptErrorUp, navigateScriptErrorDown, toggleFileApproval,
        rejectAllFiles, navigateBulkRepairUp, navigateBulkRepairDown,
        navigateBulkInstructUp, navigateBulkInstructDown,
    } = store.actions;

    const openCopyMode = () => {
        if (!transaction) return;
        const currentItem = navigableItems[selectedItemIndex];
        const selectedFile = currentItem?.type === 'file' ? files.find(f => f.id === currentItem.id) : undefined;
        useCopyStore.getState().actions.openForReview(transaction, transaction.files || [], selectedFile);
    };

    const handleIndexChange = (newIndex: number) => {
        setSelectedItemIndex(newIndex);
        contentViewport.actions.resetScroll();
    };

    const navigateToNextFile = () => {
        const nextFileIndex = navigableItems.findIndex(
            (item, index) => index > selectedItemIndex && item.type === 'file',
        );
        if (nextFileIndex !== -1) {
            setSelectedItemIndex(nextFileIndex);
        }
    };

    const navigateToPreviousFile = () => {
        // Find the last index of a file before the current one
        const prevFileIndex = navigableItems
            .slice(0, selectedItemIndex)
            .findLastIndex(item => item.type === 'file');

        if (prevFileIndex !== -1) {
            setSelectedItemIndex(prevFileIndex);
        }
    };

    // --- Input Handlers ---

    const handleGlobalInput = (input: string, key: Key): boolean => {
        if (input === '1' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'success'); return true;
        }
        if (input === '2' && transaction) { // For demo purposes
            startApplySimulation(transaction.id, 'failure'); return true;
        }
        // The 'q' (quit/back) is now handled by the global hotkey hook.

        const currentItem = navigableItems[selectedItemIndex];
        if (input.toLowerCase() === 'd' && currentItem?.type === 'file') {
            toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            return true;
        }

        if (key.escape) {
            switch (bodyView) {
                case REVIEW_BODY_VIEWS.BULK_REPAIR:
                case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF:
                case REVIEW_BODY_VIEWS.BULK_INSTRUCT:
                    toggleBodyView(bodyView);
                    break;
                default:
                    if (bodyView !== REVIEW_BODY_VIEWS.NONE) {
                        setBodyView(REVIEW_BODY_VIEWS.NONE);
                    }
                    break;
            }
            return true;
        }
        return false;
    };

    const handleHandoffConfirmInput = (_input: string, key: Key): void => {
        if (key.return) confirmHandoff();
    };

    const handleBulkRepairInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkRepairUp();
        if (key.downArrow) navigateBulkRepairDown();
        if (key.return) {
            executeBulkRepairOption(selectedBulkRepairOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '5') {
            executeBulkRepairOption(parseInt(input));
        }
    };
    
    const handleBulkInstructInput = (input: string, key: Key): void => {
        if (key.upArrow) navigateBulkInstructUp();
        if (key.downArrow) navigateBulkInstructDown();
        if (key.return) {
            executeBulkInstructOption(selectedBulkInstructOptionIndex + 1); // Options are 1-based
            return;
        }

        if (input >= '1' && input <= '3') {
            executeBulkInstructOption(parseInt(input));
        }
    };

    const handleContentScrollInput = (key: Key): boolean => {
        const contentViews: ReviewBodyView[] = [
            REVIEW_BODY_VIEWS.REASONING,
            REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
            REVIEW_BODY_VIEWS.DIFF,
            REVIEW_BODY_VIEWS.PROMPT,
        ];
        if (!contentViews.includes(bodyView)) return false;

        if (key.pageUp) { contentViewport.actions.pageUp(); return true; }
        if (key.pageDown) { contentViewport.actions.pageDown(); return true; }
        return false;
    };

    const handleReasoningInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'r') toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
    };

    const handleScriptOutputInput = (input: string, _key: Key): void => {
        if (input.toLowerCase() === 'j') navigateScriptErrorDown();
        if (input.toLowerCase() === 'k') navigateScriptErrorUp();
        if (input.toLowerCase() === 'c') { // TODO: this copy logic is not great.
            const currentItem = navigableItems[selectedItemIndex];
            const selectedScript = currentItem?.type === 'script' ? scripts.find(s => s.command === currentItem.id) : undefined;
            if (selectedScript) {
                useNotificationStore.getState().actions.show({
                    type: 'success',
                    title: 'Copied to Clipboard',
                    message: `Copied script output for: ${selectedScript.command}`,
                });
            }
        }
    };

    const handleDiffInput = (input: string, key: Key) => {
        if (key.upArrow) {
            navigateToPreviousFile();
            return;
        }
        if (key.downArrow) {
            navigateToNextFile();
            return;
        }
        if (input.toLowerCase() === 'd') toggleBodyView('diff');
    };

    const handleMainNavigationInput = (input: string, key: Key): void => {
        if (key.leftArrow) {
            showDashboardScreen();
            return;
        }

        // Handle Shift+R for reject all
        if (key.shift && input.toLowerCase() === 'r') {
            if (approvedFilesCount > 0 && transaction) {
                rejectAllFiles();
            }
            return;
        }

        const currentItem = navigableItems[selectedItemIndex];

        if (input === ' ') {
            if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState && fileState.status !== 'FAILED') {
                    toggleFileApproval(currentItem.id);
                }
            }
        }

        if (input.toLowerCase() === 'm') {
            toggleBodyView(REVIEW_BODY_VIEWS.COMMIT_MESSAGE);
        }

        if (input.toLowerCase() === 'p') {
            toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
        }

        if (input.toLowerCase() === 'r') {
            toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
        }

        if (key.return) { // Enter key
            if (currentItem?.type === 'file') {
                toggleBodyView(REVIEW_BODY_VIEWS.DIFF);
            } else if (currentItem?.type === 'commit_message') {
                toggleBodyView(REVIEW_BODY_VIEWS.COMMIT_MESSAGE);
            } else if (currentItem?.type === 'prompt') {
                toggleBodyView(REVIEW_BODY_VIEWS.PROMPT);
            } else if (currentItem?.type === 'reasoning') {
                toggleBodyView(REVIEW_BODY_VIEWS.REASONING);
            } else if (currentItem?.type === 'script') {
                toggleBodyView(REVIEW_BODY_VIEWS.SCRIPT_OUTPUT);
            }
        }

        if (input.toLowerCase() === 'a') {
            if (approvedFilesCount > 0) {
                approve();
                showDashboardScreen();
            }
        }

        if (input.toLowerCase() === 'x') {
            rejectTransaction();
        }

        if (input.toLowerCase() === 'c') {
            openCopyMode();
        }

        if (input.toLowerCase() === 't') {
            if (key.shift) {
                const hasFailedFiles = Array.from(fileReviewStates.values()).some(s => s.status === 'FAILED');
                if (hasFailedFiles) showBulkRepair();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'FAILED') tryRepairFile(currentItem.id);
            }
        }

        if (input.toLowerCase() === 'i') {
            if (key.shift) {
                if (hasRejectedFiles) showBulkInstruct();
            } else if (currentItem?.type === 'file') {
                const fileState = fileReviewStates.get(currentItem.id);
                if (fileState?.status === 'REJECTED') {
                    tryInstruct(currentItem.id);
                }
            }
        }
    };

    const listNavigableBodyViews: ReviewBodyView[] = [
        REVIEW_BODY_VIEWS.PROMPT,
        REVIEW_BODY_VIEWS.REASONING,
        REVIEW_BODY_VIEWS.SCRIPT_OUTPUT,
    ];
    const isListNavigationActive = bodyView === REVIEW_BODY_VIEWS.NONE || listNavigableBodyViews.includes(bodyView);
    const arePageKeysForListNav = bodyView === REVIEW_BODY_VIEWS.NONE;

    useListNavigator({
        itemCount: navigableItems.length,
        viewportHeight: listViewportHeight,
        selectedIndex: selectedItemIndex,
        onIndexChange: handleIndexChange,
        isActive: isListNavigationActive,
        disablePageKeys: !arePageKeysForListNav,
        onKey: arePageKeysForListNav ? handleMainNavigationInput : undefined,
    });

    useInput((input: string, key: Key) => {
        if (handleGlobalInput(input, key)) return;

        if (key.leftArrow) {
            // Allow left arrow to collapse any open body view
            setBodyView(REVIEW_BODY_VIEWS.NONE);
            return;
        }

        // Global "Enter to collapse" handler for non-modal views
        if (key.return) {
            if (
                bodyView !== REVIEW_BODY_VIEWS.BULK_REPAIR &&
                bodyView !== REVIEW_BODY_VIEWS.BULK_INSTRUCT &&
                bodyView !== REVIEW_BODY_VIEWS.CONFIRM_HANDOFF &&
                bodyView !== REVIEW_BODY_VIEWS.NONE
            ) {
                setBodyView(REVIEW_BODY_VIEWS.NONE);
                return;
            }
        }
        // Handle content scrolling (PgUp/PgDn)
        if (handleContentScrollInput(key)) return;

        switch (bodyView) {
            case REVIEW_BODY_VIEWS.CONFIRM_HANDOFF: return handleHandoffConfirmInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_REPAIR: return handleBulkRepairInput(input, key);
            case REVIEW_BODY_VIEWS.BULK_INSTRUCT: return handleBulkInstructInput(input, key);
            case REVIEW_BODY_VIEWS.REASONING: return handleReasoningInput(input, key);
            case REVIEW_BODY_VIEWS.SCRIPT_OUTPUT: return handleScriptOutputInput(input, key);
            case REVIEW_BODY_VIEWS.DIFF: return handleDiffInput(input, key);
        }
    }, { isActive: bodyView !== REVIEW_BODY_VIEWS.NONE });

    return {
        ...store,
        fileReviewStates,
        selectedItemIndex,
        transaction,
        files,
        scripts,
        patchStatus,
        navigableItems,
        isFileSelected,
        navigableItemsInView,
        viewOffset,
        contentScrollIndex: contentViewport.scrollIndex,
        availableBodyHeight,
        selectedBulkRepairOptionIndex,
        selectedBulkInstructOptionIndex,
        ...reviewStats,
        hasRejectedFiles,
    };
};
```

## File: src/stores/review.store.ts
```typescript
import { create } from 'zustand';
import { useAppStore } from './app.store';
import { useTransactionStore } from './transaction.store';
import { useViewStore } from './view.store';
import { AiService } from '../services/ai.service';
import { ReviewService, type SimulationResult } from '../services/review.service';
import { INITIAL_APPLY_STEPS, PATCH_STATUS, REVIEW_BODY_VIEWS, BULK_INSTRUCT_OPTIONS, BULK_REPAIR_OPTIONS, INITIAL_AI_PROCESSING_STEPS } from '../constants/review.constants';
import { sleep } from '../utils';
import type { FileReviewStatus } from '../types/domain.types';

export interface ApplyStep {
    id: string;
    title: string;
    status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
    details?: string;
    substeps?: ApplyStep[];
    startTime?: number;
    duration?: number;
}

export type ReviewBodyView = (typeof REVIEW_BODY_VIEWS)[keyof typeof REVIEW_BODY_VIEWS];
export type PatchStatus = (typeof PATCH_STATUS)[keyof typeof PATCH_STATUS];
export type ApplyUpdate =
    | { type: 'UPDATE_STEP'; payload: { id: string; status: ApplyStep['status']; duration?: number; details?: string } }
    | { type: 'ADD_SUBSTEP'; payload: { parentId: string; substep: Omit<ApplyStep, 'substeps'> } }
    | { type: 'UPDATE_SUBSTEP'; payload: { parentId: string; substepId: string; status: ApplyStep['status']; title?: string } };

interface ReviewState {
    patchStatus: PatchStatus;
    applySteps: ApplyStep[];
    selectedItemIndex: number;
    bodyView: ReviewBodyView;
    scriptErrorIndex: number;
    processingStartTime: number | null;
    fileReviewStates: Map<string, { status: FileReviewStatus; error?: string; details?: string }>;

    selectedBulkRepairOptionIndex: number;
    selectedBulkInstructOptionIndex: number;
    isCancelling: boolean;
    isSkipping: boolean;

    // AI auto-repair state
    aiProcessingSteps: ApplyStep[];
    aiProcessingStartTime: number | null;

    actions: {
        load: (transactionId: string, initialState?: Partial<Pick<ReviewState, 'bodyView' | 'selectedBulkRepairOptionIndex'>>) => void;
        setSelectedItemIndex: (index: number) => void;
        toggleBodyView: (view: Extract<
            ReviewBodyView, 'prompt' | 'bulk_instruct' | 'commit_message' |
            'diff' | 'reasoning' | 'script_output' | 'bulk_repair' | 'confirm_handoff'
        >) => void;
        setBodyView: (view: ReviewBodyView) => void;
        approve: () => void;
        rejectTransaction: () => void;
        startApplySimulation: (transactionId: string, scenario: 'success' | 'failure') => void;
        tryRepairFile: (fileId: string) => void;
        showBulkRepair: () => void;
        executeBulkRepairOption: (option: number) => Promise<void>;
        skipCurrentStep: () => void;
        resetSkip: () => void;
        tryInstruct: (fileId: string) => void;
        cancelProcessing: () => void;
        startAiAutoFix: () => void;
        showBulkInstruct: () => void;
        executeBulkInstructOption: (option: number) => Promise<void>;
        confirmHandoff: () => void;
        navigateScriptErrorUp: () => void;
        navigateScriptErrorDown: () => void;
        updateApplyStep: (id: string, status: ApplyStep['status'], details?: string) => void;
        addApplySubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
        updateApplySubstep: (parentId: string, substepId: string, status: ApplyStep['status'], title?: string) => void;
        updateAiProcessingStep: (id: string, status: ApplyStep['status'], details?: string) => void;
        addAiProcessingSubstep: (parentId: string, substep: Omit<ApplyStep, 'substeps'>) => void;
        updateAiProcessingSubstep: (parentId: string, substepId: string, status: ApplyStep['status'], title?: string) => void;
        updateFileReviewStatus: (fileId: string, status: FileReviewStatus, error?: string, details?: string) => void;
        toggleFileApproval: (fileId: string) => void;
        rejectAllFiles: () => void;
        navigateBulkRepairUp: () => void;
        navigateBulkRepairDown: () => void;
        navigateBulkInstructUp: () => void;
        navigateBulkInstructDown: () => void;
    };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    patchStatus: PATCH_STATUS.SUCCESS,
    applySteps: INITIAL_APPLY_STEPS,
    selectedItemIndex: 0,
    bodyView: REVIEW_BODY_VIEWS.NONE,
    scriptErrorIndex: 0,
    processingStartTime: null,
    fileReviewStates: new Map(),
    selectedBulkRepairOptionIndex: 0,
    selectedBulkInstructOptionIndex: 0,
    isCancelling: false,
    isSkipping: false,
    aiProcessingSteps: [],
    aiProcessingStartTime: null,

    actions: {
        load: (transactionId, initialState) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction) return;

            // This logic is preserved from the deleted `prepareTransactionForReview`
            // to allow debug screens to jump directly to a pre-populated review state
            // without running the full simulation.
            const isFailureCase = transaction.id === '1';
            const fileReviewStates = new Map<string, { status: FileReviewStatus; error?: string }>();
            (transaction.files || []).forEach((file, index) => {
                if (isFailureCase) {
                    const isFailedFile = index > 0;
                    const status = isFailedFile ? 'FAILED' : 'APPROVED';
                    const error = isFailedFile ? (index === 1 ? 'Hunk #1 failed to apply' : 'Context mismatch at line 92') : undefined;
                    fileReviewStates.set(file.id, { status, error });
                } else {
                    fileReviewStates.set(file.id, { status: 'APPROVED' });
                }
            });
            const patchStatus = isFailureCase ? 'PARTIAL_FAILURE' : 'SUCCESS';
            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                patchStatus,
                fileReviewStates,
                processingStartTime: null,
                selectedItemIndex: 0,
                bodyView: initialState?.bodyView ?? REVIEW_BODY_VIEWS.NONE,
                scriptErrorIndex: 0,
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
                selectedBulkRepairOptionIndex: 0,
                selectedBulkInstructOptionIndex: 0,
                ...initialState,
            });
        },
        setSelectedItemIndex: (index) => set({ selectedItemIndex: index }),
        toggleBodyView: (view) => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            const files = tx?.files || [];
            if (view === 'diff' && state.selectedItemIndex >= files.length) return {};
            return {
                bodyView: state.bodyView === view ? REVIEW_BODY_VIEWS.NONE : view,
            };
        }),
        setBodyView: (view) => set({ bodyView: view }),
        approve: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (selectedTransactionId) {
                useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'APPLIED');
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        rejectTransaction: () => {
            const { selectedTransactionId } = useViewStore.getState();
            if (selectedTransactionId) {
                useTransactionStore.getState().actions.updateTransactionStatus(selectedTransactionId, 'REJECTED');
                useAppStore.getState().actions.showDashboardScreen();
            }
        },
        startApplySimulation: async (transactionId, scenario) => {
            const transaction = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!transaction?.files) return;

            const { showReviewProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            const { updateApplyStep, addApplySubstep, updateApplySubstep } = get().actions;

            useViewStore.getState().actions.setSelectedTransactionId(transaction.id);
            set({
                applySteps: JSON.parse(JSON.stringify(INITIAL_APPLY_STEPS)),
                processingStartTime: Date.now(),
                isCancelling: false,
                isSkipping: false,
                fileReviewStates: new Map(), // Clear previous states
            });

            showReviewProcessingScreen();
            const simulationGenerator = ReviewService.runApplySimulation(transaction.files, scenario);
            let simulationResult: SimulationResult;

            // Manually iterate to get the return value from the async generator
            const iterator = simulationGenerator[Symbol.asyncIterator]();
            while (true) {
                const { value, done } = await iterator.next();
                if (done) {
                    simulationResult = value as SimulationResult;
                    break;
                }
                const update = value;
                if (update.type === 'UPDATE_STEP') {
                    updateApplyStep(update.payload.id, update.payload.status, update.payload.details);
                } else if (update.type === 'ADD_SUBSTEP') {
                    addApplySubstep(update.payload.parentId, update.payload.substep);
                } else if (update.type === 'UPDATE_SUBSTEP') {
                    updateApplySubstep(update.payload.parentId, update.payload.substepId, update.payload.status, update.payload.title);
                }
            }

            await sleep(1000);
            set({
                processingStartTime: null,
                fileReviewStates: simulationResult.fileReviewStates,
                patchStatus: simulationResult.patchStatus,
            });
            showReviewScreen();
        },
        tryRepairFile: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!file) return;

            const { status, error } = fileReviewStates.get(file.id) || {};
            if (status !== 'FAILED') return;
            
            ReviewService.tryRepairFile(file, error);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING');
        },
        tryInstruct: (fileId) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const { fileReviewStates } = get();
            if (!selectedTransactionId) return;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            const file = tx?.files?.find(f => f.id === fileId);
            if (!tx || !file) return;

            const { status } = fileReviewStates.get(file.id) || {};
            if (status !== 'REJECTED') return;
            
            ReviewService.tryInstructFile(file, tx);
            get().actions.updateFileReviewStatus(file.id, 'AWAITING', undefined, 'Instruction prompt copied!');
        },
        showBulkInstruct: () => get().actions.setBodyView('bulk_instruct'),
        cancelProcessing: () => set({ isCancelling: true }),
        startAiAutoFix: async () => {
            const { selectedTransactionId } = useViewStore.getState();
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx || !tx.files) return;

            const failedFiles = tx.files.filter(f => get().fileReviewStates.get(f.id)?.status === 'FAILED');
            if (failedFiles.length === 0) return;

            const { showAiProcessingScreen, showReviewScreen } = useAppStore.getState().actions;
            const { updateAiProcessingStep, addAiProcessingSubstep, updateAiProcessingSubstep } = get().actions;

            set({
                bodyView: REVIEW_BODY_VIEWS.NONE,
                aiProcessingSteps: JSON.parse(JSON.stringify(INITIAL_AI_PROCESSING_STEPS)),
                aiProcessingStartTime: Date.now(),
            });

            showAiProcessingScreen();

            const autoFixGenerator = AiService.runAutoFix(failedFiles, tx);

            const iterator = autoFixGenerator[Symbol.asyncIterator]();
            while (true) {
                const { value, done } = await iterator.next();
                if (done) {
                    break;
                }
                const update = value;
                if (update.type === 'UPDATE_STEP') {
                    updateAiProcessingStep(update.payload.id, update.payload.status, update.payload.details);
                } else if (update.type === 'ADD_SUBSTEP') {
                    addAiProcessingSubstep(update.payload.parentId, update.payload.substep);
                } else if (update.type === 'UPDATE_SUBSTEP') {
                    updateAiProcessingSubstep(update.payload.parentId, update.payload.substepId, update.payload.status, update.payload.title);
                }
            }

            await sleep(1500); // Give user time to see final state
            set({ aiProcessingStartTime: null });
            showReviewScreen();
        },
        skipCurrentStep: () => set({ isSkipping: true }),
        resetSkip: () => set({ isSkipping: false }),
        executeBulkInstructOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const rejectedFiles = tx.files.filter(
                f => get().fileReviewStates.get(f.id)?.status === 'REJECTED',
            );
            if (rejectedFiles.length === 0) {
                set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkInstructPrompt(rejectedFiles, tx);
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 2:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 3:
                    rejectedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'APPROVED');
                    });
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 5:
                    get().actions.startAiAutoFix();
                    break;
                default:
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
            }
        },

        showBulkRepair: () => get().actions.toggleBodyView('bulk_repair'),
        executeBulkRepairOption: async (option) => {
            const selectedTransactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === selectedTransactionId);
            if (!tx?.files) return;

            const failedFiles = tx.files.filter(
                f => get().fileReviewStates.get(f.id)?.status === 'FAILED',
            );
            if (failedFiles.length === 0) {
                set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                return;
            }

            switch (option) {
                case 1:
                    ReviewService.generateBulkRepairPrompt(failedFiles);
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 2: {
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    failedFiles.forEach(f => get().actions.updateFileReviewStatus(f.id, 'RE_APPLYING'));
                    const results = await ReviewService.runBulkReapply(failedFiles);
                    results.forEach(result => {
                        get().actions.updateFileReviewStatus(
                            result.id, result.status, result.error,
                        );
                    });
                    break;
                }
                case 3:
                    get().actions.setBodyView('confirm_handoff');
                    break;
                case 4:
                    failedFiles.forEach(file => {
                        get().actions.updateFileReviewStatus(file.id, 'REJECTED');
                    });
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
                    break;
                case 5: // AI Auto-repair
                    get().actions.startAiAutoFix();
                    break;
                default:
                    set({ bodyView: REVIEW_BODY_VIEWS.NONE });
            }
        },
        confirmHandoff: () => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.files) return;
            const { fileReviewStates } = get();
            ReviewService.generateHandoffPrompt(tx, fileReviewStates);
            ReviewService.performHandoff(tx.hash);
        },
        navigateScriptErrorUp: () => set(state => ({ scriptErrorIndex: Math.max(0, state.scriptErrorIndex - 1) })),
        navigateScriptErrorDown: () => set(state => {
            const transactionId = useViewStore.getState().selectedTransactionId;
            const tx = useTransactionStore.getState().transactions.find(t => t.id === transactionId);
            if (!tx?.scripts || !tx?.files) return {};
            const selectedScript = tx.scripts[state.selectedItemIndex - tx.files.length];
            if (selectedScript?.output) {
                const errorLines = selectedScript.output
                    .split('\n')
                    .filter(line => line.includes('Error') || line.includes('Warning'));
                return { scriptErrorIndex: Math.min(errorLines.length - 1, state.scriptErrorIndex + 1) };
            }
            return {};
        }),
        updateApplyStep: (id, status, details) => {
            set(state => {
                const newSteps = state.applySteps.map(s => {
                    if (s.id === id) {
                        const newStep: ApplyStep = { ...s, status };
                        if (status === 'active') {
                            newStep.startTime = Date.now();
                        } else if ((status === 'done' || status === 'failed' || status === 'skipped') && s.startTime) {
                            newStep.duration = (Date.now() - s.startTime) / 1000;
                        }
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                });
                return { applySteps: newSteps };
            });
        },
        updateApplySubstep: (parentId, substepId, status, title) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId && s.substeps) {
                        const newSubsteps = s.substeps.map(sub => {
                            if (sub.id === substepId) {
                                const newSub: ApplyStep = { ...sub, status };
                                if (status === 'active') {
                                    newSub.startTime = Date.now();
                                } else if ((status === 'done' || status === 'failed') && sub.startTime) {
                                    newSub.duration = (Date.now() - sub.startTime) / 1000;
                                }
                                if (title) newSub.title = title;
                                return newSub;
                            }
                            return sub;
                        });
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
        addApplySubstep: (parentId, substep) => {
            set(state => ({
                applySteps: state.applySteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
        updateAiProcessingStep: (id, status, details) => {
            set(state => {
                const newSteps = state.aiProcessingSteps.map(s => {
                    if (s.id === id) {
                        const newStep: ApplyStep = { ...s, status };
                        if (status === 'active') {
                            newStep.startTime = Date.now();
                        } else if ((status === 'done' || status === 'failed' || status === 'skipped') && s.startTime) {
                            newStep.duration = (Date.now() - s.startTime) / 1000;
                        }
                        if (details !== undefined) newStep.details = details;
                        return newStep;
                    }
                    return s;
                });
                return { aiProcessingSteps: newSteps };
            });
        },
        updateAiProcessingSubstep: (parentId, substepId, status, title) => {
            set(state => ({
                aiProcessingSteps: state.aiProcessingSteps.map(s => {
                    if (s.id === parentId && s.substeps) {
                        const newSubsteps = s.substeps.map(sub => {
                            if (sub.id === substepId) {
                                const newSub: ApplyStep = { ...sub, status };
                                if (status === 'active') {
                                    newSub.startTime = Date.now();
                                } else if ((status === 'done' || status === 'failed') && sub.startTime) {
                                    newSub.duration = (Date.now() - sub.startTime) / 1000;
                                }
                                if (title) newSub.title = title;
                                return newSub;
                            }
                            return sub;
                        });
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
        addAiProcessingSubstep: (parentId, substep) => {
            set(state => ({
                aiProcessingSteps: state.aiProcessingSteps.map(s => {
                    if (s.id === parentId) {
                        const newSubsteps = [...(s.substeps || []), substep as ApplyStep];
                        return { ...s, substeps: newSubsteps };
                    }
                    return s;
                }),
            }));
        },
        updateFileReviewStatus: (fileId, status, error, details) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                newStates.set(fileId, { status, error, details });
                return { fileReviewStates: newStates };
            });
        },
        toggleFileApproval: (fileId) => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                const current = newStates.get(fileId);
                if (current) {
                    const newStatus: FileReviewStatus = current.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                    newStates.set(fileId, { status: newStatus, error: undefined, details: undefined });
                }
                return { fileReviewStates: newStates };
            });
        },
        rejectAllFiles: () => {
            set(state => {
                const newStates = new Map(state.fileReviewStates);
                for (const [fileId, reviewState] of newStates.entries()) {
                    if (reviewState.status === 'APPROVED') {
                        newStates.set(fileId, { status: 'REJECTED', error: undefined, details: undefined });
                    }
                }
                return { fileReviewStates: newStates };
            });
        },
        navigateBulkRepairUp: () => set(state => ({
            selectedBulkRepairOptionIndex: (state.selectedBulkRepairOptionIndex - 1 + BULK_REPAIR_OPTIONS.length) % BULK_REPAIR_OPTIONS.length,
        })),
        navigateBulkRepairDown: () => set(state => ({
            selectedBulkRepairOptionIndex: (state.selectedBulkRepairOptionIndex + 1) % BULK_REPAIR_OPTIONS.length,
        })),
        navigateBulkInstructUp: () => set(state => ({
            selectedBulkInstructOptionIndex: (state.selectedBulkInstructOptionIndex - 1 + BULK_INSTRUCT_OPTIONS.length) % BULK_INSTRUCT_OPTIONS.length,
        })),
        navigateBulkInstructDown: () => set(state => ({
            selectedBulkInstructOptionIndex: (state.selectedBulkInstructOptionIndex + 1) % BULK_INSTRUCT_OPTIONS.length,
        })),
    },
}));
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
import { INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS } from '../constants/init.constants';
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
            title: 'Splash Screen: Update Failed',
            action: () => {
                appActions.setSplashScreenDebugState('update-failed');
                appActions.showSplashScreen();
            },
        },
        {
            title: 'Init: Analyze Phase',
            action: () => {
                initActions.setPhase('ANALYZE');
                appActions.showInitScreen();
            },
        },
        {
            title: 'Init: Git Not Found Prompt',
            action: () => {
                initActions.resetInit();
                initActions.setTasks(INITIAL_ANALYZE_TASKS, INITIAL_CONFIGURE_TASKS);
                initActions.setAnalysisResults('relaycode-tui', true, false);
                initActions.setPhase('GIT_INIT_PROMPT');
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
            title: 'AI Processing Screen (Simulated)',
            action: () => {
                // Use tx '1' which is the failure case
                reviewActions.load('1');
                reviewActions.startAiAutoFix();
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
        {
            title: 'Settings Screen',
            action: () => {
                appActions.showSettingsScreen();
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
