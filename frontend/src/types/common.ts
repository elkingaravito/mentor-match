export interface LoadingState {
  isLoading: boolean;
  isInitialLoad: boolean;
}

export interface ErrorState {
  error: string | null;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterParams {
  search?: string;
  dateRange?: DateRange;
  status?: string[];
  type?: string[];
  [key: string]: any;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}