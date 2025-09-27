import { useState, useEffect, useRef } from 'react';
import { useInput } from 'ink';
import { useAppStore } from '../stores/app.store';
import { UI_CONFIG } from '../config/ui.config';
import { SPLASH_TIPS } from '../constants/splash.constants';
import { useNotificationStore } from '../stores/notification.store';

export const useSplashScreen = () => {
    const showInitScreen = useAppStore(state => state.actions.showInitScreen);
    const [countdown, setCountdown] = useState<number>(UI_CONFIG.splash.initialCountdown);
    const [visibleLogoLines, setVisibleLogoLines] = useState(0);
    const [tip, setTip] = useState('');
    const [updateState, setUpdateState] = useState<'checking' | 'success' | 'failed'>('checking');
    const [updateMessage, setUpdateMessage] = useState('');
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
        setVisibleSections(new Set(['tagline', 'version', 'updateCheck', 'promo', 'links']));
        setUpdateState('success');
        setUpdateMessage('✓ You are up to date.');
        showInitScreen();
    };

    const runUpdateCheck = () => {
        setUpdateState('checking');
        setUpdateMessage('Checking for updates...');
        timeouts.current.push(setTimeout(() => { setUpdateState('success'); setUpdateMessage('✓ You are up to date.'); }, 1500));
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
        if (updateState === 'failed') {
            if (lowerInput === 'r') {
                runUpdateCheck();
                return;
            }
            if (lowerInput === 's') {
                handleSkip();
                return;
            }
        }

        // Any other key skips
        handleSkip(); 
    });

    useEffect(() => {
        const t = (fn: () => void, delay: number) => timeouts.current.push(setTimeout(fn, delay));

        const debugState = useAppStore.getState().splashScreenDebugState;
        if (debugState === 'update-failed') {
            useAppStore.getState().actions.setSplashScreenDebugState('default');
            setVisibleLogoLines(100);
            setVisibleSections(new Set(['tagline', 'version', 'updateCheck', 'promo', 'links']));
            setUpdateState('failed');
            setUpdateMessage('✗ Update check failed. Please check your connection.');
            // Skip countdown and other animations, but don't auto-skip the screen
            setAnimationComplete(true);
            setCountdown(999); // Prevent auto-skip via countdown
            if (!tip) {
                setTip(SPLASH_TIPS[Math.floor(Math.random() * SPLASH_TIPS.length)]!);
            }
            return;
        }

        // Pick a random tip on mount
        if (!tip) {
            setTip(SPLASH_TIPS[Math.floor(Math.random() * SPLASH_TIPS.length)]!);
        }

        // 1. Animate logo
        const logoTimer = setInterval(() => {
            setVisibleLogoLines(l => {
                if (l >= 4) { // Fix: was 3, which cut off the last line of the logo
                    clearInterval(logoTimer);
                    
                    // 2. Animate sections
                    t(() => setVisibleSections(s => new Set(s).add('tagline')), 100);
                    t(() => setVisibleSections(s => new Set(s).add('version')), 300);
                    t(() => {
                        setVisibleSections(s => new Set(s).add('updateCheck'));
                        runUpdateCheck();
                    }, 600);

                    t(() => setVisibleSections(s => new Set(s).add('promo')), 800);
                    t(() => setVisibleSections(s => new Set(s).add('links')), 1000);
                    t(() => setAnimationComplete(true), 1200);

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
    }, [tip]);

    useEffect(() => {
        if (!animationComplete || updateState === 'failed') return;

        if (countdown <= 0) {
            showInitScreen();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        timeouts.current.push(timer);
        
        return () => clearTimeout(timer);
    }, [countdown, showInitScreen, animationComplete, updateState]);

    return { countdown, visibleLogoLines, visibleSections, animationComplete, tip, updateState, updateMessage };
};