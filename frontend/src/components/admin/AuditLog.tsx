import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Chip,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert,
    Button,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { 
    AuditEvent, 
    AuditEventType, 
    AuditSeverity, 
    AuditFilter 
} from '../../types/audit';
import { useAuditLog } from '../../hooks/useAuditLog';

const getSeverityColor = (severity: AuditSeverity): string => {
    switch (severity) {
        case 'critical':
            return '#d32f2f';
        case 'error':
            return '#f44336';
        case 'warning':
            return '#ffa726';
        default:
            return '#2196f3';
    }
};

const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
        case 'critical':
        case 'error':
            return <ErrorIcon />;
        case 'warning':
            return <WarningIcon />;
        default:
            return <InfoIcon />;
    }
};

export const AuditLog: React.FC = () => {
    const [filters, setFilters] = useState<AuditFilter>({});
    const [searchTerm, setSearchTerm] = useState('');
    const { 
        events,
        loading,
        error,
        summary,
        fetchEvents,
        exportEvents 
    } = useAuditLog();

    const columns: GridColDef[] = [
        {
            field: 'severity',
            headerName: 'Severity',
            width: 120,
            renderCell: (params) => (
                <Chip
                    icon={getSeverityIcon(params.value)}
                    label={params.value}
                    size="small"
                    sx={{
                        backgroundColor: getSeverityColor(params.value),
                        color: 'white',
                    }}
                />
            ),
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            width: 180,
            valueFormatter: (params) => 
                format(new Date(params.value), 'yyyy-MM-dd HH:mm:ss'),
        },
        {
            field: 'type',
            headerName: 'Event Type',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value.replace(/_/g, ' ')}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'userEmail',
            headerName: 'User',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2">{params.value}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {params.row.userRole}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'ipAddress',
            headerName: 'IP Address',
            width: 130,
        },
        {
            field: 'details',
            headerName: 'Details',
            flex: 1,
            renderCell: (params) => (
                <Tooltip title={JSON.stringify(params.value, null, 2)}>
                    <Typography variant="body2" noWrap>
                        {JSON.stringify(params.value)}
                    </Typography>
                </Tooltip>
            ),
        },
    ];

    const handleExport = async (format: 'csv' | 'json') => {
        await exportEvents(format, filters);
    };

    const handleFilterChange = (newFilters: Partial<AuditFilter>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    event.userEmail?.toLowerCase().includes(searchLower) ||
                    event.ipAddress.toLowerCase().includes(searchLower) ||
                    JSON.stringify(event.details).toLowerCase().includes(searchLower)
                );
            }
            return true;
        });
    }, [events, searchTerm]);

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Audit Log</Typography>
                <Box display="flex" gap={1}>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                    >
                        Export CSV
                    </Button>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchEvents(filters)}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {summary && (
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={3}>
                        <Alert 
                            severity="error" 
                            icon={<SecurityIcon />}
                        >
                            {summary.criticalEvents} Critical Events
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Alert severity="warning">
                            {summary.warningEvents} Warnings
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Alert severity="info">
                            {summary.uniqueUsers} Unique Users
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Alert severity="info">
                            {summary.uniqueIPs} Unique IPs
                        </Alert>
                    </Grid>
                </Grid>
            )}

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />,
                    }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                        multiple
                        value={filters.types || []}
                        onChange={(e) => handleFilterChange({ 
                            types: e.target.value as AuditEventType[] 
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip 
                                        key={value} 
                                        label={value.replace(/_/g, ' ')} 
                                        size="small" 
                                    />
                                ))}
                            </Box>
                        )}
                    >
                        {Object.values(AuditEventType).map((type) => (
                            <MenuItem key={type} value={type}>
                                {type.replace(/_/g, ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Severity</InputLabel>
                    <Select
                        multiple
                        value={filters.severities || []}
                        onChange={(e) => handleFilterChange({ 
                            severities: e.target.value as AuditSeverity[] 
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip 
                                        key={value} 
                                        label={value} 
                                        size="small"
                                        sx={{
                                            backgroundColor: getSeverityColor(value),
                                            color: 'white',
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    >
                        {Object.values(AuditSeverity).map((severity) => (
                            <MenuItem key={severity} value={severity}>
                                {severity}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <DateTimePicker
                    label="Start Date"
                    value={filters.startDate ? new Date(filters.startDate) : null}
                    onChange={(date) => handleFilterChange({ 
                        startDate: date?.toISOString() 
                    })}
                />
                <DateTimePicker
                    label="End Date"
                    value={filters.endDate ? new Date(filters.endDate) : null}
                    onChange={(date) => handleFilterChange({ 
                        endDate: date?.toISOString() 
                    })}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <DataGrid
                rows={filteredEvents}
                columns={columns}
                loading={loading}
                autoHeight
                pagination
                disableSelectionOnClick
                getRowId={(row) => row.id}
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                    },
                }}
            />
        </Paper>
    );
};