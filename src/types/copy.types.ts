import type { Transaction } from './transaction.types';
import type { ReviewFileItem, FileChange } from './file.types';

export interface CopyItem {
    id: string;
    key: string;
    label: string;
    getData: () => string;
    isDefaultSelected?: boolean;
}

export type CopyContext = 'REVIEW' | 'TRANSACTION_DETAIL' | 'TRANSACTION_HISTORY' | 'DEBUG_REVIEW' | 'DEBUG_HISTORY';

export type ReviewTransactionInfo = Pick<Transaction, 'hash' | 'message' | 'prompt' | 'reasoning'>;

export type CopyContextData =
    | { context: 'REVIEW'; txInfo: ReviewTransactionInfo; files: ReviewFileItem[]; selectedFile?: ReviewFileItem }
    | { context: 'TRANSACTION_DETAIL'; transaction: Transaction; selectedFile?: FileChange }
    | { context: 'TRANSACTION_HISTORY'; transactions: Transaction[] }
    | { context: 'DEBUG_REVIEW'; txInfo: ReviewTransactionInfo; files: ReviewFileItem[]; selectedFile?: ReviewFileItem }
    | { context: 'DEBUG_HISTORY'; transactions: Transaction[] };

export const COPYABLE_ITEMS = {
    UUID: 'UUID',
    MESSAGE: 'Git Message',
    PROMPT: 'Prompt',
    REASONING: 'Reasoning',
    FILE_DIFF: 'Diff for',
    ALL_DIFFS: 'All Diffs',
    FULL_YAML: 'Full YAML representation',
    // For multi-selection contexts
    MESSAGES: 'Git Messages',
    PROMPTS: 'Prompts',
    REASONINGS: 'Reasonings',
    DIFFS: 'Diffs',
    UUIDS: 'UUIDs',
} as const;