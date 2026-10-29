
package com.library.library_management_system.controller;

import com.library.library_management_system.dto.loan.LoanRequest;
import com.library.library_management_system.dto.loan.LoanResponse;
import com.library.library_management_system.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }



    @GetMapping("/overdueLoans")
    public ResponseEntity<List<LoanResponse>> overdueLoans(){

        List<LoanResponse> response = loanService.getOverDueLoans();
        return ResponseEntity.ok(response);

    }

    @GetMapping("/myloans")
    public ResponseEntity<List<LoanResponse>> getMyLoans(){
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        List<LoanResponse>response = loanService.getMyLoans(email);
        return ResponseEntity.ok(response);
    }

    // Borrow a book
    @PostMapping("/borrow")
    public ResponseEntity<LoanResponse> borrowBook(
            @Valid @RequestBody LoanRequest request) {

        LoanResponse response = loanService.borrowBook(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<LoanResponse> returnBook(
            @PathVariable Long id) {

        LoanResponse response = loanService.returnBook(id);
        return ResponseEntity.ok(response);
    }

// Get all loans with pagination and search
    @GetMapping
    public ResponseEntity<Page<LoanResponse>> getAllLoans(
            @RequestParam(defaultValue = "") String search,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "loanId",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        Page<LoanResponse> result =
                loanService.getAllLoans(search, pageable);

        return ResponseEntity.ok(result);
    }

}
