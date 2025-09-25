import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useCopyStore } from '../stores/copy.store';
import Separator from './Separator';
import { useUIStore } from '../stores/ui.store';
import { useStdoutDimensions } from '../utils';

const CopyScreen = () => {
    const activeOverlay = useUIStore(s => s.activeOverlay);
    const {
        title, items, selectedIndex, selectedIds, lastCopiedMessage,
        actions,
    } = useCopyStore(state => ({ ...state, actions: state.actions }));

    useInput((input, key) => {
        if (key.escape) {
            actions.close();
            return;
        }
        if (key.upArrow) {
            actions.navigateUp();
            return;
        }
        if (key.downArrow) {
            actions.navigateDown();
            return;
        }
        if (input === ' ') {
            actions.toggleSelection();
            return;
        }
        if (key.return) {
            actions.executeCopy();
            return;
        }
        
        const item = items.find(i => i.key.toLowerCase() === input.toLowerCase());
        if(item) {
            actions.toggleSelectionById(item.id);
        }
    }, { isActive: activeOverlay === 'copy' });
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
                borderStyle="round" 
                borderColor="yellow" 
                paddingX={2}
                width="80%"
            >
                <Text bold color="yellow">▲ relaycode · copy mode</Text>
                <Separator width={Math.floor(width * 0.8) - 4} />
                <Box flexDirection="column" marginY={1}>
                    <Text>{title}</Text>
                    <Box flexDirection="column" marginTop={1}>
                        {items.map((item, index) => {
                            const isSelected = index === selectedIndex;
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
                <Text>(↑↓) Nav · (Spc/Hotkey) Toggle · (Enter) Copy · (Esc) Close</Text>
            </Box>
        </Box>
    );
};

export default CopyScreen;