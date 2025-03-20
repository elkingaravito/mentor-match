import { SessionActivity } from './sessionActivity';

export interface ImportFormat {
    type: 'json' | 'csv' | 'markdown';
    validateData?: boolean;
    mergeStrategy?: 'replace' | 'append' | 'merge';
}

export interface ImportResult {
    activities: SessionActivity[];
    stats: {
        total: number;
        imported: number;
        skipped: number;
        errors: string[];
    };
}

export class ImportService {
    static async importSessionData(
        file: File,
        format: ImportFormat
    ): Promise<ImportResult> {
        try {
            const content = await this.readFile(file);
            const activities = await this.parseContent(content, format.type);
            
            if (format.validateData) {
                this.validateActivities(activities);
            }

            return {
                activities,
                stats: {
                    total: activities.length,
                    imported: activities.length,
                    skipped: 0,
                    errors: []
                }
            };
        } catch (error) {
            throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private static async readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    private static async parseContent(
        content: string,
        format: ImportFormat['type']
    ): Promise<SessionActivity[]> {
        switch (format) {
            case 'json':
                return this.parseJson(content);
            case 'csv':
                return this.parseCsv(content);
            case 'markdown':
                return this.parseMarkdown(content);
            default:
                throw new Error(`Unsupported import format: ${format}`);
        }
    }

    private static parseJson(content: string): SessionActivity[] {
        const data = JSON.parse(content);
        return Array.isArray(data.activities) ? data.activities : [data];
    }

    private static parseCsv(content: string): SessionActivity[] {
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                const values = line.split(',');
                const activity: Partial<SessionActivity> = {};
                
                headers.forEach((header, index) => {
                    const value = values[index]?.trim();
                    switch (header) {
                        case 'timestamp':
                            activity.timestamp = value;
                            break;
                        case 'type':
                            activity.type = value as SessionActivity['type'];
                            break;
                        case 'content':
                            activity.content = value.replace(/^"|"$/g, '').replace(/""/g, '"');
                            break;
                        case 'tags':
                            activity.metadata = {
                                ...activity.metadata,
                                tags: value ? value.split(';') : []
                            };
                            break;
                        case 'status':
                            activity.metadata = {
                                ...activity.metadata,
                                status: value as 'pending' | 'resolved'
                            };
                            break;
                    }
                });

                return activity as SessionActivity;
            });
    }

    private static parseMarkdown(content: string): SessionActivity[] {
        const activities: SessionActivity[] = [];
        const sections = content.split('###').slice(1);

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const [typeAndTimestamp, ...contentLines] = lines;
            
            const [type, timestamp] = typeAndTimestamp.split(' - ');
            const content = contentLines
                .filter(line => !line.startsWith('Tags:') && !line.startsWith('Status:'))
                .join('\n')
                .trim();

            const tagsLine = contentLines.find(line => line.startsWith('Tags:'));
            const statusLine = contentLines.find(line => line.startsWith('Status:'));

            const tags = tagsLine
                ? tagsLine.replace('Tags:', '').trim().split(',').map(t => t.trim())
                : [];
            const status = statusLine
                ? statusLine.replace('Status:', '').trim() as 'pending' | 'resolved'
                : 'pending';

            activities.push({
                type: type.trim().toLowerCase() as SessionActivity['type'],
                timestamp: new Date(timestamp.trim()).toISOString(),
                content,
                userId: 0, // This will need to be set by the application
                metadata: {
                    tags,
                    status
                }
            });
        });

        return activities;
    }

    private static validateActivities(activities: SessionActivity[]): void {
        const errors: string[] = [];

        activities.forEach((activity, index) => {
            if (!activity.type) {
                errors.push(`Activity ${index + 1}: Missing type`);
            }
            if (!activity.content) {
                errors.push(`Activity ${index + 1}: Missing content`);
            }
            if (!activity.timestamp || isNaN(new Date(activity.timestamp).getTime())) {
                errors.push(`Activity ${index + 1}: Invalid timestamp`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Validation failed:\n${errors.join('\n')}`);
        }
    }
}