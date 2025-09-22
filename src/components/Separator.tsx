import React from 'react';
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = () => {
	const [columns] = useStdoutDimensions();
	return <Text>{'─'.repeat(columns || 80)}</Text>;
};

export default Separator;