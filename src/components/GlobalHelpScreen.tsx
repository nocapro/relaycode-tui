import { Box, Text } from 'ink';
import { useStdoutDimensions } from '../utils';
import ModalLayout from './layout/ModalLayout';

const HELP_SECTIONS = [
    {
        title: 'GLOBAL',
        shortcuts: [
            { key: '?', label: 'Toggle this help screen' },
            { key: 'Q/Esc', label: 'Quit or Go Back' },
            { key: 'Ctrl+V', label: 'Process Clipboard' },
            { key: 'Ctrl+B', label: 'Toggle Debug Menu' },
            { key: 'Ctrl+L', label: 'Toggle Debug Log' },
        ],
    },
    {
        title: 'DASHBOARD',
        shortcuts: [
            { key: '↑↓', label: 'Navigate event stream' },
            { key: '→/Enter', label: 'Expand / View Details' },
            { key: '←', label: 'Collapse Item' },
            { key: 'P', label: 'Pause / Resume clipboard watcher' },
            { key: 'A', label: 'Approve All Pending' },
            { key: 'C', label: 'Commit All Applied' },
            { key: 'L', label: 'View History Log' },
        ],
    },
    {
        title: 'HISTORY',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Items' },
            { key: '→/←', label: 'Expand / Collapse' },
            { key: 'Space', label: 'Select for Bulk Action' },
            { key: 'Enter', label: 'View Details' },
            { key: 'F', label: 'Filter History' },
            { key: 'B', label: 'Open Bulk Actions Menu' },
            { key: 'C', label: 'Copy Selected Items' },
        ],
    },
    {
        title: 'REVIEW SCREEN',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Items' },
            { key: 'D/Enter', label: 'View File Diff' },
            { key: 'R', label: 'Show / Collapse Reasoning' },
            { key: 'Space', label: 'Toggle Approval State' },
            { key: 'A', label: 'Apply Approved Changes' },
            { key: 'T/Shift+T', label: 'Repair / Bulk Repair Failed Files' },
            { key: 'I/Shift+I', label: 'Instruct / Bulk Instruct Rejected' },
            { key: 'C', label: 'Open Copy Menu' },
        ],
    },
    {
        title: 'DETAIL SCREEN',
        shortcuts: [
            { key: '↑↓', label: 'Navigate Sections/Files' },
            { key: '→/←', label: 'Expand / Collapse' },
            { key: 'Enter', label: 'Drill-in / View Diff' },
            { key: 'U', label: 'Revert Transaction' },
            { key: 'C', label: 'Open Copy Menu' },
            { key: 'O', label: 'Open File/YAML in Editor' },
        ],
    },
];

const KEY_PADDING = 12;

const Shortcut = ({ shortcut }: { shortcut: { key: string; label: string } }) => (
    <Text>
        {'  '}
        <Text color="cyan" bold>{shortcut.key.padEnd(KEY_PADDING)}</Text>
        {shortcut.label}
    </Text>
);

const GlobalHelpScreen = () => {
    const [width] = useStdoutDimensions();

    // 90% view width, minus 2 padding on each side.
    const availableWidth = Math.floor(width * 0.9) - 4;

    // Calculate max width needed for one column of content
    const allShortcutLines = HELP_SECTIONS.flatMap(s => 
        s.shortcuts.map(sc => `  ${sc.key.padEnd(KEY_PADDING)} ${sc.label}`)
    );
    const allLines = [...allShortcutLines, ...HELP_SECTIONS.map(s => s.title)];
    const maxContentWidth = Math.max(...allLines.map(line => line.length));

    const GAP = 4;
    // Determine optimal number of columns
    const numColumns = Math.max(1, Math.min(
        HELP_SECTIONS.length, // Don't make more columns than sections
        Math.floor(availableWidth / (maxContentWidth + GAP))
    ));

    // Distribute sections into columns
    const columns: typeof HELP_SECTIONS[] = Array.from({ length: numColumns }, () => []);
    const sectionsPerColumn = Math.ceil(HELP_SECTIONS.length / numColumns);

    HELP_SECTIONS.forEach((section, index) => {
        const columnIndex = Math.floor(index / sectionsPerColumn);
        if (columns[columnIndex]) {
            columns[columnIndex].push(section);
        }
    });

    return (
        <ModalLayout width="90%">
            <Box
                flexDirection="column"
                paddingX={2}
                paddingY={2}
            >
                <Box justifyContent="center" marginBottom={1}>
                    <Text bold>
                        <Text color="yellow">▲ relaycode</Text>
                        <Text color="cyan"> · Keyboard Shortcuts</Text>
                    </Text>
                </Box>

                <Box flexDirection="row" gap={GAP}>
                    {columns.map((sectionList, i) => (
                        <Box key={i} flexDirection="column" gap={1} flexGrow={1} flexShrink={1} flexBasis={0}>
                            {sectionList.map(section => (
                                <Box key={section.title} flexDirection="column">
                                    <Text bold color="cyan">{section.title}</Text>
                                    {section.shortcuts.map(shortcut => (
                                        <Shortcut key={shortcut.label} shortcut={shortcut} />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box justifyContent="center" marginTop={1}>
                <Text bold>(Press <Text color="cyan" bold>?</Text> or <Text color="cyan" bold>Esc</Text> to close)</Text>
            </Box>
        </ModalLayout>
    );
};

export default GlobalHelpScreen;