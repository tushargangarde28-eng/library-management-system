package com.library.library_management_system.controller;


import com.library.library_management_system.dto.BookRequest;
import com.library.library_management_system.dto.BookResponse;
import com.library.library_management_system.entity.Book;
import com.library.library_management_system.service.BookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest request){
        BookResponse bookResponse = bookService.createBook(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookResponse);
    }

    @GetMapping
    public ResponseEntity<Page<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10")int size,
            @RequestParam(defaultValue = "bookId")String sortBy,
            @RequestParam(defaultValue = "asc")String direction,
            @RequestParam(required = false) String search
    )

    {


        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                :Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page,size,sort);

        if(search != null && !search.isBlank()){
            return ResponseEntity.ok(
                    bookService.searchBook(search,pageable)
            );
        }

        return ResponseEntity.ok(bookService.getAllBooks(pageable));
    }

    // Get a book by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id){
        BookResponse response = bookService.getBookById(id);

        return ResponseEntity.ok(response);
    }

    // Update an Existing Book
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id,@Valid @RequestBody BookRequest request){
        BookResponse bookResponse = bookService.updateBook(id,request);

        return ResponseEntity.ok(bookResponse);

    }

    //Delete Existing Book
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id){

        bookService.deleteBookById(id);
        return ResponseEntity.noContent().build();

    }


}
