import React from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    IconButton, 
    Box,
    Skeleton,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useGetSessionTrendsQuery } from '../../services/api';
import { TrendStatistics } from '../../types';

interface ChartData {
    name: string;
    sessions: number;
    completionRate: number;
}

const CHART_PERIODS = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' }
];

export const SessionTrendsChart: React.FC = () => {
    const [period, setPeriod] = React.useState(30);
    
    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch
    } = useGetSessionTrendsQuery({ days: period });

    const trends = response?.data;

    const formatChartData = (trends: TrendStatistics): ChartData[] => {
        return trends.by_day.map(day => ({
            name: new Date(day.day).toLocaleDateString(),
            sessions: day.count,
            completionRate: trends.completion_rate
        }));
    };

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => refetch()}
                            >
                                <RefreshIcon />
                            </IconButton>
                        }
                    >
                        {error instanceof Error ? error.message : 'Failed to load trends'}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Session Trends"
                action={
                    <FormControl variant="outlined" size="small">
                        <InputLabel>Period</InputLabel>
                        <Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as number)}
                            label="Period"
                        >
                            {CHART_PERIODS.map(({ value, label }) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                }
            />
            <CardContent>
                <Box sx={{ width: '100%', height: 300 }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height={300} />
                    ) : trends ? (
                        <ResponsiveContainer>
                            <LineChart
                                data={formatChartData(trends)}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name"
                                    tick={{ fill: '#666' }}
                                    tickLine={{ stroke: '#666' }}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    tick={{ fill: '#666' }}
                                    tickLine={{ stroke: '#666' }}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 100]}
                                    tick={{ fill: '#666' }}
                                    tickLine={{ stroke: '#666' }}
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="#8884d8"
                                    name="Sessions"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="completionRate"
                                    stroke="#82ca9d"
                                    name="Completion Rate (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : null}
                </Box>
            </CardContent>
        </Card>
    );
};