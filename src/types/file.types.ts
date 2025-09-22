// From transaction-detail.store.ts and transaction-history.store.ts
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileChange {
    id: string;
    path: string;
    type: FileChangeType;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

// From review.store.ts
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';
export interface ReviewFileItem {
    id: string;
    path: string;
    status: FileReviewStatus;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}