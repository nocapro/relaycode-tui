/**
 * Mock editor service.
 * In a real application, this would interact with the user's default editor.
 */
const openFileInEditor = async (filePath: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`[EDITOR MOCK] Opening file in default editor: ${filePath}`);
};

const getTransactionYamlPath = (transactionHash: string): string => {
    return `.relay/transactions/${transactionHash}.yml`;
};

export const EditorService = {
    openFileInEditor,
    getTransactionYamlPath,
};