import { useDashboardStore } from '../stores/dashboard.store';
import { sleep } from '../utils';
import { useTransactionStore } from '../stores/transaction.store';

const approveAll = async () => {
    // Find pending transactions and mark them as in-progress
    const pendingTxIds: string[] = [];
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    useTransactionStore.getState().transactions.forEach(tx => {
        if (tx.status === 'PENDING') {
            pendingTxIds.push(tx.id);
            updateTransactionStatus(tx.id, 'IN-PROGRESS');
        }
    });

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
};

export const DashboardService = {
    approveAll,
};