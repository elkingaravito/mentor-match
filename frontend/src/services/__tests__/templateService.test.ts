import { TemplateService } from '../templateService';
import { SessionActivity } from '../sessionActivity';
import { ActivityMetrics } from '../activityAnalytics';

describe('TemplateService', () => {
    const mockActivities: SessionActivity[] = [
        {
            type: 'code',
            content: 'Test code',
            timestamp: '2024-02-29T10:00:00Z',
            userId: 1,
            metadata: {
                status: 'resolved',
                tags: ['important', 'react']
            }
        },
        {
            type: 'question',
            content: 'Test question',
            timestamp: '2024-02-29T09:00:00Z',
            userId: 2,
            metadata: {
                status: 'pending',
                tags: ['react']
            }
        }
    ];

    const mockMetrics: ActivityMetrics = {
        totalActivities: 2,
        byType: { code: 1, question: 1 },
        resolutionRate: 0.5,
        averageResponseTime: 0,
        topTags: [{ tag: 'react', count: 2 }],
        activityTimeline: [],
        participationMetrics: {
            mentorContributions: 1,
            menteeContributions: 1,
            interactionRatio: 0.5
        }
    };

    describe('getTemplates', () => {
        it('returns default templates', () => {
            const templates = TemplateService.getTemplates();
            expect(templates).toHaveLength(2);
            expect(templates[0].id).toBe('detailed-report');
            expect(templates[1].id).toBe('activity-summary');
        });
    });

    describe('applyTemplate', () => {
        it('applies detailed report template correctly', async () => {
            const template = TemplateService.getTemplate('detailed-report');
            if (!template) throw new Error('Template not found');

            const result = await TemplateService.applyTemplate(
                template,
                mockActivities,
                mockMetrics
            );

            const content = JSON.parse(result);
            expect(content).toHaveProperty('metadata');
            expect(content).toHaveProperty('activities');
            expect(content).toHaveProperty('metrics');
        });

        it('applies activity summary template correctly', async () => {
            const template = TemplateService.getTemplate('activity-summary');
            if (!template) throw new Error('Template not found');

            const result = await TemplateService.applyTemplate(
                template,
                mockActivities,
                mockMetrics
            );

            const content = JSON.parse(result);
            expect(content.activities).toHaveLength(1);
            expect(content.activities[0].metadata.tags).toContain('important');
        });
    });

    describe('transformations', () => {
        it('applies filter transformation correctly', () => {
            const transformation = {
                type: 'filter' as const,
                field: 'type',
                operation: 'equals',
                options: { value: 'code' }
            };

            const result = TemplateService['applyFilter'](mockActivities, transformation);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe('code');
        });

        it('applies sort transformation correctly', () => {
            const transformation = {
                type: 'sort' as const,
                field: 'timestamp',
                operation: 'asc'
            };

            const result = TemplateService['applySort'](mockActivities, transformation);
            expect(result[0].timestamp).toBe('2024-02-29T09:00:00Z');
        });

        it('applies group transformation correctly', () => {
            const transformation = {
                type: 'group' as const,
                field: 'type',
                operation: 'group'
            };

            const result = TemplateService['applyGroup'](mockActivities, transformation);
            expect(result).toHaveLength(2);
        });
    });
});