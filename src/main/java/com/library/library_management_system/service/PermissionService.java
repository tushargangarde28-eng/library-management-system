
package com.library.library_management_system.service;

import com.library.library_management_system.entity.User;
import com.library.library_management_system.repository.RolePermissionRepository;
import com.library.library_management_system.repository.UserPermissionRepository;
import com.library.library_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class PermissionService {

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;

    public PermissionService(
            UserRepository userRepository,
            RolePermissionRepository rolePermissionRepository,
            UserPermissionRepository userPermissionRepository
    ) {
        this.userRepository = userRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    @Transactional(readOnly = true)
    public Set<String> getPermissions(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found.")
                );

        Set<String> permissions = new HashSet<>();

        // Get role-based permissions
        permissions.addAll(
                rolePermissionRepository.findPermissionNamesByRole(
                        user.getRole().getRoleName()
                )
        );

        // Get individual user permissions
        permissions.addAll(
                userPermissionRepository.findPermissionNamesByUserId(
                        user.getUserId()
                )
        );

        return permissions;
    }
}
