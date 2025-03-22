import { useState, useCallback } from 'react';
import { 
    MetricsResponse, 
    MetricsFilter 
} from '../types/metrics';

export const useMetrics = () => {
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async (filters: MetricsFilter) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }

            const data: MetricsResponse = await response.json();
            setMetrics(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching metrics');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportMetrics = useCallback(async (
        format: 'csv' | 'pdf' | 'excel',
        filters: MetricsFilter
    ) => {
        try {
            const response = await fetch(`/api/admin/metrics/export/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            if (!response.ok) {
                throw new Error('Failed to export metrics');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metrics_report_${new Date().toISOString()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error exporting metrics');
        }
    }, []);

    return {
        metrics,
        loading,
        error,
        fetchMetrics,
        exportMetrics,
    };
};