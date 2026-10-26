import { apiClient } from './client';

export const LOAN_PERIOD_DAYS = 8;
export const BORROWING_LIMIT = 3;

const STORAGE_KEY = 'libricore_loans_registry_v1';

/**
 * Normalizes and enriches a loan object with calculated properties
 */
export function enrichLoan(loan) {
  if (!loan) return loan;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
  if (dueDate) dueDate.setHours(0, 0, 0, 0);

  const isOverdue =
    loan.status === 'ACTIVE' &&
    dueDate &&
    today.getTime() > dueDate.getTime();

  let daysOverdue = 0;
  if (isOverdue && dueDate) {
    const diffTime = today.getTime() - dueDate.getTime();
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    ...loan,
    isOverdue,
    daysOverdue,
    fine: loan.fine !== undefined && loan.fine !== null ? Number(loan.fine) : 0,
  };
}

/**
 * Local storage manager to retain loan history across sessions
 * since the backend currently exposes only Borrow & Return endpoints.
 */
function getStoredLoans() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(enrichLoan) : [];
  } catch (e) {
    console.warn('[loanService] Failed to read loans from localStorage:', e);
    return [];
  }
}

function saveStoredLoans(loans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  } catch (e) {
    console.warn('[loanService] Failed to save loans to localStorage:', e);
  }
}

