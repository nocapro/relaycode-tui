import { Box, Text } from 'ink';
import Separator from './Separator';
import { useSplashScreen } from '../hooks/useSplashScreen';

const SplashScreen = () => {
    const { countdown, visibleLogoLines, visibleSections, animationComplete, tip, updateStatus } = useSplashScreen();
    const logo = `
         ░█▀▄░█▀▀░█░░░█▀█░█░█░█▀▀░█▀█░█▀▄░█▀▀
         ░█▀▄░█▀▀░█░░░█▀█░░█░░█░░░█░█░█░█░█▀▀
         ░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀`;

    const logoLines = logo.split('\n');

    return (
        <Box flexDirection="column" height="100%" justifyContent="center" alignItems="center">
            <Box flexDirection="column">
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode </Text>
                <Separator />
                <Box flexDirection="column">
                    {logoLines.slice(0, visibleLogoLines).map((line, index) => {
                        if (index === 0) return <Text key={index}>{line}</Text>;
                        if (index === 2) return <Text key={index} color="white">{line}</Text>;
                        return <Text key={index} color="cyan">{line}</Text>;
                    })}
                </Box>
                {visibleSections.has('tagline') && (
                    <Box flexDirection="column" alignItems="center">
                        <Text italic>A zero-friction, AI-native patch engine.</Text>
                        <Text italic color="gray">Built by Arman and contributors · <Text underline color="blue">https://relay.noca.pro</Text></Text>
                    </Box>
                )}
                
                {visibleSections.has('version') && (
                    <Box flexDirection="row" justifyContent="space-around" width="100%" marginTop={1}>
                        <Box flexDirection="column" width="45%">
                            <Text color="yellow">Version 1.1.5</Text>
                            <Text color="gray">─────────────────────────</Text>
                            <Text>relaycode</Text>
                            <Text>relaycode-core</Text>
                            <Text>apply-multi-diff</Text>
                            <Text>konro</Text>
                        </Box>
                         <Box flexDirection="column" width="45%">
                            <Text color="yellow">Build Timestamps</Text>
                            <Text color="gray">─────────────────────────</Text>
                            <Text>2025-09-20 13:58:05</Text>
                            <Text>2025-09-20 10:59:05</Text>
                            <Text>(versioned)</Text>
                            <Text>(versioned)</Text>
                        </Box>
                    </Box>
                )}

                {visibleSections.has('updateCheck') && (
                    <Box marginTop={1}>
                        <Text>{updateStatus}</Text>
                    </Box>
                )}
                
                {visibleSections.has('promo') && (
                    <>
                        <Box marginTop={1}><Separator /></Box>
                        <Text>If you love this workflow, check out <Text underline color="blue">https://www.noca.pro</Text> for the full</Text>
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
                {animationComplete && (
                    <Box marginBottom={1}>
                        <Text italic color="gray">{tip}</Text>
                    </Box>
                )}
                <Text>
                    <Text color="gray">
                        {animationComplete ? 'Loading... ' : 'Loading...'}
                    </Text>
                    {animationComplete && <Text color="yellow">{countdown}</Text>}
                    <Text color="gray"> (Press any key to skip)</Text>
                </Text>
            </Box>
        </Box>
    );
};

export default SplashScreen;