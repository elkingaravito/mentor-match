import { saveAs } from 'file-saver';
import { ActivityMetrics, ActivityTrends } from './activityAnalytics';
import { SessionActivity } from './sessionActivity';

export interface ExportFormat {
    type: 'json' | 'csv' | 'pdf' | 'markdown';
    includeMetrics?: boolean;
    includeTrends?: boolean;
    includeActivities?: boolean;
}

export class ExportService {
    static async exportSessionData(
        sessionId: number,
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        trends: ActivityTrends,
        format: ExportFormat
    ) {
        switch (format.type) {
            case 'json':
                return this.exportAsJson(sessionId, activities, metrics, trends, format);
            case 'csv':
                return this.exportAsCsv(sessionId, activities, metrics, trends, format);
            case 'markdown':
                return this.exportAsMarkdown(sessionId, activities, metrics, trends, format);
            case 'pdf':
                return this.exportAsPdf(sessionId, activities, metrics, trends, format);
            default:
                throw new Error(`Unsupported export format: ${format.type}`);
        }
    }

    private static async exportAsJson(
        sessionId: number,
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        trends: ActivityTrends,
        format: ExportFormat
    ) {
        const data: any = {
            sessionId,
            exportedAt: new Date().toISOString()
        };

        if (format.includeActivities) {
            data.activities = activities;
        }
        if (format.includeMetrics) {
            data.metrics = metrics;
        }
        if (format.includeTrends) {
            data.trends = trends;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        saveAs(blob, `session-${sessionId}-export.json`);
    }

    private static async exportAsCsv(
        sessionId: number,
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        trends: ActivityTrends,
        format: ExportFormat
    ) {
        const rows: string[] = ['timestamp,type,content,status,tags'];

        activities.forEach(activity => {
            const row = [
                activity.timestamp,
                activity.type,
                `"${activity.content.replace(/"/g, '""')}"`,
                activity.metadata?.status || '',
                (activity.metadata?.tags || []).join(';')
            ];
            rows.push(row.join(','));
        });

        if (format.includeMetrics) {
            rows.push('');
            rows.push('Metrics Summary');
            rows.push(`Total Activities,${metrics.totalActivities}`);
            rows.push(`Resolution Rate,${(metrics.resolutionRate * 100).toFixed(1)}%`);
            rows.push(`Average Response Time,${metrics.averageResponseTime}ms`);
        }

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `session-${sessionId}-export.csv`);
    }

    private static async exportAsMarkdown(
        sessionId: number,
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        trends: ActivityTrends,
        format: ExportFormat
    ) {
        let markdown = `# Session ${sessionId} Export\n\n`;
        markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

        if (format.includeMetrics) {
            markdown += '## Metrics\n\n';
            markdown += `- Total Activities: ${metrics.totalActivities}\n`;
            markdown += `- Resolution Rate: ${(metrics.resolutionRate * 100).toFixed(1)}%\n`;
            markdown += `- Average Response Time: ${metrics.averageResponseTime}ms\n\n`;
            
            markdown += '### Top Tags\n\n';
            metrics.topTags.forEach(({ tag, count }) => {
                markdown += `- ${tag}: ${count}\n`;
            });
            markdown += '\n';
        }

        if (format.includeActivities) {
            markdown += '## Activities\n\n';
            activities.forEach(activity => {
                markdown += `### ${activity.type} - ${new Date(activity.timestamp).toLocaleString()}\n\n`;
                markdown += `${activity.content}\n\n`;
                if (activity.metadata?.tags?.length) {
                    markdown += `Tags: ${activity.metadata.tags.join(', ')}\n`;
                }
                markdown += `Status: ${activity.metadata?.status || 'N/A'}\n\n`;
            });
        }

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `session-${sessionId}-export.md`);
    }

    private static async exportAsPdf(
        sessionId: number,
        activities: SessionActivity[],
        metrics: ActivityMetrics,
        trends: ActivityTrends,
        format: ExportFormat
    ) {
        // Using jsPDF for PDF generation
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        let y = 20;
        const lineHeight = 10;

        // Title
        doc.setFontSize(16);
        doc.text(`Session ${sessionId} Export`, 20, y);
        y += lineHeight * 2;

        if (format.includeMetrics) {
            doc.setFontSize(14);
            doc.text('Metrics', 20, y);
            y += lineHeight;

            doc.setFontSize(12);
            doc.text(`Total Activities: ${metrics.totalActivities}`, 30, y);
            y += lineHeight;
            doc.text(`Resolution Rate: ${(metrics.resolutionRate * 100).toFixed(1)}%`, 30, y);
            y += lineHeight;
            doc.text(`Average Response Time: ${metrics.averageResponseTime}ms`, 30, y);
            y += lineHeight * 2;
        }

        if (format.includeActivities) {
            doc.setFontSize(14);
            doc.text('Activities', 20, y);
            y += lineHeight;

            activities.forEach(activity => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(12);
                doc.text(`${activity.type} - ${new Date(activity.timestamp).toLocaleString()}`, 30, y);
                y += lineHeight;

                const contentLines = doc.splitTextToSize(activity.content, 150);
                contentLines.forEach((line: string) => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, 30, y);
                    y += lineHeight;
                });

                if (activity.metadata?.tags?.length) {
                    doc.text(`Tags: ${activity.metadata.tags.join(', ')}`, 30, y);
                    y += lineHeight;
                }

                y += lineHeight;
            });
        }

        doc.save(`session-${sessionId}-export.pdf`);
    }
}