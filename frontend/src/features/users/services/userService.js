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

  async getAllUsers(params = {}, options = {}) {
    const response = await api.get('/users', { params, signal: options.signal });
    const payload = response.data?.data;

    if (Array.isArray(payload)) {
      return {
        items: payload,
        pagination: {
          page: 1,
          limit: payload.length || 10,
          totalItems: payload.length,
          totalPages: 1,
        },
        stats: {
          total: payload.length,
          adminCount: payload.filter((u) => u.role === 'admin').length,
          customerCount: payload.filter((u) => u.role === 'user').length,
          withPhoneCount: payload.filter((u) => u.phone && u.phone.trim()).length,
        },
      };
    }

    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: {
        page: payload?.pagination?.page || 1,
        limit: payload?.pagination?.limit || 10,
        totalItems: payload?.pagination?.totalItems || 0,
        totalPages: payload?.pagination?.totalPages || 1,
      },
      stats: {
        total: payload?.stats?.total || 0,
        adminCount: payload?.stats?.adminCount || 0,
        customerCount: payload?.stats?.customerCount || 0,
        withPhoneCount: payload?.stats?.withPhoneCount || 0,
      },
    };
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

