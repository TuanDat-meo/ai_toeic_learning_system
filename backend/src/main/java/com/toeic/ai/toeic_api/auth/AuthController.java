package com.toeic.ai.toeic_api.auth;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.audit.AuditLogService;
import com.toeic.ai.toeic_api.audit.AuditLogService.AuditLogEntry;
import com.toeic.ai.toeic_api.user.ManagedUser;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final UserAccountService userAccountService;
    private final PasswordResetService passwordResetService;
    private final AuditLogService auditLogService;

    public AuthController(AuthenticationManager authenticationManager, SecurityContextRepository contextRepository,
            UserAccountService userAccountService, PasswordResetService passwordResetService,
            AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
        this.userAccountService = userAccountService;
        this.passwordResetService = passwordResetService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/csrf")
    CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getToken(), csrfToken.getHeaderName());
    }

    @PostMapping("/login")
    AuthUser login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.email().trim(), request.password()));
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác.");
        }

        if (servletRequest.getSession(false) != null) {
            servletRequest.changeSessionId();
        }
        servletRequest.getSession(true).setAttribute(UserAccountService.SESSION_VERSION_ATTRIBUTE,
            userAccountService.getSessionVersion(authentication.getName()));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, servletRequest, servletResponse);
        return toAuthUser(userAccountService.findManagedUser(authentication.getName()));
    }

    @PostMapping("/register")
    RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        userAccountService.registerStudent(request.fullName(), request.email(), request.password());
        return new RegisterResponse("Tài khoản học viên đã được tạo. Bạn có thể đăng nhập.");
    }

    @PostMapping("/password/forgot")
    PasswordResetResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
        return new PasswordResetResponse("Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi.");
    }

    @PostMapping("/password/reset")
    PasswordResetResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.password());
        return new PasswordResetResponse("Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.");
    }

    @GetMapping("/me")
    AuthUser currentUser(Authentication authentication) {
        return toAuthUser(userAccountService.findManagedUser(authentication.getName()));
    }

        @PatchMapping("/me")
        AuthUser updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request, Authentication authentication,
            HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        ManagedUser current = userAccountService.findManagedUser(authentication.getName());
        ManagedUser updated = userAccountService.updateCurrentUserProfile(
            authentication.getName(), request.fullName(), request.email());
        auditLogService.record(current.id(), "UPDATE", "PROFILE", current.id(),
            "Cập nhật hồ sơ cá nhân.", servletRequest.getRemoteAddr());

        UserDetails updatedDetails = userAccountService.loadUserByUsername(updated.email());
        UsernamePasswordAuthenticationToken updatedAuthentication = UsernamePasswordAuthenticationToken.authenticated(
            updatedDetails, null, updatedDetails.getAuthorities());
        updatedAuthentication.setDetails(authentication.getDetails());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(updatedAuthentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, servletRequest, servletResponse);
        return toAuthUser(updated);
        }

        @GetMapping("/activity")
        List<AuditLogEntry> activity(Authentication authentication,
            @RequestParam(defaultValue = "50") int limit) {
        ManagedUser current = userAccountService.findManagedUser(authentication.getName());
        return auditLogService.listForUser(current.id(), limit);
        }

        @PostMapping("/password/change")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication,
            HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        ManagedUser current = userAccountService.findManagedUser(authentication.getName());
        userAccountService.changePassword(authentication.getName(), request.currentPassword(), request.newPassword());
        auditLogService.record(current.id(), "UPDATE", "PASSWORD", current.id(),
            "Đổi mật khẩu.", servletRequest.getRemoteAddr());
        new SecurityContextLogoutHandler().logout(servletRequest, servletResponse, authentication);
        }

        @PostMapping("/logout-all")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void logoutAll(Authentication authentication, HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        ManagedUser current = userAccountService.findManagedUser(authentication.getName());
        userAccountService.revokeAllSessions(authentication.getName());
        auditLogService.record(current.id(), "REVOKE_SESSIONS", "SESSION", null,
            "Đăng xuất tất cả thiết bị.", servletRequest.getRemoteAddr());
        new SecurityContextLogoutHandler().logout(servletRequest, servletResponse, authentication);
        }

    @PostMapping("/logout")
    void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        ManagedUser current = userAccountService.findManagedUser(authentication.getName());
        auditLogService.record(current.id(), "LOGOUT", "SESSION", null,
            "Đăng xuất khỏi thiết bị này.", request.getRemoteAddr());
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }

    private AuthUser toAuthUser(ManagedUser user) {
        return new AuthUser(user.id().toString(), user.email(), user.fullName(), user.role());
    }

    record CsrfResponse(String token, String headerName) { }
        record LoginRequest(@NotBlank @Email @Size(max = 255) String email, @NotBlank @Size(max = 72) String password) { }
            record UpdateProfileRequest(@NotBlank @Size(min = 2, max = 255) String fullName,
                @NotBlank @Email @Size(max = 255) String email) { }
            record ChangePasswordRequest(@NotBlank @Size(max = 72) String currentPassword,
                @NotBlank @Size(min = 8, max = 72) String newPassword) { }
        record RegisterRequest(@NotBlank @Size(min = 2, max = 255) String fullName, @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 72) String password) { }
        record ForgotPasswordRequest(@NotBlank @Email @Size(max = 255) String email) { }
        record ResetPasswordRequest(@NotBlank @Size(max = 128) String token,
            @NotBlank @Size(min = 8, max = 72) String password) { }
    record AuthUser(String id, String email, String fullName, String role) { }
    record RegisterResponse(String message) { }
        record PasswordResetResponse(String message) { }
}
