package com.library.library_management_system.controller;

import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.service.MemberService;
import jakarta.validation.Valid;
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

    //Update the member

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> updateMember(@PathVariable Long id, @Valid @RequestBody MemberRequest request){
        MemberResponse memberResponse = memberService.updateMember(id,request);
        return ResponseEntity.ok(memberResponse);
    }
}
