package com.toeic.ai.toeic_api.aireview;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.toeic.ai.toeic_api.audit.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.jdbc.core.RowMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AiReviewServiceTest {
    @Mock
    private JdbcTemplate jdbc;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AiReviewService aiReviewService;

    @Test
    void approvesPendingContentAndAuditsDecisionWithoutContentPayload() {
        UUID contentId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        Instant reviewedAt = Instant.now();
        AiReviewService.ReviewItem item = new AiReviewService.ReviewItem(
                contentId, "QUESTION", null, AiReviewStatus.APPROVED,
                "GENERATE_QUESTION", "test-model", reviewedAt, reviewedAt);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<AiReviewService.ReviewItem>>any(),
                eq(contentId))).thenReturn(List.of(item));

        AiReviewService.ReviewItem result = aiReviewService.review(
                contentId, adminId, AiReviewDecision.APPROVE, "127.0.0.1");

        assertThat(result.status()).isEqualTo(AiReviewStatus.APPROVED);
        verify(auditLogService).record(eq(adminId), eq("APPROVE_AI_CONTENT"), eq("AI_GENERATED_CONTENT"), eq(contentId),
                contains("duyệt"), eq("127.0.0.1"));
    }

    @Test
    void rejectsConcurrentDecisionWhenContentIsNoLongerPending() {
        UUID contentId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(0);
        when(jdbc.queryForObject(anyString(), eq(String.class), eq(contentId))).thenReturn("PASSED");

        assertThatThrownBy(() -> aiReviewService.review(contentId, adminId, AiReviewDecision.REJECT, "127.0.0.1"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode().value())
                        .isEqualTo(409));
        verify(auditLogService, never()).record(eq(adminId), anyString(), anyString(), eq(contentId),
                anyString(), anyString());
    }

    @Test
    void returnsNotFoundWhenReviewingMissingContent() {
        UUID contentId = UUID.randomUUID();
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(0);
        when(jdbc.queryForObject(anyString(), eq(String.class), eq(contentId)))
                .thenThrow(new org.springframework.dao.EmptyResultDataAccessException(1));

        assertThatThrownBy(() -> aiReviewService.review(contentId, UUID.randomUUID(),
                AiReviewDecision.APPROVE, "127.0.0.1"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode().value())
                        .isEqualTo(404));
    }
}
