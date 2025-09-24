import type { Transaction } from '../types/transaction.types';
import type { ReviewFileItem } from '../stores/review.store';
import type { FileChange } from '../types/file.types';
import type { CopyItem } from '../types/copy.types';
import { COPYABLE_ITEMS } from '../types/copy.types';

const getCopyItemsForReview = (
    transaction: Transaction,
    files: ReviewFileItem[],
    selectedFile?: ReviewFileItem,
): CopyItem[] => {
    return [
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
    ];
};

const getCopyItemsForDetail = (
    transaction: Transaction,
    selectedFile?: FileChange,
): CopyItem[] => {
    return [
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message, isDefaultSelected: true },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '', isDefaultSelected: true },
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
};

const getCopyItemsForHistory = (
    transactions: Transaction[],
): CopyItem[] => {
    if (transactions.length === 0) return [];
    
    return [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
};

export const CopyService = {
    getCopyItemsForReview,
    getCopyItemsForDetail,
    getCopyItemsForHistory,
};