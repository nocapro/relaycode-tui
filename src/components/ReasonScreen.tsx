import React from 'react';
import { Box, Text } from 'ink';

interface ReasonScreenProps {
    reasoning: string;
}

const ReasonScreen = ({ reasoning }: ReasonScreenProps) => {
    return (
        <Box flexDirection="column">
            <Text>REASONING</Text>
            <Box flexDirection="column" marginTop={1}>
                <Text>{reasoning}</Text>
            </Box>
        </Box>
    );
};

export default ReasonScreen;