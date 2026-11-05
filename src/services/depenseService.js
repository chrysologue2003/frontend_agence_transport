import api from './api.js';

export const depenseService = {
  async getDepenses({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/depenses', { params: { page, limit } });
    return response.data;
  },

  async getDepenseById(id) {
    const response = await api.get(`/depenses/${id}`);
    return response.data;
  },

  async createDepense(data) {
    const response = await api.post('/depenses', data);
    return response.data;
  },

  async deleteDepense(id) {
    const response = await api.delete(`/depenses/${id}`);
    return response.data;
  },
};
