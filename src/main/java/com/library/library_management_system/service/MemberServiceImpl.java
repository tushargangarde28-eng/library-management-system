package com.library.library_management_system.service;


import com.library.library_management_system.repository.MemberRepository;
import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.entity.Member;
import com.library.library_management_system.exception.DuplicateResourceException;
import com.library.library_management_system.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Crete Member
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

    // Get Member By ID
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
    public Page<MemberResponse> getAllMembers(Pageable pageable){
        return memberRepository.findAll(pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<MemberResponse> searchMember(String search, Pageable pageable){
        return memberRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search,pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<MemberResponse> getMemberByStatus(String status, Pageable pageable){

        Member.Status memberStatus;

        try {
            memberStatus = Member.Status.valueOf(status.toUpperCase());
        }catch (IllegalArgumentException | NullPointerException ex){
            throw new IllegalArgumentException(
                    "Invalid status. Allowed values : ACTIVE , INACTIVE"
            );
        }
        return memberRepository.findByStatus(memberStatus,pageable)
                .map(this::toResponse);

    }

    // Update Member 
    @Override
    public MemberResponse updateMember(Long memberId, MemberRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found with Id "+memberId));


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


    // Delete Member by Id
    @Override
    public MemberResponse deactivateMember(Long memberId) {

            Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member not found with Id "+memberId));

            member.setStatus(Member.Status.INACTIVE);

            Member updateMember = memberRepository.save(member);

        MemberResponse response = new MemberResponse();

        response.setStatus(updateMember.getStatus().name());
        response.setUpdatedAt(updateMember.getUpdatedAt());
        return response;
    }

    private MemberResponse toResponse(Member member) {
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

}
