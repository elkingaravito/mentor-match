import { SessionActivity } from './sessionActivity';

export type SortField = 'timestamp' | 'type' | 'status';
export type SortOrder = 'asc' | 'desc';
export type GroupBy = 'none' | 'type' | 'status' | 'date' | 'tags';

export interface ActivityGroup {
    key: string;
    label: string;
    activities: SessionActivity[];
    metadata?: {
        count: number;
        resolvedCount?: number;
        totalTime?: number;
    };
}

export class ActivityOrganizer {
    static sortActivities(
        activities: SessionActivity[],
        field: SortField,
        order: SortOrder
    ): SessionActivity[] {
        return [...activities].sort((a, b) => {
            let comparison = 0;
            
            switch (field) {
                case 'timestamp':
                    comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'status':
                    const statusA = a.metadata?.status || 'pending';
                    const statusB = b.metadata?.status || 'pending';
                    comparison = statusA.localeCompare(statusB);
                    break;
            }

            return order === 'asc' ? comparison : -comparison;
        });
    }

    static groupActivities(
        activities: SessionActivity[],
        groupBy: GroupBy
    ): ActivityGroup[] {
        if (groupBy === 'none') {
            return [{
                key: 'all',
                label: 'All Activities',
                activities,
                metadata: {
                    count: activities.length,
                    resolvedCount: activities.filter(a => a.metadata?.status === 'resolved').length
                }
            }];
        }

        const groups = new Map<string, ActivityGroup>();

        activities.forEach(activity => {
            let keys: string[] = [];

            switch (groupBy) {
                case 'type':
                    keys = [activity.type];
                    break;
                case 'status':
                    keys = [activity.metadata?.status || 'pending'];
                    break;
                case 'date':
                    keys = [this.getDateGroup(new Date(activity.timestamp))];
                    break;
                case 'tags':
                    keys = activity.metadata?.tags || ['untagged'];
                    break;
            }

            keys.forEach(key => {
                if (!groups.has(key)) {
                    groups.set(key, {
                        key,
                        label: this.getGroupLabel(key, groupBy),
                        activities: [],
                        metadata: {
                            count: 0,
                            resolvedCount: 0
                        }
                    });
                }

                const group = groups.get(key)!;
                group.activities.push(activity);
                group.metadata!.count++;
                if (activity.metadata?.status === 'resolved') {
                    group.metadata!.resolvedCount!++;
                }
            });
        });

        return Array.from(groups.values()).sort((a, b) => {
            if (groupBy === 'date') {
                return new Date(b.key).getTime() - new Date(a.key).getTime();
            }
            return b.metadata!.count - a.metadata!.count;
        });
    }

    private static getDateGroup(date: Date): string {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toISOString().split('T')[0];
        }
    }

    private static getGroupLabel(key: string, groupBy: GroupBy): string {
        switch (groupBy) {
            case 'type':
                return key.charAt(0).toUpperCase() + key.slice(1) + 's';
            case 'status':
                return key.charAt(0).toUpperCase() + key.slice(1);
            case 'date':
                return key;
            case 'tags':
                return key === 'untagged' ? 'Untagged' : `#${key}`;
            default:
                return key;
        }
    }
}