export const loanService = {
  LOAN_PERIOD_DAYS,
  BORROWING_LIMIT,

  /**
   * Fetch all loans across all pages (up to size=100)
   * GET /api/loans?page=0&size={size}
   * @returns {Promise<LoanResponse[]>}
   */
  async getAllLoans({ size = 100 } = {}) {
    try {
      const data = await apiClient('/loans', {
        method: 'GET',
        params: { page: 0, size, sort: 'loanId,desc' },
      });
      const rawContent = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];
      const loans = rawContent.map(enrichLoan);
      saveStoredLoans(loans);
      return loans;
    } catch (err) {
      console.warn('[loanService] Failed to fetch loans from GET /api/loans, using local fallback:', err);
      return getStoredLoans();
    }
  },

  /**
   * Fetch all active circulating loans across all pages
   * Useful for the Return Book modal dropdown
   * @returns {Promise<LoanResponse[]>}
   */
  async getAllActiveLoans() {
    try {
      const loans = await this.getAllLoans({ size: 100 });
      return loans.filter((l) => l.status === 'ACTIVE');
    } catch (err) {
      console.warn('[loanService] Failed to fetch active loans:', err);
      return getStoredLoans().filter((l) => l.status === 'ACTIVE');
    }
  },

  /**
   * Fetch paginated loans with search and sort params directly from Spring Boot API:
   * GET /api/loans?page={page}&size={size}&search={search}&sort={sortBy},{direction}
   * @param {Object} options - { page, size, search, sortBy, direction }
   * @returns {Promise<{ content: LoanResponse[], totalElements: number, totalPages: number, number: number, size: number }>}
   */
  async getLoans({
    page = 0,
    size = 5,
    search = '',
    sortBy = 'loanId',
    direction = 'desc',
    status = 'ALL',
  } = {}) {
    try {
      const params = {
        page,
        size,
        sort: `${sortBy},${direction}`,
      };

      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const data = await apiClient('/loans', {
        method: 'GET',
        params,
      });

      let rawContent = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];

      let enriched = rawContent.map(enrichLoan);

      // Merge newly fetched page items into localStorage for offline cache
      const existing = getStoredLoans();
      const mergedMap = new Map();
      enriched.forEach((item) => mergedMap.set(Number(item.loanId), item));
      existing.forEach((item) => {
        if (!mergedMap.has(Number(item.loanId))) {
          mergedMap.set(Number(item.loanId), item);
        }
      });
      saveStoredLoans(Array.from(mergedMap.values()));

      // Apply client-side status filter if specified and not 'ALL'
      let finalContent = enriched;
      let finalTotalElements = Number(data?.totalElements ?? enriched.length);
      let finalTotalPages = Number(data?.totalPages ?? (enriched.length > 0 ? 1 : 0));

      if (status && status !== 'ALL') {
        if (status === 'OVERDUE') {
          finalContent = enriched.filter((l) => l.status === 'ACTIVE' && l.isOverdue);
        } else {
          finalContent = enriched.filter((l) => l.status === status);
        }
      }

      return {
        content: finalContent,
        totalElements: finalTotalElements,
        totalPages: finalTotalPages,
        number: Number(data?.number ?? page),
        size: Number(data?.size ?? size),
      };
    } catch (err) {
      console.warn('[loanService] Failed to fetch loans from GET /api/loans, using local fallback:', err);
      // Local fallback pagination
      let stored = getStoredLoans();

      if (status && status !== 'ALL') {
        if (status === 'OVERDUE') {
          stored = stored.filter((l) => l.status === 'ACTIVE' && l.isOverdue);
        } else {
          stored = stored.filter((l) => l.status === status);
        }
      }

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        stored = stored.filter((l) => {
          const idMatch = String(l.loanId).includes(q);
          const bookMatch = l.bookTitle && l.bookTitle.toLowerCase().includes(q);
          const memberMatch = l.memberName && l.memberName.toLowerCase().includes(q);
          const bookIdMatch = String(l.bookId).includes(q);
          const memberIdMatch = String(l.memberId).includes(q);
          return idMatch || bookMatch || memberMatch || bookIdMatch || memberIdMatch;
        });
      }

      // Sort
      stored.sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      const totalElements = stored.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const start = page * size;
      const content = stored.slice(start, start + size);

      return {
        content,
        totalElements,
        totalPages,
        number: page,
        size,
      };
    }
  },

  /**
   * API 2: Borrow a book
   * POST /api/loans/borrow
   * @param {Object} payload - { memberId: number, bookId: number }
   * @returns {Promise<LoanResponse>}
   */
  async borrowBook({ memberId, bookId }) {
    const payload = {
      memberId: Number(memberId),
      bookId: Number(bookId),
    };

    try {
      const loanResponse = await apiClient('/loans/borrow', {
        method: 'POST',
        body: payload,
      });

      const enriched = enrichLoan(loanResponse);

      // Refresh storage cache
      const existing = getStoredLoans();
      const filtered = existing.filter((l) => Number(l.loanId) !== Number(enriched.loanId));
      saveStoredLoans([enriched, ...filtered]);

      return enriched;
    } catch (err) {
      // Enhance backend error diagnostics
      if (err.status === 500) {
        err.friendlyMessage =
          'Borrowing limit reached (max 3 active books per member) or book is unavailable. Please verify member active loans.';
      } else if (err.status === 400) {
        err.friendlyMessage =
          err.message || 'Invalid borrow request. Member ID and Book ID must be positive integers.';
      } else if (err.status === 404) {
        err.friendlyMessage =
          err.message || 'Member or Book was not found in the backend database.';
      } else {
        err.friendlyMessage = err.message || 'Failed to borrow book.';
      }
      throw err;
    }
  },

  /**
   * API 3: Return a book
   * PUT /api/loans/{id}/return
   * @param {number|string} loanId - Loan ID
   * @returns {Promise<LoanResponse>}
   */
  async returnBook(loanId) {
    try {
      const loanResponse = await apiClient(`/loans/${loanId}/return`, {
        method: 'PUT',
      });

      const enriched = enrichLoan(loanResponse);

      // Update in storage cache
      const existing = getStoredLoans();
      const index = existing.findIndex((l) => Number(l.loanId) === Number(loanId));

      if (index !== -1) {
        existing[index] = enriched;
        saveStoredLoans(existing);
      } else {
        saveStoredLoans([enriched, ...existing]);
      }

      return enriched;
    } catch (err) {
      if (err.status === 404) {
        err.friendlyMessage = `Active loan not found with ID #${loanId}. It may have already been returned or does not exist.`;
      } else {
        err.friendlyMessage = err.message || `Failed to return loan #${loanId}.`;
      }
      throw err;
    }
  },

  /**
   * Synchronous cached records fallback
   */
  getRecordedLoans({ search = '', status = 'ALL' } = {}) {
    let loans = getStoredLoans();

    loans.sort((a, b) => Number(b.loanId || 0) - Number(a.loanId || 0));

    if (status && status !== 'ALL') {
      if (status === 'OVERDUE') {
        loans = loans.filter((l) => l.status === 'ACTIVE' && l.isOverdue);
      } else {
        loans = loans.filter((l) => l.status === status);
      }
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      loans = loans.filter((l) => {
        const idMatch = String(l.loanId).includes(q);
        const bookMatch = l.bookTitle && l.bookTitle.toLowerCase().includes(q);
        const memberMatch = l.memberName && l.memberName.toLowerCase().includes(q);
        const bookIdMatch = String(l.bookId).includes(q);
        const memberIdMatch = String(l.memberId).includes(q);
        return idMatch || bookMatch || memberMatch || bookIdMatch || memberIdMatch;
      });
    }

    return loans;
  },

  /**
   * Find a single loan by ID
   */
  getRecordedLoanById(loanId) {
    const loans = getStoredLoans();
    return loans.find((l) => Number(l.loanId) === Number(loanId)) || null;
  },

  /**
   * Calculates statistics on loans (from provided list or cache)
   */
  getLoanStats(providedLoans = null) {
    const loans = Array.isArray(providedLoans) ? providedLoans : getStoredLoans();
    const active = loans.filter((l) => l.status === 'ACTIVE');
    const returned = loans.filter((l) => l.status === 'RETURNED');
    const overdue = active.filter((l) => l.isOverdue);
    const totalFines = loans.reduce((acc, l) => acc + (Number(l.fine) || 0), 0);

    return {
      total: loans.length,
      active: active.length,
      returned: returned.length,
      overdue: overdue.length,
      totalFines,
      borrowingLimit: BORROWING_LIMIT,
      loanPeriodDays: LOAN_PERIOD_DAYS,
    };
  },
};

