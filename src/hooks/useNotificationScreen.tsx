import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useNotificationStore } from '../stores/notification.store';
import { NOTIFICATION_DEFAULT_DURATION } from '../constants/notification.constants';

export const useNotificationScreen = () => {
    const { isVisible, notification, actions } = useNotificationStore(state => ({
        isVisible: state.isVisible,
        notification: state.notification,
        actions: state.actions,
    }));
    const [countdown, setCountdown] = useState(notification?.duration || NOTIFICATION_DEFAULT_DURATION);

    // This effect runs ONLY when the notification itself changes, resetting the countdown.
    useEffect(() => {
        if (notification) {
            setCountdown(notification.duration || NOTIFICATION_DEFAULT_DURATION);
        }
    }, [notification]);

    // This effect handles the ticking and dismissal logic.
    useEffect(() => {
        if (isVisible) {
            if (countdown <= 0) {
                actions.hide();
                return;
            }

            const timer = setTimeout(() => {
                setCountdown(c => c - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, countdown, actions]);

    useInput((_, key) => {
        if (key.return || key.escape) {
            actions.hide();
        }
    }, { isActive: isVisible });

    return {
        notification,
        countdown,
    };
};