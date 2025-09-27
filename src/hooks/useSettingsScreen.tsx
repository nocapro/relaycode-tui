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