import { memberService } from './memberService';

const TOKEN_KEY = 'lms_auth_token';
const USER_KEY = 'lms_auth_user';

export const authService = {
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
   * Retrieve active JWT token
   * @returns {string|null}
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Retrieve stored user profile
   * @returns {Object|null}
   */
  getUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },

  /**
   * Clear session on logout
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
