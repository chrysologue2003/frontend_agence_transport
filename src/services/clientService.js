import api from './api.js';

export const clientService = {
  /**
   * Récupère la liste paginée des clients
   */
  async getClients({ page = 1, limit = 20, sort = 'date_creation', search = '' } = {}) {
    const params = { page, limit, sort };
    if (search) params.search = search;
    const response = await api.get('/clients', { params });
    return response.data;
  },

  /**
   * Récupère un client par ID
   */
  async getClientById(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau client
   */
  async createClient(data) {
    const response = await api.post('/clients', data);
    return response.data;
  },

  /**
   * Met à jour un client existant
   */
  async updateClient(id, data) {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * Supprime un client
   */
  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
