# Library Management System — REST API

**Status:** Draft — Pending Mentor Review

Base path: `/api`

## 1. Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate and obtain JWT | Public |
| POST | `/api/auth/register` | Register a member, if approved | Pending confirmation |

## 2. Books

| Method | Endpoint | Purpose | Proposed access |
|---|---|---|---|
| POST | `/api/books` | Create a book | ADMIN |
| GET | `/api/books` | List books with pagination, sorting and search | Authenticated |
| GET | `/api/books/{bookId}` | Get book details | Authenticated |
| PUT | `/api/books/{bookId}` | Update book details | ADMIN |
| DELETE | `/api/books/{bookId}` | Delete a book, subject to loan restrictions | ADMIN |

## 3. Members

| Method | Endpoint | Purpose | Proposed access |
|---|---|---|---|
| POST | `/api/members` | Create a member | ADMIN |
| GET | `/api/members` | List/search members | ADMIN |
| GET | `/api/members/{memberId}` | Get member details | ADMIN or authorized member |
| PUT | `/api/members/{memberId}` | Update member details | ADMIN |
| PATCH | `/api/members/{memberId}/status` | Activate/deactivate a member | ADMIN |

## 4. Borrow and Return

| Method | Endpoint | Purpose | Proposed access |
|---|---|---|---|
| POST | `/api/loans` | Borrow a book | Authenticated member / ADMIN as approved |
| GET | `/api/loans/{loanId}` | Get loan details | ADMIN or loan owner |
| GET | `/api/members/{memberId}/loans` | View a member's loans | ADMIN or loan owner |
| POST | `/api/loans/{loanId}/return` | Return a borrowed book | ADMIN or authorized member |

## 5. Reports

| Method | Endpoint | Purpose | Proposed access |
|---|---|---|---|
| GET | `/api/reports/loans` | Loan report | ADMIN |
| GET | `/api/reports/overdue` | Overdue loans | ADMIN |
| GET | `/api/reports/fines` | Fine report | ADMIN |

## 6. Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/actuator/health` | Application health check |

