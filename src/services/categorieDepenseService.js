import api from './api.js';

export const categorieDepenseService = {
  async getCategories() {
    const response = await api.get('/categories-depenses');
    return response.data;
  },

  async getCategorieById(id) {
    const response = await api.get(`/categories-depenses/${id}`);
    return response.data;
  },

  async createCategorie(data) {
    const response = await api.post('/categories-depenses', data);
    return response.data;
  },

  async updateCategorie(id, data) {
    const response = await api.patch(`/categories-depenses/${id}`, data);
    return response.data;
  },

  async deleteCategorie(id) {
    const response = await api.delete(`/categories-depenses/${id}`);
    return response.data;
  },
};
