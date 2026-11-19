package com.toeic.ai.toeic_api.aireview;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.audit.AuditLogService;

@Service
public class AiReviewService {
    private static final String SELECT_ITEM = """
            SELECT generated.id, generated.content_type, generated.payload_json,
                   generated.validation_status, generated.created_at, generated.reviewed_at,
                   interaction.type AS interaction_type, interaction.model,
                   COALESCE(NULLIF(TRIM(reviewer.full_name), ''), reviewer.email) AS reviewer_name,
                   latest_audit.new_data ->> 'category' AS review_category,
                   latest_audit.new_data ->> 'reason' AS review_note
            FROM ai_generated_content generated
            JOIN ai_interactions interaction ON interaction.id = generated.ai_interaction_id
            LEFT JOIN users reviewer ON reviewer.id = generated.reviewed_by
            LEFT JOIN LATERAL (
                SELECT a.new_data
                FROM audit_logs a
                WHERE a.entity_type = 'AI_GENERATED_CONTENT'
                  AND a.entity_id = generated.id
                  AND a.action IN ('APPROVE_AI_CONTENT', 'REJECT_AI_CONTENT', 'AUTO_PUBLISH_AI_CONTENT')
                ORDER BY a.created_at DESC
                LIMIT 1
            ) latest_audit ON true
            """;

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AuditLogService auditLogService;
    private final AiContentPublishService publishService;

    public AiReviewService(
            JdbcTemplate jdbc,
            AuditLogService auditLogService,
            AiContentPublishService publishService) {
        this.jdbc = jdbc;
        this.auditLogService = auditLogService;
        this.publishService = publishService;
    }

    @Transactional(readOnly = true)
    public Queue getQueue(AiReviewStatus status, int requestedLimit) {
        int limit = Math.clamp(requestedLimit, 1, 100);
        String filter = switch (status) {
            case PENDING -> " WHERE generated.validation_status = 'PENDING'";
            case APPROVED -> " WHERE generated.validation_status = 'PASSED'";
            case REJECTED -> " WHERE generated.validation_status = 'REJECTED'";
            case ALL -> "";
        };
        List<ReviewItem> items = jdbc.query(SELECT_ITEM + filter
                        + " ORDER BY CASE WHEN generated.validation_status = 'PENDING' THEN 0 ELSE 1 END, "
                        + "generated.created_at DESC LIMIT ?",
                (rs, row) -> mapReviewItem(rs),
                limit);
        Counts counts = jdbc.queryForObject("""
                SELECT count(*) FILTER (WHERE validation_status = 'PENDING') AS pending,
                       count(*) FILTER (WHERE validation_status = 'PASSED') AS approved,
                       count(*) FILTER (WHERE validation_status = 'REJECTED') AS rejected
                FROM ai_generated_content
                """,
                (rs, row) -> new Counts(rs.getInt("pending"), rs.getInt("approved"), rs.getInt("rejected")));
        return new Queue(items, counts);
    }

