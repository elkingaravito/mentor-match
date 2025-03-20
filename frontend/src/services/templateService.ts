import { SessionActivity } from './sessionActivity';
import { ActivityMetrics } from './activityAnalytics';

export interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    format: 'json' | 'csv' | 'markdown' | 'pdf';
    sections: TemplateSection[];
    transformations: DataTransformation[];
    metadata?: {
        author?: string;
        version?: string;
        tags?: string[];
        lastModified?: string;
    };
}

export interface TemplateSection {
    type: 'activities' | 'metrics' | 'summary' | 'custom';
    title?: string;
    fields: string[];
    filter?: (item: any) => boolean;
    transform?: (item: any) => any;
    format?: {
        dateFormat?: string;
        numberFormat?: string;
        layout?: 'table' | 'list' | 'grid';
    };
}

export interface DataTransformation {
    type: 'filter' | 'sort' | 'group' | 'aggregate' | 'format';
    field?: string;
    operation: string;
    options?: Record<string, any>;
}

export class TemplateService {
    private static readonly DEFAULT_TEMPLATES: ExportTemplate[] = [
        {
            id: 'detailed-report',
            name: 'Detailed Session Report',
            description: 'Complete session report with activities and metrics',
            format: 'pdf',
            sections: [
                {
                    type: 'summary',
                    title: 'Session Overview',
                    fields: ['duration', 'participantCount', 'activityCount'],
                    format: {
                        dateFormat: 'MMMM dd, yyyy HH:mm'
                    }
                },
                {
                    type: 'metrics',
                    title: 'Session Metrics',
                    fields: ['resolutionRate', 'averageResponseTime', 'participationBalance'],
                    format: {
                        numberFormat: '0.0%'
                    }
                },
                {
                    type: 'activities',
                    title: 'Session Activities',
                    fields: ['timestamp', 'type', 'content', 'status'],
                    format: {
                        layout: 'table'
                    }
                }
            ],
            transformations: [
                {
                    type: 'sort',
                    field: 'timestamp',
                    operation: 'desc'
                }
            ]
        },
        {
            id: 'activity-summary',
            name: 'Activity Summary',
            description: 'Condensed summary of session activities',
            format: 'markdown',
            sections: [
                {
                    type: 'custom',
                    title: 'Key Takeaways',
                    fields: ['objectives', 'outcomes', 'nextSteps'],
                    format: {
                        layout: 'list'
                    }
                },
                {
                    type: 'activities',
                    title: 'Important Activities',
                    fields: ['type', 'content'],
                    filter: (activity: SessionActivity) => 
                        activity.metadata?.tags?.includes('important') || false,
                    format: {
                        layout: 'list'
                    }
                }
            ],
            transformations: [
                {
                    type: 'group',
                    field: 'type',
                    operation: 'group'
                }
            ]
        }
    ];

    static getTemplates(): ExportTemplate[] {
        const customTemplates = this.loadCustomTemplates();
        return [...this.DEFAULT_TEMPLATES, ...customTemplates];
    }

    static getTemplate(id: string): ExportTemplate | undefined {
        return this.getTemplates().find(template => template.id === id);
    }

    static async applyTemplate(
        template: ExportTemplate,
        activities: SessionActivity[],
        metrics: ActivityMetrics
    ): Promise<string> {
        // Apply transformations
        let transformedActivities = this.applyTransformations(
            activities,
            template.transformations
        );

        // Generate content based on template format
        switch (template.format) {
            case 'json':
                return this.generateJsonContent(template, transformedActivities, metrics);
            case 'csv':
                return this.generateCsvContent(template, transformedActivities, metrics);
            case 'markdown':
                return this.generateMarkdownContent(template, transformedActivities, metrics);
            case 'pdf':
                return this.generatePdfContent(template, transformedActivities, metrics);
            default:
                throw new Error(`Unsupported template format: ${template.format}`);
        }
    }

    private static applyTransformations(
        activities: SessionActivity[],
        transformations: DataTransformation[]
    ): SessionActivity[] {
        return transformations.reduce((result, transformation) => {
            switch (transformation.type) {
                case 'filter':
                    return this.applyFilter(result, transformation);
                case 'sort':
                    return this.applySort(result, transformation);
                case 'group':
                    return this.applyGroup(result, transformation);
                case 'aggregate':
                    return this.applyAggregate(result, transformation);
                case 'format':
                    return this.applyFormat(result, transformation);
                default:
                    return result;
            }
        }, [...activities]);
    }

