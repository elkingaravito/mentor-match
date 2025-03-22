// Common Types
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid' | 'calendar';

// Utility Types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type AsyncState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
};

// Date Range Type
export interface DateRange {
    start: Date;
    end: Date;
}

// Pagination Type
export interface PaginationState {
    page: number;
    limit: number;
    total: number;
}

// Filter Type
export interface FilterState {
    search: string;
    status: string[];
    dateRange?: DateRange;
    tags: string[];
    [key: string]: any;
}

// Theme Types
export interface Theme {
    mode: 'light' | 'dark' | 'system';
    primary: string;
    secondary: string;
    background: {
        default: string;
        paper: string;
    };
    text: {
        primary: string;
        secondary: string;
    };
}

// Application State Type
export interface AppState {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

// Loading State Type
export interface LoadingState {
    [key: string]: boolean;
}

// Error State Type
export interface ErrorState {
    [key: string]: string | null;
}