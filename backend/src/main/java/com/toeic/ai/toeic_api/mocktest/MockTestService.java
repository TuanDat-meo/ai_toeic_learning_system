package com.toeic.ai.toeic_api.mocktest;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MockTestService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MockTestService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<MockTestItem> listTests(String volId, UUID userId) {
        String sql = """
                SELECT t.id, t.vol_id, t.title, t.difficulty, t.description,
                       t.duration_minutes, t.status,
                       (SELECT COUNT(*) FROM mock_test_question_links ql WHERE ql.test_id = t.id) AS total_questions,
                       t.key_vocab::text AS key_vocab,
                       latest.score, latest.listening_score, latest.reading_score,
                       latest.completed_at::text AS completed_at,
                       stats.avg_score, stats.attempt_count
                FROM mock_test_items t
                LEFT JOIN LATERAL (
                    SELECT score, listening_score, reading_score, completed_at
                    FROM user_mock_test_attempts a
                    WHERE a.test_id = t.id AND a.user_id = ?
                    ORDER BY a.completed_at DESC
                    LIMIT 1
                ) latest ON true
                LEFT JOIN LATERAL (
                    SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0) AS avg_score,
                           COUNT(id) AS attempt_count
                    FROM user_mock_test_attempts a
                    WHERE a.test_id = t.id
                ) stats ON true
                """;

        if (volId != null && !volId.isBlank() && !"all".equalsIgnoreCase(volId)) {
            sql += " WHERE t.vol_id = ? ORDER BY t.id ASC";
            return jdbc.query(sql, (rs, rowNum) -> mapTestSummary(rs, userId), userId, volId);
        } else {
            sql += " ORDER BY t.id ASC";
            return jdbc.query(sql, (rs, rowNum) -> mapTestSummary(rs, userId), userId);
        }
    }

    public List<MockTestQuestion> getTestQuestions(int testId) {
        String sql = """
                SELECT b.id, l.test_id, l.question_num, b.part, b.question_text,
                       b.passage, b.bilingual_passage, b.audio_url, b.image_url,
                       b.options::text AS options_json,
                       b.correct_answer, b.explanation, b.transcript, b.translation,
                       b.vocab_list::text AS vocab_json
                FROM mock_test_question_links l
                JOIN toeic_question_bank b ON b.id = l.question_id
                WHERE l.test_id = ?
                ORDER BY l.question_num ASC
                """;

        return jdbc.query(sql, (rs, rowNum) -> new MockTestQuestion(
                rs.getLong("id"),
                rs.getInt("test_id"),
                rs.getInt("question_num"),
                rs.getString("part"),
                rs.getString("question_text"),
                rs.getString("passage"),
                rs.getString("bilingual_passage"),
                rs.getString("audio_url"),
                rs.getString("image_url"),
                parseMap(rs.getString("options_json")),
                rs.getString("correct_answer"),
                rs.getString("explanation"),
                rs.getString("transcript"),
                rs.getString("translation"),
                parseList(rs.getString("vocab_json"))
        ), testId);
    }

    @Transactional
    public MockTestItem createTest(MockTestUpsertRequest request) {
        validateTestRequest(request);
        String keyVocab = toJson(request.keyVocab() == null ? List.of() : request.keyVocab());
        Integer testId = jdbc.queryForObject("""
                INSERT INTO mock_test_items
                    (vol_id, title, difficulty, description, duration_minutes, status, key_vocab)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb)
                RETURNING id
                """, Integer.class, request.volId().trim(), request.title().trim(), toDatabaseDifficulty(request.difficulty()),
                request.description(), request.durationMinutes(), request.status(), keyVocab);
        return findTest(testId);
    }

    @Transactional
    public MockTestItem updateTest(int testId, MockTestUpsertRequest request) {
        validateTestRequest(request);
        String keyVocab = toJson(request.keyVocab() == null ? List.of() : request.keyVocab());
        int updated = jdbc.update("""
                UPDATE mock_test_items
                SET vol_id = ?, title = ?, difficulty = ?, description = ?,
                    duration_minutes = ?, status = ?, key_vocab = ?::jsonb, updated_at = now()
                WHERE id = ?
                """, request.volId().trim(), request.title().trim(), toDatabaseDifficulty(request.difficulty()), request.description(),
                request.durationMinutes(), request.status(), keyVocab, testId);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đề thi.");
        }
        return findTest(testId);
    }

    @Transactional
    public void deleteTest(int testId) {
        int deleted = jdbc.update("DELETE FROM mock_test_items WHERE id = ?", testId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đề thi.");
        }
    }

    private MockTestItem findTest(int testId) {
        return listTests(null, null).stream()
                .filter(test -> test.id() == testId)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đề thi."));
    }

    private void validateTestRequest(MockTestUpsertRequest request) {
        if (request == null || request.volId() == null || request.volId().isBlank()
                || request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bộ đề và tên đề thi là bắt buộc.");
        }
        toDatabaseDifficulty(request.difficulty());
        if (request.durationMinutes() == null || request.durationMinutes() < 1 || request.durationMinutes() > 600) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời lượng phải từ 1 đến 600 phút.");
        }
        if (request.status() == null || !List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái đề thi không hợp lệ.");
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu từ vựng không hợp lệ.", e);
        }
    }

    private String toDatabaseDifficulty(String difficulty) {
        if (difficulty == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mức độ đề thi là bắt buộc.");
        }
        return switch (difficulty) {
            case "Dễ", "EASY" -> "EASY";
            case "Vừa sức", "Trung bình", "MEDIUM" -> "MEDIUM";
            case "Khó", "HARD" -> "HARD";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mức độ đề thi không hợp lệ.");
        };
    }

    private String displayDifficulty(String difficulty) {
        return switch (difficulty) {
            case "EASY" -> "Dễ";
            case "HARD" -> "Khó";
            default -> "Trung bình";
        };
    }

    @Transactional
    public MockTestAttempt submitAttempt(UUID userId, SubmitMockTestRequest req) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để lưu kết quả thi thử.");
        }

        UUID attemptId = UUID.randomUUID();
        String sql = """
                INSERT INTO user_mock_test_attempts (id, user_id, test_id, score, listening_score, reading_score, correct_count, total_count, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        jdbc.update(sql, attemptId, userId, req.testId(), req.score(), req.listeningScore(), req.readingScore(),
                req.correctCount(), req.totalCount(), req.durationSeconds());

        return new MockTestAttempt(
                attemptId, req.testId(), req.score(), req.listeningScore(), req.readingScore(),
                req.correctCount(), req.totalCount(), req.durationSeconds(), java.time.Instant.now()
        );
    }

    public List<MockTestSubmissionDto> listAllSubmissions(Integer testId) {
        String sql = """
                SELECT a.id, a.test_id, t.title AS test_title,
                       t.vol_id AS vol_id,
                       a.user_id, u.full_name AS student_name,
                       u.email AS student_email,
                       a.score, a.listening_score, a.reading_score,
                       a.correct_count, a.total_count, a.duration_seconds, a.completed_at
                FROM user_mock_test_attempts a
                LEFT JOIN mock_test_items t ON t.id = a.test_id
                LEFT JOIN users u ON u.id = a.user_id
                """;
        if (testId != null && testId > 0) {
            sql += " WHERE a.test_id = ? ORDER BY a.completed_at DESC";
            return jdbc.query(sql, (rs, rowNum) -> mapSubmissionDto(rs), testId);
        } else {
            sql += " ORDER BY a.completed_at DESC";
            return jdbc.query(sql, (rs, rowNum) -> mapSubmissionDto(rs));
        }
    }

    private MockTestSubmissionDto mapSubmissionDto(ResultSet rs) throws SQLException {
        return new MockTestSubmissionDto(
                rs.getObject("id", UUID.class),
                rs.getInt("test_id"),
                rs.getString("test_title"),
                rs.getString("vol_id"),
                rs.getObject("user_id", UUID.class),
                rs.getString("student_name"),
                rs.getString("student_email"),
                rs.getInt("score"),
                rs.getInt("listening_score"),
                rs.getInt("reading_score"),
                rs.getInt("correct_count"),
                rs.getInt("total_count"),
                rs.getInt("duration_seconds"),
                rs.getTimestamp("completed_at").toInstant(),
                "Đã chấm điểm"
        );
    }

    public List<MockTestAttempt> getHistoryAttempts(int testId, UUID userId) {
        if (userId == null) return Collections.emptyList();

        String sql = """
                SELECT id, test_id, score, listening_score, reading_score, correct_count, total_count, duration_seconds, completed_at
                FROM user_mock_test_attempts
                WHERE test_id = ? AND user_id = ?
                ORDER BY completed_at DESC
                """;

        return jdbc.query(sql, (rs, rowNum) -> new MockTestAttempt(
                rs.getObject("id", UUID.class),
                rs.getInt("test_id"),
                rs.getInt("score"),
                rs.getInt("listening_score"),
                rs.getInt("reading_score"),
                rs.getInt("correct_count"),
                rs.getInt("total_count"),
                rs.getInt("duration_seconds"),
                rs.getTimestamp("completed_at").toInstant()
        ), testId, userId);
    }

    private MockTestItem mapTestSummary(ResultSet rs, UUID userId) throws SQLException {
        int testId = rs.getInt("id");
        List<MockTestAttempt> attempts = userId != null ? getHistoryAttempts(testId, userId) : Collections.emptyList();
        Integer score = rs.getObject("score") != null ? rs.getInt("score") : null;
        Integer listeningScore = rs.getObject("listening_score") != null ? rs.getInt("listening_score") : null;
        Integer readingScore = rs.getObject("reading_score") != null ? rs.getInt("reading_score") : null;
        Double avgScore = rs.getObject("avg_score") != null ? rs.getDouble("avg_score") : 0.0;
        int attemptCount = rs.getInt("attempt_count");

        return new MockTestItem(
                testId,
                rs.getString("vol_id"),
                rs.getString("title"),
                displayDifficulty(rs.getString("difficulty")),
                rs.getString("description"),
                rs.getInt("duration_minutes"),
                rs.getInt("total_questions"),
                score,
                listeningScore,
                readingScore,
                rs.getString("status"),
                rs.getString("completed_at"),
                parseList(rs.getString("key_vocab")),
                attempts,
                avgScore,
                attemptCount
        );
    }

    private Map<String, String> parseMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private List<Map<String, Object>> parseList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
