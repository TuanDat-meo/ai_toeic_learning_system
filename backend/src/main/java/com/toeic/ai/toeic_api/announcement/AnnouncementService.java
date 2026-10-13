package com.toeic.ai.toeic_api.announcement;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnnouncementService {
    private static final String SELECT = """
            SELECT a.id, a.title, a.summary, a.content, a.type, a.target, a.status,
                   a.is_pinned, a.action_url, a.created_at, a.updated_at,
                   COALESCE(u.full_name, 'Admin') AS created_by,
                   (SELECT count(*) FROM announcement_reads ar WHERE ar.announcement_id=a.id) AS read_count,
                   %s AS is_read
            FROM announcements a LEFT JOIN users u ON u.id=a.created_by
            """;

    private final JdbcTemplate jdbc;

    public AnnouncementService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Announcement> listForAdmin() {
        return jdbc.query(SELECT.formatted("false") + " ORDER BY a.created_at DESC", this::map);
    }

    public List<Announcement> listForStudent(UUID userId) {
        String sql = SELECT.formatted("EXISTS (SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id=a.id AND ar.user_id=?)") + """
                WHERE a.status='ACTIVE'
                  AND (a.target='ALL'
                    OR (a.target='FREE_USERS' AND NOT EXISTS (
                        SELECT 1 FROM user_subscriptions s JOIN subscription_plans p ON p.id=s.plan_id
                        WHERE s.user_id=? AND s.status='ACTIVE' AND s.start_at<=now()
                          AND (s.end_at IS NULL OR s.end_at>now())
                          AND p.plan_category IN ('PRO','PREMIUM','PROMOTION')))
                    OR (a.target='VIP_USERS' AND EXISTS (
                        SELECT 1 FROM user_subscriptions s JOIN subscription_plans p ON p.id=s.plan_id
                        WHERE s.user_id=? AND s.status='ACTIVE' AND s.start_at<=now()
                          AND (s.end_at IS NULL OR s.end_at>now())
                          AND p.plan_category IN ('PRO','PREMIUM','PROMOTION'))))
                ORDER BY a.is_pinned DESC, a.created_at DESC
                """;
        return jdbc.query(sql, this::map, userId, userId, userId);
    }

    @Transactional
    public Announcement create(AnnouncementRequest request, UUID adminId) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO announcements (id,title,summary,content,type,target,status,is_pinned,action_url,created_by)
                VALUES (?,?,?,?,?,?,?,?,?,?)
                """, id, request.title().trim(), clean(request.summary()), request.content().trim(), request.type(),
                request.target(), request.status(), request.isPinned(), clean(request.actionUrl()), adminId);
        return find(id);
    }

    @Transactional
    public Announcement update(UUID id, AnnouncementRequest request) {
        int changed = jdbc.update("""
                UPDATE announcements SET title=?,summary=?,content=?,type=?,target=?,status=?,is_pinned=?,action_url=?,updated_at=now()
                WHERE id=?
                """, request.title().trim(), clean(request.summary()), request.content().trim(), request.type(),
                request.target(), request.status(), request.isPinned(), clean(request.actionUrl()), id);
        if (changed == 0) throw missing();
        return find(id);
    }

    @Transactional
    public void delete(UUID id) {
        if (jdbc.update("DELETE FROM announcements WHERE id=?", id) == 0) throw missing();
    }

    public void markRead(UUID announcementId, UUID userId) {
        int exists = jdbc.query("SELECT count(*) FROM announcements WHERE id=? AND status='ACTIVE'", rs -> rs.next() ? rs.getInt(1) : 0, announcementId);
        if (exists == 0) throw missing();
        jdbc.update("INSERT INTO announcement_reads (announcement_id,user_id) VALUES (?,?) ON CONFLICT DO NOTHING", announcementId, userId);
    }

    private Announcement find(UUID id) {
        List<Announcement> rows = jdbc.query(SELECT.formatted("false") + " WHERE a.id=?", this::map, id);
        if (rows.isEmpty()) throw missing();
        return rows.getFirst();
    }

    private Announcement map(ResultSet rs, int row) throws SQLException {
        Timestamp created = rs.getTimestamp("created_at");
        Timestamp updated = rs.getTimestamp("updated_at");
        return new Announcement(rs.getObject("id", UUID.class), rs.getString("title"), rs.getString("summary"),
                rs.getString("content"), rs.getString("type"), rs.getString("target"), rs.getString("status"),
                rs.getBoolean("is_pinned"), rs.getString("action_url"), rs.getLong("read_count"),
                rs.getBoolean("is_read"), created == null ? null : created.toInstant(),
                updated == null ? null : updated.toInstant(), rs.getString("created_by"));
    }

    private static String clean(String value) { return value == null ? "" : value.trim(); }
    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo."); }
}
