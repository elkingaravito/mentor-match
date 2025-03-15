import { MatchingService } from '../matchingService';
import { server } from '../../mocks/server';
import { rest } from 'msw';

describe('MatchingService', () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    it('should get match suggestions', async () => {
        const suggestions = await MatchingService.getSuggestions();
        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].total_score).toBe(0.85);
    });

    it('should create match preferences', async () => {
        const preferences = {
            skill_weight: 0.3,
            availability_weight: 0.2,
            style_weight: 0.2,
            goals_weight: 0.3
        };

        const result = await MatchingService.createPreferences(preferences);
        expect(result).toEqual(preferences);
    });

    it('should update match preferences', async () => {
        const preferences = {
            skill_weight: 0.4,
            availability_weight: 0.3
        };

        const result = await MatchingService.updatePreferences(preferences);
        expect(result).toEqual(preferences);
    });

    it('should accept a match', async () => {
        const matchId = 1;
        const result = await MatchingService.acceptMatch(matchId);
        expect(result.id).toBe(matchId.toString());
        expect(result.status).toBe('accepted');
    });

    it('should reject a match', async () => {
        const matchId = 1;
        const result = await MatchingService.rejectMatch(matchId);
        expect(result.id).toBe(matchId.toString());
        expect(result.status).toBe('rejected');
    });

    it('should handle API errors', async () => {
        server.use(
            rest.get(`${baseUrl}/api/matching/suggestions`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ message: 'Server error' }));
            })
        );

        await expect(MatchingService.getSuggestions()).rejects.toThrow();
    });
});
