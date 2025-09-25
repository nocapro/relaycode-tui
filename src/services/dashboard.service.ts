import { sleep } from '../utils';
import { useTransactionStore, selectTransactionsByStatus } from '../stores/transaction.store';
import { LoggerService } from './logger.service';

const approveAll = async () => {
    LoggerService.info('Starting bulk approval process...');
    const pendingTransactions = selectTransactionsByStatus('PENDING')(useTransactionStore.getState());
    const pendingTxIds = pendingTransactions.map(tx => tx.id);
    LoggerService.debug(`Found ${pendingTxIds.length} pending transactions to approve.`);
    const { updateTransactionStatus } = useTransactionStore.getState().actions;
    pendingTxIds.forEach(id => {
        updateTransactionStatus(id, 'IN-PROGRESS');
        LoggerService.debug(`Transaction ${id} status set to IN-PROGRESS.`);
    });

    await sleep(2000); // Simulate approval process

    // Mark them as applied
    pendingTxIds.forEach(id => updateTransactionStatus(id, 'APPLIED'));
    LoggerService.info(`Bulk approval complete. ${pendingTxIds.length} transactions applied.`);
};

export const DashboardService = {
    approveAll,
};