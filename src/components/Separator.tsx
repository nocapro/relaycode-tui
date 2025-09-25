import React from 'react';
import {Text} from 'ink';
import { useStdoutDimensions } from '../utils';

const Separator = ({ width: propWidth }: { width?: number }) => {
	const [columns] = useStdoutDimensions();
	const width = propWidth ?? columns;
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;