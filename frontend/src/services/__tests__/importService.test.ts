import { ImportService } from '../importService';

describe('ImportService', () => {
    const createFile = (content: string, type: string) => {
        return new File([content], `test.${type}`, { type: `text/${type}` });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('JSON import', () => {
        const jsonContent = JSON.stringify({
            activities: [{
                type: 'code',
                content: 'Test code',
                timestamp: '2024-02-29T10:00:00Z',
                userId: 1,
                metadata: {
                    status: 'resolved',
                    tags: ['react']
                }
            }]
        });

        it('imports JSON data correctly', async () => {
            const file = createFile(jsonContent, 'json');
            const result = await ImportService.importSessionData(file, { type: 'json' });

            expect(result.activities).toHaveLength(1);
            expect(result.activities[0].type).toBe('code');
            expect(result.stats.imported).toBe(1);
        });

        it('validates JSON data when requested', async () => {
            const invalidJson = JSON.stringify({
                activities: [{
                    type: 'invalid',
                    content: ''
                }]
            });

            const file = createFile(invalidJson, 'json');
            await expect(
                ImportService.importSessionData(file, { type: 'json', validateData: true })
            ).rejects.toThrow('Validation failed');
        });
    });

    describe('CSV import', () => {
        const csvContent = `timestamp,type,content,status,tags
2024-02-29T10:00:00Z,code,"Test code",resolved,react;typescript`;

        it('imports CSV data correctly', async () => {
            const file = createFile(csvContent, 'csv');
            const result = await ImportService.importSessionData(file, { type: 'csv' });

            expect(result.activities).toHaveLength(1);
            expect(result.activities[0].type).toBe('code');
            expect(result.activities[0].metadata?.tags).toEqual(['react', 'typescript']);
        });

        it('handles empty CSV fields correctly', async () => {
            const csvWithEmpty = `timestamp,type,content,status,tags
2024-02-29T10:00:00Z,code,"Test code",,`;

            const file = createFile(csvWithEmpty, 'csv');
            const result = await ImportService.importSessionData(file, { type: 'csv' });

            expect(result.activities[0].metadata?.tags).toEqual([]);
        });
    });

    describe('Markdown import', () => {
        const markdownContent = `### code - 2024-02-29T10:00:00Z
Test code
Tags: react, typescript
Status: resolved`;

        it('imports Markdown data correctly', async () => {
            const file = createFile(markdownContent, 'md');
            const result = await ImportService.importSessionData(file, { type: 'markdown' });

            expect(result.activities).toHaveLength(1);
            expect(result.activities[0].type).toBe('code');
            expect(result.activities[0].metadata?.tags).toEqual(['react', 'typescript']);
        });

        it('handles multiple sections in Markdown', async () => {
            const multiSection = `${markdownContent}
### question - 2024-02-29T11:00:00Z
Test question
Status: pending`;

            const file = createFile(multiSection, 'md');
            const result = await ImportService.importSessionData(file, { type: 'markdown' });

            expect(result.activities).toHaveLength(2);
        });
    });
});