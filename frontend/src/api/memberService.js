import { apiClient } from './client';

export const memberService = {
  /**
   * Member authentication login endpoint
   * Calls POST /api/members/login
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { message, memberId, name, email, role, token }
   */
  async login(credentials) {
    return await apiClient('/members/login', {
      method: 'POST',
      body: {
        email: credentials.email?.trim(),
        password: credentials.password,
      },
    });
  },

  /**
   * Fetch paginated list of members.
   * Handles backend parameter naming adaptation ('shortBy' in MemberController).
   */
  async getMembers({
    page = 0,
    size = 10,
    sortBy = 'memberId',
    direction = 'asc',
    search = '',
    status = 'ACTIVE',
  } = {}) {
    const params = {
      page,
      size,
      // Backend expects 'shortBy' with an 'h'
      shortBy: sortBy,
      direction: direction.toLowerCase() === 'desc' ? 'desc' : 'asc',
    };

    if (search && search.trim() !== '') {
      params.search = search.trim();
    } else if (status) {
      params.status = status.toUpperCase();
    }

    return await apiClient('/members', { params });
  },

  /**
   * Fetch single member by ID
   */
  async getMemberById(id) {
    return await apiClient(`/members/${id}`);
  },

  /**
   * Create a new member
   * @param {Object} memberData - { name, email, phone, password }
   */
  async createMember(memberData) {
    const payload = {
      name: memberData.name?.trim(),
      email: memberData.email?.trim(),
      phone: memberData.phone?.trim() || null,
      password: memberData.password,
    };

    return await apiClient('/members', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing member (name and phone only)
   * @param {number|string} id - Member ID
   * @param {Object} memberData - { name, phone }
   */
  async updateMember(id, memberData) {
    const payload = {
      name: memberData.name?.trim(),
      phone: memberData.phone?.trim() || null,
    };

    return await apiClient(`/members/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  /**
   * Deactivate member by ID (Soft delete in backend)
   * @param {number|string} id - Member ID
   */
  async deactivateMember(id) {
    return await apiClient(`/members/${id}`, {
      method: 'DELETE',
    });
  },
};
