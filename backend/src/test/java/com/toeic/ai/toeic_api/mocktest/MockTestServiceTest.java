package com.toeic.ai.toeic_api.mocktest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MockTestServiceTest {

    @Mock
    private JdbcTemplate jdbc;

    private MockTestService service;

    @BeforeEach
    void setUp() {
        service = new MockTestService(jdbc);
    }

    @Test
    void createTestPersistsCatalogFieldsAndReturnsCreatedItem() {
        MockTestItem expected = new MockTestItem(42, "vol2", "Practice 1", "Trung bình",
                "Instructions", 90, 0, null, null, null, "DRAFT", null, List.of(), List.of());
        when(jdbc.queryForObject(anyString(), eq(Integer.class), eq("vol2"), eq("Practice 1"),
                eq("MEDIUM"), eq("Instructions"), eq(90), eq("DRAFT"), eq("[]"))).thenReturn(42);
        when(jdbc.query(anyString(), ArgumentMatchers.<RowMapper<MockTestItem>>any(),
                isNull())).thenReturn(List.of(expected));

        MockTestItem created = service.createTest(request("DRAFT"));

        assertEquals(expected, created);
        verify(jdbc).queryForObject(startsWith("INSERT INTO mock_test_items"), eq(Integer.class),
                eq("vol2"), eq("Practice 1"), eq("MEDIUM"), eq("Instructions"), eq(90), eq("DRAFT"), eq("[]"));
    }

    @Test
    void updateTestPersistsChangesAndReturnsUpdatedItem() {
        MockTestItem expected = new MockTestItem(42, "vol2", "Practice 1", "Trung bình",
                "Instructions", 90, 0, null, null, null, "PUBLISHED", null, List.of(), List.of());
        when(jdbc.update(startsWith("UPDATE mock_test_items"), eq("vol2"), eq("Practice 1"),
                eq("MEDIUM"), eq("Instructions"), eq(90), eq("PUBLISHED"), eq("[]"), eq(42))).thenReturn(1);
        when(jdbc.query(anyString(), ArgumentMatchers.<RowMapper<MockTestItem>>any(),
                isNull())).thenReturn(List.of(expected));

        MockTestItem updated = service.updateTest(42, request("PUBLISHED"));

        assertEquals(expected, updated);
        verify(jdbc).update(startsWith("UPDATE mock_test_items"), eq("vol2"), eq("Practice 1"),
                eq("MEDIUM"), eq("Instructions"), eq(90), eq("PUBLISHED"), eq("[]"), eq(42));
    }

    @Test
    void deleteTestRemovesPersistedCatalogItem() {
        when(jdbc.update("DELETE FROM mock_test_items WHERE id = ?", 42)).thenReturn(1);

        service.deleteTest(42);

        verify(jdbc).update("DELETE FROM mock_test_items WHERE id = ?", 42);
    }

    @Test
    void submitAttemptRejectsMissingUserInsteadOfSelectingAnExistingAccount() {
        SubmitMockTestRequest request = new SubmitMockTestRequest(42, 500, 250, 250, 100, 100, 3600);

        assertThrows(ResponseStatusException.class, () -> service.submitAttempt(null, request));
        verifyNoInteractions(jdbc);
    }

    @Test
    void createTestRejectsInvalidDurationWithoutWriting() {
        MockTestUpsertRequest invalid = new MockTestUpsertRequest(
                "vol1", "Practice 1", "Trung bình", "Instructions", 0, "DRAFT", List.<Map<String, Object>>of());

        assertThrows(ResponseStatusException.class, () -> service.createTest(invalid));
        verifyNoInteractions(jdbc);
    }

    private MockTestUpsertRequest request(String status) {
        return new MockTestUpsertRequest(
                "vol2", "Practice 1", "Trung bình", "Instructions", 90, status, List.of());
    }
}
