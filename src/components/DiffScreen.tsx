import { Box, Text } from 'ink';
import { UI_CONFIG } from '../config/ui.config';

interface DiffScreenProps {
    filePath: string;
    diffContent: string;
    isExpanded: boolean;
    scrollIndex?: number;
    maxHeight?: number;
}
const DiffScreen = ({ filePath, diffContent, isExpanded, scrollIndex = 0, maxHeight }: DiffScreenProps) => {
    const lines = diffContent.split('\n');
    const COLLAPSE_THRESHOLD = UI_CONFIG.diffScreen.collapseThreshold;
    const COLLAPSE_SHOW_LINES = UI_CONFIG.diffScreen.collapseShowLines;

    const renderContent = () => {
        if (!isExpanded && lines.length > COLLAPSE_THRESHOLD) {
            const topLines = lines.slice(0, COLLAPSE_SHOW_LINES);
            const bottomLines = lines.slice(lines.length - COLLAPSE_SHOW_LINES);
            const hiddenLines = lines.length - (COLLAPSE_SHOW_LINES * 2);

            return (
                <>
                    {topLines.map((line, i) => renderLine(line, i))}
                    <Text color="gray">... {hiddenLines} lines hidden ...</Text>
                    {bottomLines.map((line, i) => renderLine(line, i + topLines.length + 1))}
                </>
            );
        }
        // Handle vertical scrolling for expanded view
        if (isExpanded && maxHeight) {
            const visibleLines = lines.slice(scrollIndex, scrollIndex + maxHeight);
            return visibleLines.map((line, i) => renderLine(line, scrollIndex + i));
        }
        return lines.map((line, i) => renderLine(line, i));
    };

    const renderLine = (line: string, key: number) => {
        let color = 'white';
        if (line.startsWith('+')) color = 'green';
        if (line.startsWith('-')) color = 'red';
        if (line.startsWith('@@')) color = 'cyan';
        return <Text key={key} color={color}>{line}</Text>;
    };

    return (
        <Box flexDirection="column">
            <Text>DIFF: {filePath}</Text>
            <Box flexDirection="column" marginTop={1}>
                {renderContent()}
            </Box>
        </Box>
    );
};

export default DiffScreen;