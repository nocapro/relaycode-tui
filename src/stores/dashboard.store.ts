import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';
import { useTransactionStore, type Transaction } from './transaction.store';
import type { DashboardStatus } from '../types/dashboard.types';
import { moveIndex } from './navigation.utils';

export type { Transaction } from '../types/transaction.types';
export type { DashboardStatus } from '../types/dashboard.types';

// --- Store Interface ---
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus; // To handle cancel from confirmation
    selectedTransactionIndex: number;
    showHelp: boolean;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        toggleHelp: () => void;
        setStatus: (status: DashboardStatus) => void; // For debug menu
    };
}

// --- Store Implementation ---
export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    selectedTransactionIndex: 0,
    showHelp: false,
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
        toggleHelp: () => set(state => ({ showHelp: !state.showHelp })),
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