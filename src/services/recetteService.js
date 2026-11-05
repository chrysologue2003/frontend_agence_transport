import api from './api.js';

export const recetteService = {
  async getRecettes({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/recettes', { params: { page, limit } });
    return response.data;
  },

  async getRecetteById(id) {
    const response = await api.get(`/recettes/${id}`);
    return response.data;
  },
};
