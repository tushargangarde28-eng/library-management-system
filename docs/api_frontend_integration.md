# LibriCore — Library Management System
## Frontend Architecture & REST API Integration Manual

**Frontend:** React 19 + Vite 8  
**Backend:** Spring Boot 4.1 + Java 21  
**Proxy:** Port 5173 &rarr; Port 8080  
**Date:** October 2026  

---

## 1. High-Level Architecture & Network Flow

Because the Spring Boot backend does not configure Cross-Origin Resource Sharing (CORS), direct browser calls to `http://localhost:8080` would be blocked by CORS policies.

To connect cleanly **without modifying backend code**, a reverse proxy was implemented in `vite.config.js`:

```
Browser (React UI)
  │ (User actions on DashboardPage, BooksPage, MembersPage)
  ▼
Service Layer (bookService.js & memberService.js)
  │ (Field normalization, backend parameter adaptation)
  ▼
API Client (api/client.js)
  │ (Fetch wrapper, JSON serialization, console error logger)
  ▼
Vite Dev Proxy (Port 5173)
  │ Maps: /api/*  ──►  http://localhost:8080/api/* (Zero CORS restrictions)
  ▼
Spring Boot REST Controllers (Port 8080)
  (BookController.java & MemberController.java)
```

### Vite Reverse Proxy Configuration (`frontend/vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 2. Critical Backend Nuances & Normalization

1. **Field Inversion in `BookService.toResponse()`:**  
   In `BookService.java` (lines 119-126), the constructor arguments for `availableCopies` and `totalCopies` were inverted. The frontend's `normalizeBook()` in `src/api/bookService.js` automatically swaps them back so the UI always reflects accurate values.
2. **Sort Parameter in `MemberController.java`:**  
   The member controller expects `@RequestParam String shortBy` (with an 'h'). The frontend adapter `memberService.js` transparently maps standard `sortBy` calls to `shortBy`.
3. **Console Diagnostics:**  
   All HTTP errors and network timeouts are printed to `console.error` with complete request payload and response body context.

---

## 3. Book Management APIs (`BookController.java`)

### 1. `GET /api/books` — Paginated Book Catalog & Search
- **Backend Handler:** `BookController.getAllBooks(page, size, sortBy, direction, search)`
- **Frontend Function:** `bookService.getBooks({ page, size, sortBy, direction, search })`
- **Query Parameters:**
  - `page`: zero-indexed page number (default 0)
  - `size`: items per page (5, 10, 20, 50)
  - `sortBy`: property to sort by (`bookId`, `title`, `author`, `isbn`)
  - `direction`: `"asc"` or `"desc"`
  - `search` *(optional)*: search keyword matching `title` or `author`
- **Response:** Spring Data `Page<BookResponse>`
- **UI Integration:** `BooksPage.jsx` (catalog table & pagination) and `DashboardPage.jsx` (KPI metrics & highlights).

### 2. `GET /api/books/{id}` — Single Book Details
- **Backend Handler:** `BookController.getBookById(id)`
- **Frontend Function:** `bookService.getBookById(id)`
- **Response:** Single `BookResponse` JSON.

