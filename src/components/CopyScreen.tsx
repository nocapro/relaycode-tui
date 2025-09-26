import { Box, Text } from 'ink';
import Separator from './Separator';
import { useStdoutDimensions } from '../utils';
import ActionFooter from './ActionFooter';
import { useCopyScreen } from '../hooks/useCopyScreen';
import { COPY_SCREEN_FOOTER_ACTIONS } from '../constants/copy.constants';

const CopyScreen = () => {
    const {
        title,
        itemsInView,
        selectedIndex,
        selectedIds,
        lastCopiedMessage,
        viewOffset,
    } = useCopyScreen();
    const [width] = useStdoutDimensions();

    return (
        <Box 
            width="100%"
            height="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Box 
                flexDirection="column" 
                paddingX={2}
                width="80%"
            >
                <Text bold color="yellow">▲ relaycode · copy mode</Text>
                <Separator width={Math.floor(width * 0.8) - 4} />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {itemsInView.map((item, index) => {
                            const isSelected = (index + viewOffset) === selectedIndex;
                            const isChecked = selectedIds.has(item.id);
                            return (
                                <Text key={item.id} color={isSelected ? 'cyan' : undefined}>
                                    {isSelected ? '> ' : '  '}
                                    [{isChecked ? 'x' : ' '}] ({item.key}) {item.label}
                                </Text>
                            );
                        })}
                    </Box>
                </Box>
                <Separator width={Math.floor(width * 0.8) - 4} />
                {lastCopiedMessage && <Text color="green">✓ {lastCopiedMessage}</Text>}
                <ActionFooter actions={COPY_SCREEN_FOOTER_ACTIONS}/>
            </Box>
        </Box>
    );
};

export default CopyScreen;