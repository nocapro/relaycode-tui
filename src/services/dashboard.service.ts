import { useDashboardStore } from '../stores/dashboard.store';
import { sleep } from '../utils';

const approveAll = async () => {
    // Find pending transactions and mark them as in-progress
    const pendingTxIds: string[] = [];
    useDashboardStore.setState(state => {
        const newTxs = state.transactions.map(tx => {
            if (tx.status === 'PENDING') {
                pendingTxIds.push(tx.id);
                return { ...tx, status: 'IN-PROGRESS' as const };
            }
            return tx;
        });
        return { transactions: newTxs };
    });

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    useDashboardStore.setState(state => {
        const newTxs = state.transactions.map(tx => {
            if (pendingTxIds.includes(tx.id)) {
                return { ...tx, status: 'APPLIED' as const };
            }
            return tx;
        });
        return { transactions: newTxs };
    });
};

export const DashboardService = {
    approveAll,
};