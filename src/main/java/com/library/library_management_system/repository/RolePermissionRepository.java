
package com.library.library_management_system.repository;

import com.library.library_management_system.entity.RolePermission;
import com.library.library_management_system.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RolePermissionRepository
        extends JpaRepository<RolePermission, RolePermissionId> {

    @Query("""
        SELECT rp.permission.permissionName
        FROM RolePermission rp
        WHERE rp.role.roleName = :role
    """)
    List<String> findPermissionNamesByRole(@Param("role") String role);
}
