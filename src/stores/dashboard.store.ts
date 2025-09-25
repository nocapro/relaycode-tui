import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { moveIndex } from './navigation.utils';

export type DashboardStatus = 'LISTENING' | 'PAUSED' | 'CONFIRM_APPROVE' | 'APPROVING';
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    expandedTransactionId: string | null;
    actions: {
        togglePause: () => void;
        moveSelectionUp: () => void;
        moveSelectionDown: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
        toggleExpand: () => void;
        setExpandedTransactionId: (id: string | null) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: 'LISTENING',
    previousStatus: 'LISTENING',
    selectedTransactionIndex: 0,
    expandedTransactionId: null,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === 'LISTENING' ? 'PAUSED' : 'LISTENING',
        })),
        moveSelectionUp: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return {
                selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'up', transactions.length),
                expandedTransactionId: null,
            };
        }),
        moveSelectionDown: () => set(state => {
            const { transactions } = useTransactionStore.getState();
            return {
                selectedTransactionIndex: moveIndex(state.selectedTransactionIndex, 'down', transactions.length),
                expandedTransactionId: null,
            };
        }),
        startApproveAll: () => set(state => ({
            status: 'CONFIRM_APPROVE',
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => { // The `if` is redundant as this is only called from that state.
            const previousStatus = get().previousStatus;
            set({ status: 'APPROVING' });
            await DashboardService.approveAll();
            set({ status: previousStatus });
        },
        toggleExpand: () => {
            const { selectedTransactionIndex, expandedTransactionId } = get();
            const { transactions } = useTransactionStore.getState();
            const selectedTx = transactions[selectedTransactionIndex];
            if (!selectedTx) return;

            if (expandedTransactionId === selectedTx.id) {
                set({ expandedTransactionId: null });
            } else {
                set({ expandedTransactionId: selectedTx.id });
            }
        },
        setExpandedTransactionId: (id) => set({ expandedTransactionId: id }),
    },
}));