import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchOptions {
  initialValue?: string;
  debounceTime?: number;
  minLength?: number;
  maxHistory?: number;
  onSearch?: (value: string) => void;
}

export const useSearch = ({
  initialValue = '',
  debounceTime = 300,
  minLength = 2,
  maxHistory = 5,
  onSearch,
}: UseSearchOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem('searchHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);

  // Persistir historial de búsqueda
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Manejar cambios en el término de búsqueda
  useEffect(() => {
    if (debouncedSearchTerm.length >= minLength) {
      setIsSearching(true);
      onSearch?.(debouncedSearchTerm);
    }
    setIsSearching(false);
  }, [debouncedSearchTerm, minLength, onSearch]);

  const handleSearch = useCallback((term: string) => {
    if (term.length >= minLength) {
      // Actualizar historial
      setSearchHistory(prev => {
        const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, maxHistory);
        return newHistory;
      });
      onSearch?.(term);
    }
  }, [minLength, maxHistory, onSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    searchHistory,
    handleSearch,
    clearSearch,
    clearHistory,
  };
};