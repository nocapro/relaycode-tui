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
import CopyScreen from './components/CopyScreen';
import { useCopyStore } from './stores/copy.store';

const App = () => {
    const { currentScreen, isDebugMenuOpen, actions } = useAppStore(state => ({
        currentScreen: state.currentScreen,
        isDebugMenuOpen: state.isDebugMenuOpen,
        actions: state.actions,
    }));
    const isCopyModeOpen = useCopyStore(s => s.isOpen);

    useInput((input, key) => {
        if (key.ctrl && input === 'b') {
            actions.toggleDebugMenu();
        }
    }, { isActive: !isCopyModeOpen });

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen, isDebugMenuOpen, isCopyModeOpen]);

    const renderMainScreen = () => {
        if (isDebugMenuOpen) return <DebugMenu />;
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
                display={isCopyModeOpen ? 'none' : 'flex'}
            >
                {renderMainScreen()}
            </Box>
            <CopyScreen />
        </>
    );
};

export default App;