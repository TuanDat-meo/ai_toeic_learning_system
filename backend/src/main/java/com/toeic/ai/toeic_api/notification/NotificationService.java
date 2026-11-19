package com.toeic.ai.toeic_api.notification;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
    private static final String SELECT = """
            SELECT id, user_id, type, title, message, is_read, link_url, reference_id, created_at
            FROM notifications
            """;

    private final JdbcTemplate jdbc;

    public NotificationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Notification> listForUser(UUID userId, int limit) {
        int safeLimit = Math.clamp(limit, 1, 100);
        return jdbc.query(
                SELECT + " WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
                this::mapNotification,
                userId, safeLimit
        );
    }

    public int getUnreadCount(UUID userId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = false",
                Integer.class,
                userId
        );
        return count != null ? count : 0;
    }

    @Transactional
    public Notification createNotification(UUID userId, String type, String title, String message,
                                          String linkUrl, String referenceId) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO notifications (id, user_id, type, title, message, is_read, link_url, reference_id)
                VALUES (?, ?, ?, ?, ?, false, ?, ?)
                """, id, userId, type, title.trim(), message.trim(), linkUrl, referenceId);
        return find(id, userId);
    }

    @Transactional
    public void notifyAdminsAndTeachers(String type, String title, String message, String linkUrl, String referenceId) {
        List<UUID> staffIds = jdbc.query(
                "SELECT id FROM users WHERE role IN ('ADMIN', 'TEACHER') AND status = 'ACTIVE'",
                (rs, rowNum) -> rs.getObject("id", UUID.class)
        );
        for (UUID staffId : staffIds) {
            createNotification(staffId, type, title, message, linkUrl, referenceId);
        }
    }

    @Transactional
    public void markAsRead(UUID id, UUID userId) {
        int updated = jdbc.update(
                "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
                id, userId
        );
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo.");
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        jdbc.update(
                "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
                userId
        );
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        int deleted = jdbc.update(
                "DELETE FROM notifications WHERE id = ? AND user_id = ?",
                id, userId
        );
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo để xóa.");
        }
    }

    private Notification find(UUID id, UUID userId) {
        List<Notification> list = jdbc.query(
                SELECT + " WHERE id = ? AND user_id = ?",
                this::mapNotification,
                id, userId
        );
        if (list.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo.");
        }
        return list.getFirst();
    }

    private Notification mapNotification(ResultSet rs, int rowNum) throws SQLException {
        Timestamp createdAtTs = rs.getTimestamp("created_at");
        Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();
        return new Notification(
                rs.getObject("id", UUID.class),
                rs.getObject("user_id", UUID.class),
                rs.getString("type"),
                rs.getString("title"),
                rs.getString("message"),
                rs.getBoolean("is_read"),
                rs.getString("link_url"),
                rs.getString("reference_id"),
                createdAt
        );
    }
}
