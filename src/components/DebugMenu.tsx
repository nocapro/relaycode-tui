import { Box, Text } from 'ink';
import { useDebugMenu } from '../hooks/useDebugMenu';
import ActionFooter from './ActionFooter';
import { DEBUG_MENU_FOOTER_ACTIONS } from '../constants/debug.constants';
import ScreenLayout from './layout/ScreenLayout';

const getKeyForIndex = (index: number): string => {
    if (index < 9) {
        return (index + 1).toString();
    }
    return String.fromCharCode('a'.charCodeAt(0) + (index - 9));
};

const DebugMenu = () => {
    const { selectedIndex, menuItems, viewOffset, totalItems } = useDebugMenu();

    return (
        <ScreenLayout
            title="DEBUG MENU"
            footer={
                <Box>
                    <ActionFooter actions={DEBUG_MENU_FOOTER_ACTIONS}/>
                    <Box flexGrow={1} />
                    <Text>
                        {Math.min(viewOffset + 1, totalItems)}-
                        {Math.min(viewOffset + menuItems.length, totalItems)} of {totalItems}
                    </Text>
                </Box>
            }
        >
            <Box flexDirection="column" paddingX={2}>
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
        </ScreenLayout>
    );
};

export default DebugMenu;