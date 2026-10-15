package com.library.library_management_system.service;


import com.library.library_management_system.BookRepository.MemberRepository;
import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.entity.Member;
import com.library.library_management_system.exception.DuplicateResourceException;
import com.library.library_management_system.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberServiceImpl(MemberRepository memberRepository, PasswordEncoder passwordEncoder){
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;

    }

    @Override
    public MemberResponse createMember(MemberRequest request){

        if(memberRepository.existsByEmail(request.getEmail())){
            throw new DuplicateResourceException(
                    "Member with This email elready exists"
            );
        }

        Member member = new Member();
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());

        member.setPasswordHash(passwordEncoder.encode(request.getPassword()));


        Member savedMember = memberRepository.save(member);

        MemberResponse response = new MemberResponse();

        response.setMemberId(savedMember.getMemberId());
        response.setName(savedMember.getName());
        response.setEmail(savedMember.getEmail());
        response.setPhone(savedMember.getPhone());
        response.setRole(savedMember.getRole().name());
        response.setStatus(savedMember.getStatus().name());
        response.setCreatedAt(savedMember.getCreatedAt());
        response.setUpdatedAt(savedMember.getUpdatedAt());

        return response;
    }

    @Override
    public MemberResponse getMemberById(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found with Id "+memberId));

        MemberResponse response = new MemberResponse();
        response.setMemberId(member.getMemberId());
        response.setName(member.getName());
        response.setEmail(member.getEmail());
        response.setPhone(member.getPhone());
        response.setRole(member.getRole().name());
        response.setStatus(member.getStatus().name());
        response.setCreatedAt(member.getCreatedAt());
        response.setUpdatedAt(member.getUpdatedAt());


        return response;

    }

    @Override
    public MemberResponse updateMember(Long memberId, MemberRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found with Id "+memberId));

        if (!member.getEmail().equalsIgnoreCase(request.getEmail())
        && memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Member with these email already exists"
            );
        }

            member.setName(request.getName());
            member.setPhone(request.getPhone());

            Member updatedMember = memberRepository.save(member);

            MemberResponse response = new MemberResponse();
            response.setMemberId(updatedMember.getMemberId());
            response.setName(updatedMember.getName());
            response.setPhone(updatedMember.getPhone());
            response.setEmail(member.getEmail());
            response.setRole(updatedMember.getRole().name());
            response.setStatus(updatedMember.getStatus().name());
            response.setCreatedAt(updatedMember.getCreatedAt());
            response.setUpdatedAt(updatedMember.getUpdatedAt());

            return response;
    }

    @Override
    public MemberResponse deactivateMember(Long memberId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

}
