import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { useTransactionStore } from './transaction.store';
import type { DashboardStatus } from '../types/view.types';
import type { Transaction } from '../types/domain.types';
import { moveIndex } from './navigation.utils';

export type { Transaction, DashboardStatus };

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    selectedTransactionIndex: number;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
    };
}

// --- Store Implementation ---
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