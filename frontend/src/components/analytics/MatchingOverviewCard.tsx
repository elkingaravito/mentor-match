import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MatchingOverviewProps {
    data: {
        total_matches: number;
        average_scores: {
            overall: number;
            expertise: number;
            availability: number;
        };
        success_rate: number;
        period_days: number;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export const MatchingOverviewCard: React.FC<MatchingOverviewProps> = ({ data }) => {
    const pieData = [
        { name: 'Expertise', value: data.average_scores.expertise },
        { name: 'Availability', value: data.average_scores.availability },
        { name: 'Overall', value: data.average_scores.overall }
    ];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Matching Overview
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box textAlign="center">
                            <Typography variant="h4" color="primary">
                                {data.total_matches}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Matches (Last {data.period_days} days)
                            </Typography>
                        </Box>
                        <Box mt={2} textAlign="center">
                            <Typography variant="h4" color="secondary">
                                {data.success_rate}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Success Rate
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};