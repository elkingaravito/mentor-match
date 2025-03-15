import { renderHook, act } from '@testing-library/react';
import { useMatching } from '../useMatching';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../../mocks/server';
import { rest } from 'msw';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
);

describe('useMatching', () => {
    it('should load suggestions', async () => {
        const { result } = renderHook(() => useMatching(), { wrapper });

        await act(async () => {
            await result.current.loadSuggestions();
        });

        expect(result.current.suggestions).toHaveLength(1);
        expect(result.current.error).toBeNull();
    });

    it('should handle loading state', async () => {
        const { result } = renderHook(() => useMatching(), { wrapper });

        expect(result.current.loading).toBe(false);

        await act(async () => {
            const loadPromise = result.current.loadSuggestions();
            expect(result.current.loading).toBe(true);
            await loadPromise;
        });

        expect(result.current.loading).toBe(false);
    });

    it('should handle error state', async () => {
        server.use(
            rest.get('*/api/matching/suggestions', (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ message: 'Server error' }));
            })
        );

        const { result } = renderHook(() => useMatching(), { wrapper });

        await act(async () => {
            await result.current.loadSuggestions();
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.suggestions).toHaveLength(0);
    });

    it('should accept match', async () => {
        const { result } = renderHook(() => useMatching(), { wrapper });

        await act(async () => {
            await result.current.acceptMatch(1);
        });

        expect(result.current.error).toBeNull();
    });

    it('should reject match', async () => {
        const { result } = renderHook(() => useMatching(), { wrapper });

        await act(async () => {
            await result.current.rejectMatch(1);
        });

        expect(result.current.error).toBeNull();
    });

    it('should update preferences', async () => {
        const { result } = renderHook(() => useMatching(), { wrapper });

        const preferences = {
            skill_weight: 0.4,
            availability_weight: 0.3
        };

        await act(async () => {
            await result.current.updatePreferences(preferences);
        });

        expect(result.current.error).toBeNull();
    });
});
