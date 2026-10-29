 package com.library.library_management_system.controller;

import com.library.library_management_system.config.SecurityConfig;
import com.library.library_management_system.dto.loan.LoanRequest;
import com.library.library_management_system.dto.loan.LoanResponse;
import com.library.library_management_system.exception.GlobalExceptionHandler;
import com.library.library_management_system.service.JwtService;
import com.library.library_management_system.service.LoanService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoanController.class)
@Import({
        SecurityConfig.class,
        GlobalExceptionHandler.class
})
class LoanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LoanService loanService;

    @MockitoBean
    private JwtService jwtService;

    private static final String ADMIN_TOKEN = "valid-admin-token";
    private static final String STUDENT_TOKEN = "valid-student-token";

    private String adminToken() {
        when(jwtService.extractEmail(ADMIN_TOKEN))
                .thenReturn("admin@example.com");
        when(jwtService.extractRole(ADMIN_TOKEN))
                .thenReturn("ADMIN");
        when(jwtService.isTokenValid(
                ADMIN_TOKEN,
                "admin@example.com"
        )).thenReturn(true);

        return "Bearer " + ADMIN_TOKEN;
    }

    private String studentToken() {
        when(jwtService.extractEmail(STUDENT_TOKEN))
                .thenReturn("student@example.com");
        when(jwtService.extractRole(STUDENT_TOKEN))
                .thenReturn("STUDENT");
        when(jwtService.isTokenValid(
                STUDENT_TOKEN,
                "student@example.com"
        )).thenReturn(true);

        return "Bearer " + STUDENT_TOKEN;
    }

    private String validLoanJson() {
        return """
                {
                    "memberId": 1,
                    "bookId": 1
                }
                """;
    }

    private LoanResponse loanResponse() {
        LoanResponse response = new LoanResponse();
        response.setLoanId(1L);
        response.setMemberId(1L);
        response.setMemberName("Test Member");
        response.setBookId(1L);
        response.setBookTitle("Clean Code");
        response.setIssueDate(LocalDate.of(2026, 10, 20));
        response.setDueDate(LocalDate.of(2026, 11, 3));
        response.setReturnDate(null);
        response.setFine(BigDecimal.ZERO);
        response.setStatus("ACTIVE");
        return response;
    }

    // Test 1: Borrow a book successfully
    @Test
    void borrowBook_ShouldReturnCreated_WhenRequestIsValid()
            throws Exception {

        when(loanService.borrowBook(any(LoanRequest.class)))
                .thenReturn(loanResponse());

        mockMvc.perform(post("/api/loans/borrow")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoanJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.loanId").value(1))
                .andExpect(jsonPath("$.memberId").value(1))
                .andExpect(jsonPath("$.bookId").value(1))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // Test 2: Reject a missing member ID
    @Test
    void borrowBook_ShouldReturnBadRequest_WhenMemberIdIsMissing()
            throws Exception {

        String invalidJson = """
                {
                    "bookId": 1
                }
                """;

        mockMvc.perform(post("/api/loans/borrow")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // Test 3: Reject a non-positive book ID
    @Test
    void borrowBook_ShouldReturnBadRequest_WhenBookIdIsZero()
            throws Exception {

        String invalidJson = """
                {
                    "memberId": 1,
                    "bookId": 0
                }
                """;

        mockMvc.perform(post("/api/loans/borrow")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // Test 4: Return a book successfully
    @Test
    void returnBook_ShouldReturnOk_WhenLoanExists()
            throws Exception {

        LoanResponse returnedLoan = loanResponse();
        returnedLoan.setStatus("RETURNED");
        returnedLoan.setReturnDate(LocalDate.of(2026, 10, 28));

        when(loanService.returnBook(1L))
                .thenReturn(returnedLoan);

        mockMvc.perform(put("/api/loans/1/return")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loanId").value(1))
                .andExpect(jsonPath("$.status").value("RETURNED"));
    }

    // Test 5: Get all loans
    @Test
    void getAllLoans_ShouldReturnLoans_WhenLoansExist()
            throws Exception {

        Page<LoanResponse> loanPage = new PageImpl<>(
                List.of(loanResponse()),
                PageRequest.of(0, 10),
                1
        );

        when(loanService.getAllLoans(anyString(), any()))
                .thenReturn(loanPage);

        mockMvc.perform(get("/api/loans")
                        .header("Authorization", adminToken())
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].loanId").value(1))
                .andExpect(jsonPath("$.content[0].bookTitle")
                        .value("Clean Code"));
    }

    // Test 6: Get overdue loans
    @Test
    void getOverdueLoans_ShouldReturnOk()
            throws Exception {

        when(loanService.getOverDueLoans())
                .thenReturn(List.of(loanResponse()));

        mockMvc.perform(get("/api/loans/overdueLoans")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].loanId").value(1));
    }

    // Test 7: Get current student's loans
    @Test
    void getMyLoans_ShouldReturnCurrentStudentLoans()
            throws Exception {

        when(loanService.getMyLoans("student@example.com"))
                .thenReturn(List.of(loanResponse()));

        mockMvc.perform(get("/api/loans/myloans")
                        .header("Authorization", studentToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].loanId").value(1));

        org.mockito.Mockito.verify(loanService)
                .getMyLoans("student@example.com");
    }

    // Test 8: Reject request without authentication
    @Test
    void getAllLoans_ShouldReturnUnauthorized_WhenTokenIsMissing()
            throws Exception {

        mockMvc.perform(get("/api/loans"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message")
                        .value("Authentication required"));
    }

    // Test 9: Reject a student trying to borrow a book
    @Test
    void borrowBook_ShouldReturnForbidden_WhenStudentAttemptsBorrow()
            throws Exception {

        mockMvc.perform(post("/api/loans/borrow")
                        .header("Authorization", studentToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoanJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message")
                        .value("Access denied: insufficient permissions"));
    }

    // Test 10: Reject a student trying to view all loans
    @Test
    void getAllLoans_ShouldReturnForbidden_WhenStudentRequestsAllLoans()
            throws Exception {

        mockMvc.perform(get("/api/loans")
                        .header("Authorization", studentToken()))
                .andExpect(status().isForbidden());
    }

    // Test 11: Reject an admin trying to access the student-only endpoint
    @Test
    void getMyLoans_ShouldReturnForbidden_WhenAdminRequestsIt()
            throws Exception {

        mockMvc.perform(get("/api/loans/myloans")
                        .header("Authorization", adminToken()))
                .andExpect(status().isForbidden());
    }
}