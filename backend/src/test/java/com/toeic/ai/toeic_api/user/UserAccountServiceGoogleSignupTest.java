package com.toeic.ai.toeic_api.user;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserAccountServiceGoogleSignupTest {
    @Test
    void rejectsGoogleSignupWhenEmailAlreadyExists() {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq("existing@example.com")))
                .thenReturn(1);

        UserAccountService service = new UserAccountService(jdbcTemplate, passwordEncoder);

        assertThatThrownBy(() -> service.registerGoogleAccount("Existing User", " Existing@Example.com "))
                .isInstanceOf(EmailAlreadyRegisteredException.class)
                .hasMessage("Email này đã có tài khoản. Vui lòng quay lại đăng nhập.");
    }
}
