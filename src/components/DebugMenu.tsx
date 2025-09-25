import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDebugMenu } from '../hooks/useDebugMenu';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems } = useDebugMenu();
    const [width] = useStdoutDimensions();

    return (
        <Box
            flexDirection="column"
            width="100%"
            paddingX={2}
            paddingY={1}
        >
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · DEBUG MENU </Text>
            <Separator width={width - 4} />
            <Box flexDirection="column" marginY={1}>
                {menuItems.map((item, index) => (
                    <Text key={item.title} color={selectedIndex === index ? 'cyan' : undefined}>
                        {selectedIndex === index ? '> ' : '  '}
                        ({getKeyForIndex(index)}) {item.title}
                    </Text>
                ))}
            </Box>
            <Separator width={width - 4} />
            <ActionFooter actions={[
                { key: '↑↓', label: 'Nav' },
                { key: '1-9,a-z', label: 'Jump' },
                { key: 'Enter', label: 'Select' },
                { key: 'Esc/Ctrl+B', label: 'Close' },
            ]}/>
        </Box>
    );
};

export default DebugMenu;