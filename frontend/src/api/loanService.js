import { apiClient } from './client';

export const LOAN_PERIOD_DAYS = 8;
export const BORROWING_LIMIT = 3;
export const FINE_PER_DAY = 5;

// Clean up any legacy offline loan storage to ensure clean state
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('libricore_loans_registry_v1');
  }
} catch {
  // Ignore localStorage access restrictions
}

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

  const rawFine = loan.fine !== undefined && loan.fine !== null ? Number(loan.fine) : 0;
  const accruedFine = isOverdue && rawFine === 0 ? daysOverdue * FINE_PER_DAY : rawFine;

  return {
    ...loan,
    isOverdue,
    daysOverdue,
    fine: rawFine,
    accruedFine,
  };
}

export const loanService = {
  LOAN_PERIOD_DAYS,
  BORROWING_LIMIT,
  FINE_PER_DAY,

  /**
   * Fetch overdue loans directly from backend API
   * GET /api/loans/overdueLoans
   * @returns {Promise<LoanResponse[]>}
   */
  async getOverdueLoans() {
    const data = await apiClient('/loans/overdueLoans', {
      method: 'GET',
    });
    const list = Array.isArray(data) ? data : [];
    return list.map(enrichLoan);
  },

  /**
   * Fetch loans for the currently authenticated student directly from backend API
   * GET /api/loans/myloans
   * @returns {Promise<LoanResponse[]>}
   */
  async getMyLoans() {
    const data = await apiClient('/loans/myloans', {
      method: 'GET',
    });
    const list = Array.isArray(data) ? data : [];
    return list.map(enrichLoan);
  },

  /**
   * Fetch all loans across all pages (up to size=100) directly from backend API
   * GET /api/loans?page=0&size={size}&sort=loanId,desc
   * @returns {Promise<LoanResponse[]>}
   */
  async getAllLoans({ size = 100 } = {}) {
    const data = await apiClient('/loans', {
      method: 'GET',
      params: { page: 0, size, sort: 'loanId,desc' },
    });
    const rawContent = Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
    return rawContent.map(enrichLoan);
  },

  /**
   * Fetch all active circulating loans across all pages directly from backend API
   * Useful for the Return Book modal dropdown
   * @returns {Promise<LoanResponse[]>}
   */
  async getAllActiveLoans() {
    const loans = await this.getAllLoans({ size: 100 });
    return loans.filter((l) => l.status === 'ACTIVE');
  },

  /**
   * Fetch paginated loans with search and sort params directly from Spring Boot API:
   * GET /api/loans?page={page}&size={size}&search={search}&sort={sortBy},{direction}
   * @param {Object} options - { page, size, search, sortBy, direction, status }
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
  },

  /**
   * API 2: Borrow a book directly via backend API
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

      return enrichLoan(loanResponse);
    } catch (err) {
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
   * API 3: Return a book directly via backend API
   * PUT /api/loans/{id}/return
   * @param {number|string} loanId - Loan ID
   * @returns {Promise<LoanResponse>}
   */
  async returnBook(loanId) {
    try {
      const loanResponse = await apiClient(`/loans/${loanId}/return`, {
        method: 'PUT',
      });

      return enrichLoan(loanResponse);
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
   * Safe stub for any component expecting getRecordedLoanById
   */
  getRecordedLoanById() {
    return null;
  },

  /**
   * Safe stub for any component expecting getRecordedLoans
   */
  getRecordedLoans() {
    return [];
  },

  /**
   * Calculates statistics on loans from provided records
   */
  getLoanStats(providedLoans = []) {
    const loans = Array.isArray(providedLoans) ? providedLoans : [];
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