    @Transactional(readOnly = true)
    public AuditOverview getAuditOverview(int requestedLimit) {
        int limit = Math.clamp(requestedLimit, 1, 100);
        InteractionStats stats = jdbc.queryForObject("""
                SELECT count(*) AS total,
                       count(*) FILTER (WHERE status = 'SUCCESS') AS success_count,
                       count(*) FILTER (WHERE status = 'FAILED') AS failed_count,
                       count(*) FILTER (WHERE type IN ('GENERATE_QUESTION', 'GENERATE_READING', 'GENERATE_EXERCISE')) AS content_gen_count,
                       count(*) FILTER (WHERE type IN ('EXPLAIN_ANSWER', 'ANALYZE_MISTAKE', 'EXPLAIN_VOCAB')) AS tutor_count
                FROM ai_interactions
                """,
                (rs, row) -> new InteractionStats(
                        rs.getInt("total"),
                        rs.getInt("success_count"),
                        rs.getInt("failed_count"),
                        rs.getInt("content_gen_count"),
                        rs.getInt("tutor_count")));

        List<AuditItem> logs = jdbc.query("""
                SELECT a.id, a.action, a.entity_id,
                       COALESCE(NULLIF(TRIM(u.full_name), ''), u.email, 'Hệ thống') AS actor_name,
                       a.new_data ->> 'summary' AS summary,
                       NULLIF(a.new_data ->> 'category', '') AS category,
                       NULLIF(a.new_data ->> 'reason', '') AS reason,
                       a.created_at
                FROM audit_logs a
                LEFT JOIN users u ON u.id = a.user_id
                WHERE a.entity_type = 'AI_GENERATED_CONTENT'
                ORDER BY a.created_at DESC
                LIMIT ?
                """,
                (rs, row) -> new AuditItem(
                        rs.getObject("id", UUID.class),
                        rs.getString("action"),
                        rs.getObject("entity_id", UUID.class),
                        rs.getString("actor_name"),
                        rs.getString("summary"),
                        rs.getString("category"),
                        rs.getString("reason"),
                        rs.getTimestamp("created_at").toInstant()),
                limit);

        List<RejectionBreakdown> topReasons = jdbc.query("""
                SELECT COALESCE(NULLIF(TRIM(new_data ->> 'category'), ''), 'Khác') AS category,
                       count(*) AS total
                FROM audit_logs
                WHERE entity_type = 'AI_GENERATED_CONTENT'
                  AND action = 'REJECT_AI_CONTENT'
                GROUP BY 1
                ORDER BY total DESC, category ASC
                LIMIT 6
                """,
                (rs, row) -> new RejectionBreakdown(rs.getString("category"), rs.getInt("total")));

        return new AuditOverview(stats, logs, topReasons);
    }

    @Transactional
    public ReviewItem updatePayload(UUID contentId, Map<String, Object> payload, UUID adminId, String ipAddress) {
        if (payload == null || payload.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payload chỉnh sửa phải là JSON object hợp lệ.");
        }
        String serialized;
        try {
            serialized = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể mã hóa JSON nội dung AI.");
        }
        int updated = jdbc.update("""
                UPDATE ai_generated_content
                SET payload_json = ?::jsonb, updated_at = now()
                WHERE id = ? AND validation_status = 'PENDING'
                """, serialized, contentId);
        if (updated == 0) {
            throwNotFoundOrConflict(contentId);
        }
        auditLogService.record(adminId, "EDIT_AI_CONTENT", "AI_GENERATED_CONTENT", contentId,
                "Đã hiệu chỉnh nội dung AI trước khi kiểm duyệt.", ipAddress);
        return getItem(contentId);
    }

    @Transactional
    public ReviewItem review(UUID contentId, UUID adminId, AiReviewDecision decision, String ipAddress) {
        return review(contentId, adminId, decision, null, null, ipAddress);
    }

    @Transactional
    public ReviewItem review(
            UUID contentId,
            UUID adminId,
            AiReviewDecision decision,
            String category,
            String reason,
            String ipAddress) {
        String newStatus = decision == AiReviewDecision.APPROVE ? "PASSED" : "REJECTED";
        int updated = jdbc.update("""
                UPDATE ai_generated_content
                SET validation_status = ?, reviewed_by = ?, reviewed_at = now(), updated_at = now()
                WHERE id = ? AND validation_status = 'PENDING'
                """, newStatus, adminId, contentId);
        if (updated == 0) {
            throwNotFoundOrConflict(contentId);
        }
        ReviewItem reviewed = getItem(contentId);
        AiContentPublishService.PublishedTarget publishedTarget = null;
        if (decision == AiReviewDecision.APPROVE && publishService != null) {
            JsonNode payloadTree = objectMapper.valueToTree(reviewed.payload());
            publishedTarget = publishService.publish(reviewed.contentType(), payloadTree, adminId);
        }

        String normalizedCategory = cleanText(category, 80);
        String normalizedReason = cleanText(reason, 300);

        String action = decision == AiReviewDecision.APPROVE ? "APPROVE" : "REJECT";
        if (decision == AiReviewDecision.APPROVE) {
            String auditDetail = publishedTarget != null
                    ? "Đã duyệt đạt chuẩn và đồng bộ tới " + publishedTarget.targetLabel() + "."
                    : "Đã duyệt nội dung AI.";
            auditLogService.record(adminId, action + "_AI_CONTENT", "AI_GENERATED_CONTENT", contentId,
                    auditDetail, ipAddress);
        } else {
            String auditDetail = normalizedCategory != null
                    ? "Đã từ chối nội dung AI (" + normalizedCategory + ")."
                    : "Đã từ chối nội dung AI.";
            if (normalizedCategory != null || normalizedReason != null) {
                auditLogService.recordWithDetails(
                        adminId,
                        action + "_AI_CONTENT",
                        "AI_GENERATED_CONTENT",
                        contentId,
                        auditDetail,
                        normalizedCategory,
                        normalizedReason,
                        ipAddress);
            } else {
                auditLogService.record(adminId, action + "_AI_CONTENT", "AI_GENERATED_CONTENT", contentId,
                        auditDetail, ipAddress);
            }
        }

        return new ReviewItem(
                reviewed.id(),
                reviewed.contentType(),
                reviewed.payload(),
                reviewed.status(),
                reviewed.interactionType(),
                reviewed.model(),
                reviewed.createdAt(),
                reviewed.reviewedAt(),
                reviewed.reviewerName(),
                normalizedCategory != null ? normalizedCategory : reviewed.reviewCategory(),
                normalizedReason != null ? normalizedReason : reviewed.reviewNote(),
                publishedTarget);
    }

