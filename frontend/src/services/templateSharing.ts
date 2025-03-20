import { ExportTemplate } from './templateService';

export interface SharedTemplate extends ExportTemplate {
    shareId: string;
    owner: {
        id: string;
        name: string;
    };
    sharing: {
        accessLevel: 'public' | 'private' | 'organization';
        allowCopy: boolean;
        allowModify: boolean;
        expiresAt?: string;
    };
    version: {
        number: string;
        history: VersionHistory[];
        latest: boolean;
    };
    stats: {
        uses: number;
        copies: number;
        rating: number;
        reviews: number;
    };
}

export interface VersionHistory {
    number: string;
    createdAt: string;
    changes: string[];
    author: {
        id: string;
        name: string;
    };
}

export interface TemplateShareOptions {
    accessLevel: SharedTemplate['sharing']['accessLevel'];
    allowCopy: boolean;
    allowModify: boolean;
    expiresIn?: number; // hours
}

export class TemplateSharingService {
    private static readonly STORAGE_KEY = 'shared_templates';

    static async shareTemplate(
        template: ExportTemplate,
        options: TemplateShareOptions
    ): Promise<SharedTemplate> {
        const shareId = crypto.randomUUID();
        const sharedTemplate: SharedTemplate = {
            ...template,
            shareId,
            owner: {
                id: 'current-user', // Replace with actual user ID
                name: 'Current User' // Replace with actual user name
            },
            sharing: {
                ...options,
                expiresAt: options.expiresIn 
                    ? new Date(Date.now() + options.expiresIn * 3600000).toISOString()
                    : undefined
            },
            version: {
                number: '1.0.0',
                history: [{
                    number: '1.0.0',
                    createdAt: new Date().toISOString(),
                    changes: ['Initial version'],
                    author: {
                        id: 'current-user',
                        name: 'Current User'
                    }
                }],
                latest: true
            },
            stats: {
                uses: 0,
                copies: 0,
                rating: 0,
                reviews: 0
            }
        };

        await this.saveSharedTemplate(sharedTemplate);
        return sharedTemplate;
    }

    static async getSharedTemplate(shareId: string): Promise<SharedTemplate | null> {
        const templates = await this.getSharedTemplates();
        return templates.find(t => t.shareId === shareId) || null;
    }

    static async updateSharedTemplate(
        shareId: string,
        updates: Partial<ExportTemplate>,
        changes: string[]
    ): Promise<SharedTemplate> {
        const template = await this.getSharedTemplate(shareId);
        if (!template) {
            throw new Error('Template not found');
        }

        // Increment version number
        const [major, minor, patch] = template.version.number.split('.').map(Number);
        const newVersion = `${major}.${minor}.${patch + 1}`;

        const updatedTemplate: SharedTemplate = {
            ...template,
            ...updates,
            version: {
                number: newVersion,
                history: [
                    {
                        number: newVersion,
                        createdAt: new Date().toISOString(),
                        changes,
                        author: {
                            id: 'current-user',
                            name: 'Current User'
                        }
                    },
                    ...template.version.history
                ],
                latest: true
            }
        };

        await this.saveSharedTemplate(updatedTemplate);
        return updatedTemplate;
    }

    static async copyTemplate(shareId: string): Promise<ExportTemplate> {
        const template = await this.getSharedTemplate(shareId);
        if (!template) {
            throw new Error('Template not found');
        }

        if (!template.sharing.allowCopy) {
            throw new Error('Template copying is not allowed');
        }

        // Increment copy count
        template.stats.copies++;
        await this.saveSharedTemplate(template);

        // Create new template without sharing info
        const { shareId: _, owner: __, sharing: ___, version: ____, stats: _____, ...newTemplate } = template;
        return {
            ...newTemplate,
            id: crypto.randomUUID(),
            name: `Copy of ${template.name}`,
            metadata: {
                ...newTemplate.metadata,
                copiedFrom: shareId,
                copiedAt: new Date().toISOString()
            }
        };
    }

    static async searchSharedTemplates(
        query: string,
        filters?: {
            accessLevel?: SharedTemplate['sharing']['accessLevel'];
            sortBy?: 'uses' | 'rating' | 'copies';
            order?: 'asc' | 'desc';
        }
    ): Promise<SharedTemplate[]> {
        let templates = await this.getSharedTemplates();

        // Filter by access level
        if (filters?.accessLevel) {
            templates = templates.filter(t => t.sharing.accessLevel === filters.accessLevel);
        }

        // Filter by query
        if (query) {
            const searchQuery = query.toLowerCase();
            templates = templates.filter(t =>
                t.name.toLowerCase().includes(searchQuery) ||
                t.description.toLowerCase().includes(searchQuery) ||
                t.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
            );
        }

        // Sort results
        if (filters?.sortBy) {
            templates.sort((a, b) => {
                const valueA = a.stats[filters.sortBy!];
                const valueB = b.stats[filters.sortBy!];
                return filters.order === 'asc' ? valueA - valueB : valueB - valueA;
            });
        }

        return templates;
    }

    private static async getSharedTemplates(): Promise<SharedTemplate[]> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private static async saveSharedTemplate(template: SharedTemplate): Promise<void> {
        const templates = await this.getSharedTemplates();
        const index = templates.findIndex(t => t.shareId === template.shareId);
        
        if (index >= 0) {
            templates[index] = template;
        } else {
            templates.push(template);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    }
}