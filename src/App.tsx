import React, { useEffect } from 'react';
import { useAppStore } from './stores/app.store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';
import DashboardScreen from './components/DashboardScreen';
import ReviewScreen from './components/ReviewScreen';

const App = () => {
    const currentScreen = useAppStore(state => state.currentScreen);

    useEffect(() => {
        // Clear the terminal when the screen changes to ensure a clean view.
        // This is especially important when transitioning from the splash screen.
        // eslint-disable-next-line no-console
        console.clear();
    }, [currentScreen]);
    
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    if (currentScreen === 'dashboard') {
        return <DashboardScreen />;
    }

    if (currentScreen === 'review') {
        return <ReviewScreen />;
    }

    return null;
};

export default App;