import api from './api.js';

export const typePrestationService = {
  async getTypesPrestations() {
    const response = await api.get('/types-prestations');
    return response.data;
  },

  async getTypePrestationByCode(code) {
    const response = await api.get(`/types-prestations/${code}`);
    return response.data;
  },

  async createTypePrestation(data) {
    const response = await api.post('/types-prestations', data);
    return response.data;
  },

  async updateTypePrestation(code, data) {
    const response = await api.patch(`/types-prestations/${code}`, data);
    return response.data;
  },

  async deleteTypePrestation(code) {
    const response = await api.delete(`/types-prestations/${code}`);
    return response.data;
  },
};
