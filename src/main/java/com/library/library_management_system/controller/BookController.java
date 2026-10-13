package com.library.library_management_system.controller;


import com.library.library_management_system.dto.BookRequest;
import com.library.library_management_system.dto.BookResponse;
import com.library.library_management_system.entity.Book;
import com.library.library_management_system.service.BookService;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    //create a new book
    @PostMapping
    public ResponseEntity<BookResponse> createBook(@RequestBody BookRequest request){
        BookResponse bookResponse = bookService.createBook(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookResponse);
    }

    // Get a book by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id){
        BookResponse response = bookService.getBookById(id);

        return ResponseEntity.ok(response);
    }

    // Update an Existing Book
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @RequestBody BookRequest request){
        BookResponse bookResponse = bookService.updateBook(id,request);

        return ResponseEntity.ok(bookResponse);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id){
        bookService.deleteBookById(id);

        return ResponseEntity.noContent().build();

    }


}
