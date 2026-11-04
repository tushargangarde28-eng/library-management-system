
package com.library.library_management_system.repository;

import com.library.library_management_system.entity.UserPermission;
import com.library.library_management_system.entity.UserPermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPermissionRepository
        extends JpaRepository<UserPermission, UserPermissionId> {

    @Query("""
        SELECT up.permission.permissionName
        FROM UserPermission up
        WHERE up.user.userId = :userId
    """)
    List<String> findPermissionNamesByUserId(
            @Param("userId") Long userId
    );
}
