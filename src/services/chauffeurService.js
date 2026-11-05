import api from './api.js';

export const chauffeurService = {
  async getChauffeurs({ page = 1, limit = 50 } = {}) {
    const response = await api.get('/chauffeurs', { params: { page, limit } });
    return response.data;
  },

  async getChauffeurByMatricule(matricule) {
    const response = await api.get(`/chauffeurs/${matricule}`);
    return response.data;
  },

  async createChauffeur(data) {
    const response = await api.post('/chauffeurs', data);
    return response.data;
  },

  async updateChauffeur(matricule, data) {
    const response = await api.patch(`/chauffeurs/${matricule}`, data);
    return response.data;
  },

  async deleteChauffeur(matricule) {
    const response = await api.delete(`/chauffeurs/${matricule}`);
    return response.data;
  },
};
