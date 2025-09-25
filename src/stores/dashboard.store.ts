import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { moveIndex } from './navigation.utils';

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    selectedTransactionIndex: 0,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', transactions.length) };
        }),
        moveSelectionDown: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return { selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', transactions.length) };
        }),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => {
            const { status, previousStatus } = get();
            if (status === 'CONFIRM_APPROVE') {
                set({ status: 'APPROVING' });
                await DashboardService.approveAll();
                set({ status: previousStatus });
            }
        },
    },
}));