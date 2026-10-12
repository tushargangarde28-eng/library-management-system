# Library Management System — Requirements


---

## 1. Project Overview

The Library Management System is a backend REST API designed to manage books, library members, borrowing and returning transactions, overdue fines, and administrative reports.

The application will be developed using Java 21, Maven, Spring Boot 3.x, and MySQL, following the official internship guide.

## 2. User Roles

The system supports two roles: `ADMIN` and `MEMBER`.

### 2.1 ADMIN

An administrator can:

* Add, view, update, and delete books.
* Manage and search library members.
* Borrow and return books on behalf of any member.
* View member borrowing histories.
* Access overdue-loan reports and other required administrative reports.
* Access administrative functions permitted by the authorization rules.

### 2.2 MEMBER

A registered member can:

* Browse and search books.
* View book availability.
* Borrow available books within the configured borrowing limit.
* Return borrowed books.
* View their own borrowing history only.
* Access protected resources according to their assigned permissions.

## 3. Functional Requirements

### 3.1 Book Management

The system shall:

* Create, retrieve, update, and delete book records according to defined rules.
* Store book details, including title, author, ISBN, and copy inventory.
* Support book searching.
* Display available copies.
* Prevent inventory from becoming negative.
* Reject invalid inventory updates and applicable business-rule violations.

### 3.2 Member Management

The system shall:

* Store member information and authentication credentials.
* Allow administrators to manage member records.
* Validate member data before saving.
* Store passwords securely using BCrypt hashing.
* Enforce role-based access control.
* Prevent members from viewing another member's private borrowing history.

**Pending policy decision:** The mentor must confirm how to handle member deletion when active loans exist.

### 3.3 Borrowing and Returning Books

The system shall:

* Allow authorized users to borrow available books.
* Record the member, book, issue date, due date, and return date as applicable.
* Enforce the approved maximum number of active loans per member.
* Decrease available inventory after a successful borrowing transaction.
* Increase available inventory after a successful return.
* Reject borrowing when no copies are available.
* Reject a second return of an already returned loan.
* Preserve completed loan history.
* Maintain inventory integrity during concurrent borrowing and returning requests.

### 3.4 Fine Calculation

The system shall:

* Calculate overdue fines using the approved daily fine rule.
* Calculate the fine using overdue days and the configured daily rate.
* Apply no overdue fine when a book is returned on or before its due date.
* Provide overdue information for administrative reporting.

**Pending decisions:** Loan period, fine per day, and the precise overdue-day calculation rule.

### 3.5 Reports

The system shall provide the administrative reports required by the internship guide, including overdue-loan reports and relevant borrowing information.

Only authorized users may access administrative reports.

## 4. Core Business Rules

| Rule                  | Requirement                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| Book availability     | Borrowing is permitted only when an available copy exists.                  |
| Inventory integrity   | Available copies must never become negative.                                |
| Borrowing limit       | The current mentor-confirmed limit is 5 active loans per member.            |
| Due date              | Calculated using the issue date and the approved loan period.               |
| Fine calculation      | Based on overdue days and the approved daily fine.                          |
| On-time return        | No overdue fine applies when returned on or before the due date.            |
| Duplicate return      | An already returned loan cannot be returned again.                          |
| Loan history          | Completed loan records must be retained.                                    |
| Member privacy        | Members can access only their own borrowing history.                        |
| Administrative access | ADMIN can access authorized administrative operations and member histories. |
| Authentication        | Protected endpoints require valid authentication.                           |
| Authorization         | Access must follow the user's role and permissions.                         |

### 4.1 Confirmed and Pending Values

| Business Rule           | Current Value      | Status              |
| ----------------------- | ------------------ | ------------------- |
| Maximum active loans    | 5 books per member | Confirmed by mentor |
| Loan period             | Not yet confirmed  | Pending             |
| Fine per day            | Not yet confirmed  | Pending             |
| Overdue-day calculation | Not yet confirmed  | Pending             |

The previously discussed examples of 14 days and ₹5 per overdue day are not approved decisions.

### 4.2 Business Rule Change Policy

* The mentor may revise business rules at any time.
* Record every confirmed change with its date and source of confirmation.
* Update the requirements and related design documents when a change is approved.
* Review the affected implementation and tests before applying an approved change.
* Do not treat an unconfirmed suggestion as a final requirement.
* Do not implement changes to requirements without the required mentor confirmation.

## 5. API and Security Requirements

The application shall expose REST endpoints for book management, member management, borrowing, returning, fines, and reporting.

The implementation shall:

