package com.toeic.ai.toeic_api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.sql.Timestamp;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class PasswordResetService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String INVALID_TOKEN_MESSAGE = "Mã xác thực không hợp lệ hoặc đã hết hạn.";

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final Duration tokenTtl;
    private final String mailFrom;

    public PasswordResetService(
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            @Value("${app.password-reset.token-ttl:PT30M}") Duration tokenTtl,
            @Value("${app.mail.from:no-reply@toeic-ai.local}") String mailFrom) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.tokenTtl = tokenTtl;
        this.mailFrom = mailFrom;
    }

    @Transactional
    public boolean requestReset(String email) {
        List<Account> accounts = jdbcTemplate.query(
                "SELECT id, email, full_name FROM users WHERE lower(email) = lower(?) AND status = 'ACTIVE'",
                (rs, rowNum) -> new Account(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("full_name")),
                email.trim());
        if (accounts.isEmpty()) {
            return false;
        }

        Account account = accounts.getFirst();
        String otp = generateOtp();
        String tokenHash = hashToken(otp);
        jdbcTemplate.update(
                "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?) "
                        + "ON CONFLICT (user_id) DO UPDATE SET token_hash = EXCLUDED.token_hash, "
                        + "expires_at = EXCLUDED.expires_at, used_at = NULL, created_at = now()",
                account.id(), tokenHash, Timestamp.from(java.time.Instant.now().plus(tokenTtl)));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(account.email());
        message.setSubject("Đặt lại mật khẩu TOEIC AI");
        message.setText("Xin chào " + account.fullName() + ",\n\n"
                + "Mã OTP đặt lại mật khẩu của bạn là: " + otp + "\n"
                + "Mã có hiệu lực trong " + tokenTtl.toMinutes() + " phút.\n\n"
                + "Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            jdbcTemplate.update("UPDATE password_reset_tokens SET used_at = now() WHERE user_id = ?", account.id());
            LOGGER.warn("Unable to deliver a password reset email.", exception);
        }
        return true;
    }

    @Transactional
    public void resetPassword(String token, String password) {
        String tokenHash = hashToken(token);
        List<ResetToken> tokens;
        try {
            tokens = jdbcTemplate.query(
                    "SELECT user_id FROM password_reset_tokens "
                            + "WHERE token_hash = ? AND used_at IS NULL AND expires_at > now() FOR UPDATE",
                    (rs, rowNum) -> new ResetToken(rs.getObject("user_id", UUID.class)),
                    tokenHash);
        } catch (EmptyResultDataAccessException exception) {
            throw invalidToken();
        }
        if (tokens.isEmpty()) {
            throw invalidToken();
        }

        UUID userId = tokens.getFirst().userId();
        jdbcTemplate.update("UPDATE users SET password_hash = ?, session_version = session_version + 1, updated_at = now() WHERE id = ?",
                passwordEncoder.encode(password), userId);
        jdbcTemplate.update("UPDATE password_reset_tokens SET used_at = now() WHERE user_id = ?", userId);
    }

    private String generateOtp() {
        return String.format(Locale.ROOT, "%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, INVALID_TOKEN_MESSAGE);
    }

    private record Account(UUID id, String email, String fullName) { }
    private record ResetToken(UUID userId) { }
}
