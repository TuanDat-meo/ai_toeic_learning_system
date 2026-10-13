package com.toeic.ai.toeic_api.community;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommunityService {
    private static final String POST_SELECT = """
            SELECT p.id, p.author_id, u.full_name AS author_name, p.title, p.content, p.post_type,
                   p.question_snapshot::text AS question_snapshot, p.created_at, p.updated_at,
                   (SELECT count(*) FROM community_comments c WHERE c.post_id=p.id) AS comment_count
            FROM community_posts p JOIN users u ON u.id=p.author_id
            """;
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public CommunityService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CommunityPost> list() {
        return jdbc.query(POST_SELECT + " ORDER BY p.created_at DESC LIMIT 100", this::mapPost);
    }

    public CommunityPost find(UUID id) {
        List<CommunityPost> posts = jdbc.query(POST_SELECT + " WHERE p.id=?", this::mapPost, id);
        if (posts.isEmpty()) throw missingPost();
        return posts.getFirst();
    }

    @Transactional
    public CommunityPost create(CreateCommunityPostRequest request, UUID authorId) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO community_posts (id, author_id, title, content, post_type, question_snapshot)
                VALUES (?, ?, ?, ?, ?, ?::jsonb)
                """, id, authorId, request.title().trim(), request.content().trim(), request.postType(),
                writeJson(request.questionSnapshot()));
        return find(id);
    }

    @Transactional
    public void delete(UUID postId, UUID actorId, boolean admin) {
        List<UUID> authors = jdbc.query("SELECT author_id FROM community_posts WHERE id=?",
                (rs, row) -> rs.getObject("author_id", UUID.class), postId);
        if (authors.isEmpty()) throw missingPost();
        if (!admin && !authors.getFirst().equals(actorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người đăng bài hoặc quản trị viên mới có thể xóa bài viết.");
        }
        jdbc.update("DELETE FROM community_posts WHERE id=?", postId);
    }

    public List<CommunityComment> comments(UUID postId) {
        ensurePost(postId);
        return jdbc.query("""
                SELECT c.id, c.post_id, c.author_id, u.full_name AS author_name, c.content, c.created_at
                FROM community_comments c JOIN users u ON u.id=c.author_id
                WHERE c.post_id=? ORDER BY c.created_at ASC
                """, this::mapComment, postId);
    }

    @Transactional
    public CommunityComment addComment(UUID postId, UUID authorId, String content) {
        ensurePost(postId);
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO community_comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)",
                id, postId, authorId, content.trim());
        return jdbc.query("""
                SELECT c.id, c.post_id, c.author_id, u.full_name AS author_name, c.content, c.created_at
                FROM community_comments c JOIN users u ON u.id=c.author_id WHERE c.id=?
                """, this::mapComment, id).getFirst();
    }

    private void ensurePost(UUID id) {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM community_posts WHERE id=?", Integer.class, id);
        if (count == null || count == 0) throw missingPost();
    }

    private CommunityPost mapPost(ResultSet rs, int row) throws SQLException {
        Timestamp created = rs.getTimestamp("created_at");
        Timestamp updated = rs.getTimestamp("updated_at");
        return new CommunityPost(rs.getObject("id", UUID.class), rs.getObject("author_id", UUID.class),
                rs.getString("author_name"), rs.getString("title"), rs.getString("content"),
                rs.getString("post_type"), readJson(rs.getString("question_snapshot")), rs.getLong("comment_count"),
                created == null ? null : created.toInstant(), updated == null ? null : updated.toInstant());
    }

    private CommunityComment mapComment(ResultSet rs, int row) throws SQLException {
        Timestamp created = rs.getTimestamp("created_at");
        return new CommunityComment(rs.getObject("id", UUID.class), rs.getObject("post_id", UUID.class),
                rs.getObject("author_id", UUID.class), rs.getString("author_name"), rs.getString("content"),
                created == null ? null : created.toInstant());
    }

    private Map<String, Object> readJson(String json) {
        if (json == null || json.isBlank()) return null;
        try { return mapper.readValue(json, new TypeReference<>() { }); }
        catch (JsonProcessingException exception) { throw new IllegalStateException("Invalid community question snapshot", exception); }
    }

    private String writeJson(Map<String, Object> value) {
        if (value == null || value.isEmpty()) return null;
        try { return mapper.writeValueAsString(value); }
        catch (JsonProcessingException exception) { throw new IllegalArgumentException("Question snapshot could not be serialized", exception); }
    }

    private static ResponseStatusException missingPost() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết cộng đồng.");
    }
}
