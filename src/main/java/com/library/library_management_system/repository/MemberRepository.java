
package com.library.library_management_system.repository;

import com.library.library_management_system.entity.Member;
import com.library.library_management_system.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByUser_Email(String email);

    Optional<Member> findByUser_Email(String email);

    Page<Member> findByNameContainingIgnoreCaseOrUser_EmailContainingIgnoreCase(
            String name,
            String email,
            Pageable pageable
    );

    Page<Member> findByUser_Status(
            User.Status status,
            Pageable pageable
    );

    Page<Member> findByUser_Role_RoleName(
            String roleName,
            Pageable pageable
    );
}
