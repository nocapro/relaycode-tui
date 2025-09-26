import { useState, useEffect, useRef } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { useNotificationStore } from '../stores/notification.store';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);
    const [visibleLogoLines, setVisibleLogoLines] = useState(0);
    const [visibleSections, setVisibleSections] = useState(new Set<string>());
    const [animationComplete, setAnimationComplete] = useState(false);

    // Use a ref to manage timeouts to prevent memory leaks on fast unmount/skip
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAllTimeouts = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    };

    const handleSkip = () => {
        clearAllTimeouts();
        setAnimationComplete(true);
        setVisibleLogoLines(100); // A high number to show all lines
        setVisibleSections(new Set(['tagline', 'version', 'promo', 'links']));
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
        const t = (fn: () => void, delay: number) => timeouts.current.push(setTimeout(fn, delay));

        // 1. Animate logo
        const logoTimer = setInterval(() => {
            setVisibleLogoLines(l => {
                if (l >= 4) { // Fix: was 3, which cut off the last line of the logo
                    clearInterval(logoTimer);
                    
                    // 2. Animate sections
                    t(() => setVisibleSections(s => new Set(s).add('tagline')), 100);
                    t(() => setVisibleSections(s => new Set(s).add('version')), 300);
                    t(() => setVisibleSections(s => new Set(s).add('promo')), 500);
                    t(() => setVisibleSections(s => new Set(s).add('links')), 700);
                    t(() => setAnimationComplete(true), 900);

                    return l;
                }
                return l + 1;
            });
        }, 80);

        // Cleanup
        return () => {
            clearInterval(logoTimer);
            clearAllTimeouts();
        };
    }, []);

    useEffect(() => {
        if (!animationComplete) return;

        if (countdown <= 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        timeouts.current.push(timer);
        
        return () => clearTimeout(timer);
    }, [countdown, showInitScreen, animationComplete]);

    return { countdown, visibleLogoLines, visibleSections, animationComplete };
};