    private static applyFilter(
        activities: SessionActivity[],
        transformation: DataTransformation
    ): SessionActivity[] {
        const { field, operation, options } = transformation;
        if (!field) return activities;

        return activities.filter(activity => {
            const value = this.getFieldValue(activity, field);
            switch (operation) {
                case 'equals':
                    return value === options?.value;
                case 'contains':
                    return String(value).includes(String(options?.value));
                case 'greaterThan':
                    return value > options?.value;
                case 'lessThan':
                    return value < options?.value;
                default:
                    return true;
            }
        });
    }

    private static applySort(
        activities: SessionActivity[],
        transformation: DataTransformation
    ): SessionActivity[] {
        const { field, operation } = transformation;
        if (!field) return activities;

        return [...activities].sort((a, b) => {
            const valueA = this.getFieldValue(a, field);
            const valueB = this.getFieldValue(b, field);
            const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            return operation === 'desc' ? -comparison : comparison;
        });
    }

    private static applyGroup(
        activities: SessionActivity[],
        transformation: DataTransformation
    ): SessionActivity[] {
        const { field } = transformation;
        if (!field) return activities;

        const groups = activities.reduce((acc, activity) => {
            const value = this.getFieldValue(activity, field);
            if (!acc[value]) acc[value] = [];
            acc[value].push(activity);
            return acc;
        }, {} as Record<string, SessionActivity[]>);

        return Object.values(groups).flat();
    }

    private static applyAggregate(
        activities: SessionActivity[],
        transformation: DataTransformation
    ): SessionActivity[] {
        // Implementation for aggregation transformations
        return activities;
    }

    private static applyFormat(
        activities: SessionActivity[],
        transformation: DataTransformation
    ): SessionActivity[] {
        // Implementation for formatting transformations
        return activities;
    }

    private static getFieldValue(activity: SessionActivity, field: string): any {
        const fields = field.split('.');
        return fields.reduce((obj, key) => obj?.[key], activity);
    }

    private static loadCustomTemplates(): ExportTemplate[] {
        try {
            const templates = localStorage.getItem('customTemplates');
            return templates ? JSON.parse(templates) : [];
        } catch {
            return [];
        }
    }

    private static async generateJsonContent(
        template: ExportTemplate,
        activities: SessionActivity[],
        metrics: ActivityMetrics
    ): Promise<string> {
        const content: Record<string, any> = {
            metadata: {
                templateId: template.id,
                generatedAt: new Date().toISOString(),
                ...template.metadata
            }
        };

        template.sections.forEach(section => {
            switch (section.type) {
                case 'activities':
                    content.activities = activities.map(activity =>
                        this.formatFields(activity, section.fields, section.format)
                    );
                    break;
                case 'metrics':
                    content.metrics = this.formatFields(metrics, section.fields, section.format);
                    break;
                case 'summary':
                    content.summary = this.generateSummary(activities, metrics, section);
                    break;
                case 'custom':
                    content[section.title?.toLowerCase() || 'custom'] = 
                        this.generateCustomSection(activities, metrics, section);
                    break;
            }
        });

        return JSON.stringify(content, null, 2);
    }

    private static generateCsvContent(
        template: ExportTemplate,
        activities: SessionActivity[],
        metrics: ActivityMetrics
    ): Promise<string> {
        // Implementation for CSV generation
        return Promise.resolve('');
    }

    private static generateMarkdownContent(
        template: ExportTemplate,
        activities: SessionActivity[],
        metrics: ActivityMetrics
    ): Promise<string> {
        // Implementation for Markdown generation
        return Promise.resolve('');
    }

    private static generatePdfContent(
        template: ExportTemplate,
        activities: SessionActivity[],
        metrics: ActivityMetrics
    ): Promise<string> {
        // Implementation for PDF generation
        return Promise.resolve('');
    }

    private static formatFields(
        data: any,
        fields: string[],
        format?: TemplateSection['format']
    ): any {
        // Implementation for field formatting
        return data;
    }

    private static generateSummary(
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        section: TemplateSection
    ): any {
        // Implementation for summary generation
        return {};
    }

    private static generateCustomSection(
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        section: TemplateSection
    ): any {
        // Implementation for custom section generation
        return {};
    }
}