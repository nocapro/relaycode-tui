import React, { useState, useEffect } from 'react';
import {Text} from 'ink';

const useStdoutDimensions = () => {
	const [dimensions, setDimensions] = useState({ columns: 80, rows: 24 });

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				columns: process.stdout.columns || 80,
				rows: process.stdout.rows || 24,
			});
		};

		updateDimensions();
		process.stdout.on('resize', updateDimensions);

		return () => {
			process.stdout.off('resize', updateDimensions);
		};
	}, []);

	return [dimensions.columns, dimensions.rows];
};

const Separator = () => {
	const [columns] = useStdoutDimensions();
	return <Text>{'─'.repeat(columns || 80)}</Text>;
};

export default Separator;