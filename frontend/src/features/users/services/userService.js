import api from '../../../services/api.js';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data?.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    if (response.data?.data) {
      const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      sessionStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.data }));
    }
    return response.data?.data;
  },

  async getAllUsers() {
    const response = await api.get('/users');
    return response.data?.data || [];
  },

  async updateUserRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data?.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data?.data;
  },
};

export default userService;

