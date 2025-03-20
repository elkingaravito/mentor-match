import { useMemo, useState, useCallback } from 'react';
import { SessionActivity } from '../services/sessionActivity';
import { ActivityFilters } from '../components/session/ActivityFilters';

export const useActivityFilters = (activities: SessionActivity[] = []) => {
    const [filters, setFilters] = useState<ActivityFilters>({
        search: '',
        types: [],
        status: null,
        tags: [],
        dateRange: null
    });

    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        activities.forEach(activity => {
            activity.metadata?.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [activities]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            // Type filter
            if (filters.types.length > 0 && !filters.types.includes(activity.type)) {
                return false;
            }

            // Status filter
            if (filters.status && activity.metadata?.status !== filters.status) {
                return false;
            }

            // Tag filter
            if (filters.tags.length > 0) {
                const activityTags = activity.metadata?.tags || [];
                if (!filters.tags.some(tag => activityTags.includes(tag))) {
                    return false;
                }
            }

            // Date range filter
            if (filters.dateRange) {
                const activityDate = new Date(activity.timestamp);
                if (
                    activityDate < filters.dateRange.start ||
                    activityDate > filters.dateRange.end
                ) {
                    return false;
                }
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const contentLower = activity.content.toLowerCase();
                const tagsLower = activity.metadata?.tags?.map(t => t.toLowerCase()) || [];
                
                return (
                    contentLower.includes(searchLower) ||
                    tagsLower.some(tag => tag.includes(searchLower))
                );
            }

            return true;
        });
    }, [activities, filters]);

    const handleFiltersChange = useCallback((newFilters: ActivityFilters) => {
        setFilters(newFilters);
    }, []);

    return {
        filters,
        setFilters: handleFiltersChange,
        filteredActivities,
        availableTags
    };
};