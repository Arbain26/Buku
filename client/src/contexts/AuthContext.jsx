import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mabbaca_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mabbaca_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mabbaca_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('mabbaca_user', JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mabbaca_token', res.data.token);
      localStorage.setItem('mabbaca_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const adminLogin = async (email, password) => {
    const res = await authService.adminLogin({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mabbaca_token', res.data.token);
      localStorage.setItem('mabbaca_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mabbaca_token', res.data.token);
      localStorage.setItem('mabbaca_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const registerMitra = async (data) => {
    const res = await authService.registerMitra(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mabbaca_token', res.data.token);
      localStorage.setItem('mabbaca_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mabbaca_token');
    localStorage.removeItem('mabbaca_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('mabbaca_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        isMitra: user?.role === 'MITRA',
        isApprovedMitra: user?.role === 'MITRA' && user?.mitraProfile?.status === 'APPROVED',
        login,
        adminLogin,
        register,
        registerMitra,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