    private ReviewItem mapReviewItem(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ReviewItem(
                rs.getObject("id", UUID.class),
                rs.getString("content_type"),
                readPayload(rs.getString("payload_json")),
                toReviewStatus(rs.getString("validation_status")),
                rs.getString("interaction_type"),
                rs.getString("model"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("reviewed_at") == null ? null : rs.getTimestamp("reviewed_at").toInstant(),
                rs.getString("reviewer_name"),
                blankToNull(rs.getString("review_category")),
                blankToNull(rs.getString("review_note")),
                null);
    }

    private void throwNotFoundOrConflict(UUID contentId) {
        String currentStatus;
        try {
            currentStatus = jdbc.queryForObject(
                    "SELECT validation_status FROM ai_generated_content WHERE id = ?",
                    String.class, contentId);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nội dung AI cần kiểm duyệt.");
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Nội dung đã được xử lý trước đó với trạng thái " + currentStatus + ".");
    }

    private ReviewItem getItem(UUID contentId) {
        List<ReviewItem> items = jdbc.query(SELECT_ITEM + " WHERE generated.id = ?",
                (rs, row) -> mapReviewItem(rs),
                contentId);
        if (items.isEmpty()) {
            throw new IllegalStateException("Nội dung AI đã được cập nhật nhưng không thể tải lại.");
        }
        return items.getFirst();
    }

    private Object readPayload(String payload) {
        try {
            return objectMapper.readValue(payload, Object.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Payload nội dung AI không phải JSON hợp lệ.", exception);
        }
    }

    private AiReviewStatus toReviewStatus(String status) {
        return switch (status) {
            case "PENDING" -> AiReviewStatus.PENDING;
            case "PASSED" -> AiReviewStatus.APPROVED;
            case "REJECTED" -> AiReviewStatus.REJECTED;
            default -> throw new IllegalStateException("Trạng thái kiểm duyệt AI không được hỗ trợ: " + status);
        };
    }

    private String cleanText(String raw, int maxLen) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isBlank()) return null;
        return trimmed.length() <= maxLen ? trimmed : trimmed.substring(0, maxLen).trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record Queue(List<ReviewItem> items, Counts counts) { }
    public record Counts(int pending, int approved, int rejected) { }
    public record ReviewItem(
            UUID id,
            String contentType,
            Object payload,
            AiReviewStatus status,
            String interactionType,
            String model,
            Instant createdAt,
            Instant reviewedAt,
            String reviewerName,
            String reviewCategory,
            String reviewNote,
            AiContentPublishService.PublishedTarget publishedTarget
    ) { }

    public record InteractionStats(
            int total,
            int successCount,
            int failedCount,
            int contentGenerationCount,
            int tutorChatCount
    ) { }

    public record AuditItem(
            UUID id,
            String action,
            UUID entityId,
            String actorName,
            String summary,
            String category,
            String reason,
            Instant createdAt
    ) { }

    public record RejectionBreakdown(String category, int count) { }

    public record AuditOverview(
            InteractionStats stats,
            List<AuditItem> logs,
            List<RejectionBreakdown> rejectionBreakdown
    ) { }
}
