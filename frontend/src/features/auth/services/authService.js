import api from '../../../services/api.js';

// Không giữ phiên đăng nhập tự động qua các lần mở lại trình duyệt từ localStorage cũ
if (typeof window !== 'undefined') {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      sessionStorage.setItem('token', response.data.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data?.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data?.token) {
      sessionStorage.setItem('token', response.data.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data?.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    if (response.data?.data) {
      sessionStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data?.data;
  },

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return sessionStorage.getItem('token');
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

export default authService;
