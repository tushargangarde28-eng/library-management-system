
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

CREATE TABLE books (
    book_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,

    CONSTRAINT chk_books_total_copies
        CHECK (total_copies >= 0),

    CONSTRAINT chk_books_available_copies
        CHECK (available_copies >= 0),

    CONSTRAINT chk_books_inventory
        CHECK (available_copies <= total_copies)
);

CREATE TABLE members (
    member_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),

    -- Proposed values; confirm the allowed statuses with mentor.
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_members_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE loans (
    loan_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,

    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,

    -- Proposed status values; pending mentor review.
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',

    -- Proposed storage; fine calculation policy is not confirmed.
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_loans_book
        FOREIGN KEY (book_id)
        REFERENCES books(book_id),

    CONSTRAINT fk_loans_member
        FOREIGN KEY (member_id)
        REFERENCES members(member_id),

    CONSTRAINT chk_loans_dates
        CHECK (due_date >= borrow_date),

    CONSTRAINT chk_loans_return_date
        CHECK (return_date IS NULL OR return_date >= borrow_date),

    CONSTRAINT chk_loans_status
        CHECK (status IN ('BORROWED', 'RETURNED')),

    CONSTRAINT chk_loans_fine
        CHECK (fine_amount >= 0),

    INDEX idx_loans_member_status (member_id, status),
    INDEX idx_loans_book_status (book_id, status),
    INDEX idx_loans_due_date (due_date)
);
