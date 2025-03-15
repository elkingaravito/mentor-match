import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { MatchingOverviewCard } from '../components/analytics/MatchingOverviewCard';
import { TopIndustriesChart } from '../components/analytics/TopIndustriesChart';
import { MentoringStyleChart } from '../components/analytics/MentoringStyleChart';
import { GoalAchievementChart } from '../components/analytics/GoalAchievementChart';
import { api } from '../services/api';

export const AnalyticsDashboard: React.FC = () => {
    const [filters, setFilters] = useState({
        dateRange: {
            start: null,
            end: null
        },
        industry: '',
        mentoringStyle: '',
        goalCategory: ''
    });
    const [overview, setOverview] = useState<any>(null);
    const [industries, setIndustries] = useState<any[]>([]);
    const [styles, setStyles] = useState<any[]>([]);
    const [goals, setGoals] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            dateRange: {
                start: null,
                end: null
            },
            industry: '',
            mentoringStyle: '',
            goalCategory: ''
        });
        fetchAnalytics();
    };

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        
        if (filters.dateRange.start) {
            params.append('start_date', filters.dateRange.start.toISOString());
        }
        if (filters.dateRange.end) {
            params.append('end_date', filters.dateRange.end.toISOString());
        }
        if (filters.industry) {
            params.append('industry', filters.industry);
        }
        if (filters.mentoringStyle) {
            params.append('mentoring_style', filters.mentoringStyle);
        }
        if (filters.goalCategory) {
            params.append('goal_category', filters.goalCategory);
        }

        return params.toString();
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const queryParams = buildQueryParams();
            
            const [
                overviewData,
                industriesData,
                stylesData,
                goalsData
            ] = await Promise.all([
                api.get(`/analytics/matching/overview?${queryParams}`),
                api.get(`/analytics/matching/top-industries?${queryParams}`),
                api.get(`/analytics/matching/style-effectiveness?${queryParams}`),
                api.get(`/analytics/matching/goal-achievement?${queryParams}`)
            ]);

            setOverview(overviewData.data);
            setIndustries(industriesData.data);
            setStyles(stylesData.data);
            setGoals(goalsData.data);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []); // Initial load

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography>Loading analytics...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Matching Analytics Dashboard
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <AnalyticsFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onApplyFilters={fetchAnalytics}
                            onResetFilters={handleResetFilters}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <ExportControls
                            filters={filters}
                            onExportStart={() => setLoading(true)}
                            onExportComplete={() => setLoading(false)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <ScheduledExportsManager />
                    </Grid>
                    <Grid item xs={12}>
                        <MatchingOverviewCard data={overview} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TopIndustriesChart data={industries} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <MentoringStyleChart data={styles} />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <GoalAchievementChart data={goals} />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default AnalyticsDashboard;
