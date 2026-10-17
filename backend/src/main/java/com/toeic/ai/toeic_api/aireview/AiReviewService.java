package com.toeic.ai.toeic_api.aireview;

import java.time.Instant;
import java.util.List;
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
                   interaction.type AS interaction_type, interaction.model
            FROM ai_generated_content generated
            JOIN ai_interactions interaction ON interaction.id = generated.ai_interaction_id
            """;

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AuditLogService auditLogService;

    public AiReviewService(JdbcTemplate jdbc, AuditLogService auditLogService) {
        this.jdbc = jdbc;
        this.auditLogService = auditLogService;
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
                (rs, row) -> new ReviewItem(
                        rs.getObject("id", UUID.class),
                        rs.getString("content_type"),
                        readPayload(rs.getString("payload_json")),
                        toReviewStatus(rs.getString("validation_status")),
                        rs.getString("interaction_type"),
                        rs.getString("model"),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getTimestamp("reviewed_at") == null ? null : rs.getTimestamp("reviewed_at").toInstant()),
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

    @Transactional
    public ReviewItem review(UUID contentId, UUID adminId, AiReviewDecision decision, String ipAddress) {
        String newStatus = decision == AiReviewDecision.APPROVE ? "PASSED" : "REJECTED";
        int updated = jdbc.update("""
                UPDATE ai_generated_content
                SET validation_status = ?, reviewed_by = ?, reviewed_at = now(), updated_at = now()
                WHERE id = ? AND validation_status = 'PENDING'
                """, newStatus, adminId, contentId);
        if (updated == 0) {
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
        ReviewItem reviewed = getItem(contentId);
        String action = decision == AiReviewDecision.APPROVE ? "APPROVE" : "REJECT";
        auditLogService.record(adminId, action + "_AI_CONTENT", "AI_GENERATED_CONTENT", contentId,
                decision == AiReviewDecision.APPROVE ? "Đã duyệt nội dung AI." : "Đã từ chối nội dung AI.",
                ipAddress);
        return reviewed;
    }

    private ReviewItem getItem(UUID contentId) {
        List<ReviewItem> items = jdbc.query(SELECT_ITEM + " WHERE generated.id = ?",
                (rs, row) -> new ReviewItem(
                        rs.getObject("id", UUID.class),
                        rs.getString("content_type"),
                        readPayload(rs.getString("payload_json")),
                        toReviewStatus(rs.getString("validation_status")),
                        rs.getString("interaction_type"),
                        rs.getString("model"),
                        rs.getTimestamp("created_at").toInstant(),
                        rs.getTimestamp("reviewed_at") == null ? null : rs.getTimestamp("reviewed_at").toInstant()),
                contentId);
        if (items.isEmpty()) {
            throw new IllegalStateException("Nội dung AI đã được cập nhật nhưng không thể tải lại.");
        }
        return items.getFirst();
    }

    private JsonNode readPayload(String payload) {
        try {
            return objectMapper.readTree(payload);
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

    public record Queue(List<ReviewItem> items, Counts counts) { }
    public record Counts(int pending, int approved, int rejected) { }
    public record ReviewItem(UUID id, String contentType, JsonNode payload, AiReviewStatus status,
            String interactionType, String model, Instant createdAt, Instant reviewedAt) { }
}
