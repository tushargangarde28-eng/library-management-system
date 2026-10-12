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
