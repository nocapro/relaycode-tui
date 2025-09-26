import type { Transaction, FileItem } from '../types/domain.types';
import type { CopyItem } from '../types/copy.types';
import { COPYABLE_ITEMS } from '../constants/copy.constants';
import { CommitService } from './commit.service';
import { FileSystemService } from './fs.service';

const formatFileContext = (filePath: string, content: string): string => {
    const lang = filePath.split('.').pop() || '';
    return `--- CONTEXT FOR FILE: ${filePath} ---\n\`\`\`${lang}\n${content}\n\`\`\``;
};

const getContextForFilePaths = async (filePaths: string[]): Promise<string> => {
    const contentPromises = filePaths.map(path => FileSystemService.readFileContent(path));
    const resolvedContents = await Promise.all(contentPromises);
    return filePaths
        .map((path, index) => formatFileContext(path, resolvedContents[index]!))
        .join('\n\n');
};

const createBaseTransactionCopyItems = (transaction: Transaction): CopyItem[] => [
    { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
    { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message },
    { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
    { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '' },
];

const getCopyItemsForReview = (
    transaction: Transaction,
    files: FileItem[],
    selectedFile?: FileItem,
): CopyItem[] => {
    const allFilePaths = [...new Set(files.map(f => f.path))];

    return [
        ...createBaseTransactionCopyItems(transaction),
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
        {
            id: 'context_files',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
    ];
};

const getCopyItemsForDetail = (
    transaction: Transaction,
    selectedFile?: FileItem,
): CopyItem[] => {
    const baseItems = createBaseTransactionCopyItems(transaction);
    const messageItem = { ...baseItems.find(i => i.id === 'message')!, isDefaultSelected: true };
    const promptItem = baseItems.find(i => i.id === 'prompt')!;
    const reasoningItem = { ...baseItems.find(i => i.id === 'reasoning')!, isDefaultSelected: true };
    const uuidItem = baseItems.find(i => i.id === 'uuid')!;

    const allFilePaths = [...new Set((transaction.files || []).map(f => f.path))];

    return [
        messageItem,
        promptItem,
        reasoningItem,
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        {
            id: 'context_files',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
        uuidItem,
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
};

const getCopyItemsForHistory = (
    transactions: Transaction[],
): CopyItem[] => {
    if (transactions.length === 0) return [];

    const allFilePaths = [
        ...new Set(transactions.flatMap(tx => tx.files?.map(f => f.path) || [])),
    ];

    return [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        {
            id: 'context_files_history',
            key: 'X',
            label: `${COPYABLE_ITEMS.CONTEXT_FILES} (${allFilePaths.length} files)`,
            getData: async () => {
                return getContextForFilePaths(allFilePaths);
            },
        },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
};

const getCopyItemsForCommit = (
    transactions: Transaction[],
    finalCommitMessage: string,
): CopyItem[] => {
    const subject = finalCommitMessage.split('\n')[0] || '';
    const body = finalCommitMessage.split('\n').slice(1).join('\n').trim();

    return [
        { id: 'full_message', key: 'M', label: 'Full Commit Message', getData: () => finalCommitMessage, isDefaultSelected: true },
        { id: 'subject', key: 'S', label: 'Commit Subject', getData: () => subject },
        { id: 'body', key: 'B', label: 'Commit Body', getData: () => body },
        { id: 'hashes', key: 'H', label: `Included Transaction Hashes (${transactions.length})`, getData: () => transactions.map(t => t.hash).join('\n') },
        { id: 'command', key: 'C', label: 'Git Commit Command', getData: () => CommitService.getGitCommitCommand(finalCommitMessage) },
    ];
};

export const CopyService = {
    getCopyItemsForReview,
    getCopyItemsForDetail,
    getCopyItemsForHistory,
    getCopyItemsForCommit,
};