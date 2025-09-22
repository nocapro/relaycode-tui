import React from 'react';
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string,
    scrollIndex?: number,
    visibleLinesCount?: number,
}

const ReasonScreen = ({ reasoning, scrollIndex = 0, visibleLinesCount = 10 }: ReasonScreenProps) => {
    const lines = reasoning.split('\n');
    const visibleLines = lines.slice(scrollIndex, scrollIndex + visibleLinesCount);

    return (
        <Box flexDirection="column">
            <Text>REASONING</Text>
            <Box flexDirection="column" marginTop={1}>
                {visibleLines.map((line, index) => <Text key={index}>{line}</Text>)}
            </Box>
        </Box>
    );
};

export default ReasonScreen;