### 3. `POST /api/books` — Create New Book
- **Backend Handler:** `BookController.createBook(@Valid @RequestBody BookRequest request)`
- **Frontend Function:** `bookService.createBook(bookData)`
- **Payload:**
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0132350884",
    "totalCopies": 5
  }
  ```
- **Status Codes:** `201 Created` on success, `409 Conflict` if ISBN exists.
- **UI Integration:** `BookFormModal.jsx` handles validation and submits payload.

### 4. `PUT /api/books/{id}` — Update Book Details
- **Backend Handler:** `BookController.updateBook(id, @Valid @RequestBody BookRequest request)`
- **Frontend Function:** `bookService.updateBook(id, bookData)`
- **Payload:** Same schema as POST.
- **Validation:** Backend ensures `totalCopies` cannot be reduced below circulating copies.
- **UI Integration:** Triggered from edit button on `BooksPage.jsx` table row via `BookFormModal.jsx`.

### 5. `DELETE /api/books/{id}` — Delete Book Record
- **Backend Handler:** `BookController.deleteBook(id)`
- **Frontend Function:** `bookService.deleteBook(id)`
- **Response:** `204 No Content`
- **UI Integration:** Triggered from `DeleteBookModal.jsx`.

---

## 4. Member Directory APIs (`MemberController.java`)

### 6. `GET /api/members` — Paginated Members, Status Filter & Search
- **Backend Handler:** `MemberController.getAllMembers(page, size, shortBy, direction, search, status)`
- **Frontend Function:** `memberService.getMembers({ page, size, sortBy, direction, search, status })`
- **Query Parameters:**
  - `page`: current page (default 0)
  - `size`: items per page (default 10)
  - `shortBy`: mapped from `sortBy`
  - `direction`: `"asc"` or `"desc"`
  - `status`: `"ACTIVE"` or `"INACTIVE"`
  - `search` *(optional)*: matches name or email
- **Response:** Spring Data `Page<MemberResponse>`
- **UI Integration:** Powers status tabs, search, and table on `MembersPage.jsx`.

### 7. `GET /api/members/{id}` — Single Member Details
- **Backend Handler:** `MemberController.getMemberById(id)`
- **Frontend Function:** `memberService.getMemberById(id)`
- **Response:** Single `MemberResponse` JSON.

### 8. `POST /api/members` — Register New Member
- **Backend Handler:** `MemberController.createMember(@Valid @RequestBody MemberRequest request)`
- **Frontend Function:** `memberService.createMember(memberData)`
- **Payload:**
  ```json
  {
    "name": "Ankita Zade",
    "email": "ankita@example.com",
    "phone": "8080976977",
    "password": "SecurePassword123"
  }
  ```
- **Security:** Password is encrypted with BCrypt by Spring Boot.
- **UI Integration:** `MemberFormModal.jsx` registers user and updates table.

### 9. `PUT /api/members/{id}` — Update Member Profile
- **Backend Handler:** `MemberController.updateMember(id, @Valid @RequestBody MemberRequest request)`
- **Frontend Function:** `memberService.updateMember(id, memberData)`
- **Payload:** `{ "name": "...", "phone": "..." }` (email is immutable).
- **UI Integration:** Triggered from `MemberFormModal.jsx`.

### 10. `DELETE /api/members/{id}` — Soft Deactivate Member
- **Backend Handler:** `MemberController.deleteMember(id)`
- **Frontend Function:** `memberService.deactivateMember(id)`
- **Backend Logic:** Sets `member.setStatus(Member.Status.INACTIVE)`.
- **UI Integration:** Triggered from `DeactivateMemberModal.jsx`.

---

## 5. Summary Reference Table

| Action | Method & URL | Frontend Service Call | React Component | Backend Controller |
|---|---|---|---|---|
| Dashboard KPIs | `GET /api/books` & `GET /api/members` | `bookService.getBooks` & `memberService.getMembers` | `DashboardPage.jsx` | `BookController` & `MemberController` |
| List / Search Books | `GET /api/books` | `bookService.getBooks()` | `BooksPage.jsx` | `BookController.getAllBooks` |
| Add New Book | `POST /api/books` | `bookService.createBook()` | `BookFormModal.jsx` | `BookController.createBook` |
| Update Book | `PUT /api/books/{id}` | `bookService.updateBook()` | `BookFormModal.jsx` | `BookController.updateBook` |
| Delete Book | `DELETE /api/books/{id}` | `bookService.deleteBook()` | `DeleteBookModal.jsx` | `BookController.deleteBook` |
| List / Filter Members | `GET /api/members` | `memberService.getMembers()` | `MembersPage.jsx` | `MemberController.getAllMembers` |
| Register Member | `POST /api/members` | `memberService.createMember()` | `MemberFormModal.jsx` | `MemberController.createMember` |
| Update Member Profile | `PUT /api/members/{id}` | `memberService.updateMember()` | `MemberFormModal.jsx` | `MemberController.updateMember` |
| Deactivate Account | `DELETE /api/members/{id}` | `memberService.deactivateMember()` | `DeactivateMemberModal.jsx` | `MemberController.deleteMember` |
