import type { FileChange } from './file.types';

export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    // Fields for history/detail view
    files?: FileChange[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}