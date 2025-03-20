import { ActivityAnalytics } from '../activityAnalytics';
import { SessionActivity } from '../sessionActivity';

describe('ActivityAnalytics', () => {
    const mockActivities: SessionActivity[] = [
        {
            type: 'code',
            content: 'Test code',
            timestamp: '2024-02-29T10:00:00Z',
            userId: 1,
            metadata: {
                status: 'resolved',
                resolvedAt: '2024-02-29T10:30:00Z',
                tags: ['react', 'typescript'],
                role: 'mentor'
            }
        },
        {
            type: 'question',
            content: 'Test question',
            timestamp: '2024-02-29T09:00:00Z',
            userId: 2,
            metadata: {
                status: 'pending',
                tags: ['react'],
                role: 'mentee'
            }
        }
    ];

    describe('calculateMetrics', () => {
        const metrics = ActivityAnalytics.calculateMetrics(mockActivities);

        it('calculates total activities correctly', () => {
            expect(metrics.totalActivities).toBe(2);
        });

        it('calculates activity by type correctly', () => {
            expect(metrics.byType).toEqual({
                code: 1,
                question: 1
            });
        });

        it('calculates resolution rate correctly', () => {
            expect(metrics.resolutionRate).toBe(0.5);
        });

        it('calculates average response time correctly', () => {
            expect(metrics.averageResponseTime).toBe(1800000); // 30 minutes in milliseconds
        });

        it('identifies top tags correctly', () => {
            expect(metrics.topTags).toEqual([
                { tag: 'react', count: 2 },
                { tag: 'typescript', count: 1 }
            ]);
        });

        it('calculates participation metrics correctly', () => {
            expect(metrics.participationMetrics).toEqual({
                mentorContributions: 1,
                menteeContributions: 1,
                interactionRatio: 0.5
            });
        });
    });

    describe('analyzeTrends', () => {
        const trends = ActivityAnalytics.analyzeTrends(mockActivities);

        it('calculates weekly activity correctly', () => {
            expect(trends.weeklyActivity).toHaveLength(7);
            expect(trends.weeklyActivity.some(day => day.count > 0)).toBe(true);
        });

        it('calculates type distribution correctly', () => {
            expect(trends.typeDistribution).toEqual([
                { type: 'code', percentage: 50 },
                { type: 'question', percentage: 50 }
            ]);
        });

        it('calculates tag trends correctly', () => {
            expect(trends.tagTrends.length).toBeGreaterThan(0);
            expect(trends.tagTrends[0]).toHaveProperty('tag');
            expect(trends.tagTrends[0]).toHaveProperty('trend');
        });
    });
});