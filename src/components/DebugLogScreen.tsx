import { Box, Text } from 'ink';
import Separator from './Separator';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import type { LogEntry } from '../types/log.types';

const LogLevelColors = {
    DEBUG: 'gray',
    INFO: 'white',
    WARN: 'yellow',
    ERROR: 'red',
};

const LogEntryRow = ({ entry, isSelected }: { entry: LogEntry; isSelected: boolean }) => {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.replace('Z', '');
    const color = LogLevelColors[entry.level];

    return (
        <Text color={color}>
            {isSelected ? '> ' : '  '}
            <Text color="gray">{time}</Text>
            {' '}
            <Text bold color={color}>[{entry.level.padEnd(5, ' ')}]</Text>
            {' '}
            {entry.message}
        </Text>
    );
};

const DebugLogScreen = () => {
    const { logsInView, logCount, selectedIndex } = useDebugLogScreen();

    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor="yellow"
            width="100%"
            height="100%"
            paddingX={2}
        >
            <Text bold color="yellow">▲ relaycode · DEBUG LOG</Text>
            <Separator />
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {logsInView.map((entry, index) => (
                    <LogEntryRow
                        key={`${entry.timestamp}-${index}`}
                        entry={entry}
                        isSelected={selectedIndex === index}
                    />
                ))}
                {logCount === 0 && <Text color="gray">No log entries yet. Waiting for system activity...</Text>}
            </Box>
            <Separator />
            <ActionFooter actions={[
                { key: '↑↓', label: 'Scroll' },
                { key: 'C', label: 'Clear' },
                { key: 'Esc/Ctrl+L', label: 'Close' },
            ]}/>
        </Box>
    );
};

export default DebugLogScreen;