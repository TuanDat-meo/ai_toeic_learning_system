package com.toeic.ai.toeic_api.user;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.audit.AuditLogService;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {
    private final UserAccountService userAccountService;
    private final AuditLogService auditLogService;

    public UserManagementController(UserAccountService userAccountService, AuditLogService auditLogService) {
        this.userAccountService = userAccountService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    List<ManagedUser> list() {
        return userAccountService.listManagedUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
        Message create(@Valid @RequestBody CreateUserRequest request, Authentication authentication,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        ManagedUser created = userAccountService.createManagedUser(
            request.fullName(), request.email(), request.password(), request.role());
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        auditLogService.record(actor.id(), "CREATE", "USER", created.id(),
            "Tạo tài khoản " + created.fullName() + " (" + created.email() + ").",
            servletRequest.getRemoteAddr());
        return new Message("Tài khoản đã được tạo.");
    }

    @PatchMapping("/{userId}")
    Message update(@PathVariable UUID userId, @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication, jakarta.servlet.http.HttpServletRequest servletRequest) {
        ManagedUser updated = userAccountService.updateManagedUser(userId, request.fullName(), request.email(), request.password(),
                request.role(), request.status(), authentication.getName());
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        auditLogService.record(actor.id(), "UPDATE", "USER", updated.id(),
            "Cập nhật tài khoản " + updated.fullName() + " (" + updated.email() + ").",
            servletRequest.getRemoteAddr());
        return new Message("Thông tin tài khoản đã được cập nhật.");
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.OK)
    Message disable(@PathVariable UUID userId, Authentication authentication,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        ManagedUser disabled = userAccountService.findManagedUser(userId);
        userAccountService.disableManagedUser(userId, authentication.getName());
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        auditLogService.record(actor.id(), "DISABLE", "USER", disabled.id(),
                "Khóa tài khoản " + disabled.fullName() + " (" + disabled.email() + ").",
                servletRequest.getRemoteAddr());
        return new Message("Tài khoản đã bị khóa; dữ liệu học tập được giữ nguyên.");
    }

    record CreateUserRequest(@NotBlank @Size(max = 255) String fullName,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotNull @Pattern(regexp = "ADMIN|STUDENT|TEACHER") String role) { }

    record UpdateUserRequest(@NotBlank @Size(max = 255) String fullName,
            @NotBlank @Email @Size(max = 255) String email,
            @Size(min = 8, max = 72) String password,
            @NotNull @Pattern(regexp = "ADMIN|STUDENT|TEACHER") String role,
            @NotNull @Pattern(regexp = "ACTIVE|DISABLED") String status) { }

    record Message(String message) { }
}
