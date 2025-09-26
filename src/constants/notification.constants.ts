import type { ActionItem } from '../types/actions.types';
import type { NotificationType } from '../types/notification.types';

export const NOTIFICATION_DEFAULT_DURATION = 5; // seconds

export const NOTIFICATION_FOOTER_ACTIONS: readonly ActionItem[] = [
    { key: 'Enter/Esc', label: 'Dismiss' },
] as const;

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { color: string; title: string }> = {
    success: { color: 'green', title: '✓ SUCCESS' },
    error: { color: 'red', title: '✗ ERROR' },
    info: { color: 'blue', title: 'ℹ INFO' },
    warning: { color: 'yellow', title: '⚠ WARNING' },
};