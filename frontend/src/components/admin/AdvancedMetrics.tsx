import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Tooltip,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    Tooltip as RechartsTooltip,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    RemoveCircle,
    Info as InfoIcon,
    MoreVert as MoreVertIcon,
    FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { 
    MetricsResponse, 
    TimeGranularity,
    MetricValue,
    TimeSeriesPoint 
} from '../../types/metrics';
import { useMetrics } from '../../hooks/useMetrics';

const formatValue = (value: number, type: 'number' | 'percentage' | 'currency' | 'duration') => {
    switch (type) {
        case 'percentage':
            return `${value.toFixed(1)}%`;
        case 'currency':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value);
        case 'duration':
            return `${Math.floor(value / 60)}h ${value % 60}m`;
        default:
            return new Intl.NumberFormat().format(value);
    }
};

const TrendIndicator: React.FC<{ value: MetricValue }> = ({ value }) => (
    <Box display="flex" alignItems="center" gap={0.5}>
        {value.direction === 'up' ? (
            <TrendingUp color="success" />
        ) : value.direction === 'down' ? (
            <TrendingDown color="error" />
        ) : (
            <RemoveCircle color="info" />
        )}
        <Typography
            variant="caption"
            color={
                value.direction === 'up' ? 'success.main' :
                value.direction === 'down' ? 'error.main' :
                'info.main'
            }
        >
            {value.trend > 0 ? '+' : ''}{value.trend}%
        </Typography>
    </Box>
);

const MetricCard: React.FC<{
    title: string;
    value: MetricValue;
    type: 'number' | 'percentage' | 'currency' | 'duration';
    description?: string;
}> = ({ title, value, type, description }) => (
    <Card>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle2" color="textSecondary">
                    {title}
                </Typography>
                {description && (
                    <Tooltip title={description}>
                        <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                )}
            </Box>
            <Box mt={2}>
                <Typography variant="h4">
                    {formatValue(value.current, type)}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TrendIndicator value={value} />
                    <Typography variant="caption" color="textSecondary">
                        vs previous period
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const TimeSeriesChart: React.FC<{
    data: TimeSeriesPoint[];
    title: string;
    color: string;
}> = ({ data, title, color }) => (
    <Box height={300}>
        <Typography variant="subtitle1" gutterBottom>
            {title}
        </Typography>
        <ResponsiveContainer>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                />
                <YAxis />
                <RechartsTooltip
                    formatter={(value: number) => [
                        new Intl.NumberFormat().format(value),
                        title
                    ]}
                    labelFormatter={(label) => format(parseISO(label), 'PPP')}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                />
            </AreaChart>
        </ResponsiveContainer>
    </Box>
);

export const AdvancedMetrics: React.FC = () => {
    const [timeRange, setTimeRange] = useState<[Date | null, Date | null]>([null, null]);
    const [granularity, setGranularity] = useState<TimeGranularity>('day');
    const { metrics, loading, error, fetchMetrics, exportMetrics } = useMetrics();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
        await exportMetrics(format, {
            startDate: timeRange[0]?.toISOString() || '',
            endDate: timeRange[1]?.toISOString() || '',
            granularity,
        });
        setMenuAnchor(null);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Platform Metrics</Typography>
                <Box display="flex" gap={2}>
                    <DateRangePicker
                        value={timeRange}
                        onChange={setTimeRange}
                    />
                    <ToggleButtonGroup
                        value={granularity}
                        exclusive
                        onChange={(_, value) => value && setGranularity(value)}
                        size="small"
                    >
                        <ToggleButton value="day">Day</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                    </ToggleButtonGroup>
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem onClick={() => handleExport('csv')}>
                    <DownloadIcon sx={{ mr: 1 }} /> Export CSV
                </MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>
                    <DownloadIcon sx={{ mr: 1 }} /> Export PDF
                </MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>
                    <DownloadIcon sx={{ mr: 1 }} /> Export Excel
                </MenuItem>
            </Menu>

            <Grid container spacing={3}>
                {/* Mentorship Metrics */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Mentorship Performance
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Active Mentors"
                                value={metrics?.mentorship.activeMentors}
                                type="number"
                                description="Number of mentors with at least one active session"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Mentor Retention"
                                value={metrics?.mentorship.mentorRetentionRate}
                                type="percentage"
                                description="Percentage of mentors active for more than 3 months"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Average Match Quality"
                                value={metrics?.mentorship.averageMatchQuality}
                                type="percentage"
                                description="Average compatibility score of active matches"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Sessions per Mentor"
                                value={metrics?.mentorship.averageSessionsPerMentor}
                                type="number"
                                description="Average number of sessions per active mentor"
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Session Metrics */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Session Analytics
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <TimeSeriesChart
                                data={metrics?.sessions.timeSeriesData.sessionsOverTime || []}
                                title="Sessions Over Time"
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Session Summary
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Completion Rate
                                            </Typography>
                                            <Typography variant="h4">
                                                {formatValue(
                                                    metrics?.sessions.sessionCompletionRate.current || 0,
                                                    'percentage'
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Average Duration
                                            </Typography>
                                            <Typography variant="h4">
                                                {formatValue(
                                                    metrics?.sessions.averageSessionDuration.current || 0,
                                                    'duration'
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Average Rating
                                            </Typography>
                                            <Typography variant="h4">
                                                {(metrics?.sessions.averageRating.current || 0).toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Revenue Metrics */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Revenue Analytics
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Total Revenue"
                                value={metrics?.revenue.totalRevenue}
                                type="currency"
                                description="Total revenue in the selected period"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Revenue per User"
                                value={metrics?.revenue.averageRevenuePerUser}
                                type="currency"
                                description="Average revenue per active user"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Subscription Growth"
                                value={metrics?.revenue.subscriptionGrowth}
                                type="percentage"
                                description="Month-over-month subscription growth rate"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <MetricCard
                                title="Churn Rate"
                                value={metrics?.revenue.churnRate}
                                type="percentage"
                                description="Monthly user churn rate"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};