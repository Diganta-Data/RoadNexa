import api from './api';

export const uploadService = {
  uploadDataset: async (cityId, datasetType, file) => {
    const formData = new FormData();
    formData.append('city_id', cityId);
    formData.append('dataset_type', datasetType);
    formData.append('file', file);

    const res = await api.post('/uploads/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  getAllUploads: async () => {
    const res = await api.get('/uploads/');
    return res.data;
  }
};
