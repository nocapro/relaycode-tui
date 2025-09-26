import { create } from 'zustand';
import { OVERLAYS } from '../constants/view.constants';

export type Overlay = (typeof OVERLAYS)[keyof typeof OVERLAYS];

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: Overlay;
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: OVERLAYS.NONE,
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));