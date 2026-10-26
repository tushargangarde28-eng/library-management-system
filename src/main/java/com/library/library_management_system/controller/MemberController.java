package com.library.library_management_system.controller;

import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.service.BookService;
import com.library.library_management_system.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService){
        this.memberService = memberService;
    }

    //Adding Member
    @PostMapping
    public ResponseEntity<MemberResponse> createMember(@Valid @RequestBody MemberRequest request){

        MemberResponse memberResponse = memberService.createMember(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(memberResponse);
    }

    //Get Member By Id
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> getMemberById(@PathVariable Long id ){
        MemberResponse memberResponse = memberService.getMemberById(id);

        return ResponseEntity.ok(memberResponse);

    }

    @GetMapping
    public ResponseEntity<Page<MemberResponse>> getAllMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "memberId") String shortBy,
            @RequestParam(defaultValue = "0") String direction,
            @RequestParam(required = false)String search,
            @RequestParam(defaultValue = "ACTIVE") String status
            ){

        Sort sort= direction.equalsIgnoreCase("desc")
                ?Sort.by(shortBy).descending():Sort.by(shortBy).ascending();

        Pageable pageable = PageRequest.of(page, size,sort);



        if(search != null && !search.isBlank()){
            return ResponseEntity.ok(memberService.searchMember(search,pageable));
        }
        return ResponseEntity.ok(
                memberService.getMemberByStatus(status,pageable)
        );
    }

    //Update the member
    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> updateMember(@PathVariable Long id, @Valid @RequestBody MemberRequest request){
        MemberResponse memberResponse = memberService.updateMember(id,request);
        return ResponseEntity.ok(memberResponse);
    }

    // Delete Member by id
    @DeleteMapping("/{id}")
    public ResponseEntity<MemberResponse> deleteMember(@PathVariable("id") Long id){

        MemberResponse memberResponse = memberService.deactivateMember(id);

        return ResponseEntity.ok(memberResponse);

    }

}
