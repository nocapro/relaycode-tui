import { Box, Text } from 'ink';
import Separator from '../Separator';

interface ScreenLayoutProps {
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
    contextInfo?: string;
}

const ScreenLayout = ({ title, footer, children, contextInfo }: ScreenLayoutProps) => {
    return (
        <Box flexDirection="column" flexGrow={1}>
            <Box flexDirection="row">
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · {title} </Text>
                <Box flexGrow={1} />
                {contextInfo && <Text color="gray">{contextInfo}</Text>}
            </Box>
            <Separator />
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {children}
            </Box>
            <Separator />
            <Box>
                {footer}
            </Box>
        </Box>
    );
};

export default ScreenLayout;