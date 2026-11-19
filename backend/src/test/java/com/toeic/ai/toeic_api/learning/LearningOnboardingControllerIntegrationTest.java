package com.toeic.ai.toeic_api.learning;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Transactional
class LearningOnboardingControllerIntegrationTest {
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
    void returnsDefaultOnboardingStateForStudentWithoutProfile() throws Exception {
        String studentEmail = UUID.randomUUID() + "@example.test";
        jdbc.update("""
                INSERT INTO users (email, password_hash, full_name, role, status)
                VALUES (?, 'unused', 'Onboarding test student', 'STUDENT', 'ACTIVE')
                """, studentEmail);

        mockMvc.perform(get("/api/learning-profile/onboarding/status")
                        .with(user(studentEmail).roles("STUDENT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state.completed").value(false))
                .andExpect(jsonPath("$.state.currentStep").value(0))
                .andExpect(jsonPath("$.state.dailyStudyMinutes").value(30));
    }
}
