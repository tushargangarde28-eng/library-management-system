
package com.library.library_management_system.repository;

import com.library.library_management_system.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    Long countByMember_MemberIdAndStatus(
            Long memberId,
            Loan.Status status
    );

    Optional<Loan> findByLoanIdAndStatus(
            Long loanId,
            Loan.Status status
    );

    @Query("""
       SELECT l FROM Loan l
       JOIN l.member m
       JOIN l.book b
       WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%'))
       """)
    Page<Loan> searchLoans(
            @Param("search") String search,
            Pageable pageable
    );


    @Query("""
    SELECT l FROM Loan l
    WHERE l.status = :status
      AND l.dueDate < CURRENT_DATE
    ORDER BY l.dueDate ASC
    """)
    List<Loan> findOverdueLoans(
            @Param("status") Loan.Status status
    );

    List<Loan> findByMember_MemberId(Long memberId);
}

