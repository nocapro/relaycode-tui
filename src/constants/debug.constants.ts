import type { ActionItem } from '../types/actions.types';

export const DEBUG_MENU_FOOTER_ACTIONS: readonly ActionItem[] = [
    { key: '↑↓/PgUp/PgDn', label: 'Nav' },
    { key: '1-9,a-z', label: 'Jump' },
    { key: 'Enter', label: 'Select' },
    { key: 'Esc/Ctrl+B', label: 'Close' },
] as const;