import api from './api';

export const roadService = {
  getNearestRoad: async (lat, lng) => {
    const res = await api.get('/roads/nearest', { params: { lat, lng } });
    return res.data;
  },
  getRoadDetails: async (roadId) => {
    const res = await api.get(`/roads/${roadId}/details`);
    return res.data;
  },
  getRoadRisk: async (roadId) => {
    const res = await api.get(`/roads/${roadId}/risk`);
    return res.data;
  }
};
