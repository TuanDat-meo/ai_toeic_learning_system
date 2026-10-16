package com.toeic.ai.toeic_api.reading;

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
public class ReadingService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReadingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ReadingExerciseCard> listCards(String category, UUID userId) {
        String sql = """
                SELECT r.id, r.title, r.category, r.sub_category, r.subtitle, r.tag,
                       r.total_questions,
                       COALESCE(p.studied_questions, 0) AS studied_questions,
                       COALESCE(p.correct_answers, 0) AS correct_answers,
                       COALESCE(p.wrong_answers, 0) AS wrong_answers,
                       COALESCE(p.bookmarked, false) AS bookmarked,
                       r.passage_text, r.passage_text_vi,
                       '[]' AS passages,
                       '{}' AS theory,
                       '[]' AS sample_questions,
                       r.created_at, r.updated_at
                FROM reading_exercise_cards r
                LEFT JOIN user_reading_progress p ON p.exercise_id = r.id AND p.user_id = ?
                """;

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            sql += " WHERE r.category = ? ORDER BY r.order_index ASC, r.id ASC";
            return jdbc.query(sql, this::mapCardSummary, userId, category);
        } else {
            sql += " ORDER BY r.order_index ASC, r.id ASC";
            return jdbc.query(sql, this::mapCardSummary, userId);
        }
    }

    public ReadingExerciseCard getCard(String cardId, UUID userId) {
        String sql = """
                SELECT r.id, r.title, r.category, r.sub_category, r.subtitle, r.tag,
                       r.total_questions,
                       COALESCE(p.studied_questions, 0) AS studied_questions,
                       COALESCE(p.correct_answers, 0) AS correct_answers,
                       COALESCE(p.wrong_answers, 0) AS wrong_answers,
                       COALESCE(p.bookmarked, false) AS bookmarked,
                       r.passage_text, r.passage_text_vi,
                       r.passages::text AS passages,
                       r.theory::text AS theory,
                       r.sample_questions::text AS sample_questions,
                       r.created_at, r.updated_at
                FROM reading_exercise_cards r
                LEFT JOIN user_reading_progress p ON p.exercise_id = r.id AND p.user_id = ?
                WHERE r.id = ?
                """;

        List<ReadingExerciseCard> cards = jdbc.query(sql, this::mapCardFull, userId, cardId);
        if (cards.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài đọc: " + cardId);
        }
        return cards.get(0);
    }

    @Transactional
    public void saveProgress(UUID userId, String exerciseId, int studied, int correct, int wrong, Boolean bookmarked) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_reading_progress (user_id, exercise_id, studied_questions, correct_answers, wrong_answers, bookmarked, updated_at)
                VALUES (?, ?, ?, ?, ?, COALESCE(?, false), now())
                ON CONFLICT (user_id, exercise_id) DO UPDATE SET
                    studied_questions = EXCLUDED.studied_questions,
                    correct_answers = EXCLUDED.correct_answers,
                    wrong_answers = EXCLUDED.wrong_answers,
                    bookmarked = COALESCE(EXCLUDED.bookmarked, user_reading_progress.bookmarked),
                    updated_at = now()
                """;

        jdbc.update(upsert, userId, exerciseId, studied, correct, wrong, bookmarked);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM reading_exercise_cards", Integer.class);
        if (count != null && count > 0) {
            return;
        }

        String sampleQsP5 = "[{\"questionNum\":\"101\",\"question\":\"Ms. Reynolds requested that all department managers submit _______ quarterly budget estimates by Friday.\",\"options\":[\"they\",\"their\",\"theirs\",\"them\"],\"correctIndex\":1,\"explanation\":\"Trước cụm danh từ quarterly budget estimates cần một tính từ sở hữu their.\",\"bilingual\":\"Bà Reynolds yêu cầu tất cả trưởng phòng nộp dự toán ngân sách quý của họ trước thứ Sáu.\"}]";

        jdbc.update("""
                INSERT INTO reading_exercise_cards (id, title, category, sub_category, subtitle, tag, total_questions, sample_questions, order_index)
                VALUES ('rc-p5-grammar-nouns', 'Part 5: Phân Loại Danh Từ & Tính Từ', 'part5', 'word_types',
                    'Nắm chắc 15 dạng từ loại ăn điểm tối đa trong Part 5 ETS 2024', 'Từ loại trọng tâm', 10,
                    ?::jsonb, 0)
                """, sampleQsP5);

        String passageP6 = "Notice to All Tenants: Routine plumbing maintenance will be carried out across all residential units on Tuesday, October 24.";
        String sampleQsP6 = "[{\"questionNum\":\"131\",\"question\":\"The technicians will need to _______ each bathroom to inspect the water pipes.\",\"options\":[\"enter\",\"entering\",\"entrance\",\"entered\"],\"correctIndex\":0,\"explanation\":\"Cấu trúc need to + V nguyên mẫu (enter).\",\"bilingual\":\"Các kỹ thuật viên sẽ cần vào từng phòng tắm để kiểm tra đường ống nước.\"}]";

        jdbc.update("""
                INSERT INTO reading_exercise_cards (id, title, category, sub_category, subtitle, tag, total_questions, passage_text, sample_questions, order_index)
                VALUES ('rc-p6-notices', 'Part 6: Thông Báo & Quy Định Chung', 'part6', 'text_types',
                    'Kỹ thuật điền từ vào đoạn văn thông báo nội bộ công ty', 'Thông báo & Biên bản', 4,
                    ?, ?::jsonb, 1)
                """, passageP6, sampleQsP6);
    }

    private ReadingExerciseCard mapCardSummary(ResultSet rs, int rowNum) throws SQLException {
        return new ReadingExerciseCard(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("sub_category"),
                rs.getString("subtitle"),
                rs.getString("tag"),
                rs.getInt("total_questions"),
                rs.getInt("studied_questions"),
                rs.getInt("correct_answers"),
                rs.getInt("wrong_answers"),
                rs.getBoolean("bookmarked"),
                rs.getString("passage_text"),
                rs.getString("passage_text_vi"),
                Collections.emptyList(),
                Collections.emptyMap(),
                Collections.emptyList(),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        );
    }

    private ReadingExerciseCard mapCardFull(ResultSet rs, int rowNum) throws SQLException {
        return new ReadingExerciseCard(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("sub_category"),
                rs.getString("subtitle"),
                rs.getString("tag"),
                rs.getInt("total_questions"),
                rs.getInt("studied_questions"),
                rs.getInt("correct_answers"),
                rs.getInt("wrong_answers"),
                rs.getBoolean("bookmarked"),
                rs.getString("passage_text"),
                rs.getString("passage_text_vi"),
                parseList(rs.getString("passages")),
                parseMap(rs.getString("theory")),
                parseList(rs.getString("sample_questions")),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        );
    }

    private List<Map<String, Object>> parseList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> parseMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
