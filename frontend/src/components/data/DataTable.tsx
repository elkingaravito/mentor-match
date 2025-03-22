import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TableRowSkeleton } from '../feedback/Skeletons';
import NoResults from '../feedback/empty-states/NoResults';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  rowsPerPage: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  loading?: boolean;
  selectable?: boolean;
  selected?: string[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSort?: (orderBy: string, orderDirection: 'asc' | 'desc') => void;
  onSelectionChange?: (selected: string[]) => void;
  onRefresh?: () => void;
  onFilterClick?: () => void;
  getRowId: (row: T) => string;
  rowActions?: (row: T) => React.ReactNode[];
  toolbarActions?: React.ReactNode[];
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  rowsPerPage,
  orderBy,
  orderDirection = 'asc',
  loading = false,
  selectable = false,
  selected = [],
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onSelectionChange,
  onRefresh,
  onFilterClick,
  getRowId,
  rowActions,
  toolbarActions,
  emptyState,
}: DataTableProps<T>) {
  const theme = useTheme();

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (event.target.checked) {
        onSelectionChange(data.map(getRowId));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (id: string) => {
    if (onSelectionChange) {
      const selectedIndex = selected.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }

      onSelectionChange(newSelected);
    }
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={selected.length > 0 && selected.length < data.length}
              checked={data.length > 0 && selected.length === data.length}
              onChange={handleSelectAll}
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.id.toString()}
            align={column.align}
            style={{ width: column.width }}
          >
            {column.sortable && onSort ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? orderDirection : 'asc'}
                onClick={() => onSort(
                  column.id.toString(),
                  orderBy === column.id && orderDirection === 'asc' ? 'desc' : 'asc'
                )}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
        {rowActions && <TableCell align="right" />}
      </TableRow>
    </TableHead>
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableBody>
          {Array(rowsPerPage).fill(0).map((_, index) => (
            <TableRow key={index}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={20} height={20} />
                </TableCell>
              )}
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  <TableRowSkeleton columns={1} />
                </TableCell>
              ))}
              {rowActions && <TableCell />}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (data.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
              align="center"
            >
              {emptyState || (
                <NoResults
                  variant="compact"
                  onAction={onRefresh}
                />
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        <AnimatePresence>
          {data.map((row, index) => (
            <motion.tr
              key={getRowId(row)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.indexOf(getRowId(row)) !== -1}
                    onChange={() => handleSelectRow(getRowId(row))}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id.toString()}
                  align={column.align}
                >
                  {column.render ? column.render(row) : row[column.id as keyof T]}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {rowActions(row)}
                  </Box>
                </TableCell>
              )}
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    );
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" component="div">
          {selected.length > 0 ? (
            `${selected.length} selected`
          ) : (
            'Data Table'
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {toolbarActions}
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter list">
            <IconButton onClick={onFilterClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More actions">
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table stickyHeader>
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
      />
    </Paper>
  );
}