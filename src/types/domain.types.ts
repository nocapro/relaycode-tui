// --- Core Domain Models ---

/** The type of change applied to a file. */
export type FileChangeType = 'MOD' | 'ADD' | 'DEL' | 'REN';

/** The review status of a file within a transaction. */
export type FileReviewStatus = 'FAILED' | 'APPROVED' | 'REJECTED' | 'AWAITING' | 'RE_APPLYING';

/** The result of a script execution. */
export interface ScriptResult {
    command: string;
    success: boolean;
    duration: number;
    summary: string;
    output: string;
}

/** The unified representation of a file change within a transaction. */
export interface FileItem {
    id: string;
    path: string;
    diff: string;
    linesAdded: number;
    linesRemoved: number;
    type: FileChangeType;
    strategy?: 'replace' | 'standard-diff';
    // Review-specific, optional properties
    reviewStatus?: FileReviewStatus;
    reviewError?: string;
}

/** The lifecycle status of a transaction. */
export type TransactionStatus =
    | 'PENDING'
    | 'APPLIED'
    | 'COMMITTED'
    | 'FAILED'
    | 'REVERTED'
    | 'IN-PROGRESS'
    | 'HANDOFF';

/** The central data model for a code modification transaction. */
export interface Transaction {
    id: string;
    timestamp: number;
    status: TransactionStatus;
    hash: string;
    message: string;
    prompt?: string;
    reasoning?: string;
    error?: string;
    files?: FileItem[];
    scripts?: ScriptResult[];
    stats?: {
        files: number;
        linesAdded: number;
        linesRemoved: number;
    };
}