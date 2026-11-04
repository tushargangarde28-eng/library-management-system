
package com.library.library_management_system.dto.loan;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoanConfigurationRequest {

    @NotNull(message = "Borrowing limit is required.")
    @Min(value = 1, message = "Borrowing limit must be at least 1.")
    private Integer borrowingLimit;

    @NotNull(message = "Loan period is required.")
    @Min(value = 1, message = "Loan period must be at least 1 day.")
    private Integer periodDays;

    @NotNull(message = "Fine per day is required.")
    @DecimalMin(value = "0.00", message = "Fine per day cannot be negative.")
    private BigDecimal finePerDay;

    public Integer getBorrowingLimit() {
        return borrowingLimit;
    }

    public void setBorrowingLimit(Integer borrowingLimit) {
        this.borrowingLimit = borrowingLimit;
    }

    public Integer getPeriodDays() {
        return periodDays;
    }

    public void setPeriodDays(Integer periodDays) {
        this.periodDays = periodDays;
    }

    public BigDecimal getFinePerDay() {
        return finePerDay;
    }

    public void setFinePerDay(BigDecimal finePerDay) {
        this.finePerDay = finePerDay;
    }
}
