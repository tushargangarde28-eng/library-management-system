import { apiClient } from './client';

/**
 * Normalizes book data returned from the backend.
 * Addresses the backend parameter inversion where availableCopies and totalCopies
 * are reversed in BookService.toResponse().
 */
export function normalizeBook(book) {
  if (!book) return book;

  // In backend BookService.java toResponse():
  // 5th constructor param (binds to BookResponse.totalCopies): book.getAvailableCopies()
  // 6th constructor param (binds to BookResponse.availableCopies): book.getTotalCopies()
  //
  // Therefore in raw backend JSON:
  // book.totalCopies = database available_copies
  // book.availableCopies = database total_copies
  const rawTotalCopies = book.totalCopies;
  const rawAvailableCopies = book.availableCopies;

  const total = Number.isInteger(rawAvailableCopies)
    ? rawAvailableCopies
    : (Number.isInteger(rawTotalCopies) ? rawTotalCopies : 0);
  const available = Number.isInteger(rawTotalCopies)
    ? rawTotalCopies
    : (Number.isInteger(rawAvailableCopies) ? rawAvailableCopies : 0);

  return {
    ...book,
    totalCopies: total,
    availableCopies: available,
    total_copies: total,
    available_copies: available,
    _rawTotal: rawTotalCopies,
    _rawAvailable: rawAvailableCopies,
  };
}

export const bookService = {
  /**
   * Fetch paginated list of books with optional sorting and search
   */
  async getBooks({ page = 0, size = 5, sortBy = 'bookId', direction = 'asc', search = '' } = {}) {
    const params = {
      page,
      size,
      sortBy,
      direction,
    };

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    const response = await apiClient('/books', { params });

    if (response && Array.isArray(response.content)) {
      return {
        ...response,
        content: response.content.map(normalizeBook),
      };
    }

    return response;
  },

  /**
   * Fetch single book by ID
   */
  async getBookById(id) {
    const book = await apiClient(`/books/${id}`);
    return normalizeBook(book);
  },

  /**
   * Create a new book
   * @param {Object} bookData - { title, author, isbn, totalCopies }
   */
  async createBook(bookData) {
    const payload = {
      title: bookData.title?.trim(),
      author: bookData.author?.trim(),
      isbn: bookData.isbn?.trim(),
      totalCopies: Number(bookData.totalCopies),
    };

    const book = await apiClient('/books', {
      method: 'POST',
      body: payload,
    });
    return normalizeBook(book);
  },

  /**
   * Update an existing book
   * @param {number|string} id - Book ID
   * @param {Object} bookData - { title, author, isbn, totalCopies }
   * @param {Object} [currentBook] - Current book state to preserve exact totalCopies against backend subtraction logic
   */
  async updateBook(id, bookData, currentBook = null) {
    const desiredTotal = Number(bookData.totalCopies);

    // In backend BookService.java line 74-87:
    // int barrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
    // book.setTotalCopies(request.getTotalCopies() - barrowedCopies);
    //
    // The backend subtracts barrowedCopies from request.getTotalCopies().
    // To ensure the database total_copies ends up precisely as desiredTotal,
    // we send (desiredTotal + borrowedCopies).
    let borrowedCopies = 0;
    if (currentBook) {
      const curTotal = Number(currentBook.totalCopies ?? currentBook.total_copies ?? 0);
      const curAvail = Number(currentBook.availableCopies ?? currentBook.available_copies ?? 0);
      borrowedCopies = Math.max(0, curTotal - curAvail);
    }

    const payload = {
      title: bookData.title?.trim(),
      author: bookData.author?.trim(),
      isbn: bookData.isbn?.trim(),
      totalCopies: desiredTotal + borrowedCopies,
    };

    const book = await apiClient(`/books/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return normalizeBook(book);
  },

  /**
   * Delete book by ID
   * @param {number|string} id - Book ID
   */
  async deleteBook(id) {
    return await apiClient(`/books/${id}`, {
      method: 'DELETE',
    });
  },
};
