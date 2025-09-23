// @ts-nocheck
import { useCopyStore, type CopyItem } from '../stores/copy.store';
import { COPYABLE_ITEMS, type CopyContextData, type CopyContext } from '../types/copy.types';

type CopyArgs =
  | { context: 'REVIEW'; txInfo: any; files: any; selectedFile?: any }
  | { context: 'TRANSACTION_DETAIL'; transaction: any; selectedFile?: any }
  | { context: 'TRANSACTION_HISTORY'; transactions: any }
  | { context: 'DEBUG_REVIEW'; txInfo: any; files: any; selectedFile?: any }
  | { context: 'DEBUG_HISTORY'; transactions: any };

const open = (context: CopyContext, data: CopyArgs) => {
    let title = 'Select data to copy:';
    let items: CopyItem[] = [];

    switch(data.context) {
        case 'REVIEW':
        case 'DEBUG_REVIEW': {
            const { txInfo, files, selectedFile } = data;
            title = 'Select data to copy from review:';
            items = [
                { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => `${txInfo.hash ?? ''}-a8b3-4f2c-9d1e-8a7c1b9d8f03` },
                { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => txInfo.message },
                { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => txInfo.prompt || '' },
                { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => txInfo.reasoning || '' },
                { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}${selectedFile ? `: ${selectedFile.path}` : ''}`, getData: () => selectedFile?.diff || 'No file selected' },
                { id: 'all_diffs', key: 'A', label: COPYABLE_ITEMS.ALL_DIFFS, getData: () => files.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') },
            ];
            break;
        }
        case 'TRANSACTION_DETAIL': {
            const { transaction, selectedFile } = data;
            title = `Select data to copy from transaction ${transaction.hash}:`;
            items = [
                { id: 'message', key: 'M', label: COPYABLE_ITEMS.MESSAGE, getData: () => transaction.message, isDefaultSelected: true },
                { id: 'prompt', key: 'P', label: COPYABLE_ITEMS.PROMPT, getData: () => transaction.prompt || '' },
                { id: 'reasoning', key: 'R', label: COPYABLE_ITEMS.REASONING, getData: () => transaction.reasoning || '', isDefaultSelected: true },
                { id: 'all_diffs', key: 'A', label: `${COPYABLE_ITEMS.ALL_DIFFS} (${transaction.files?.length || 0} files)`, getData: () => transaction.files?.map(f => `--- FILE: ${f.path} ---\n${f.diff}`).join('\n\n') || '' },
                { id: 'file_diff', key: 'F', label: `${COPYABLE_ITEMS.FILE_DIFF}: ${selectedFile?.path || 'No file selected'}`, getData: () => selectedFile?.diff || 'No file selected' },
                { id: 'uuid', key: 'U', label: COPYABLE_ITEMS.UUID, getData: () => transaction.id },
                { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' }, // Mocking this
            ];
            break;
        }
        case 'TRANSACTION_HISTORY':
        case 'DEBUG_HISTORY': {
            const { transactions } = data;
            title = `Select data to copy from ${transactions.length} transactions:`;
            items = [
                { id: 'messages', key: 'M', label: COPYABLE_ITEMS.MESSAGES, getData: () => transactions.map(tx => tx.message).join('\n'), isDefaultSelected: true },
                { id: 'prompts', key: 'P', label: COPYABLE_ITEMS.PROMPTS, getData: () => transactions.map(tx => tx.prompt || '').join('\n\n---\n\n'), isDefaultSelected: false },
                { id: 'reasonings', key: 'R', label: COPYABLE_ITEMS.REASONINGS, getData: () => transactions.map(tx => tx.reasoning || '').join('\n\n---\n\n'), isDefaultSelected: true },
                { id: 'diffs', key: 'D', label: COPYABLE_ITEMS.DIFFS, getData: () => transactions.flatMap(tx => tx.files?.map(f => `--- TX: ${tx.hash}, FILE: ${f.path} ---\n${f.diff}`)).join('\n\n') },
                { id: 'uuids', key: 'U', label: COPYABLE_ITEMS.UUIDS, getData: () => transactions.map(tx => tx.id).join('\n') },
                { id: 'yaml', key: 'Y', label: COPYABLE_ITEMS.FULL_YAML, getData: () => '... YAML representation ...' },
            ];
            break;
        }
    }

    useCopyStore.getState().actions.open(title, items);
};

export const CopyService = { open: open as any };