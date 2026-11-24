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
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.toeic.ai.toeic_api.audit.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AiReviewServiceTest {
    @Mock
    private JdbcTemplate jdbc;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private AiContentPublishService publishService;

    @InjectMocks
    private AiReviewService aiReviewService;

    @Test
    void approvesPendingContentPublishesToLearningBankAndAuditsDecision() {
        UUID contentId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        Instant reviewedAt = Instant.now();
        Map<String, Object> payload = Map.of(
                "question", "Test?",
                "options", Map.of("A", "1", "B", "2"),
                "correctAnswer", "A");
        AiReviewService.ReviewItem item = new AiReviewService.ReviewItem(
                contentId, "QUESTION", payload, AiReviewStatus.APPROVED,
                "GENERATE_QUESTION", "test-model", reviewedAt, reviewedAt,
                "Admin TOEIC", null, null, null);
        AiContentPublishService.PublishedTarget target = new AiContentPublishService.PublishedTarget(
                "QUESTION_BANK", "42", "Ngân hàng câu hỏi (P5-000042)", "/admin/content/questions", "/admin/content/questions");

        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<AiReviewService.ReviewItem>>any(),
                eq(contentId))).thenReturn(List.of(item));
        when(publishService.publish(eq("QUESTION"), any(JsonNode.class), eq(adminId))).thenReturn(target);

        AiReviewService.ReviewItem result = aiReviewService.review(
                contentId, adminId, AiReviewDecision.APPROVE, "127.0.0.1");

        assertThat(result.status()).isEqualTo(AiReviewStatus.APPROVED);
        assertThat(result.publishedTarget()).isEqualTo(target);
        verify(publishService).publish(eq("QUESTION"), any(JsonNode.class), eq(adminId));
        verify(auditLogService).record(eq(adminId), eq("APPROVE_AI_CONTENT"), eq("AI_GENERATED_CONTENT"), eq(contentId),
                contains("duyệt"), eq("127.0.0.1"));
    }

    @Test
    void rejectsPendingContentWithReasonCategoryWithoutPublishing() {
        UUID contentId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        Instant reviewedAt = Instant.now();
        Map<String, Object> payload = Map.of("question", "Bad question?");
        AiReviewService.ReviewItem item = new AiReviewService.ReviewItem(
                contentId, "QUESTION", payload, AiReviewStatus.REJECTED,
                "GENERATE_QUESTION", "test-model", reviewedAt, reviewedAt,
                "Admin TOEIC", null, null, null);

        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<AiReviewService.ReviewItem>>any(),
                eq(contentId))).thenReturn(List.of(item));

        AiReviewService.ReviewItem result = aiReviewService.review(
                contentId, adminId, AiReviewDecision.REJECT,
                "Sai đáp án", "Đáp án B mới đúng ngữ pháp", "127.0.0.1");

        assertThat(result.status()).isEqualTo(AiReviewStatus.REJECTED);
        assertThat(result.reviewCategory()).isEqualTo("Sai đáp án");
        assertThat(result.reviewNote()).isEqualTo("Đáp án B mới đúng ngữ pháp");
        assertThat(result.publishedTarget()).isNull();
        verify(publishService, never()).publish(anyString(), any(), any());
        verify(auditLogService).recordWithDetails(
                eq(adminId), eq("REJECT_AI_CONTENT"), eq("AI_GENERATED_CONTENT"), eq(contentId),
                contains("Sai đáp án"), eq("Sai đáp án"), eq("Đáp án B mới đúng ngữ pháp"), eq("127.0.0.1"));
    }

    @Test
    void updatesPendingPayloadAndRecordsAudit() {
        UUID contentId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        Instant now = Instant.now();
        Map<String, Object> updatedPayload = Map.of("question", "Edited?");
        AiReviewService.ReviewItem item = new AiReviewService.ReviewItem(
                contentId, "QUESTION", updatedPayload, AiReviewStatus.PENDING,
                "GENERATE_QUESTION", "test-model", now, null, null, null, null, null);

        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.query(anyString(), org.mockito.ArgumentMatchers.<RowMapper<AiReviewService.ReviewItem>>any(),
                eq(contentId))).thenReturn(List.of(item));

        AiReviewService.ReviewItem result = aiReviewService.updatePayload(contentId, updatedPayload, adminId, "127.0.0.1");

        assertThat(result.payload()).isEqualTo(updatedPayload);
        verify(auditLogService).record(eq(adminId), eq("EDIT_AI_CONTENT"), eq("AI_GENERATED_CONTENT"), eq(contentId),
                contains("hiệu chỉnh"), eq("127.0.0.1"));
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
        verify(publishService, never()).publish(anyString(), any(), any());
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
