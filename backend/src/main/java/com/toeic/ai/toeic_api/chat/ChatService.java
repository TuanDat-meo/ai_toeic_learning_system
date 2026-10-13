package com.toeic.ai.toeic_api.chat;

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
public class ChatService {
    private static final String MESSAGE_SELECT = """
            SELECT m.id, m.thread_id, m.sender_id, u.full_name AS sender_name, u.role AS sender_role,
                   m.content, m.reply_to_id, ru.full_name AS reply_sender_name, rm.content AS reply_content, m.created_at
            FROM chat_messages m JOIN users u ON u.id=m.sender_id
            LEFT JOIN chat_messages rm ON rm.id=m.reply_to_id LEFT JOIN users ru ON ru.id=rm.sender_id
            """;
    private final JdbcTemplate jdbc;

    public ChatService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public int onlineCount() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM chat_presence WHERE last_seen_at > now() - interval '90 seconds'", Integer.class);
        return count == null ? 0 : count;
    }

    @Transactional
    public void heartbeat(UUID userId) {
        jdbc.update("INSERT INTO chat_presence(user_id,last_seen_at) VALUES (?,now()) ON CONFLICT(user_id) DO UPDATE SET last_seen_at=now()", userId);
    }

    public List<ChatMessage> discussionMessages() {
        return jdbc.query(MESSAGE_SELECT + " WHERE m.room_type='DISCUSSION' ORDER BY m.created_at DESC LIMIT 100", this::mapMessage)
                .reversed();
    }

    @Transactional
    public ChatMessage sendDiscussion(UUID userId, String content) {
        return insertMessage("DISCUSSION", null, userId, content, null);
    }

    @Transactional
    public UUID getOrCreateThread(UUID userId) {
        List<UUID> existing = jdbc.query("SELECT id FROM chat_support_threads WHERE user_id=? AND status='OPEN'", (rs, row) -> rs.getObject(1, UUID.class), userId);
        if (!existing.isEmpty()) return existing.getFirst();
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO chat_support_threads(id,user_id) VALUES (?,?)", id, userId);
        return id;
    }

    public List<ChatMessage> supportMessages(UUID threadId, UUID userId, boolean admin) {
        ensureThreadAccess(threadId, userId, admin);
        return jdbc.query(MESSAGE_SELECT + " WHERE m.room_type='SUPPORT' AND m.thread_id=? ORDER BY m.created_at ASC LIMIT 200", this::mapMessage, threadId);
    }

    @Transactional
    public ChatMessage sendSupport(UUID threadId, UUID userId, boolean admin, String content) {
        ensureThreadAccess(threadId, userId, admin);
        jdbc.update("UPDATE chat_support_threads SET updated_at=now() WHERE id=?", threadId);
        return insertMessage("SUPPORT", threadId, userId, content, null);
    }

    @Transactional
    public ChatMessage sendDiscussion(UUID userId, String content, UUID replyToId) {
        return insertMessage("DISCUSSION", null, userId, content, replyToId);
    }

    @Transactional
    public ChatMessage sendSupport(UUID threadId, UUID userId, boolean admin, String content, UUID replyToId) {
        ensureThreadAccess(threadId, userId, admin);
        return insertMessage("SUPPORT", threadId, userId, content, replyToId);
    }

    public List<ChatThread> threads() {
        return jdbc.query("""
                SELECT t.id,t.user_id,u.full_name,u.email,t.status,
                  (SELECT m.content FROM chat_messages m WHERE m.thread_id=t.id ORDER BY m.created_at DESC LIMIT 1) last_message,
                  t.updated_at
                FROM chat_support_threads t JOIN users u ON u.id=t.user_id ORDER BY t.updated_at DESC LIMIT 200
                """, (rs, row) -> new ChatThread(rs.getObject("id", UUID.class), rs.getObject("user_id", UUID.class),
                    rs.getString("full_name"), rs.getString("email"), rs.getString("status"), rs.getString("last_message"), instant(rs,"updated_at")));
    }

    private ChatMessage insertMessage(String type, UUID threadId, UUID senderId, String rawContent, UUID replyToId) {
        String content = rawContent.trim();
        if (content.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn không được để trống.");
        UUID id = UUID.randomUUID();
        if (replyToId != null) {
            Integer replyExists = jdbc.queryForObject("SELECT count(*) FROM chat_messages WHERE id=? AND room_type=? AND thread_id IS NOT DISTINCT FROM ?", Integer.class, replyToId, type, threadId);
            if (replyExists == null || replyExists == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn được trả lời không thuộc cuộc trò chuyện này.");
        }
        jdbc.update("INSERT INTO chat_messages(id,room_type,thread_id,sender_id,content,reply_to_id) VALUES (?,?,?,?,?,?)", id, type, threadId, senderId, content, replyToId);
        if (threadId != null) jdbc.update("UPDATE chat_support_threads SET updated_at=now() WHERE id=?", threadId);
        return jdbc.queryForObject(MESSAGE_SELECT + " WHERE m.id=?", this::mapMessage, id);
    }

    private void ensureThreadAccess(UUID threadId, UUID userId, boolean admin) {
        Integer count = admin
            ? jdbc.queryForObject("SELECT count(*) FROM chat_support_threads WHERE id=?", Integer.class, threadId)
            : jdbc.queryForObject("SELECT count(*) FROM chat_support_threads WHERE id=? AND user_id=?", Integer.class, threadId, userId);
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cuộc trò chuyện.");
    }

    private ChatMessage mapMessage(ResultSet rs, int row) throws SQLException {
        return new ChatMessage(rs.getObject("id", UUID.class), rs.getObject("thread_id", UUID.class),
                rs.getObject("sender_id", UUID.class), rs.getString("sender_name"), rs.getString("sender_role"),
                rs.getString("content"), rs.getObject("reply_to_id", UUID.class), rs.getString("reply_sender_name"),
                rs.getString("reply_content"), instant(rs,"created_at"));
    }

    private Instant instant(ResultSet rs, String col) throws SQLException {
        Timestamp value = rs.getTimestamp(col);
        return value == null ? null : value.toInstant();
    }
}
