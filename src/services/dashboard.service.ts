import { sleep } from '../utils';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';

const approveAll = async () => {
    const pendingTransactions = selectTransactionsByStatus('PENDING')(useTransactionStore.getState());
    const pendingTxIds = pendingTransactions.map(tx => tx.id);
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'IN-PROGRESS'));

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
};

export const DashboardService = {
    approveAll,
};