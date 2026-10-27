package com.library.library_management_system.repository;

import com.library.library_management_system.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);

    Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author, Pageable pageable);

    @Modifying
    @Query("""
            UPDATE Book b
            SET b.availableCopies = b.availableCopies - 1
            WHERE b.bookId = :bookId
              AND b.availableCopies > 0
            """)
    int decreaseAvailableCopies(@Param("bookId")Long bookId);

    @Modifying
    @Query("""
        UPDATE Book b
        SET b.availableCopies = b.availableCopies + 1
        WHERE b.bookId = :bookId
          AND b.availableCopies < b.totalCopies
        """)
    int increaseAvailableCopies(@Param("bookId") Long bookId);
}
