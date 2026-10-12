# Library Management System — Architecture

**Status:** Draft — Pending Mentor Review

## 1. Technology and Layers

- Client: Postman or another approved API consumer.
- Security: Spring Security and JWT authentication/authorization.
- Controller: Spring Web REST controllers and request validation.
- Service: Business rules and transactional operations.
- Repository: Spring Data JPA database access.
- Database: MySQL.
- Testing: JUnit 5, Mockito and MockMvc.

## 2. Borrow Request Flow

1. The client sends `POST /api/loans` with the requested book information.
2. Spring Security authenticates the request and checks authorization.
3. The Loan Controller validates the request and delegates to the Loan Service.
4. The Loan Service checks member eligibility, available inventory and the configured borrowing limit.
5. Within a transaction, the application safely reserves one available copy and creates the loan record.
6. The Repository persists the changes through JPA to MySQL.
7. The transaction commits if the operation succeeds; otherwise, the changes roll back.
8. The Controller returns the appropriate HTTP response.

## 3. Return Request Flow

1. The client sends `POST /api/loans/{loanId}/return`.
2. Security verifies the caller's identity and permissions.
3. The Controller delegates to the Loan Service.
4. The Service verifies that the loan exists and has not already been returned.
5. Within a transaction, the application records the return date, updates loan status and restores one available copy.
6. Any applicable fine is calculated according to the mentor-approved policy.
7. The transaction commits and the API returns the result.

## 4. Inventory Integrity

- Do not allow borrowing when no copies are available.
- Do not allow available inventory to become negative.
- Prevent the same loan from being returned twice.
- Ensure loan creation and inventory decrement succeed or fail together.
- Protect against concurrent borrow requests using an appropriate database locking or guarded-update strategy.
- Ensure return processing does not increment inventory more than once.

## 5. Business Rules — Approval Required

| Rule | Current decision |
|---|---|
| Loan period | Pending mentor confirmation |
| Maximum active loans per member | Pending exact value |
| Fine per overdue day | Pending mentor confirmation |
| Duplicate ISBN | Must be rejected |
| Duplicate member email | Must be rejected |
| Borrowing unavailable inventory | Must be rejected |
| Returning an already returned loan | Must be rejected |

## 6. Testing Expectations

- Unit tests for borrowing and return business rules.
- Tests for unavailable inventory and borrowing-limit violations.
- Tests for duplicate returns and invalid loan IDs.
- Tests for inventory consistency after success and failure.
- Controller tests using MockMvc.
- Database integration tests for constraints and transactional behavior.

