import type { APP_SCREENS } from '../constants/app.constants';

// --- UI / View-Specific Types ---

// app.store
type ObjectValues<T> = T[keyof T];

export type AppScreen = ObjectValues<typeof APP_SCREENS>;