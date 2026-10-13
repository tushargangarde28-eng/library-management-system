package com.library.library_management_system.service;

import com.library.library_management_system.BookRepository.BookRepository;
import com.library.library_management_system.dto.BookRequest;
import com.library.library_management_system.dto.BookResponse;
import com.library.library_management_system.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Pageable;
@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository){
        this.bookRepository = bookRepository;
    }


    //Create a New Book

    public BookResponse createBook(BookRequest request){
        if(bookRepository.existsByIsbn(request.getIsbn())){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A Book With these ISBN is already exists");
        }

        Book book = toEntity(request);
        Book savedBook = bookRepository.save(book);
        return toResponse(savedBook);
    }

    //Get a book by its id
    public BookResponse getBookById(Long bookId){
        Book book = bookRepository.findById(bookId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Book Not Found With These ID :"+bookId));
        return toResponse(book);
    }

//    Get All Books using pagination and sorting
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable)
                .map(this::toResponse);
    }

//    Serching method
    public Page<BookResponse> searchBook(String search, Pageable pageable){
        return bookRepository
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(search,search,pageable)
                .map(this::toResponse);
    }


    //Update an Existing Book
    public BookResponse updateBook(Long bookId, BookRequest request){
        Book book = bookRepository.findById(bookId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Book Not Found With These ID :"+bookId));


        boolean isbnBelongstoAnotherBook = bookRepository.existsByIsbn(request.getIsbn())
                && !book.getIsbn().equals(request.getIsbn());


        if(isbnBelongstoAnotherBook){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A Book With these Isbn is already exists");
        }

        int barrowedCopies = book.getTotalCopies() - book.getAvailable_Copies();

        if (request.getTotalCopies() < barrowedCopies) {
            throw  new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Total copies is not less than barrowed copies");
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setTotalCopies(request.getTotalCopies());

        //Preserve the Number of Book Copies
        book.setAvailable_Copies(request.getTotalCopies() - barrowedCopies);

        Book updatedBook = bookRepository.save(book);

        return toResponse(updatedBook);

    }

    //    Delete a Book by id

    public void deleteBookById(long bookId){
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not Found With These ID: "+bookId));

        bookRepository.delete(book);
    }

    // Convert Request DTO to Entity
    private Book toEntity(BookRequest request){
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setTotalCopies(request.getTotalCopies());

        book.setAvailable_Copies(request.getTotalCopies());
        return book;
    }

    // Convert Entity to Response DTO
    private BookResponse toResponse(Book book){
        return new BookResponse(
                book.getBookId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getAvailable_Copies(),
                book.getTotalCopies()
        );
    }

}
