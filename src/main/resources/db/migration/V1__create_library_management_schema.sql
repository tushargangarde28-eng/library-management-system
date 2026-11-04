-- =====================================================
-- Library Management System
-- Flyway migration: V1__create_library_management_schema.sql
-- Database: MySQL 8.0+
--
-- Fresh-schema migration. This migration does not DROP
-- existing tables or databases.
-- =====================================================

-- 1. ROLES
CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT chk_roles_role_name
        CHECK (role_name IN ('ADMIN', 'STUDENT'))
) ENGINE=InnoDB;

-- 2. USERS
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_users_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB;

-- Add circular FK after USERS exists.
ALTER TABLE roles
    ADD CONSTRAINT fk_roles_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- 3. MEMBERS
CREATE TABLE members (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_members_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. BOOKS
CREATE TABLE books (
    book_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    total_copies INT NOT NULL DEFAULT 0,
    available_copies INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_books_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_books_total_copies
        CHECK (total_copies >= 0),
    CONSTRAINT chk_books_available_copies
        CHECK (
            available_copies >= 0
            AND available_copies <= total_copies
        )
) ENGINE=InnoDB;

-- 5. PERMISSIONS
CREATE TABLE permissions (
    permission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_permissions_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. ROLE PERMISSIONS
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(permission_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. USER PERMISSIONS
CREATE TABLE user_permissions (
    user_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    PRIMARY KEY (user_id, permission_id),
    CONSTRAINT fk_user_permissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_user_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(permission_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_user_permissions_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. LOANS
CREATE TABLE loans (
    loan_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    fine DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_loans_member
        FOREIGN KEY (member_id)
        REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_loans_book
        FOREIGN KEY (book_id)
        REFERENCES books(book_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_loans_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_loans_dates
        CHECK (
            due_date >= issue_date
            AND (return_date IS NULL OR return_date >= issue_date)
        ),
    CONSTRAINT chk_loans_fine
        CHECK (fine >= 0),
    CONSTRAINT chk_loans_status
        CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE'))
) ENGINE=InnoDB;

-- 9. LOAN CONFIGURATION
CREATE TABLE loan_configuration (
    id BIGINT PRIMARY KEY,
    borrowing_limit INT NOT NULL,
    period_days INT NOT NULL,
    fine_per_day DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT NULL,
    CONSTRAINT fk_loan_configuration_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_loan_configuration_id
        CHECK (id = 1),
    CONSTRAINT chk_loan_configuration_limit
        CHECK (borrowing_limit > 0),
    CONSTRAINT chk_loan_configuration_period
        CHECK (period_days > 0),
    CONSTRAINT chk_loan_configuration_fine
        CHECK (fine_per_day >= 0)
) ENGINE=InnoDB;

-- 10. INITIAL ROLES
INSERT INTO roles (role_name, description)
VALUES
    ('ADMIN', 'Administrator with full system access'),
    ('STUDENT', 'Student with library borrowing access');

-- 11. INITIAL PERMISSIONS
INSERT INTO permissions (permission_name, description)
VALUES
    ('BOOK_CREATE', 'Create new books'),
    ('BOOK_READ', 'View books'),
    ('BOOK_UPDATE', 'Update book information'),
    ('BOOK_DELETE', 'Delete books'),
    ('MEMBER_MANAGE', 'Manage library members'),
    ('LOAN_MANAGE', 'Manage all loans'),
    ('LOAN_VIEW_OWN', 'View own loan history'),
    ('LOAN_BORROW', 'Borrow books'),
    ('LOAN_RETURN', 'Return borrowed books'),
    ('REPORT_VIEW', 'View library reports'),
    ('CONFIGURATION_MANAGE', 'Manage library configuration');

-- 12. ALL PERMISSIONS TO ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.role_name = 'ADMIN';

-- 13. BASIC PERMISSIONS TO STUDENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.role_name = 'STUDENT'
  AND p.permission_name IN (
      'BOOK_READ',
      'LOAN_VIEW_OWN',
      'LOAN_BORROW',
      'LOAN_RETURN'
  );

-- 14. INITIAL LOAN CONFIGURATION
INSERT INTO loan_configuration (
    id,
    borrowing_limit,
    period_days,
    fine_per_day
)
VALUES (1, 3, 8, 5.00);


-- 15. INITIAL USERS (Password: 12345678)
-- BCrypt hash verified: $2a$10$3/RsOdorVxCQRYxfMmV.SOoJWtRieb08u7UQDupr729GjOnojqBtW
INSERT INTO users (email, password_hash, role_id, status)
VALUES
    ('admin@library.com', '$2a$10$3/RsOdorVxCQRYxfMmV.SOoJWtRieb08u7UQDupr729GjOnojqBtW', (SELECT role_id FROM roles WHERE role_name = 'ADMIN'), 'ACTIVE'),
    ('student@library.com', '$2a$10$3/RsOdorVxCQRYxfMmV.SOoJWtRieb08u7UQDupr729GjOnojqBtW', (SELECT role_id FROM roles WHERE role_name = 'STUDENT'), 'ACTIVE');

-- 16. INITIAL MEMBERS PROFILES
INSERT INTO members (user_id, name, phone)
VALUES
    ((SELECT user_id FROM users WHERE email = 'admin@library.com'), 'System Administrator', '9876543210'),
    ((SELECT user_id FROM users WHERE email = 'student@library.com'), 'Student User', '9123456780');

-- 17. INITIAL SAMPLE BOOKS (For immediate catalog & loan testing)
INSERT INTO books (title, author, isbn, total_copies, available_copies)
VALUES
    ('Clean Code', 'Robert C. Martin', '978-0132350884', 5, 5),
    ('Effective Java', 'Joshua Bloch', '978-0134685991', 4, 4),
    ('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', '978-0135957059', 3, 3);