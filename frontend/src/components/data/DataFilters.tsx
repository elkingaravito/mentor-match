import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';

export interface FilterConfig {
  id: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'boolean';
  label: string;
  options?: { value: string; label: string }[];
}

interface DataFiltersProps {
  open: boolean;
  filters: Record<string, any>;
  config: FilterConfig[];
  onClose: () => void;
  onChange: (filters: Record<string, any>) => void;
  onClear: () => void;
  onApply: () => void;
}

export const DataFilters: React.FC<DataFiltersProps> = ({
  open,
  filters,
  config,
  onClose,
  onChange,
  onClear,
  onApply,
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (id: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApply = () => {
    onChange(localFilters);
    onApply();
  };

  const renderFilterControl = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={filter.label}
            value={localFilters[filter.id] || ''}
            onChange={(e) => handleChange(filter.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={localFilters[filter.id] || ''}
              onChange={(e) => handleChange(filter.id, e.target.value)}
              label={filter.label}
            >
              <MenuItem value="">All</MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              multiple
              value={localFilters[filter.id] || []}
              onChange={(e) => handleChange(filter.id, e.target.value)}
              label={filter.label}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={filter.options?.find(opt => opt.value === value)?.label}
                      onDelete={() => {
                        const newValue = (localFilters[filter.id] || []).filter(
                          (v: string) => v !== value
                        );
                        handleChange(filter.id, newValue);
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <DatePicker
            label={filter.label}
            value={localFilters[filter.id] || null}
            onChange={(date) => handleChange(filter.id, date)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        );

      case 'dateRange':
        return (
          <Stack spacing={2}>
            <DatePicker
              label={`${filter.label} From`}
              value={localFilters[`${filter.id}From`] || null}
              onChange={(date) => handleChange(`${filter.id}From`, date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label={`${filter.label} To`}
              value={localFilters[`${filter.id}To`] || null}
              onChange={(date) => handleChange(`${filter.id}To`, date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Stack>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={localFilters[filter.id] || false}
                onChange={(e) => handleChange(filter.id, e.target.checked)}
              />
            }
            label={filter.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          {config.map((filter) => (
            <Box key={filter.id}>
              {renderFilterControl(filter)}
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<ClearIcon />}
            onClick={onClear}
            sx={{ flex: 1 }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{ flex: 1 }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};