import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import Separator from './Separator';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import type { LogEntry } from '../types/log.types';
import { useStdoutDimensions } from '../utils';

const LogLevelColors = {
    DEBUG: 'gray',
    INFO: 'white',
    WARN: 'yellow',
    ERROR: 'red',
};

const LogLevelTag = {
    DEBUG: { color: 'white', backgroundColor: 'gray' },
    INFO: { color: 'black', backgroundColor: 'cyan' },
    WARN: { color: 'black', backgroundColor: 'yellow' },
    ERROR: { color: 'white', backgroundColor: 'red' },
};

const LogEntryRow = ({ entry, isSelected }: { entry: LogEntry; isSelected: boolean }) => {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.replace('Z', '');
    const color = LogLevelColors[entry.level];
    const tagColors = LogLevelTag[entry.level];

    return (
        <Text color={color}>
            {isSelected ? '> ' : '  '}
            <Text color="gray">{time}</Text>
            {' '}
            <Text bold color={tagColors.color} backgroundColor={tagColors.backgroundColor}>
                {' '}{entry.level.padEnd(5, ' ')}{' '}
            </Text>
            {' '}
            {entry.message}
        </Text>
    );
};

const DebugLogScreen = () => {
    const {
        logsInView,
        logCount,
        filteredLogCount,
        selectedIndex,
        mode,
        filterQuery,
        setFilterQuery,
    } = useDebugLogScreen();
    const [width] = useStdoutDimensions();

    const renderFilter = () => (
        <Box>
            <Text>Filter: </Text>
            {mode === 'FILTER' ? (
                <TextInput
                    value={filterQuery}
                    onChange={setFilterQuery}
                    placeholder="Type to filter log messages..."
                />
            ) : (
                <Text color="gray">{filterQuery || '(none)'}</Text>
            )}
            <Box flexGrow={1} />
            <Text>
                Showing {filteredLogCount} of {logCount} entries
            </Text>
        </Box>
    );

    const footerActions =
        mode === 'FILTER'
            ? [{ key: 'Enter/Esc', label: 'Apply & Close Filter' }]
            : [
                  { key: '↑↓', label: 'Scroll' },
                  { key: 'F', label: 'Filter' },
                  { key: 'C', label: 'Clear' },
                  { key: 'Esc/Ctrl+L', label: 'Close' },
              ];

    return (
        <Box
            flexDirection="column"
            width="100%"
            height="100%"
            paddingX={2}
            paddingY={1}
        >
            <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · DEBUG LOG </Text>
            <Separator width={width - 4} />
            <Box marginY={1}>{renderFilter()}</Box>
            <Box flexDirection="column" flexGrow={1}>
                {logsInView.map((entry, index) => (
                    <LogEntryRow
                        key={`${entry.timestamp}-${index}`}
                        entry={entry}
                        isSelected={selectedIndex === index}
                    />
                ))}
                {logCount > 0 && filteredLogCount === 0 && (
                    <Text color="gray">No logs match your filter.</Text>
                )}
                {logCount === 0 && (
                    <Text color="gray">No log entries yet. Waiting for system activity...</Text>
                )}
            </Box>
            <Separator width={width - 4} />
            <ActionFooter actions={footerActions} />
        </Box>
    );
};

export default DebugLogScreen;