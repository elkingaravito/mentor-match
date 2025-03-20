// Re-export all types
export * from './api';
export * from './matching';
export * from './session';
export * from './notification';

// Additional shared types
export interface Theme {
    mode: 'light' | 'dark';
    primary: string;
    secondary: string;
}

export interface UserPreferences {
    theme: Theme;
    notifications: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
    availability: {
        timezone: string;
        schedule: {
            [key: string]: {
                start: string;
                end: string;
            }[];
        };
    };
}

export interface AppState {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

// Utility types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type AsyncState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
};