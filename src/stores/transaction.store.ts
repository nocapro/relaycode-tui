import { create } from 'zustand';
import { TransactionService } from '../services/transaction.service';
import type { Transaction, TransactionStatus, FileReviewStatus } from '../types/domain.types';

export type { Transaction };

interface TransactionState {
    transactions: Transaction[];
    actions: {
        loadTransactions: () => void;
        updateTransactionStatus: (id: string, status: TransactionStatus) => void;

        // New actions for managing review state directly on the transaction
        updateFileReviewStatus: (
            transactionId: string,
            fileId: string,
            status: FileReviewStatus,
            error?: string,
        ) => void;
        toggleFileApproval: (transactionId: string, fileId: string) => void;
        rejectAllFiles: (transactionId: string) => void;
    };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    actions: {
        loadTransactions: () => {
            const transactions = TransactionService.getAllTransactions();
            set({ transactions });
        },
        updateTransactionStatus: (id, status) => {
            set(state => ({
                transactions: state.transactions.map(tx =>
                    tx.id === id ? { ...tx, status, timestamp: Date.now() } : tx,
                ),
            }));
        },
        updateFileReviewStatus: (transactionId, fileId, status, error) => {
            set(state => ({
                transactions: state.transactions.map(tx => {
                    if (tx.id === transactionId) {
                        const newFiles = tx.files?.map(file => {
                            if (file.id === fileId) {
                                return { ...file, reviewStatus: status, reviewError: error };
                            }
                            return file;
                        });
                        return { ...tx, files: newFiles };
                    }
                    return tx;
                }),
            }));
        },
        toggleFileApproval: (transactionId, fileId) => {
            set(state => ({
                transactions: state.transactions.map(tx => {
                    if (tx.id === transactionId) {
                        const newFiles = tx.files?.map(file => {
                            if (file.id === fileId) {
                                const newStatus: FileReviewStatus = file.reviewStatus === 'APPROVED' ? 'REJECTED' : 'APPROVED';
                                return { ...file, reviewStatus: newStatus };
                            }
                            return file;
                        });
                        return { ...tx, files: newFiles };
                    }
                    return tx;
                }),
            }));
        },
        rejectAllFiles: (transactionId) => {
            set(state => ({
                transactions: state.transactions.map(tx => {
                    if (tx.id === transactionId) {
                        const newFiles = tx.files?.map(file =>
                            file.reviewStatus === 'APPROVED' ? { ...file, reviewStatus: 'REJECTED' as const } : file,
                        );
                        return { ...tx, files: newFiles };
                    }
                    return tx;
                }),
            }));
        },
    },
}));

// --- Selectors ---

/** Selects transactions by their status. */
export const selectTransactionsByStatus = (status: TransactionStatus) => (state: TransactionState) =>
    state.transactions.filter(tx => tx.status === status);

/** Selects statistics for the review screen for a given transaction. */
export const selectReviewStats = (transactionId: string | null) => (state: TransactionState) => {
    const transaction = state.transactions.find(t => t.id === transactionId);
    const files = transaction?.files || [];
    const approvedFiles = files.filter(f => f.reviewStatus === 'APPROVED');

    return {
        numFiles: files.length,
        approvedFilesCount: approvedFiles.length,
        approvedLinesAdded: approvedFiles.reduce((sum, f) => sum + f.linesAdded, 0),
        approvedLinesRemoved: approvedFiles.reduce((sum, f) => sum + f.linesRemoved, 0),
    };
};
