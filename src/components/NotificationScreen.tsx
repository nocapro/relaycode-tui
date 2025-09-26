import { Box, Text } from 'ink';
import { useNotificationScreen } from '../hooks/useNotificationScreen';
import ActionFooter from './ActionFooter';
import ModalLayout from './layout/ModalLayout';
import { NOTIFICATION_FOOTER_ACTIONS, NOTIFICATION_TYPE_CONFIG } from '../constants/notification.constants';

const NotificationScreen = () => {
    const { notification, countdown } = useNotificationScreen();

    if (!notification) {
        return null;
    }

    const config = NOTIFICATION_TYPE_CONFIG[notification.type];

    return (
        <ModalLayout>
            <Box paddingX={2} marginBottom={1} backgroundColor={config.color}>
                <Text bold color="black">{config.title}</Text>
            </Box>
            <Box paddingX={2}>
                <Text>{notification.message}</Text>
            </Box>
            <Box marginTop={1}>
                <Box paddingX={2}>
                    <Text color="gray">(Dismissing in {countdown}s...)</Text>
                </Box>
            </Box>
            <Box marginTop={1}>
                <ActionFooter actions={NOTIFICATION_FOOTER_ACTIONS} />
            </Box>
        </ModalLayout>
    );
};

export default NotificationScreen;