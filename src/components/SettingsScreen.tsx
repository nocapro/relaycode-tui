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