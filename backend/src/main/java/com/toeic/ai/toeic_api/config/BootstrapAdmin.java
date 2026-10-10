package com.toeic.ai.toeic_api.config;

import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapAdmin {
    @Bean
    ApplicationRunner createBootstrapAdmin(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder,
            @Value("${app.auth.bootstrap-admin-email:}") String email,
            @Value("${app.auth.bootstrap-admin-password:}") String password,
            @Value("${app.auth.bootstrap-admin-name:}") String fullName) {
        return arguments -> {
            if (email.isBlank() || password.isBlank() || fullName.isBlank()) {
                return;
            }
            jdbcTemplate.update(
                    "INSERT INTO users (id, email, password_hash, full_name, role, status) "
                            + "VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE') ON CONFLICT (email) DO NOTHING",
                    UUID.randomUUID(), email.trim().toLowerCase(Locale.ROOT), passwordEncoder.encode(password), fullName.trim());
        };
    }
}