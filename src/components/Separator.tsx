import {Text} from 'ink';
import { useDimensions } from '../contexts/DimensionsContext';

const Separator = ({ width: propWidth }: { width?: number }) => {
	const { columns } = useDimensions();
	const width = propWidth ?? columns;
	return <Text>{'─'.repeat(width)}</Text>;
};

export default Separator;