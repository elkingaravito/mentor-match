import { TemplateSharingService } from '../templateSharing';
import { ExportTemplate } from '../templateService';

describe('TemplateSharingService', () => {
    const mockTemplate: ExportTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test Description',
        format: 'json',
        sections: [],
        transformations: []
    };

    beforeEach(() => {
        localStorage.clear();
    });

    describe('shareTemplate', () => {
        it('creates a shared template with correct properties', async () => {
            const shareOptions = {
                accessLevel: 'public' as const,
                allowCopy: true,
                allowModify: false
            };

            const sharedTemplate = await TemplateSharingService.shareTemplate(
                mockTemplate,
                shareOptions
            );

            expect(sharedTemplate.shareId).toBeDefined();
            expect(sharedTemplate.sharing).toEqual({
                ...shareOptions,
                expiresAt: undefined
            });
            expect(sharedTemplate.version.number).toBe('1.0.0');
            expect(sharedTemplate.stats).toEqual({
                uses: 0,
                copies: 0,
                rating: 0,
                reviews: 0
            });
        });

        it('handles expiration time correctly', async () => {
            const shareOptions = {
                accessLevel: 'private' as const,
                allowCopy: true,
                allowModify: false,
                expiresIn: 24
            };

            const sharedTemplate = await TemplateSharingService.shareTemplate(
                mockTemplate,
                shareOptions
            );

            expect(sharedTemplate.sharing.expiresAt).toBeDefined();
            const expiresAt = new Date(sharedTemplate.sharing.expiresAt!);
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();
            expect(diff).toBeCloseTo(24 * 3600000, -2); // Within 100ms
        });
    });

    describe('updateSharedTemplate', () => {
        it('updates template and creates new version', async () => {
            const sharedTemplate = await TemplateSharingService.shareTemplate(
                mockTemplate,
                { accessLevel: 'public', allowCopy: true, allowModify: true }
            );

            const updates = {
                name: 'Updated Template',
                description: 'Updated Description'
            };

            const updatedTemplate = await TemplateSharingService.updateSharedTemplate(
                sharedTemplate.shareId,
                updates,
                ['Updated name and description']
            );

            expect(updatedTemplate.name).toBe('Updated Template');
            expect(updatedTemplate.version.number).toBe('1.0.1');
            expect(updatedTemplate.version.history).toHaveLength(2);
        });

        it('throws error for non-existent template', async () => {
            await expect(
                TemplateSharingService.updateSharedTemplate(
                    'non-existent',
                    { name: 'Updated' },
                    ['Update']
                )
            ).rejects.toThrow('Template not found');
        });
    });

    describe('copyTemplate', () => {
        it('creates a copy with new ID and increments copy count', async () => {
            const sharedTemplate = await TemplateSharingService.shareTemplate(
                mockTemplate,
                { accessLevel: 'public', allowCopy: true, allowModify: false }
            );

            const copiedTemplate = await TemplateSharingService.copyTemplate(
                sharedTemplate.shareId
            );

            expect(copiedTemplate.id).not.toBe(sharedTemplate.id);
            expect(copiedTemplate.name).toBe(`Copy of ${sharedTemplate.name}`);
            expect(copiedTemplate.metadata?.copiedFrom).toBe(sharedTemplate.shareId);

            const updated = await TemplateSharingService.getSharedTemplate(
                sharedTemplate.shareId
            );
            expect(updated?.stats.copies).toBe(1);
        });

        it('throws error when copying is not allowed', async () => {
            const sharedTemplate = await TemplateSharingService.shareTemplate(
                mockTemplate,
                { accessLevel: 'public', allowCopy: false, allowModify: false }
            );

            await expect(
                TemplateSharingService.copyTemplate(sharedTemplate.shareId)
            ).rejects.toThrow('Template copying is not allowed');
        });
    });

    describe('searchSharedTemplates', () => {
        it('filters templates by query and access level', async () => {
            await TemplateSharingService.shareTemplate(
                { ...mockTemplate, name: 'Template A' },
                { accessLevel: 'public', allowCopy: true, allowModify: false }
            );
            await TemplateSharingService.shareTemplate(
                { ...mockTemplate, name: 'Template B' },
                { accessLevel: 'private', allowCopy: true, allowModify: false }
            );

            const results = await TemplateSharingService.searchSharedTemplates(
                'Template',
                { accessLevel: 'public' }
            );

            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Template A');
        });

        it('sorts templates by specified criteria', async () => {
            const templateA = await TemplateSharingService.shareTemplate(
                { ...mockTemplate, name: 'Template A' },
                { accessLevel: 'public', allowCopy: true, allowModify: false }
            );
            const templateB = await TemplateSharingService.shareTemplate(
                { ...mockTemplate, name: 'Template B' },
                { accessLevel: 'public', allowCopy: true, allowModify: false }
            );

            // Update stats
            await TemplateSharingService.updateSharedTemplate(
                templateA.shareId,
                {},
                ['Update stats']
            );
            templateA.stats.uses = 10;
            await TemplateSharingService.saveSharedTemplate(templateA);

            const results = await TemplateSharingService.searchSharedTemplates(
                '',
                { sortBy: 'uses', order: 'desc' }
            );

            expect(results[0].name).toBe('Template A');
            expect(results[1].name).toBe('Template B');
        });
    });
});