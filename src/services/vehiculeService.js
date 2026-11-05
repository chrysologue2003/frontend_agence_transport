import api from './api.js';

export const vehiculeService = {
  async getVehicules({ page = 1, limit = 50 } = {}) {
    const response = await api.get('/vehicules', { params: { page, limit } });
    return response.data;
  },

  async getVehiculeByImmat(immatriculation) {
    const response = await api.get(`/vehicules/${immatriculation}`);
    return response.data;
  },

  async createVehicule(data) {
    const response = await api.post('/vehicules', data);
    return response.data;
  },

  async updateVehicule(immatriculation, data) {
    const response = await api.patch(`/vehicules/${immatriculation}`, data);
    return response.data;
  },

  async deleteVehicule(immatriculation) {
    const response = await api.delete(`/vehicules/${immatriculation}`);
    return response.data;
  },
};
