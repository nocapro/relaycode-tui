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
    const { selectedIndex, menuItems, viewOffset, totalItems } = useDebugMenu();
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
                {menuItems.map((item, index) => {
                    const absoluteIndex = index + viewOffset;
                    return (
                        <Text key={item.title} color={selectedIndex === absoluteIndex ? 'cyan' : undefined}>
                            {selectedIndex === absoluteIndex ? '> ' : '  '}
                            ({getKeyForIndex(absoluteIndex)}) {item.title}
                        </Text>
                    );
                })}
            </Box>
            <Separator width={width - 4} />
            <Box>
                <ActionFooter actions={[
                    { key: '↑↓/PgUp/PgDn', label: 'Nav' },
                    { key: '1-9,a-z', label: 'Jump' },
                    { key: 'Enter', label: 'Select' },
                    { key: 'Esc/Ctrl+B', label: 'Close' },
                ]}/>
                <Box flexGrow={1} />
                <Text>
                    {Math.min(viewOffset + 1, totalItems)}-
                    {Math.min(viewOffset + menuItems.length, totalItems)} of {totalItems}
                </Text>
            </Box>
        </Box>
    );
};

export default DebugMenu;