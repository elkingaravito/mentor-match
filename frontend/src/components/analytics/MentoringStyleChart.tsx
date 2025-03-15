import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface MentoringStyleProps {
    data: Array<{
        style: string;
        successful_sessions: number;
        average_match_score: number;
        average_rating: number;
    }>;
}

export const MentoringStyleChart: React.FC<MentoringStyleProps> = ({ data }) => {
    const formattedData = data.map(item => ({
        style: item.style,
        'Success Rate': (item.successful_sessions / Math.max(...data.map(d => d.successful_sessions))) * 100,
        'Match Score': item.average_match_score * 100,
        'Rating': item.average_rating * 20 // Convert 5-star rating to percentage
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Mentoring Style Effectiveness
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={formattedData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="style" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                            name="Success Rate"
                            dataKey="Success Rate"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                        />
                        <Radar
                            name="Match Score"
                            dataKey="Match Score"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.6}
                        />
                        <Radar
                            name="Rating"
                            dataKey="Rating"
                            stroke="#ffc658"
                            fill="#ffc658"
                            fillOpacity={0.6}
                        />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};