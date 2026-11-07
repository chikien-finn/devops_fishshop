import api from '../../../services/api.js';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data?.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data?.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data?.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data?.data;
  },

  async quickAdminLogin() {
    return this.login('admin@aquacraft.com', 'admin123');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

export default authService;
