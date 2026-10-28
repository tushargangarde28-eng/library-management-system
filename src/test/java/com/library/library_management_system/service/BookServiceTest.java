 package com.library.library_management_system.service;

 import com.library.library_management_system.dto.BookRequest;
 import com.library.library_management_system.dto.BookResponse;
 import com.library.library_management_system.entity.Book;
 import com.library.library_management_system.repository.BookRepository;
 import org.junit.jupiter.api.Test;
 import org.junit.jupiter.api.extension.ExtendWith;
 import org.mockito.InjectMocks;
 import org.mockito.Mock;
 import org.mockito.junit.jupiter.MockitoExtension;

 import static org.junit.jupiter.api.Assertions.*;
 import static org.mockito.Mockito.*;



@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;


    @Test
    void getBookById_ShouldReturnBook_WhenBookExists() {
        Book book = new Book();
        book.setBookId(1L);
        book.setTitle("Java Programming");
        book.setAuthor("James Gosling");
        book.setIsbn("9781234567890");
        book.setTotalCopies(5);
        book.setAvailableCopies(5);

        when(bookRepository.findById(1L))
                .thenReturn(java.util.Optional.of(book));

        BookResponse response = bookService.getBookById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getBookId());
        assertEquals("Java Programming", response.getTitle());
        assertEquals("James Gosling", response.getAuthor());
        assertEquals(5, response.getTotalCopies());
        assertEquals(5, response.getAvailableCopies());

        verify(bookRepository).findById(1L);
    }

    @Test
    void createBook_ShouldSaveBook_WhenIsbnIsUnique() {

        // Arrange
        BookRequest request = new BookRequest();
        request.setTitle("Java Programming");
        request.setAuthor("James Gosling");
        request.setIsbn("9781234567890");
        request.setTotalCopies(5);

        when(bookRepository.existsByIsbn(request.getIsbn()))
                .thenReturn(false);

        when(bookRepository.save(any(Book.class)))
                .thenAnswer(invocation -> {
                    Book book = invocation.getArgument(0);
                    book.setBookId(1L);
                    return book;
                });

        // Act
        BookResponse response = bookService.createBook(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getBookId());
        assertEquals("Java Programming", response.getTitle());
        assertEquals("James Gosling", response.getAuthor());
        assertEquals("9781234567890", response.getIsbn());
        assertEquals(5, response.getTotalCopies());
        assertEquals(5, response.getAvailableCopies());

        verify(bookRepository).existsByIsbn("9781234567890");
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    void createBook_ShouldThrowException_WhenIsbnAlreadyExists() {

        // Arrange
        String isbn = "9781234567890";

        com.library.library_management_system.dto.BookRequest request =
                new com.library.library_management_system.dto.BookRequest();

        request.setTitle("Java Programming");
        request.setAuthor("James Gosling");
        request.setIsbn(isbn);
        request.setTotalCopies(5);

        when(bookRepository.existsByIsbn(isbn)).thenReturn(true);

        // Act & Assert
        assertThrows(
                com.library.library_management_system.exception.DuplicateResourceException.class,
                () -> bookService.createBook(request)
        );

        verify(bookRepository).existsByIsbn(isbn);
        verify(bookRepository, never()).save(any());
    }
}
