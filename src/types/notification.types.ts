/**
 * The type of notification to display.
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * The data payload for a notification.
 */
export interface NotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    duration?: number; // in seconds
}