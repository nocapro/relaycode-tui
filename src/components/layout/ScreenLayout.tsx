import { Box, Text } from 'ink';
import Separator from '../Separator';

interface ScreenLayoutProps {
    title: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
}

const ScreenLayout = ({ title, footer, children }: ScreenLayoutProps) => {
    return (
        <Box flexDirection="column" flexGrow={1}>
            {typeof title === 'string' ? (
                <Text bold color="black" backgroundColor="yellow"> {title} </Text>
            ) : (
                title
            )}
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