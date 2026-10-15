
package com.library.library_management_system.service;

import com.library.library_management_system.dto.member.MemberRequest;
import com.library.library_management_system.dto.member.MemberResponse;

public interface MemberService {

    MemberResponse createMember(MemberRequest request);

    MemberResponse getMemberById(Long memberId);

    MemberResponse updateMember(Long memberId, MemberRequest request);

    MemberResponse deactivateMember(Long memberId);
}
