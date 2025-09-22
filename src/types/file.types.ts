// Common interface for file-based items
export interface BaseFileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
}

// From transaction-detail.store.ts and transaction-history.store.ts
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';
export interface FileChange extends BaseFileItem {
    type: FileChangeType;
}

// From review.store.ts
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';
export interface ReviewFileItem extends BaseFileItem {
    status: FileReviewStatus;
    error?: string;
    strategy: 'replace' | 'standard-diff';
}