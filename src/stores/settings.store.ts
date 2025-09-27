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