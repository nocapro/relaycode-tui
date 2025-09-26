import { Box, Text } from 'ink';
import Separator from './Separator';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashScreen = () => {
    const { countdown, visibleLogoLines, visibleSections, animationComplete } = useSplashScreen();
    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀
`;

    const logoLines = logo.split('\n');

    return (
        <Box flexDirection="column" height="100%" justifyContent="center" alignItems="center">
            <Box flexDirection="column">
                <Text color="cyan">▲ relaycode</Text>
                <Separator />
                <Text color="cyan">{logoLines.slice(0, visibleLogoLines).join('\n')}</Text>
                {visibleSections.has('tagline') && (
                    <Box flexDirection="column" alignItems="center">
                        <Text italic>A zero-friction, AI-native patch engine.</Text>
                        <Text italic color="gray">Built by Arman and contributors · <Text underline>https://relay.noca.pro</Text></Text>
                    </Box>
                )}
                
                {visibleSections.has('version') && (
                    <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                        <Box flexDirection="column" width="45%">
                            <Text>Version 1.1.5</Text>
                            <Text>─────────────────────────</Text>
                            <Text>relaycode</Text>
                            <Text>relaycode-core</Text>
                            <Text>apply-multi-diff</Text>
                            <Text>konro</Text>
                        </Box>
                         <Box flexDirection="column" width="45%">
                            <Text>Build Timestamps</Text>
                            <Text>─────────────────────────</Text>
                            <Text>2025-09-20 13:58:05</Text>
                            <Text>2025-09-20 10:59:05</Text>
                            <Text>(versioned)</Text>
                            <Text>(versioned)</Text>
                        </Box>
                    </Box>
                )}
                
                {visibleSections.has('promo') && (
                    <>
                        <Box marginTop={1}><Separator /></Box>
                        <Text>If you love this workflow, check out <Text underline>https://www.noca.pro</Text> for the full</Text>
                        <Text>web app with repo-wide visual context, history, and rollback.</Text>
                        <Text><Text color="cyan" bold>(V)</Text>isit noca.pro</Text>
                    </>
                )}

                {visibleSections.has('links') && (
                    <>
                        <Separator />
                        <Text>Follow <Text color="cyan" bold>(X)</Text> · Join <Text color="cyan" bold>(D)</Text>iscord · Star on <Text color="cyan" bold>(G)</Text>itHub</Text>
                    </>
                )}

                <Separator />
                <Text>
                    {animationComplete ? `Loading... ${countdown}` : 'Loading...'} (<Text color="gray">Press any key to skip</Text>)
                </Text>
            </Box>
        </Box>
    );
};

export default SplashScreen;