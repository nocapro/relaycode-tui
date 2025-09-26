import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { useNotificationStore } from '../stores/notification.store';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening https://relay.noca.pro in your browser...',
            });
            return;
        }
        if (lowerInput === 'x') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening X/Twitter in your browser...',
            });
            return;
        }
        if (lowerInput === 'd') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening Discord invite in your browser...',
            });
            return;
        }
        if (lowerInput === 'g') {
            useNotificationStore.getState().actions.show({
                type: 'info',
                title: 'Opening Link',
                message: 'Opening GitHub repository in your browser...',
            });
            return;
        }

        // Any other key skips
        handleSkip(); 
    });

    useEffect(() => {
        if (countdown === 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, showInitScreen]);

    return { countdown };
};