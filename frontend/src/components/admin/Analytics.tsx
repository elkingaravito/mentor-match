import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers';
import {
    TrendingUp,
    Group,
    Event,
    Assessment,
} from '@mui/icons-material';
import { StatCard } from './StatCard';
import { 
    TimeRange, 
    AnalyticsFilter, 
    AnalyticsData,
    MetricValue 
} from '../../types/analytics';

interface AnalyticsProps {
    data: AnalyticsData;
    onFilterChange: (filters: AnalyticsFilter) => void;
}

const formatMetric = (value: MetricValue, type: 'percentage' | 'number' | 'duration') => {
    const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
    const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    switch (type) {
        case 'percentage':
            return formatPercentage(value.current);
        case 'duration':
            return formatDuration(value.current);
        default:
            return formatNumber(value.current);
    }
};

const getTrendColor = (trend: number) => {
    if (trend > 0) return 'success';
    if (trend < 0) return 'error';
    return 'info';
};

export const Analytics: React.FC<AnalyticsProps> = ({
    data,
    onFilterChange,
}) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newRange: TimeRange) => {
        if (newRange !== null) {
            setTimeRange(newRange);
            onFilterChange({
                timeRange: newRange,
                ...(newRange === 'custom' && customDateRange[0] && customDateRange[1] && {
                    dateRange: {
                        startDate: customDateRange[0].toISOString(),
                        endDate: customDateRange[1].toISOString(),
                    },
                }),
            });
        }
    };

    const metrics = useMemo(() => [
        {
            title: 'Active Mentors',
            value: formatMetric(data.mentorship.activeMentors, 'number'),
            trend: data.mentorship.activeMentors.trend,
            icon: Group,
            color: getTrendColor(data.mentorship.activeMentors.trend),
        },
        {
            title: 'Session Completion Rate',
            value: formatMetric(data.sessions.completionRate, 'percentage'),
            trend: data.sessions.completionRate.trend,
            icon: Event,
            color: getTrendColor(data.sessions.completionRate.trend),
        },
        {
            title: 'Match Success Rate',
            value: formatMetric(data.matching.successfulMatches, 'percentage'),
            trend: data.matching.successfulMatches.trend,
            icon: Assessment,
            color: getTrendColor(data.matching.successfulMatches.trend),
        },
        {
            title: 'Avg. Session Duration',
            value: formatMetric(data.sessions.averageDuration, 'duration'),
            trend: data.sessions.averageDuration.trend,
            icon: TrendingUp,
            color: getTrendColor(data.sessions.averageDuration.trend),
        },
    ], [data]);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Analytics Dashboard</Typography>
                <Box display="flex" gap={2} alignItems="center">
                    <ToggleButtonGroup
                        value={timeRange}
                        exclusive
                        onChange={handleTimeRangeChange}
                        size="small"
                    >
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="quarter">Quarter</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                        <ToggleButton value="custom">Custom</ToggleButton>
                    </ToggleButtonGroup>

                    {timeRange === 'custom' && (
                        <Box display="flex" gap={1}>
                            <DatePicker
                                label="Start Date"
                                value={customDateRange[0]}
                                onChange={(date) => {
                                    setCustomDateRange([date, customDateRange[1]]);
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={customDateRange[1]}
                                onChange={(date) => {
                                    setCustomDateRange([customDateRange[0], date]);
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3} mb={4}>
                {metrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={3} key={metric.title}>
                        <StatCard
                            title={metric.title}
                            value={metric.value}
                            icon={metric.icon}
                            color={metric.color}
                            subtitle={`${metric.trend > 0 ? '+' : ''}${metric.trend}% vs previous period`}
                        />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Mentorship Activity Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data.trends.datasets}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="#8884d8"
                                    name="Sessions"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="matches"
                                    stroke="#82ca9d"
                                    name="Matches"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Success Metrics
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                {
                                    name: 'Mentor Retention',
                                    value: data.mentorship.mentorRetentionRate.current,
                                },
                                {
                                    name: 'Match Success',
                                    value: data.matching.successfulMatches.current,
                                },
                                {
                                    name: 'Session Completion',
                                    value: data.sessions.completionRate.current,
                                },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};