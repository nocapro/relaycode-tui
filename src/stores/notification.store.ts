import { create } from 'zustand';
import { useViewStore } from './view.store';
import type { NotificationPayload } from '../types/notification.types';

interface NotificationState {
    isVisible: boolean;
    notification: NotificationPayload | null;
    actions: {
        show: (payload: NotificationPayload) => void;
        hide: () => void;
    };
}

export const useNotificationStore = create<NotificationState>((set) => ({
    isVisible: false,
    notification: null,
    actions: {
        show: (payload) => {
            set({ isVisible: true, notification: payload });
            useViewStore.getState().actions.setActiveOverlay('notification');
        },
        hide: () => {
            set({ isVisible: false, notification: null });
            useViewStore.getState().actions.setActiveOverlay('none');
        },
    },
}));