import type { FileChange } from './file.types';

export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'FAILED' | 'REVERTED' | 'IN-PROGRESS' | 'HANDOFF';
export type HistoryTransactionStatus = 'Committed' | 'Handoff' | 'Reverted';

export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    error?: string;
}

// From transaction-history.store.ts
export interface HistoryTransaction {
    id: string;
    hash: string;
    timestamp: number;
    status: HistoryTransactionStatus;
    message: string;
    files: FileChange[];
    stats: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}