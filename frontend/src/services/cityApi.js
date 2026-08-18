import api from './api';

export const cityService = {
  getAllCities: async () => {
    const res = await api.get('/cities/');
    return res.data;
  },

  getCityById: async (cityId) => {
    const res = await api.get(`/cities/${cityId}`);
    return res.data;
  },

  createCity: async (cityData) => {
    const res = await api.post('/cities/', cityData);
    return res.data;
  }
};
