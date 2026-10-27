import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from local storage on load
  useEffect(() => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (err) {
      console.warn('[AuthProvider] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in user using credentials via POST /api/members/login
   */
  const login = useCallback(async ({ email, password }) => {
    const response = await authService.login({ email, password });
    if (response) {
      setToken(response.token || authService.getToken());
      const userData = {
        memberId: response.memberId,
        name: response.name,
        email: response.email,
        role: response.role || 'STUDENT',
      };
      setUser(userData);
    }
    return response;
  }, []);

  /**
   * Demo login for rapid testing / previewing UI when backend is offline
   */
  const demoLogin = useCallback((role = 'ADMIN') => {
    const demoData = {
      message: 'Demo Session Active',
      memberId: role === 'ADMIN' ? 1 : 42,
      name: role === 'ADMIN' ? 'Administrator' : 'Jane Student',
      email: role === 'ADMIN' ? 'admin@library.com' : 'jane.student@campus.edu',
      role: role,
      token: `demo-jwt-token-${Date.now()}`,
    };
    authService.saveSession(demoData);
    setToken(demoData.token);
    setUser({
      memberId: demoData.memberId,
      name: demoData.name,
      email: demoData.email,
      role: demoData.role,
    });
    return demoData;
  }, []);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    demoLogin,
    logout,
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
