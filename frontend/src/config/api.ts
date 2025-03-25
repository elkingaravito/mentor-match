export const API_CONFIG = {
  baseUrl: import.meta.env.DEV ? 'http://localhost:3001/api' : (import.meta.env.VITE_API_URL || '/api'),
  wsUrl: import.meta.env.DEV ? 'ws://localhost:3001' : (import.meta.env.VITE_WS_URL || 'ws://localhost:3001'),
  timeout: import.meta.env.DEV ? 1000 : 10000,
  retries: import.meta.env.DEV ? 0 : 3,
  mockDelay: import.meta.env.DEV ? 500 : 0, // Simulate network delay in development
};

export const MOCK_CONFIG = {
  enabled: import.meta.env.DEV,
  token: 'mock-jwt-token',
  user: {
    id: 'mock-user',
    name: 'Mock User',
    email: 'mock@example.com',
    role: 'mentee',
  },
};
