import api from './api';

export const analyticsService = {
  getKPIs: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/dashboard/kpi', { params });
    return res.data;
  },
  getSeverity: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/accidents/severity', { params });
    return res.data;
  },
  getMonthlyAccidents: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/accidents/monthly', { params });
    return res.data;
  },
  getDangerousRoads: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/dangerous-roads', { params });
    return res.data;
  },
  getHotspots: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/hotspots', { params });
    return res.data;
  },
  getRecommendations: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/risk/recommendations', { params });
    return res.data;
  },
  getPredictions: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/analytics/ml/predictions', { params });
    return res.data;
  },
  getAiAnalysis: async (roadData) => {
    const res = await api.post('/analytics/ai-analysis', roadData);
    return res.data;
  },
};
