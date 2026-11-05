import api from './api.js';

export const authService = {
  /**
   * Connexion utilisateur
   * @param {{ login: string, mot_de_passe: string }} credentials
   * @returns {Promise<{ access_token: string, user: any }>}
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Création d'un compte utilisateur
   * @param {{ nom_utilisateur: string, login: string, mot_de_passe: string, role?: string }} data
   * @returns {Promise<any>}
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

