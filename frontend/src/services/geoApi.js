import api from './api';

export const geoService = {
  getRoads: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/geo/roads', { params });
    return res.data;
  },
  getAccidents: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/geo/accidents', { params });
    return res.data;
  },
  getPotholes: async (cityId = null) => {
    const params = cityId ? { city_id: cityId } : {};
    const res = await api.get('/geo/potholes', { params });
    return res.data;
  }
};
