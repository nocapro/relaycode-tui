import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { COPYABLE_ITEMS } from '../types/copy.types';
import type { Transaction } from '../types/transaction.types';
import type { ReviewFileItem, FileChange } from '../types/file.types';

// A type for the data that can be passed to the copy service from the review screen
// since it doesn't have a full transaction object in its state.
type ReviewTransactionInfo = Pick<Transaction, 'hash' | 'message' | 'prompt' | 'reasoning'>;

const openCopyForReview = (
    txInfo: ReviewTransactionInfo,
    files: ReviewFileItem[],
    selectedFile: ReviewFileItem | undefined,
) => {
    const items: CopyItem[] = [
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => `${txInfo.hash ?? ''}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => txInfo.message },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => txInfo.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => txInfo.reasoning || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
    ];
    useCopyStore.getState().actions.open('Select data to copy from review:', items);
};

const openCopyForTransactionDetail = (transaction: Transaction, selectedFile: FileChange | undefined) => {
    const items: CopyItem[] = [
        { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message, isDefaultSelected: true },
        { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
        { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '', isDefaultSelected: true },
        { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
        { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
        { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
    ];
    useCopyStore.getState().actions.open(`Select data to copy from transaction ${transaction.hash}:`, items);
};

const openCopyForTransactionHistory = (transactions: Transaction[]) => {
    const items: CopyItem[] = [
        { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
        { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
        { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
        { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
        { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
        { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
    ];
    useCopyStore.getState().actions.open(`Select data to copy from ${transactions.length} transactions:`, items);
};


export const CopyService = {
    openCopyForReview,
    openCopyForTransactionDetail,
    openCopyForTransactionHistory,
};