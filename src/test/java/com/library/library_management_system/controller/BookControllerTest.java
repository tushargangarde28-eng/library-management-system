package com.library.library_management_system.controller;

import com.library.library_management_system.config.SecurityConfig;
import com.library.library_management_system.dto.BookRequest;
import com.library.library_management_system.dto.BookResponse;
import com.library.library_management_system.exception.GlobalExceptionHandler;
import com.library.library_management_system.exception.DuplicateResourceException;
import com.library.library_management_system.exception.ResourceNotFoundException;
import com.library.library_management_system.service.BookService;
import com.library.library_management_system.service.JwtService;

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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookController.class)
@Import({
        SecurityConfig.class,
        GlobalExceptionHandler.class
})
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookService bookService;

    @MockitoBean
    private JwtService jwtService;

    private static final String ADMIN_TOKEN = "valid-admin-token";

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

    private BookRequest validBookRequest() {
        BookRequest request = new BookRequest();
        request.setTitle("Clean Code");
        request.setAuthor("Robert C. Martin");
        request.setIsbn("ISBN-12345");
        request.setTotalCopies(5);
        return request;
    }

    private BookResponse bookResponse() {
        return new BookResponse(
                1L,
                "Clean Code",
                "Robert C. Martin",
                "ISBN-12345",
                5,
                5
        );
    }

    private String validBookJson() {
        return """
                {
                    "title": "Clean Code",
                    "author": "Robert C. Martin",
                    "isbn": "ISBN-12345",
                    "totalCopies": 5
                }
                """;
    }

    // Test 1: Create book successfully

    @Test
    void createBook_ShouldReturnCreated_WhenRequestIsValid()
            throws Exception {

        when(bookService.createBook(any(BookRequest.class)))
                .thenReturn(bookResponse());

        mockMvc.perform(post("/api/books")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBookJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Clean Code"))
                .andExpect(jsonPath("$.author")
                        .value("Robert C. Martin"))
                .andExpect(jsonPath("$.isbn").value("ISBN-12345"));
    }

    // Test 2: Duplicate ISBN

    @Test
    void createBook_ShouldReturnConflict_WhenIsbnAlreadyExists()
            throws Exception {

        when(bookService.createBook(any(BookRequest.class)))
                .thenThrow(new DuplicateResourceException(
                        "A Book With these ISBN is already exists"
                ));

        mockMvc.perform(post("/api/books")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBookJson()))
                .andExpect(status().isConflict());
    }

    // Test 3: Invalid title

    @Test
    void createBook_ShouldReturnBadRequest_WhenTitleIsBlank()
            throws Exception {

        String invalidJson = """
                {
                    "title": "",
                    "author": "Robert C. Martin",
                    "isbn": "ISBN-12345",
                    "totalCopies": 5
                }
                """;

        mockMvc.perform(post("/api/books")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // Test 4: Invalid total copies

    @Test
    void createBook_ShouldReturnBadRequest_WhenTotalCopiesIsZero()
            throws Exception {

        String invalidJson = """
                {
                    "title": "Clean Code",
                    "author": "Robert C. Martin",
                    "isbn": "ISBN-12345",
                    "totalCopies": 0
                }
                """;

        mockMvc.perform(post("/api/books")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // Test 5: Get book successfully

    @Test
    void getBookById_ShouldReturnBook_WhenBookExists()
            throws Exception {

        when(bookService.getBookById(1L))
                .thenReturn(bookResponse());

        mockMvc.perform(get("/api/books/1")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").value(1))
                .andExpect(jsonPath("$.title").value("Clean Code"));
    }

    // Test 6: Book not found

    @Test
    void getBookById_ShouldReturnNotFound_WhenBookDoesNotExist()
            throws Exception {

        when(bookService.getBookById(99L))
                .thenThrow(new ResourceNotFoundException(
                        "Book Not Found With These ID :99"
                ));

        mockMvc.perform(get("/api/books/99")
                        .header("Authorization", adminToken()))
                .andExpect(status().isNotFound());
    }

    // Test 7: Get all books

    @Test
    void getAllBooks_ShouldReturnBooks_WhenBooksExist()
            throws Exception {

        Page<BookResponse> bookPage = new PageImpl<>(
                List.of(bookResponse()),
                PageRequest.of(0, 10),
                1
        );

        when(bookService.getAllBooks(any()))
                .thenReturn(bookPage);

        mockMvc.perform(get("/api/books")
                        .header("Authorization", adminToken())
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title")
                        .value("Clean Code"));
    }

    // Test 8: Update book successfully

    @Test
    void updateBook_ShouldReturnUpdatedBook()
            throws Exception {

        when(bookService.updateBook(
                anyLong(),
                any(BookRequest.class)
        )).thenReturn(bookResponse());

        mockMvc.perform(put("/api/books/1")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBookJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Clean Code"));
    }

    // Test 9: Delete book successfully

    @Test
    void deleteBook_ShouldReturnNoContent()
            throws Exception {

        doNothing().when(bookService).deleteBookById(1L);

        mockMvc.perform(delete("/api/books/1")
                        .header("Authorization", adminToken()))
                .andExpect(status().isNoContent());
    }

    // Test 10: Unauthorized request

    @Test
    void getBooks_ShouldReturnUnauthorized_WhenTokenIsMissing()
            throws Exception {

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message")
                        .value("Authentication required"));
    }

    // Test 11: Forbidden request for a STUDENT


    @Test
    void createBook_ShouldReturnForbidden_WhenStudentCreatesBook()
            throws Exception {

        when(jwtService.extractEmail("valid-student-token"))
                .thenReturn("student@example.com");

        when(jwtService.extractRole("valid-student-token"))
                .thenReturn("STUDENT");

        when(jwtService.isTokenValid(
                "valid-student-token",
                "student@example.com"
        )).thenReturn(true);

        mockMvc.perform(post("/api/books")
                        .header(
                                "Authorization",
                                "Bearer valid-student-token"
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBookJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message")
                        .value("Access denied: insufficient permissions"));
    }
}