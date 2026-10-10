package com.toeic.ai.toeic_api.user;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserAccountService implements UserDetailsService {
    public static final String SESSION_VERSION_ATTRIBUTE = "toeic.session-version";

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var accounts = jdbcTemplate.query(
                "SELECT email, password_hash, role, status FROM users WHERE lower(email) = lower(?)",
                (rs, rowNum) -> User.withUsername(rs.getString("email"))
                        .password(rs.getString("password_hash"))
                        .roles(rs.getString("role"))
                        .disabled(!"ACTIVE".equals(rs.getString("status")))
                        .build(),
                email);
        if (accounts.isEmpty()) {
            throw new UsernameNotFoundException("Không tìm thấy tài khoản.");
        }
        return accounts.getFirst();
    }

    public List<ManagedUser> listManagedUsers() {
        return jdbcTemplate.query(
                "SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC, email",
                (rs, rowNum) -> new ManagedUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("full_name"),
                        rs.getString("role"),
                        rs.getString("status"),
                        rs.getTimestamp("created_at").toInstant()));
    }

    public ManagedUser findManagedUser(String email) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT id, email, full_name, role, status, created_at FROM users WHERE lower(email) = lower(?)",
                (rs, rowNum) -> new ManagedUser(
                    rs.getObject("id", UUID.class),
                    rs.getString("email"),
                    rs.getString("full_name"),
                    rs.getString("role"),
                    rs.getString("status"),
                    rs.getTimestamp("created_at").toInstant()),
                email);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản.");
        }
    }

    @Transactional
    public ManagedUser updateCurrentUserProfile(String email, String fullName, String newEmail) {
        ManagedUser current = findManagedUser(email);
        String normalizedEmail = normalizeEmail(newEmail);
        ensureEmailAvailable(normalizedEmail, current.id());
        jdbcTemplate.update(
                "UPDATE users SET email = ?, full_name = ?, updated_at = now() WHERE id = ?",
                normalizedEmail, fullName.trim(), current.id());
        return findManagedUser(current.id());
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        PasswordCredentials credentials = jdbcTemplate.queryForObject(
                "SELECT id, password_hash FROM users WHERE lower(email) = lower(?)",
                (rs, rowNum) -> new PasswordCredentials(
                        rs.getObject("id", UUID.class), rs.getString("password_hash")),
                email);
        if (credentials == null || !passwordEncoder.matches(currentPassword, credentials.passwordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }
        if (passwordEncoder.matches(newPassword, credentials.passwordHash())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại.");
        }
        jdbcTemplate.update(
                "UPDATE users SET password_hash = ?, session_version = session_version + 1, updated_at = now() WHERE id = ?",
                passwordEncoder.encode(newPassword), credentials.id());
    }

    @Transactional
    public void revokeAllSessions(String email) {
        jdbcTemplate.update(
                "UPDATE users SET session_version = session_version + 1, updated_at = now() WHERE lower(email) = lower(?)",
                email);
    }

    public long getSessionVersion(String email) {
        Long version = jdbcTemplate.queryForObject(
                "SELECT session_version FROM users WHERE lower(email) = lower(?)", Long.class, email);
        return version == null ? 0 : version;
    }

    @Transactional
    public ManagedUser registerStudent(String fullName, String email, String password) {
        return create(fullName, email, password, "STUDENT");
    }

    @Transactional
    public ManagedUser createManagedUser(String fullName, String email, String password, String role) {
        return create(fullName, email, password, role);
    }

    private ManagedUser create(String fullName, String email, String password, String role) {
        String normalizedEmail = normalizeEmail(email);
        ensureEmailAvailable(normalizedEmail, null);
        UUID id = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO users (id, email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
                id, normalizedEmail, passwordEncoder.encode(password), fullName.trim(), role);
        return findManagedUser(normalizedEmail);
    }

    @Transactional
    public ManagedUser updateManagedUser(UUID userId, String fullName, String email, String password,
            String role, String status, String actingEmail) {
        ManagedUser current = findManagedUser(userId);
        if (current.email().equalsIgnoreCase(actingEmail)) {
            if (!current.email().equalsIgnoreCase(email)) {
                throw new IllegalArgumentException("Không thể đổi email của tài khoản đang đăng nhập.");
            }
            if (!current.role().equals(role) || !current.status().equals(status)) {
                throw new IllegalArgumentException("Không thể tự hạ quyền hoặc khóa tài khoản đang đăng nhập.");
            }
        }

        String normalizedEmail = normalizeEmail(email);
        ensureEmailAvailable(normalizedEmail, userId);
        if (password == null || password.isBlank()) {
            jdbcTemplate.update(
                "UPDATE users SET email = ?, full_name = ?, role = ?, status = ?, "
                    + "session_version = session_version + 1, updated_at = now() WHERE id = ?",
                    normalizedEmail, fullName.trim(), role, status, userId);
        } else {
            jdbcTemplate.update(
                "UPDATE users SET email = ?, full_name = ?, password_hash = ?, role = ?, status = ?, "
                    + "session_version = session_version + 1, updated_at = now() WHERE id = ?",
                    normalizedEmail, fullName.trim(), passwordEncoder.encode(password), role, status, userId);
        }
        return findManagedUser(userId);
    }

    @Transactional
    public void disableManagedUser(UUID userId, String actingEmail) {
        ManagedUser user = findManagedUser(userId);
        if (user.email().equalsIgnoreCase(actingEmail)) {
            throw new IllegalArgumentException("Không thể khóa tài khoản đang đăng nhập.");
        }
        jdbcTemplate.update(
                "UPDATE users SET status = 'DISABLED', session_version = session_version + 1, updated_at = now() WHERE id = ?",
                userId);
    }

    public ManagedUser findManagedUser(UUID userId) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT id, email, full_name, role, status, created_at FROM users WHERE id = ?",
                (rs, rowNum) -> new ManagedUser(
                    rs.getObject("id", UUID.class),
                    rs.getString("email"),
                    rs.getString("full_name"),
                    rs.getString("role"),
                    rs.getString("status"),
                    rs.getTimestamp("created_at").toInstant()),
                userId);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản.");
        }
    }

    private void ensureEmailAvailable(String email, UUID exceptId) {
        Integer matches = exceptId == null
                ? jdbcTemplate.queryForObject("SELECT count(*) FROM users WHERE lower(email) = lower(?)", Integer.class, email)
                : jdbcTemplate.queryForObject("SELECT count(*) FROM users WHERE lower(email) = lower(?) AND id <> ?", Integer.class, email, exceptId);
        if (matches != null && matches > 0) {
            throw new IllegalArgumentException("Email này đã được sử dụng.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private record PasswordCredentials(UUID id, String passwordHash) { }
}
