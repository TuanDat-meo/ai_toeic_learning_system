package com.toeic.ai.toeic_api.settings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.toeic.ai.toeic_api.learning.LearningOnboardingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Transactional
class SystemSettingsServiceIntegrationTest {
    @Autowired
    private SystemSettingsService settingsService;

    @Autowired
    private LearningOnboardingService onboardingService;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void configureMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void updatesConfigurationAuditsChangeAndUsesStudyGoalAsOnboardingDefault() {
        SystemSettings current = settingsService.getSettings();
        int auditCountBefore = jdbc.queryForObject(
                "SELECT count(*) FROM audit_logs WHERE entity_type = 'SYSTEM_SETTINGS' AND action = 'UPDATE'",
                Integer.class);
        SystemSettingsUpdateRequest request = new SystemSettingsUpdateRequest(
                "  TOEIC AI Academy  ",
                "help@toeic.example",
                45,
                "08:15",
                new SystemSettingNotificationsRequest(false, true, true),
                false,
                current.version());

        SystemSettings updated = settingsService.update(request, null, "127.0.0.1");

        assertThat(updated.systemName()).isEqualTo("TOEIC AI Academy");
        assertThat(updated.supportEmail()).isEqualTo("help@toeic.example");
        assertThat(updated.dailyStudyMinutes()).isEqualTo(45);
        assertThat(updated.reminderTime()).isEqualTo("08:15");
        assertThat(updated.notifications())
                .isEqualTo(new SystemSettingNotifications(false, true, true));
        assertThat(updated.aiModerationEnabled()).isFalse();
        assertThat(updated.version()).isEqualTo(current.version() + 1);
        assertThat(onboardingService.getOnboardingState(UUID.randomUUID()).dailyStudyMinutes()).isEqualTo(45);
        assertThat(jdbc.queryForObject(
                "SELECT count(*) FROM audit_logs WHERE entity_type = 'SYSTEM_SETTINGS' AND action = 'UPDATE'",
                Integer.class)).isEqualTo(auditCountBefore + 1);
    }

    @Test
    void rejectsStaleVersionWithoutChangingConfiguration() {
        SystemSettings current = settingsService.getSettings();
        var staleRequest = new SystemSettingsUpdateRequest(
                "Stale update",
                "help@example.com",
                30,
                "19:00",
                new SystemSettingNotificationsRequest(true, true, false),
                current.aiModerationEnabled(),
                current.version() + 1);

        assertThatThrownBy(() -> settingsService.update(staleRequest, null, "127.0.0.1"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
        assertThat(settingsService.getSettings().version()).isEqualTo(current.version());
    }

    @Test
    void deniesStudentsReadAndWriteAccess() throws Exception {
        String studentEmail = UUID.randomUUID() + "@example.test";
        jdbc.update("""
                INSERT INTO users (email, password_hash, full_name, role, status)
                VALUES (?, 'unused', 'Test student', 'STUDENT', 'ACTIVE')
                """, studentEmail);

        mockMvc.perform(get("/api/admin/settings").with(user(studentEmail).roles("STUDENT")))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/admin/settings")
                        .with(user(studentEmail).roles("STUDENT"))
                        .with(csrf())
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deniesUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/admin/settings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanReadAndUpdateSettingsThroughTheApi() throws Exception {
        UUID adminId = UUID.randomUUID();
        String adminEmail = adminId + "@example.test";
        jdbc.update("""
                INSERT INTO users (id, email, password_hash, full_name, role, status)
                VALUES (?, ?, 'unused', 'Test admin', 'ADMIN', 'ACTIVE')
                """, adminId, adminEmail);

        SystemSettings current = settingsService.getSettings();
        String body = """
                {
                  "systemName": "Admin configured system",
                  "supportEmail": "admin-help@example.com",
                  "dailyStudyMinutes": 60,
                  "reminderTime": "20:45",
                  "notifications": {
                    "newRegistrations": false,
                    "supportRequests": true,
                    "contentReports": false
                  },
                  "aiModerationEnabled": false,
                  "expectedVersion": %d
                }
                """.formatted(current.version());

        mockMvc.perform(get("/api/admin/settings").with(user(adminEmail).roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(current.version()))
                .andExpect(jsonPath("$.aiModerationEnabled").value(true));
        mockMvc.perform(put("/api/admin/settings")
                        .with(user(adminEmail).roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.systemName").value("Admin configured system"))
                .andExpect(jsonPath("$.dailyStudyMinutes").value(60))
                .andExpect(jsonPath("$.aiModerationEnabled").value(false))
                .andExpect(jsonPath("$.version").value(current.version() + 1));
        assertThat(jdbc.queryForObject(
                "SELECT count(*) FROM audit_logs WHERE user_id = ? AND entity_type = 'SYSTEM_SETTINGS'",
                Integer.class, adminId)).isEqualTo(1);
    }
}
