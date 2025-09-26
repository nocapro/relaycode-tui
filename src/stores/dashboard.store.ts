import { create } from 'zustand';
import { useTransactionStore } from './transaction.store';
import { DashboardService } from '../services/dashboard.service';
import { DASHBOARD_STATUS } from '../constants/dashboard.constants';

export type DashboardStatus = (typeof DASHBOARD_STATUS)[keyof typeof DASHBOARD_STATUS];
 
interface DashboardState {
    status: DashboardStatus;
    previousStatus: DashboardStatus;
    selectedTransactionIndex: number;
    expandedTransactionId: string | null;
    actions: {
        togglePause: () => void;
        startApproveAll: () => void;
        confirmAction: () => Promise<void>;
        cancelAction: () => void;
        setStatus: (status: DashboardStatus) => void;
        toggleExpand: () => void;
        setExpandedTransactionId: (id: string | null) => void;
        setSelectedIndex: (index: number) => void;
    };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    status: DASHBOARD_STATUS.LISTENING,
    previousStatus: DASHBOARD_STATUS.LISTENING,
    selectedTransactionIndex: 0,
    expandedTransactionId: null,
    actions: {
        togglePause: () => set(state => ({
            status: state.status === DASHBOARD_STATUS.LISTENING ? DASHBOARD_STATUS.PAUSED : DASHBOARD_STATUS.LISTENING,
        })),
        startApproveAll: () => set(state => ({
            status: DASHBOARD_STATUS.CONFIRM_APPROVE,
            previousStatus: state.status,
        })),
        cancelAction: () => set(state => ({ status: state.previousStatus })),
        setStatus: (status) => set({ status }),
        confirmAction: async () => { // The `if` is redundant as this is only called from that state.
            const previousStatus = get().previousStatus;
            set({ status: DASHBOARD_STATUS.APPROVING });
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
        setSelectedIndex: (index) => set({ selectedTransactionIndex: index }),
    },
}));