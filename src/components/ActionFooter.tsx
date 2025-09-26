import { Box, Text } from 'ink';
import { useStdoutDimensions } from '../utils';
import { UI_CONFIG } from '../config/ui.config';
import type { ActionItem } from '../types/actions.types';

interface ActionFooterProps {
    actions: readonly ActionItem[];
}

const Action = ({ item }: { item: ActionItem }) => (
    <Text>
        (<Text color="cyan" bold>{item.key}</Text>) {item.label}
    </Text>
);

const ActionFooter = ({ actions }: ActionFooterProps) => {
    const [width] = useStdoutDimensions();
    const { horizontalPadding, actionSeparator } = UI_CONFIG.footer;
    const separatorWidth = actionSeparator.length;

    // Calculate required width for a single line
    const formattedActions = actions.map(a => `(${a.key}) ${a.label}`);
    const singleLineWidth = formattedActions.join(actionSeparator).length;

    // 1. Render horizontally if it fits
    if (singleLineWidth <= width - horizontalPadding * 2) {
        return (
            <Box>
                {actions.map((item, index) => (
                    <Text key={item.key}>
                        <Action item={item} />
                        {index < actions.length - 1 && <Text>{actionSeparator}</Text>}
                    </Text>
                ))}
            </Box>
        );
    }

    // 2. If it doesn't fit, calculate multi-column layout
    const itemWidths = formattedActions.map(a => a.length);
    const maxItemWidth = Math.max(...itemWidths);
    
    // Determine how many columns can fit, ensuring at least one
    const availableWidth = width - horizontalPadding * 2;
    // Calculate columns based on the widest item, ensuring we don't try to make more columns than items
    const numColumns = Math.min(
        actions.length,
        Math.max(1, Math.floor(availableWidth / (maxItemWidth + separatorWidth))),
    );
    
    const itemsPerColumn = Math.ceil(actions.length / numColumns);
    const columns: ActionItem[][] = Array.from({ length: numColumns }, () => []);

    actions.forEach((action, index) => {
        const columnIndex = Math.floor(index / itemsPerColumn);
        if (columns[columnIndex]) {
            columns[columnIndex].push(action);
        }
    });

    return (
        <Box flexDirection="row" width="100%">
            {columns.map((column, colIndex) => (
                <Box
                    key={colIndex}
                    flexDirection="column"
                    // Use a flex-basis approach for more even distribution if needed,
                    // but fixed width is better for alignment.
                    width={maxItemWidth + separatorWidth}
                >
                    {column.map(item => (
                        <Action key={item.key} item={item} />
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default ActionFooter;