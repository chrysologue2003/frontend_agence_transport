import api from './api.js';

export const userService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const roleService = {
  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },
};
