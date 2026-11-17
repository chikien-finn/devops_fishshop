import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch {
      token = sessionStorage.getItem('token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } catch {}
      // Option to redirect to login if needed
    }
    return Promise.reject(error);
  }
);

export default api;

