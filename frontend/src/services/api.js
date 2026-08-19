import axios from 'axios';

// In dev, Vite proxies /analytics, /cities, /geo, /roads, /uploads, /health → localhost:8000
// This avoids CORS entirely. In production, set VITE_API_BASE_URL to the real backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

export const healthService = {
  checkHealth: () => api.get('/health').then(r => r.data),
  checkDbHealth: () => api.get('/health/db').then(r => r.data),
};

export default api;
