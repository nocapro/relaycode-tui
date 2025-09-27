import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Separator from '../Separator';
import { useViewStore } from '../../stores/view.store';
import { useDashboardStore } from '../../stores/dashboard.store';
import { DASHBOARD_STATUS } from '../../constants/dashboard.constants';

interface ScreenLayoutProps {
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
    contextInfo?: string;
}

const ScreenLayout = ({ title, footer, children, contextInfo }: ScreenLayoutProps) => {
    const headerStatus = useViewStore(s => s.headerStatus);
    const dashboardStatus = useDashboardStore(s => s.status);
    const [visibleStatus, setVisibleStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!headerStatus) return;

        setVisibleStatus(headerStatus.message);

        const timer = setTimeout(() => {
            setVisibleStatus(null);
        }, 2000);

        return () => clearTimeout(timer);
    }, [headerStatus]);

    const isListening = dashboardStatus === DASHBOARD_STATUS.LISTENING;

    return (
        <Box flexDirection="column" flexGrow={1}>
            <Box flexDirection="row">
                <Text bold color="black" backgroundColor="yellow"> ▲ relaycode · {title} </Text>
                <Box flexGrow={1} />
                {contextInfo && <Text color="gray">{contextInfo} </Text>}
                <Text color={isListening ? 'green' : 'yellow'}> {isListening ? '●' : '||'} </Text>
                {visibleStatus && <Text color="yellow" bold> · {visibleStatus}</Text>}
            </Box>
            <Separator />
            <Box flexDirection="column" flexGrow={1} marginY={1}>
                {children}
            </Box>
            <Separator />
            <Box>
                {footer}
            </Box>
        </Box>
    );
};

export default ScreenLayout;