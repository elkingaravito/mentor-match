import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Grid,
    Typography,
    Tooltip,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useTheme
} from '@mui/material';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { ConflictMetrics, ConflictPrediction } from '../../services/conflictAnalytics';

interface ConflictAnalyticsProps {
    metrics: ConflictMetrics;
    prediction?: ConflictPrediction;
    loading?: boolean;
    error?: string;
}

export const ConflictAnalytics: React.FC<ConflictAnalyticsProps> = ({
    metrics,
    prediction,
    loading,
    error
}) => {
    const theme = useTheme();
    const [timeRange, setTimeRange] = useState('24h');

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                    Conflict Analytics
                </Typography>
                <FormControl size="small" sx={{ width: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        label="Time Range"
                    >
                        <MenuItem value="24h">Last 24h</MenuItem>
                        <MenuItem value="7d">Last 7 days</MenuItem>
                        <MenuItem value="30d">Last 30 days</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Overview Cards */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Conflicts
                            </Typography>
                            <Typography variant="h4">
                                {metrics.total}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Typography variant="caption" color="success.main">
                                    {metrics.resolved} resolved
                                </Typography>
                                <Typography variant="caption" color="error.main">
                                    {metrics.pending} pending
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Resolution Rate
                            </Typography>
                            <Typography variant="h4">
                                {((metrics.resolved / metrics.total) * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Avg. {formatDistanceToNow(new Date(metrics.averageResolutionTime))}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {prediction && (
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Conflict Risk
                                </Typography>
                                <Typography
                                    variant="h4"
                                    color={
                                        prediction.risk === 'high' ? 'error.main' :
                                        prediction.risk === 'medium' ? 'warning.main' :
                                        'success.main'
                                    }
                                >
                                    {prediction.risk.toUpperCase()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(prediction.probability * 100).toFixed(1)}% probability
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Resolution Types Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Resolution Types" />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(metrics.resolutionTypes).map(([type, count]) => ({
                                            type,
                                            value: count
                                        }))}
                                        dataKey="value"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {Object.entries(metrics.resolutionTypes).map((entry, index) => (
                                            <Cell key={entry[0]} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Time Distribution Chart */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Conflict Distribution" />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics.timeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hour"
                                        tickFormatter={(hour) => `${hour}:00`}
                                    />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="conflicts"
                                        stroke={theme.palette.primary.main}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Hotspots */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Conflict Hotspots" />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics.hotspots}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="section" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar
                                        dataKey="conflicts"
                                        fill={theme.palette.primary.main}
                                    >
                                        {metrics.hotspots.map((entry, index) => (
                                            <Cell
                                                key={entry.section}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* User Impact */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="User Impact" />
                        <CardContent>
                            <Box sx={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Conflicts</th>
                                            <th>Resolutions</th>
                                            <th>Approval Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.userImpact.map((user) => (
                                            <tr key={user.userId}>
                                                <td>{user.userName}</td>
                                                <td>{user.conflictsInvolved}</td>
                                                <td>{user.resolutionsProposed}</td>
                                                <td>
                                                    {(user.averageApprovalRate * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recommendations */}
                {prediction && prediction.recommendations.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Recommendations" />
                            <CardContent>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {prediction.recommendations.map((recommendation, index) => (
                                        <Typography
                                            key={index}
                                            component="li"
                                            variant="body2"
                                            sx={{ mb: 1 }}
                                        >
                                            {recommendation}
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};