import { create } from 'zustand';
import { OVERLAYS } from '../constants/view.constants';

export type Overlay = (typeof OVERLAYS)[keyof typeof OVERLAYS];

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: Overlay;
    headerStatus: { message: string; timestamp: number } | null;
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
        setHeaderStatus: (message: string) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: OVERLAYS.NONE,
    headerStatus: null,
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
        setHeaderStatus: (message) => set({ headerStatus: { message, timestamp: Date.now() } }),
    },
}));