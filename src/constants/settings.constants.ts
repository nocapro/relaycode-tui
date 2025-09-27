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