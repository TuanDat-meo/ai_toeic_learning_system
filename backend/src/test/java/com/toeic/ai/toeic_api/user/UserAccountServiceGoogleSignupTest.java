package com.toeic.ai.toeic_api.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import com.toeic.ai.toeic_api.billing.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserAccountServiceGoogleSignupTest {
    @Test
    void rejectsGoogleSignupWhenEmailAlreadyExists() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        SubscriptionService subscriptionService = mock(SubscriptionService.class);
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq("existing@example.com")))
                .thenReturn(1);

        UserAccountService service = new UserAccountService(jdbcTemplate, passwordEncoder, subscriptionService);

        assertThatThrownBy(() -> service.registerGoogleAccount("Existing User", " Existing@Example.com "))
                .isInstanceOf(EmailAlreadyRegisteredException.class)
                .hasMessage("Email này đã có tài khoản. Vui lòng quay lại đăng nhập.");
    }

    @Test
    void studentRegistrationAssignsTheDefaultFreeSubscription() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        SubscriptionService subscriptionService = mock(SubscriptionService.class);
        ManagedUser user = new ManagedUser(UUID.randomUUID(), "student@example.com", "Student",
                "STUDENT", "ACTIVE", Instant.now());
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq("student@example.com"))).thenReturn(0);
        when(jdbcTemplate.queryForObject(contains("SELECT id, email, full_name, role, status"),
                any(RowMapper.class), eq("student@example.com"))).thenReturn(user);
        when(passwordEncoder.encode("password")).thenReturn("hashed-password");
        when(jdbcTemplate.update(anyString(), any(Object[].class))).thenReturn(1);
        UserAccountService service = new UserAccountService(jdbcTemplate, passwordEncoder, subscriptionService);

        assertThat(service.registerStudent("Student", "student@example.com", "password")).isEqualTo(user);

        ArgumentCaptor<Object[]> insertArguments = ArgumentCaptor.forClass(Object[].class);
        verify(jdbcTemplate).update(contains("INSERT INTO users"), insertArguments.capture());
        verify(subscriptionService).assignDefaultFreeSubscription((UUID) insertArguments.getValue()[0]);
    }
}
