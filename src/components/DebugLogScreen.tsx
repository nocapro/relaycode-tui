import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import ActionFooter from './ActionFooter';
import { useDebugLogScreen } from '../hooks/useDebugLogScreen';
import { DEBUG_LOG_FOOTER_ACTIONS, DEBUG_LOG_MODES, LOG_LEVEL_COLORS, LOG_LEVEL_TAGS } from '../constants/log.constants';
import type { LogEntry } from '../types/log.types';
import ScreenLayout from './layout/ScreenLayout';

const LogEntryRow = ({ entry, isSelected }: { entry: LogEntry; isSelected: boolean }) => {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.replace('Z', '');
    const color = LOG_LEVEL_COLORS[entry.level];
    const tagColors = LOG_LEVEL_TAGS[entry.level];

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
        viewOffset,
    } = useDebugLogScreen();

    const renderFilter = () => (
        <Box>
            <Text>Filter: </Text>
            {mode === DEBUG_LOG_MODES.FILTER ? (
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
                Showing {Math.min(viewOffset + 1, filteredLogCount)}-
                {Math.min(viewOffset + logsInView.length, filteredLogCount)} of {filteredLogCount}
            </Text> 
        </Box>
    );

    const footerActions =
        mode === DEBUG_LOG_MODES.FILTER
            ? DEBUG_LOG_FOOTER_ACTIONS.FILTER_MODE
            : DEBUG_LOG_FOOTER_ACTIONS.LIST_MODE(logCount > 0);

    return (
        <ScreenLayout
            title="▲ relaycode · DEBUG LOG"
            footer={<ActionFooter actions={footerActions} />}
        >
            <Box flexDirection="column" flexGrow={1} paddingX={2}>
                {renderFilter()}
                <Box flexDirection="column" flexGrow={1} marginTop={1}>
                    {logsInView.map((entry, index) => (
                        <LogEntryRow
                            key={`${entry.timestamp}-${index}`}
                            entry={entry}
                            isSelected={selectedIndex === index + viewOffset}
                        />
                    ))}
                    {logCount > 0 && filteredLogCount === 0 && (
                        <Text color="gray">No logs match your filter.</Text>
                    )}
                    {logCount === 0 && (
                        <Text color="gray">No log entries yet. Waiting for system activity...</Text>
                    )}
                </Box>
            </Box>
        </ScreenLayout>
    );
};

export default DebugLogScreen;