import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, isTokenExpired, parseJwt } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setToken(null);
  }, []);

  // Initialize auth state from local storage on load (validating expiration)
  useEffect(() => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken && !isTokenExpired(storedToken) && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        authService.clearSession();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('[AuthProvider] Initialization error:', err);
      authService.clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for system-wide auth expiration events (e.g. from apiClient 401 interceptor)
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [logout]);

  // Proactive token expiration timer
  useEffect(() => {
    if (!token) return;

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return;

    const msRemaining = decoded.exp * 1000 - Date.now();

    if (msRemaining <= 0) {
      logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      return;
    }

    const timer = setTimeout(() => {
      logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }, msRemaining);

    return () => clearTimeout(timer);
  }, [token, logout]);

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

  const isAuthenticated = Boolean(token && user && !isTokenExpired(token));

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
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
