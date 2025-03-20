import React from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Grid,
    Typography,
    Tooltip,
    LinearProgress,
    useTheme
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { ActivityMetrics, ActivityTrends } from '../../services/activityAnalytics';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    progress?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, progress }) => (
    <Card>
        <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4">
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
            {progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>
            )}
        </CardContent>
    </Card>
);

interface ActivityAnalyticsProps {
    metrics: ActivityMetrics;
    trends: ActivityTrends;
}

export const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({
    metrics,
    trends
}) => {
    const theme = useTheme();

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Total Activities"
                        value={metrics.totalActivities}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Resolution Rate"
                        value={`${(metrics.resolutionRate * 100).toFixed(1)}%`}
                        progress={metrics.resolutionRate}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Avg. Response Time"
                        value={formatDistanceToNow(new Date(metrics.averageResponseTime), { addSuffix: false })}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Interaction Balance"
                        value={`${(metrics.participationMetrics.interactionRatio * 100).toFixed(1)}%`}
                        subtitle="Mentor participation"
                        progress={metrics.participationMetrics.interactionRatio}
                    />
                </Grid>

                {/* Activity Timeline */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader title="Activity Timeline" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={metrics.activityTimeline}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="hour"
                                            tickFormatter={(hour) => `${hour}:00`}
                                        />
                                        <YAxis />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke={theme.palette.primary.main}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Type Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader title="Activity Types" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={trends.typeDistribution}
                                            dataKey="percentage"
                                            nameKey="type"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                        >
                                            {trends.typeDistribution.map((entry, index) => (
                                                <Cell
                                                    key={entry.type}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tag Trends */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Tag Trends" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={metrics.topTags}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tag" />
                                        <YAxis />
                                        <Bar
                                            dataKey="count"
                                            fill={theme.palette.primary.main}
                                        >
                                            {metrics.topTags.map((entry, index) => (
                                                <Cell
                                                    key={entry.tag}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};