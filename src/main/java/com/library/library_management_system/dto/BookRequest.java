
package com.library.library_management_system.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.aspectj.bridge.Message;

public class BookRequest {

    @NotBlank(message = "Title is Required")
    private String title;

    @NotBlank(message = "Author is Required")
    private String author;

    @NotBlank(message = "ISBN is Required")
    private String isbn;

    @NotNull(message = "TotalCopies is required")
    @Min(value = 1, message = "Total copies must be at least 1 ")
    private Integer totalCopies;

    public BookRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

}
