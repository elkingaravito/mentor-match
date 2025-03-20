import { ExportService } from '../exportService';
import { saveAs } from 'file-saver';
import { ActivityMetrics, ActivityTrends } from '../activityAnalytics';
import { SessionActivity } from '../sessionActivity';

jest.mock('file-saver');

describe('ExportService', () => {
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
        }
    ];

    const mockMetrics: ActivityMetrics = {
        totalActivities: 1,
        byType: { code: 1 },
        resolutionRate: 1,
        averageResponseTime: 0,
        topTags: [{ tag: 'react', count: 1 }],
        activityTimeline: [],
        participationMetrics: {
            mentorContributions: 1,
            menteeContributions: 0,
            interactionRatio: 1
        }
    };

    const mockTrends: ActivityTrends = {
        weeklyActivity: [],
        typeDistribution: [],
        tagTrends: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('exports as JSON correctly', async () => {
        await ExportService.exportSessionData(1, mockActivities, mockMetrics, mockTrends, {
            type: 'json',
            includeActivities: true,
            includeMetrics: true
        });

        expect(saveAs).toHaveBeenCalledWith(
            expect.any(Blob),
            'session-1-export.json'
        );

        const blob = (saveAs as jest.Mock).mock.calls[0][0];
        const content = await new Response(blob).json();
        
        expect(content).toHaveProperty('activities');
        expect(content).toHaveProperty('metrics');
        expect(content.sessionId).toBe(1);
    });

    it('exports as CSV correctly', async () => {
        await ExportService.exportSessionData(1, mockActivities, mockMetrics, mockTrends, {
            type: 'csv',
            includeActivities: true
        });

        expect(saveAs).toHaveBeenCalledWith(
            expect.any(Blob),
            'session-1-export.csv'
        );

        const blob = (saveAs as jest.Mock).mock.calls[0][0];
        const content = await new Response(blob).text();
        
        expect(content).toContain('timestamp,type,content,status,tags');
        expect(content).toContain('Test code');
    });

    it('exports as Markdown correctly', async () => {
        await ExportService.exportSessionData(1, mockActivities, mockMetrics, mockTrends, {
            type: 'markdown',
            includeActivities: true,
            includeMetrics: true
        });

        expect(saveAs).toHaveBeenCalledWith(
            expect.any(Blob),
            'session-1-export.md'
        );

        const blob = (saveAs as jest.Mock).mock.calls[0][0];
        const content = await new Response(blob).text();
        
        expect(content).toContain('# Session 1 Export');
        expect(content).toContain('## Metrics');
        expect(content).toContain('## Activities');
    });

    it('handles export errors correctly', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        (saveAs as jest.Mock).mockImplementation(() => {
            throw new Error('Export failed');
        });

        await expect(
            ExportService.exportSessionData(1, mockActivities, mockMetrics, mockTrends, {
                type: 'json',
                includeActivities: true
            })
        ).rejects.toThrow('Export failed');

        consoleSpy.mockRestore();
    });
});