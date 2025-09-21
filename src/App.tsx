import React from 'react';
import { useStore } from './store';
import SplashScreen from './components/SplashScreen';
import InitializationScreen from './components/InitializationScreen';

const App = () => {
    const currentScreen = useStore(state => state.currentScreen);

    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'init') {
        return <InitializationScreen />;
    }

    return null;
};

export default App;