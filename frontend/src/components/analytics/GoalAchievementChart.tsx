import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
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

interface GoalAchievementProps {
    data: {
        goal_statistics: Array<{
            category: string;
            total_goals: number;
            completed_goals: number;
            completion_rate: number;
            average_match_score: number;
        }>;
        completion_times: Array<{
            category: string;
            average_days: number;
        }>;
    };
}

export const GoalAchievementChart: React.FC<GoalAchievementProps> = ({ data }) => {
    const combinedData = data.goal_statistics.map(stat => ({
        category: stat.category,
        'Completion Rate': stat.completion_rate,
        'Avg Match Score': stat.average_match_score * 100,
        'Avg Days': data.completion_times.find(t => t.category === stat.category)?.average_days || 0
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Goal Achievement Analysis
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={combinedData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="Completion Rate"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="Avg Match Score"
                                    stroke="#82ca9d"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="Avg Days"
                                    stroke="#ffc658"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};