package com.toeic.ai.toeic_api.audit;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private final JdbcTemplate jdbcTemplate;

        public AuditLogService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void record(UUID userId, String action, String entityType, UUID entityId, String summary,
            String ipAddress) {
        jdbcTemplate.update(
                "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data, ip_address) "
                        + "VALUES (?, ?, ?, ?, jsonb_build_object('summary', ?), NULLIF(?, '')::inet)",
                userId, action, entityType, entityId, summary, ipAddress == null ? "" : ipAddress);
    }

    public List<AuditLogEntry> listForUser(UUID userId, int requestedLimit) {
        int limit = Math.clamp(requestedLimit, 1, 100);
        return jdbcTemplate.query(
                "SELECT id, action, entity_type, entity_id, new_data ->> 'summary' AS summary, created_at "
                        + "FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (rs, rowNum) -> new AuditLogEntry(
                        rs.getObject("id", UUID.class),
                        rs.getString("action"),
                        rs.getString("entity_type"),
                        rs.getObject("entity_id", UUID.class),
                        rs.getString("summary"),
                        rs.getTimestamp("created_at").toInstant()),
                userId, limit);
    }

    public record AuditLogEntry(UUID id, String action, String entityType, UUID entityId, String summary,
            Instant createdAt) { }
}