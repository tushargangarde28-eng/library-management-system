
package com.library.library_management_system.service;

import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;
import com.library.library_management_system.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {

    MemberResponse createMember(MemberRequest request);

    MemberResponse getMemberById(Long memberId);

    MemberResponse updateMember(Long memberId, MemberRequest request);

    MemberResponse deactivateMember(Long memberId);

    Page<MemberResponse> searchMember(String search, Pageable pageable);

    Page<MemberResponse> getAllMembers(Pageable pageable);

    Page<MemberResponse> getMemberByStatus(String status, Pageable pageable);

}
