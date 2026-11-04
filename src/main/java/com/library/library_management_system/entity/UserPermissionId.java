
package com.library.library_management_system.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserPermissionId implements Serializable {

    private Long userId;

    private Long permissionId;

    public UserPermissionId() {
    }

    public UserPermissionId(Long userId, Long permissionId) {
        this.userId = userId;
        this.permissionId = permissionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (!(object instanceof UserPermissionId that)) return false;

        return Objects.equals(userId, that.userId)
                && Objects.equals(permissionId, that.permissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, permissionId);
    }
}
