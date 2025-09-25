import React, { useEffect } from 'react';
import { Box, useInput } from 'ink';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';
import ReviewProcessingScreen from './components/ReviewProcessingScreen';
import GitCommitScreen from './components/GitCommitScreen';
import TransactionDetailScreen from './components/TransactionDetailScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import DebugMenu from './components/DebugMenu'; 
import GlobalHelpScreen from './components/GlobalHelpScreen';
import CopyScreen from './components/CopyScreen';
import { useUIStore } from './stores/ui.store';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);
    const activeOverlay = useUIStore(s => s.activeOverlay);
    const isOverlayOpen = activeOverlay !== 'none';

    // Global hotkeys are active if no modal-like component is open
    const areGlobalHotkeysActive = activeOverlay !== 'copy'; // Copy mode has its own input handler
    useGlobalHotkeys({ isActive: areGlobalHotkeysActive });

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen, activeOverlay]);

    const renderMainScreen = () => {
        if (currentScreen === 'splash') return <SplashScreen />;
        if (currentScreen === 'init') return <InitializationScreen />;
        if (currentScreen === 'dashboard') return <DashboardScreen />;
        if (currentScreen === 'review') return <ReviewScreen />;
        if (currentScreen === 'review-processing') return <ReviewProcessingScreen />;
        if (currentScreen === 'git-commit') return <GitCommitScreen />;
        if (currentScreen === 'transaction-detail') return <TransactionDetailScreen />;
        if (currentScreen === 'transaction-history') return <TransactionHistoryScreen />;
        return null;
    };

    return (
        <>
            <Box
                width="100%"
                height="100%"
                flexDirection="column"
                display={isOverlayOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            {activeOverlay === 'help' && <GlobalHelpScreen />}
            {activeOverlay === 'copy' && <CopyScreen />}
            {activeOverlay === 'debug' && <DebugMenu />}
        </>
    );
};

export default App;