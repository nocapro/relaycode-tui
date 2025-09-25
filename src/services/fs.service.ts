import { sleep } from '../utils';

/**
 * Mock file system service.
 * In a real application, this would interact with the actual filesystem.
 */
const readFileContent = async (filePath: string): Promise<string> => {
    // Simulate async file read
    await sleep(50 + Math.random() * 100);

    const lang = filePath.split('.').pop() || '';
    
    return `// Mock content for ${filePath}
// Language: ${lang}
// In a real implementation, this would read from the filesystem.

function helloWorld() {
    console.log("Hello from ${filePath}!");
}
`;
};

export const FileSystemService = {
    readFileContent,
};