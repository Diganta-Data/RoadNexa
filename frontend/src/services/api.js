import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const healthService = {
  checkHealth: () => api.get('/health').then(r => r.data),
  checkDbHealth: () => api.get('/health/db').then(r => r.data),
};

export default api;
