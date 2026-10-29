package com.library.library_management_system.service;

import com.library.library_management_system.dto.loan.LoanRequest;
import com.library.library_management_system.dto.loan.LoanResponse;
import com.library.library_management_system.entity.Book;
import com.library.library_management_system.entity.Loan;
import com.library.library_management_system.entity.Member;
import com.library.library_management_system.exception.BusinessRuleException;
import com.library.library_management_system.exception.ResourceNotFoundException;
import com.library.library_management_system.repository.BookRepository;
import com.library.library_management_system.repository.LoanRepository;
import com.library.library_management_system.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public LoanService(
            LoanRepository loanRepository,
            BookRepository bookRepository,
            MemberRepository memberRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    @Value("${library.loan.borrowing-limit}")
    private long borrowingLimit;

    @Value("${library.loan.period-days}")
    private long loanPeriodDays;

    @Value("${library.loan.fine-per-day}")
    private BigDecimal finePerDay;

    private static final Logger logger =
            LoggerFactory.getLogger(LoanService.class);

    private Member getMemberOrThrow(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Member not found with Id: " + memberId
                        ));

        if (member.getStatus() != Member.Status.ACTIVE) {
            throw new BusinessRuleException(
                    "Inactive member cannot borrow books."
            );
        }

        return member;
    }

    private Book getBookOrThrow(Long bookId){

        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book Not Found with Id :"+bookId
                ));
    }

    private void validateBorrowingLimit(Long memberId, long borrowingLimit){
        long activeLoans = loanRepository.countByMember_MemberIdAndStatus(memberId, Loan.Status.ACTIVE);

        if(activeLoans >= borrowingLimit ){
            throw new BusinessRuleException(
                    "Member has reached the borrowing limit."
            );
        }
    }

    private BigDecimal calculateFine(Loan loan, LocalDate actualReturnDate) {

        if (!actualReturnDate.isAfter(loan.getDueDate())) {
            return BigDecimal.ZERO;
        }

        long overdueDays = ChronoUnit.DAYS.between(
                loan.getDueDate(),
                actualReturnDate
        );

        return finePerDay.multiply(BigDecimal.valueOf(overdueDays));
    }

//    Get All Loans

    @Transactional(readOnly = true)
    public Page<LoanResponse> getAllLoans(
            String search,
            Pageable pageable
    ) {
        Page<Loan> loans;

        if (search == null || search.isBlank()) {
            loans = loanRepository.findAll(pageable);
        } else {
            loans = loanRepository.searchLoans(search.trim(), pageable);
        }

        logger.info("Fetching loans with search keyword: {}", search);
        return loans.map(this::toLoanResponse);
    }

    @Transactional
    public LoanResponse borrowBook(LoanRequest request){
            Member member = getMemberOrThrow(request.getMemberId());
            Book book = getBookOrThrow(request.getBookId());
            validateBorrowingLimit(member.getMemberId(), borrowingLimit);

            int updateRows = bookRepository.decreaseAvailableCopies(book.getBookId());

            if (updateRows == 0 ) {
                throw new BusinessRuleException(
                        "Book is not Available for Borrowing"
                );
            }

                Loan loan = new Loan();
                loan.setMember(member);
                loan.setBook(book);
                loan.setIssueDate(LocalDate.now());
                loan.setDueDate(LocalDate.now().plusDays(loanPeriodDays));
                loan.setStatus(Loan.Status.ACTIVE);

                Loan savedLoan = loanRepository.save(loan);

        logger.info("Processing book borrowing request for member ID: {} and book ID: {}",
                request.getMemberId(), request.getBookId());
                return toLoanResponse(savedLoan);

    }

    @Transactional
    public LoanResponse returnBook(Long loanId){
        Loan loan = loanRepository.findByLoanIdAndStatus(loanId, Loan.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active Loan Not Found with these Id: "+loanId
                ));

        LocalDate actualReturnDate = LocalDate.now();
        BigDecimal fine = calculateFine(loan, actualReturnDate);

        int updatedRows = bookRepository.increaseAvailableCopies(
                loan.getBook().getBookId()
        );

        if (updatedRows == 0) {
            throw new BusinessRuleException(
                    "Book availability could not be updated."
            );
        }
        loan.setReturnDate(actualReturnDate);

        loan.setFine(fine);
        loan.setStatus(Loan.Status.RETURNED);

        Loan returnLoan = loanRepository.save(loan);
        logger.info("Processing book return request for loan ID: {}", loanId);
        return toLoanResponse(returnLoan);

    }

    //get All Overdue Loans
    @Transactional(readOnly = true)
    public List<LoanResponse> getOverDueLoans(){
        List<Loan> overDueLoans =
                loanRepository.findOverdueLoans(Loan.Status.ACTIVE);

        logger.info("Fetching Overdue Loans. Total Found :{}", overDueLoans.size());

        return overDueLoans.stream()
                .map(this::toLoanResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public  List<LoanResponse> getMyLoans(String email){
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("Member not found with email"+email));
        return loanRepository
                .findByMember_MemberId(member.getMemberId())
                .stream()
                .map(this::toLoanResponse)
                .collect(Collectors.toList());
    }




    private LoanResponse toLoanResponse(Loan loan) {
        LoanResponse response = new LoanResponse();

        response.setLoanId(loan.getLoanId());

        response.setMemberId(
                loan.getMember().getMemberId()
        );
        response.setMemberName(
                loan.getMember().getName()
        );

        response.setBookId(
                loan.getBook().getBookId()
        );
        response.setBookTitle(
                loan.getBook().getTitle()
        );

        response.setIssueDate(loan.getIssueDate());
        response.setDueDate(loan.getDueDate());
        response.setReturnDate(loan.getReturnDate());
        response.setFine(loan.getFine());
        response.setStatus(loan.getStatus().name());

        return response;
    }

}
