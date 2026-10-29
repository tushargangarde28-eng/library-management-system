import { memberService } from './memberService';

const TOKEN_KEY = 'lms_auth_token';
const USER_KEY = 'lms_auth_user';

/**
 * Safely parse a JWT payload
 * @param {string} token 
 * @returns {Object|null}
 */
export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param {string} token 
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  // exp is unix timestamp in seconds
  return Date.now() >= decoded.exp * 1000;
}

export const authService = {
  parseJwt,
  isTokenExpired,

  /**
   * Authenticate member with institutional email & password
   * Calls POST /api/members/login
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} LoginResponse: { message, memberId, name, email, role, token }
   */
  async login({ email, password }) {
    const data = await memberService.login({ email, password });
    if (data && data.token) {
      this.saveSession(data);
    }
    return data;
  },

  /**
   * Persist authenticated session
   * @param {Object} data - Backend response
   */
  saveSession(data) {
    if (!data) return;
    try {
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      const userPayload = {
        memberId: data.memberId,
        name: data.name,
        email: data.email,
        role: data.role || 'STUDENT',
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userPayload));
    } catch (err) {
      console.warn('[authService] Failed to persist session to localStorage:', err);
    }
  },

  /**
   * Retrieve active JWT token if valid and not expired
   * @returns {string|null}
   */
  getToken() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      if (isTokenExpired(token)) {
        this.clearSession();
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve stored user profile if token is still valid
   * @returns {Object|null}
   */
  getUser() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || isTokenExpired(token)) {
        this.clearSession();
        return null;
      }
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated with a valid non-expired token
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    return Boolean(token && !isTokenExpired(token) && this.getUser());
  },

  /**
   * Clear session on logout or token expiration
   */
  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.warn('[authService] Failed to clear session:', err);
    }
  },
};
