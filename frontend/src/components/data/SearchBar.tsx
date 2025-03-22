import React, { useState, useCallback, useRef } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Popper,
  Box,
  Chip,
  Typography,
  useTheme,
  Fade,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestion {
  type: 'recent' | 'trending' | 'filter';
  value: string;
  label?: string;
  count?: number;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  loading?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
  maxSuggestions?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder = 'Search...',
  loading = false,
  showHistory = true,
  showTrending = true,
  maxSuggestions = 5,
}) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch(value);
      setFocused(false);
    }
  };

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    onSearch(suggestion.value);
    setFocused(false);
  }, [onChange, onSearch]);

  const renderSuggestions = () => {
    const recentSearches = showHistory
      ? suggestions.filter(s => s.type === 'recent').slice(0, maxSuggestions)
      : [];
    
    const trendingSearches = showTrending
      ? suggestions.filter(s => s.type === 'trending').slice(0, maxSuggestions)
      : [];

    const filterSuggestions = suggestions.filter(s => s.type === 'filter');

    return (
      <Box sx={{ p: 2 }}>
        {filterSuggestions.length > 0 && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Filters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filterSuggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion.label || suggestion.value}
                    onClick={() => handleSuggestionClick(suggestion)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {recentSearches.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recent Searches
            </Typography>
            {recentSearches.map((suggestion, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <HistoryIcon sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2">{suggestion.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {trendingSearches.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Trending
            </Typography>
            {trendingSearches.map((suggestion, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">{suggestion.value}</Typography>
                </Box>
                {suggestion.count && (
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.count} searches
                  </Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  };

  return (
    <Box ref={anchorRef}>
      <Paper
        component={motion.div}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          border: focused ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
          transition: 'border-color 0.2s ease',
        }}
      >
        <IconButton sx={{ p: '10px' }}>
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyPress={handleKeyPress}
        />
        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <IconButton sx={{ p: '10px' }} onClick={handleClear}>
                <CloseIcon />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      <Popper
        open={focused && (suggestions.length > 0 || loading)}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        style={{ width: anchorRef.current?.clientWidth, zIndex: theme.zIndex.modal }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={3}
              sx={{
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                renderSuggestions()
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};