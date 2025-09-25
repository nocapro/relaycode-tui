import React from 'react';
import {Text} from 'ink';

const Separator = ({ width }: { width: number }) => {
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;