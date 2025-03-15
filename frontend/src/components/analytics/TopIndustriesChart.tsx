import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface TopIndustriesProps {
    data: Array<{
        industry: string;
        successful_matches: number;
        average_match_score: number;
    }>;
}

export const TopIndustriesChart: React.FC<TopIndustriesProps> = ({ data }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Top Industries by Matching Success
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="industry" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="successful_matches"
                            fill="#8884d8"
                            name="Successful Matches"
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="average_match_score"
                            fill="#82ca9d"
                            name="Avg Match Score"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};