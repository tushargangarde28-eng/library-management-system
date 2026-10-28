
package com.library.library_management_system.repository;

import com.library.library_management_system.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByEmail(String email);

    Optional<Member> findByEmail(String email);

    Page<Member> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);

    Page<Member> findByStatus(
            Member.Status status,
            Pageable pageable

    );

    Page<Member> findByRole(Member.Role role, Pageable pageable);

}
