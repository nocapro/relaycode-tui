import { useState, useEffect } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { LoggerService } from '../services/logger.service';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);

    const handleSkip = () => {
        showInitScreen();
    };

    useInput((input) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput === 'v') {
            LoggerService.info('[MOCK] Opening noca.pro in browser...');
            return;
        }
        if (lowerInput === 'x') {
            LoggerService.info('[MOCK] Opening X/Twitter in browser...');
            return;
        }
        if (lowerInput === 'd') {
            LoggerService.info('[MOCK] Opening Discord in browser...');
            return;
        }
        if (lowerInput === 'g') {
            LoggerService.info('[MOCK] Opening GitHub in browser...');
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