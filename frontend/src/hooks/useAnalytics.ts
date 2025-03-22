import { useState, useCallback } from 'react';
import { 
    AnalyticsData, 
    AnalyticsFilter, 
    TimeRange,
    DateRange 
} from '../types/analytics';

export const useAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);

    const fetchAnalytics = useCallback(async (filters: AnalyticsFilter) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const analyticsData: AnalyticsData = await response.json();
            setData(analyticsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportAnalytics = useCallback(async (
        format: 'csv' | 'pdf' | 'excel',
        filters: AnalyticsFilter
    ) => {
        try {
            const response = await fetch(`/api/admin/analytics/export/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to export analytics data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_report.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error exporting analytics');
        }
    }, []);

    return {
        data,
        loading,
        error,
        fetchAnalytics,
        exportAnalytics,
    };
};