import { create } from 'zustand';

interface ViewState {
    selectedTransactionId: string | null;
    activeOverlay: 'none' | 'help' | 'copy' | 'debug';
    actions: {
        setSelectedTransactionId: (id: string | null) => void;
        setActiveOverlay: (overlay: ViewState['activeOverlay']) => void;
    };
}

export const useViewStore = create<ViewState>((set) => ({
    selectedTransactionId: null,
    activeOverlay: 'none',
    actions: {
        setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
        setActiveOverlay: (overlay) => set({ activeOverlay: overlay }),
    },
}));