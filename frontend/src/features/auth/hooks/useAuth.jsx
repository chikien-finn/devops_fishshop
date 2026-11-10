import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';
import userService from '../../users/services/userService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  // Khởi tạo và đồng bộ user từ server nếu có token
  useEffect(() => {
    const syncUser = async () => {
      const savedToken = authService.getToken();
      if (savedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          // Token hết hạn
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    syncUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const updated = await userService.updateProfile(profileData);
    setUser(updated);
    return updated;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;

