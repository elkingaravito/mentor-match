import { rest } from 'msw';
import { MatchScore, MatchPreference } from '../types/matching';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const handlers = [
    // Matching handlers
    rest.get(`${baseUrl}/api/matching/suggestions`, (req, res, ctx) => {
        const mockSuggestions: MatchScore[] = [
            {
                id: 1,
                mentor_id: 1,
                mentee_id: 2,
                total_score: 0.85,
                skill_match_score: 0.9,
                availability_score: 0.8,
                style_match_score: 0.85,
                goals_alignment_score: 0.85,
                match_details: {
                    matching_skills: ["Python", "React", "TypeScript"],
                    matching_availability: 5
                },
                status: "suggested",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
        return res(ctx.json(mockSuggestions));
    }),

    rest.post(`${baseUrl}/api/matching/preferences`, async (req, res, ctx) => {
        const preferences = await req.json() as MatchPreference;
        return res(ctx.json(preferences));
    }),

    rest.put(`${baseUrl}/api/matching/preferences`, async (req, res, ctx) => {
        const preferences = await req.json() as Partial<MatchPreference>;
        return res(ctx.json(preferences));
    }),

    rest.post(`${baseUrl}/api/matching/accept/:matchId`, (req, res, ctx) => {
        const { matchId } = req.params;
        return res(ctx.json({ id: matchId, status: "accepted" }));
    }),

    rest.post(`${baseUrl}/api/matching/reject/:matchId`, (req, res, ctx) => {
        const { matchId } = req.params;
        return res(ctx.json({ id: matchId, status: "rejected" }));
    }),

    // Calendar handlers
    rest.get(`${baseUrl}/api/calendar/availability/:userId`, (req, res, ctx) => {
        const mockAvailability = [
            {
                id: 1,
                start_time: "2024-03-15T09:00:00Z",
                end_time: "2024-03-15T10:00:00Z",
                is_available: true
            }
        ];
        return res(ctx.json(mockAvailability));
    }),

    rest.post(`${baseUrl}/api/calendar/availability`, async (req, res, ctx) => {
        const slot = await req.json();
        return res(ctx.json({ id: 1, ...slot }));
    }),

    rest.delete(`${baseUrl}/api/calendar/availability/:slotId`, (req, res, ctx) => {
        return res(ctx.json({ status: "success" }));
    }),

    rest.post(`${baseUrl}/api/calendar/integrate/:provider`, async (req, res, ctx) => {
        const { provider } = req.params;
        return res(ctx.json({ status: "success", provider }));
    }),

    rest.get(`${baseUrl}/api/calendar/sync`, (req, res, ctx) => {
        return res(ctx.json({ status: "success", events_synced: 5 }));
    })
];
