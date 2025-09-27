import { Box, Text } from 'ink';
import Separator from './Separator';
import { useDimensions } from '../contexts/DimensionsContext';
import ActionFooter from './ActionFooter';
import { useCopyScreen } from '../hooks/useCopyScreen';
import ModalLayout from './layout/ModalLayout';
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
    const { columns: width } = useDimensions();

    return (
        <ModalLayout>
            <Box
                flexDirection="column"
                paddingX={2}
                width="100%"
            >
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · COPY MODE </Text>
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
        </ModalLayout>
    );
};

export default CopyScreen;