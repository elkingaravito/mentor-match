import { ActivityOrganizer } from '../activityOrganizer';
import { SessionActivity } from '../sessionActivity';

describe('ActivityOrganizer', () => {
    const mockActivities: SessionActivity[] = [
        {
            type: 'code',
            content: 'Test code',
            timestamp: '2024-02-29T10:00:00Z',
            userId: 1,
            metadata: {
                status: 'resolved',
                tags: ['react']
            }
        },
        {
            type: 'question',
            content: 'Test question',
            timestamp: '2024-02-29T09:00:00Z',
            userId: 2,
            metadata: {
                status: 'pending',
                tags: ['typescript']
            }
        }
    ];

    describe('sortActivities', () => {
        it('sorts by timestamp', () => {
            const sorted = ActivityOrganizer.sortActivities(mockActivities, 'timestamp', 'asc');
            expect(sorted[0].timestamp).toBe('2024-02-29T09:00:00Z');
            expect(sorted[1].timestamp).toBe('2024-02-29T10:00:00Z');
        });

        it('sorts by type', () => {
            const sorted = ActivityOrganizer.sortActivities(mockActivities, 'type', 'asc');
            expect(sorted[0].type).toBe('code');
            expect(sorted[1].type).toBe('question');
        });

        it('sorts by status', () => {
            const sorted = ActivityOrganizer.sortActivities(mockActivities, 'status', 'asc');
            expect(sorted[0].metadata?.status).toBe('pending');
            expect(sorted[1].metadata?.status).toBe('resolved');
        });
    });

    describe('groupActivities', () => {
        it('groups by type', () => {
            const grouped = ActivityOrganizer.groupActivities(mockActivities, 'type');
            expect(grouped).toHaveLength(2);
            expect(grouped[0].key).toBe('code');
            expect(grouped[1].key).toBe('question');
        });

        it('groups by status', () => {
            const grouped = ActivityOrganizer.groupActivities(mockActivities, 'status');
            expect(grouped).toHaveLength(2);
            expect(grouped[0].key).toBe('resolved');
            expect(grouped[1].key).toBe('pending');
        });

        it('groups by tags', () => {
            const grouped = ActivityOrganizer.groupActivities(mockActivities, 'tags');
            expect(grouped).toHaveLength(2);
            expect(grouped[0].key).toBe('react');
            expect(grouped[1].key).toBe('typescript');
        });

        it('includes metadata in groups', () => {
            const grouped = ActivityOrganizer.groupActivities(mockActivities, 'type');
            expect(grouped[0].metadata).toEqual({
                count: 1,
                resolvedCount: 1
            });
        });
    });
});