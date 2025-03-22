export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  timeout: 10000,
  retries: 3,
};