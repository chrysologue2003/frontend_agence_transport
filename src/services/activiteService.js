import api from './api.js';

export const activiteService = {
  async getActivites({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/activites', { params: { page, limit } });
    return response.data;
  },

  async getActiviteById(id) {
    const response = await api.get(`/activites/${id}`);
    return response.data;
  },

  async createActivite(data) {
    const response = await api.post('/activites', data);
    return response.data;
  },

  async updateActivite(id, data) {
    const response = await api.patch(`/activites/${id}`, data);
    return response.data;
  },

  async deleteActivite(id) {
    const response = await api.delete(`/activites/${id}`);
    return response.data;
  },
};
