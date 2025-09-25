import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { VIEW_CONSTANTS } from '../constants/view.constants';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(VIEW_CONSTANTS.SPLASH_INITIAL_COUNTDOWN);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening noca.pro in browser...');
            return;
        }
        if (lowerInput === 'x') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening X/Twitter in browser...');
            return;
        }
        if (lowerInput === 'd') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening Discord in browser...');
            return;
        }
        if (lowerInput === 'g') {
            // eslint-disable-next-line no-console
            console.log('[MOCK] Opening GitHub in browser...');
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