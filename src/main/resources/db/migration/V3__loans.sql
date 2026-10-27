
CREATE TABLE loans (
                       loan_id BIGINT NOT NULL AUTO_INCREMENT,
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

                       CONSTRAINT pk_loans
                           PRIMARY KEY (loan_id),

                       CONSTRAINT fk_loans_member
                           FOREIGN KEY (member_id)
                               REFERENCES members(member_id),

                       CONSTRAINT fk_loans_book
                           FOREIGN KEY (book_id)
                               REFERENCES books(book_id),

                       CONSTRAINT chk_loans_fine
                           CHECK (fine >= 0),

                       CONSTRAINT chk_loans_dates
                           CHECK (due_date >= issue_date),

                       CONSTRAINT chk_loans_return_date
                           CHECK (return_date IS NULL OR return_date >= issue_date),

                       CONSTRAINT chk_loans_status
                           CHECK (status IN ('ACTIVE', 'RETURNED')),

                       CONSTRAINT chk_loans_return_status
                           CHECK (
                               (status = 'ACTIVE' AND return_date IS NULL)
                                   OR
                               (status = 'RETURNED' AND return_date IS NOT NULL)
                               )
);
