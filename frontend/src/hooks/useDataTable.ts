import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseDataTableOptions<T> {
  defaultSort?: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  defaultFilters?: Record<string, any>;
  defaultPage?: number;
  defaultRowsPerPage?: number;
  persistState?: boolean;
}

export function useDataTable<T>({
  defaultSort,
  defaultFilters = {},
  defaultPage = 0,
  defaultRowsPerPage = 10,
  persistState = true,
}: UseDataTableOptions<T> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado local
  const [page, setPage] = useState(() => {
    if (persistState) {
      const storedPage = searchParams.get('page');
      return storedPage ? parseInt(storedPage, 10) : defaultPage;
    }
    return defaultPage;
  });

  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (persistState) {
      const storedRowsPerPage = searchParams.get('rowsPerPage');
      return storedRowsPerPage ? parseInt(storedRowsPerPage, 10) : defaultRowsPerPage;
    }
    return defaultRowsPerPage;
  });

  const [orderBy, setOrderBy] = useState(() => {
    if (persistState && defaultSort) {
      const storedOrderBy = searchParams.get('orderBy');
      return storedOrderBy || defaultSort.field.toString();
    }
    return defaultSort?.field.toString() || '';
  });

  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>(() => {
    if (persistState && defaultSort) {
      const storedDirection = searchParams.get('orderDirection') as 'asc' | 'desc';
      return storedDirection || defaultSort.direction;
    }
    return defaultSort?.direction || 'asc';
  });

  const [filters, setFilters] = useState(() => {
    if (persistState) {
      const storedFilters = searchParams.get('filters');
      return storedFilters ? JSON.parse(storedFilters) : defaultFilters;
    }
    return defaultFilters;
  });

  const [selected, setSelected] = useState<string[]>([]);

  // Persistir estado en URL
  useEffect(() => {
    if (persistState) {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      params.set('rowsPerPage', rowsPerPage.toString());
      if (orderBy) params.set('orderBy', orderBy);
      if (orderDirection) params.set('orderDirection', orderDirection);
      params.set('filters', JSON.stringify(filters));
      setSearchParams(params);
    }
  }, [page, rowsPerPage, orderBy, orderDirection, filters, persistState]);

  // Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelected([]);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setSelected([]);
  }, []);

  const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setOrderBy(field);
    setOrderDirection(direction);
  }, []);

  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(0);
    setSelected([]);
  }, []);

  const handleSelectionChange = useCallback((newSelected: string[]) => {
    setSelected(newSelected);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(0);
    setSelected([]);
  }, [defaultFilters]);

  return {
    // Estado
    page,
    rowsPerPage,
    orderBy,
    orderDirection,
    filters,
    selected,

    // Handlers
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
    onSort: handleSort,
    onFilterChange: handleFilterChange,
    onSelectionChange: handleSelectionChange,
    clearFilters,

    // Helpers
    getQueryParams: () => ({
      page,
      limit: rowsPerPage,
      orderBy,
      orderDirection,
      ...filters,
    }),
  };
}