* Use appropriate HTTP methods and status codes.
* Validate incoming request data using Bean Validation.
* Return consistent and meaningful error responses.
* Authenticate users using JWT access tokens.
* Store passwords as BCrypt hashes, never as plain text.
* Apply authentication and role-based authorization through Spring Security.
* Return `401 Unauthorized` for missing or invalid authentication where applicable.
* Return `403 Forbidden` when an authenticated user lacks permission.
* Return `404 Not Found` when the requested resource does not exist.
* Return `409 Conflict` for applicable business-rule conflicts.
* Document endpoints using Swagger/OpenAPI.

Exact endpoint paths, request and response structures, and error formats will be documented in `docs/api.md` before implementation.

## 6. Database and Architecture Requirements

The application shall use MySQL for persistent storage and Spring Data JPA for database access.

### 6.1 Initial Entities

**Book**

Stores book information and inventory.

Proposed attributes:

* `book_id`
* `title`
* `author`
* `isbn`
* `total_copies`
* `available_copies`

**Member**

Stores member information and authentication-related data.

Proposed attributes:

* `member_id`
* `name`
* `email`
* `password_hash`
* `role`

**Loan**

Stores borrowing and return transactions.

Proposed attributes:

* `loan_id`
* `member_id`
* `book_id`
* `issue_date`
* `due_date`
* `return_date`

These attributes are preliminary and require design review.

### 6.2 Data Integrity

* Primary keys shall uniquely identify records.
* Foreign keys shall maintain relationships between loans, books, and members.
* Appropriate uniqueness and validation constraints shall be defined.
* Inventory updates shall prevent negative available-copy counts.
* Loan history shall be preserved.
* Database relationships and deletion policies shall be finalized before implementation.

### 6.3 Architecture

The application will follow the approved backend architecture and separate responsibilities into appropriate layers.

The detailed architecture will be documented in `docs/architecture.md`.

## 7. Technology Stack

| Area                 | Technology                      |
| -------------------- | ------------------------------- |
| Programming language | Java 21                         |
| Build tool           | Maven                           |
| Backend framework    | Spring Boot 3.x                 |
| REST API             | Spring Web                      |
| Database access      | Spring Data JPA                 |
| Database             | MySQL                           |
| Validation           | Bean Validation                 |
| Security             | Spring Security and JWT         |
| Password hashing     | BCrypt                          |
| Unit testing         | JUnit 5 and Mockito             |
| API testing          | MockMvc                         |
| Logging              | SLF4J                           |
| API documentation    | Swagger/OpenAPI using springdoc |
| Version control      | Git and GitHub                  |
| Containerization     | Docker and Docker Compose       |

## 8. Scope Exclusions

The following features are excluded by the internship guide and must not be added without explicit mentor approval:

* Book reservations.
* Loan renewal.
* Email reminders.
* Audit logs.
* Refresh tokens.
* CI/CD pipelines.

## 9. Pending Mentor Decisions

| Question                                                                      | Status  |
| ----------------------------------------------------------------------------- | ------- |
| What is the approved loan period?                                             | Pending |
| What is the approved fine per overdue day?                                    | Pending |
| How should overdue days be counted?                                           | Pending |
| What should happen when deleting a member or book with existing loan records? | Pending |
| Are additional API or response-format rules required?                         | Pending |

The borrowing limit of 5 active loans per member has been confirmed by the mentor, based on the information recorded on 2026-10-09.

## 10. Expected Deliverables

The project is expected to provide:

* Required REST API endpoints.
* JWT authentication and role-based authorization.
* Database schema and ER diagram.
* Correct inventory handling during borrowing and returning.
* Fine calculation and required reports.
* Automated tests runnable with one command.
* Swagger/OpenAPI documentation.
* Docker Compose configuration.
* README setup instructions targeting completion within 15 minutes.
* Clean GitHub commit history.
* Documentation that enables the intern to explain the implementation independently.

## 11. Verification and Review Status

| Item                                   | Status                                 |
| -------------------------------------- | -------------------------------------- |
| Requirements document                  | Draft prepared; user-reported as saved |
| ER diagram                             | User-reported as saved and previewed   |
| Mentor review of complete requirements | Pending                                |
| Borrowing limit                        | Confirmed: 5 active loans              |
| Loan period                            | Pending                                |
| Fine per day                           | Pending                                |
| Database schema                        | Pending                                |
| API documentation                      | Pending                                |
| Architecture documentation             | Pending                                |
| Environment setup                      | Not verified                           |
| Implementation and automated tests     | Not verified                           |

A saved document or preview does not establish mentor approval or successful implementation.

## 12. Document Control

* **File:** `docs/requirements.md`
* **Purpose:** Record project requirements and business rules.
* **Primary source:** Library Management System Internship Guide.
* **Current status:** Draft — Pending Mentor Review.
* **Change control:** Confirm requirement changes with the mentor and record approved decisions before implementation.
* **AI disclosure:** AI assistance was used to draft and format this document. Record the assistance and any external sources used in `docs/disclosure.md`, as required by the internship guide.
