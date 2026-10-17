package com.toeic.ai.toeic_api.mocktest;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
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
                SELECT t.id, t.vol_id, t.title, t.difficulty,
                       t.key_vocab::text AS key_vocab,
                       latest.score, latest.listening_score, latest.reading_score,
                       CASE WHEN latest.score IS NOT NULL THEN 'Đã làm' ELSE 'Chưa làm' END AS status,
                       latest.completed_at::text AS completed_at
                FROM mock_test_items t
                LEFT JOIN LATERAL (
                    SELECT score, listening_score, reading_score, completed_at
                    FROM user_mock_test_attempts a
                    WHERE a.test_id = t.id AND a.user_id = ?
                    ORDER BY a.completed_at DESC
                    LIMIT 1
                ) latest ON true
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
                SELECT id, test_id, question_num, part, question_text,
                       passage, bilingual_passage, audio_url, image_url,
                       options::text AS options_json,
                       correct_answer, explanation, transcript, translation,
                       vocab_list::text AS vocab_json
                FROM mock_test_questions
                WHERE test_id = ?
                ORDER BY question_num ASC
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

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM mock_test_items", Integer.class);
        if (count != null && count > 0) {
            return;
        }

        // Tạo 10 đề thi ETS 2024
        for (int i = 1; i <= 10; i++) {
            String diff = i <= 3 ? "Vừa sức" : (i <= 7 ? "Trung bình" : "Khó");
            String keyVocab = "[{\"word\":\"feasible\",\"ipa\":\"/ˈfiːzəbl/\",\"pos\":\"Adj\",\"meaning\":\"Khả thi\",\"example\":\"A feasible solution.\"},{\"word\":\"expedite\",\"ipa\":\"/ˈekspədaɪt/\",\"pos\":\"Verb\",\"meaning\":\"Đẩy nhanh tiến độ\",\"example\":\"Expedite the shipping process.\"}]";

            jdbc.update("""
                    INSERT INTO mock_test_items (id, vol_id, title, difficulty, key_vocab)
                    VALUES (?, 'ets2024', ?, ?, ?::jsonb)
                    """, i, "ETS 2024 - Test " + i, diff, keyVocab);
        }

        // Tạo một số câu hỏi mẫu cho Test 1
        String optionsQ1 = "{\"A\":\"He is climbing a ladder.\",\"B\":\"He is painting a fence.\",\"C\":\"He is driving a car.\",\"D\":\"He is reading a book.\"}";
        jdbc.update("""
                INSERT INTO mock_test_questions (test_id, question_num, part, question_text, audio_url, image_url, options, correct_answer, explanation)
                VALUES (1, 1, 'Part 1', 'Look at the picture marked number 1 in your test book.', '/ets_2024_lc/audio/part1_test1.mp3',
                    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
                    ?::jsonb, 'A', 'Người đàn ông đang leo lên các bậc thang.')
                """, optionsQ1);

        String optionsQ101 = "{\"A\":\"they\",\"B\":\"their\",\"C\":\"them\",\"D\":\"themselves\"}";
        jdbc.update("""
                INSERT INTO mock_test_questions (test_id, question_num, part, question_text, options, correct_answer, explanation)
                VALUES (1, 101, 'Part 5', 'Employees must submit _______ weekly timesheets before leaving the office on Friday.',
                    ?::jsonb, 'B', 'Trước cụm weekly timesheets cần một tính từ sở hữu their.')
                """, optionsQ101);
    }

    private MockTestItem mapTestSummary(ResultSet rs, UUID userId) throws SQLException {
        int testId = rs.getInt("id");
        List<MockTestAttempt> attempts = userId != null ? getHistoryAttempts(testId, userId) : Collections.emptyList();
        Integer score = rs.getObject("score") != null ? rs.getInt("score") : null;
        Integer listeningScore = rs.getObject("listening_score") != null ? rs.getInt("listening_score") : null;
        Integer readingScore = rs.getObject("reading_score") != null ? rs.getInt("reading_score") : null;

        return new MockTestItem(
                testId,
                rs.getString("vol_id"),
                rs.getString("title"),
                rs.getString("difficulty"),
                score,
                listeningScore,
                readingScore,
                rs.getString("status"),
                rs.getString("completed_at"),
                parseList(rs.getString("key_vocab")),
                attempts
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
