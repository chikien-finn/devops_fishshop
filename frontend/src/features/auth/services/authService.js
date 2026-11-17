import api from '../../../services/api.js';

const getStorageItem = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return sessionStorage.getItem(key);
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, val);
  } catch {}
  try {
    sessionStorage.setItem(key, val);
  } catch {}
};

const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {}
  try {
    sessionStorage.removeItem(key);
  } catch {}
};

export const authService = {
  setAuth(token, user) {
    if (token) setStorageItem('token', token);
    if (user) setStorageItem('user', JSON.stringify(user));
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      this.setAuth(response.data.data.token, response.data.data.user);
    }
    return response.data?.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data?.token) {
      this.setAuth(response.data.data.token, response.data.data.user);
    }
    return response.data?.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data?.data) {
      setStorageItem('user', JSON.stringify(response.data.data));
    }
    return response.data?.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data?.data;
  },

  async forgotPassword(email, newPassword) {
    const response = await api.post('/auth/forgot-password', { email, newPassword });
    return response.data?.data;
  },

  logout() {
    removeStorageItem('token');
    removeStorageItem('user');
  },

  getCurrentUser() {
    try {
      const userStr = getStorageItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return getStorageItem('token');
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

export default authService;
