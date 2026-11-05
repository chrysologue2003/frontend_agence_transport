import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearAuthSession,
} from '../utils/auth.js';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setAuthToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync state on load
    const storedToken = getToken();
    const storedUserData = getStoredUser();
    if (storedToken && storedUserData) {
      setAuthToken(storedToken);
      setUser(storedUserData);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const { access_token, user: userData } = data;

    setToken(access_token);
    setStoredUser(userData);
    setAuthToken(access_token);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (dataToRegister) => {
    const data = await authService.register(dataToRegister);
    const { access_token, user: userData } = data;

    setToken(access_token);
    setStoredUser(userData);
    setAuthToken(access_token);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (allowedRoles = []) => {
      if (!user || !user.role) return false;
      const roleLibelle = typeof user.role === 'object' ? user.role.libelle : user.role;
      return allowedRoles.includes(roleLibelle);
    },
    [user],
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
