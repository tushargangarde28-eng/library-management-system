package com.library.library_management_system.dto.loan;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class LoanRequest {

    @NotNull(message = "Member ID is required")
    @Positive(message = "Member ID must be positive")
    private Long memberId;

    @NotNull(message = "Book ID is required")
    @Positive(message = "Book ID must be positive")
    private Long bookId;

    public LoanRequest() {
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
}
