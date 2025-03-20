import { SessionActivity } from './sessionActivity';

export interface ActivityMetrics {
    totalActivities: number;
    byType: Record<string, number>;
    resolutionRate: number;
    averageResponseTime: number;
    topTags: Array<{ tag: string; count: number }>;
    activityTimeline: Array<{ hour: number; count: number }>;
    participationMetrics: {
        mentorContributions: number;
        menteeContributions: number;
        interactionRatio: number;
    };
}

export interface ActivityTrends {
    weeklyActivity: Array<{ date: string; count: number }>;
    typeDistribution: Array<{ type: string; percentage: number }>;
    tagTrends: Array<{ tag: string; trend: number }>;
}

export class ActivityAnalytics {
    static calculateMetrics(activities: SessionActivity[]): ActivityMetrics {
        const byType: Record<string, number> = {};
        const tagCounts = new Map<string, number>();
        const hourCounts = new Array(24).fill(0);
        let resolvedCount = 0;
        let totalResponseTime = 0;
        let responseCount = 0;
        let mentorActivities = 0;
        let menteeActivities = 0;

        activities.forEach(activity => {
            // Count by type
            byType[activity.type] = (byType[activity.type] || 0) + 1;

            // Count tags
            activity.metadata?.tags?.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });

            // Count by hour
            const hour = new Date(activity.timestamp).getHours();
            hourCounts[hour]++;

            // Resolution metrics
            if (activity.metadata?.status === 'resolved') {
                resolvedCount++;
                if (activity.metadata.resolvedAt) {
                    const responseTime = new Date(activity.metadata.resolvedAt).getTime() -
                        new Date(activity.timestamp).getTime();
                    totalResponseTime += responseTime;
                    responseCount++;
                }
            }

            // Participation metrics
            if (activity.metadata?.role === 'mentor') {
                mentorActivities++;
            } else if (activity.metadata?.role === 'mentee') {
                menteeActivities++;
            }
        });

        const topTags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));

        return {
            totalActivities: activities.length,
            byType,
            resolutionRate: activities.length ? resolvedCount / activities.length : 0,
            averageResponseTime: responseCount ? totalResponseTime / responseCount : 0,
            topTags,
            activityTimeline: hourCounts.map((count, hour) => ({ hour, count })),
            participationMetrics: {
                mentorContributions: mentorActivities,
                menteeContributions: menteeActivities,
                interactionRatio: mentorActivities + menteeActivities > 0 ?
                    mentorActivities / (mentorActivities + menteeActivities) : 0
            }
        };
    }

    static analyzeTrends(activities: SessionActivity[]): ActivityTrends {
        // Weekly activity
        const weeklyActivity = this.calculateWeeklyActivity(activities);

        // Type distribution
        const typeDistribution = this.calculateTypeDistribution(activities);

        // Tag trends
        const tagTrends = this.calculateTagTrends(activities);

        return {
            weeklyActivity,
            typeDistribution,
            tagTrends
        };
    }

    private static calculateWeeklyActivity(activities: SessionActivity[]) {
        const weekMap = new Map<string, number>();
        const now = new Date();
        const pastWeek = new Array(7).fill(0).map((_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        pastWeek.forEach(date => weekMap.set(date, 0));

        activities.forEach(activity => {
            const date = activity.timestamp.split('T')[0];
            if (weekMap.has(date)) {
                weekMap.set(date, (weekMap.get(date) || 0) + 1);
            }
        });

        return Array.from(weekMap.entries()).map(([date, count]) => ({ date, count }));
    }

    private static calculateTypeDistribution(activities: SessionActivity[]) {
        const typeCounts = new Map<string, number>();
        activities.forEach(activity => {
            typeCounts.set(activity.type, (typeCounts.get(activity.type) || 0) + 1);
        });

        return Array.from(typeCounts.entries()).map(([type, count]) => ({
            type,
            percentage: activities.length ? count / activities.length * 100 : 0
        }));
    }

    private static calculateTagTrends(activities: SessionActivity[]) {
        const recentTagCounts = new Map<string, number>();
        const oldTagCounts = new Map<string, number>();
        const midpoint = new Date(activities[Math.floor(activities.length / 2)]?.timestamp || '');

        activities.forEach(activity => {
            const tagMap = new Date(activity.timestamp) > midpoint ? recentTagCounts : oldTagCounts;
            activity.metadata?.tags?.forEach(tag => {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            });
        });

        const trends = new Map<string, number>();
        recentTagCounts.forEach((count, tag) => {
            const oldCount = oldTagCounts.get(tag) || 0;
            const trend = oldCount > 0 ? (count - oldCount) / oldCount : 1;
            trends.set(tag, trend);
        });

        return Array.from(trends.entries())
            .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
            .slice(0, 5)
            .map(([tag, trend]) => ({ tag, trend }));
    }
}