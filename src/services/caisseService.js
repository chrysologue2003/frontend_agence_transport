import api from './api.js';

export const caisseService = {
  async getMouvements({ page = 1, limit = 20 } = {}) {
    const response = await api.get('/caisse/mouvements', { params: { page, limit } });
    return response.data;
  },

  async getSolde({ from, to }) {
    const response = await api.get('/caisse/solde', { params: { from, to } });
    return response.data;
  },
};
