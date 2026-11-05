import api from './api.js';

export const paiementService = {
  async getPaiements({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/paiements', { params: { page, limit } });
    return response.data;
  },

  async getPaiementById(id) {
    const response = await api.get(`/paiements/${id}`);
    return response.data;
  },

  async createPaiement(data) {
    const response = await api.post('/paiements', data);
    return response.data;
  },

  async deletePaiement(id) {
    const response = await api.delete(`/paiements/${id}`);
    return response.data;
  },
};
