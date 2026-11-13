package com.toeic.ai.toeic_api.listening;

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
public class ListeningService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ListeningService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ListeningDictationCard> listCards(UUID userId) {
        String sql = """
                SELECT c.id, c.title, c.test_number, c.part, c.year, c.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.status, c.status) AS status,
                       c.created_at, c.updated_at
                FROM listening_dictation_cards c
                LEFT JOIN user_listening_progress p ON p.card_id = c.id AND p.user_id = ?
                ORDER BY c.test_number ASC, c.part ASC
                """;

        List<ListeningDictationCard> cards = jdbc.query(sql, (rs, rowNum) -> new ListeningDictationCard(
                rs.getString("id"),
                rs.getString("title"),
                rs.getInt("test_number"),
                rs.getString("part"),
                rs.getString("year"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                displayProgressStatus(rs.getString("status")),
                0,
                Collections.emptyList(),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), userId);
        return cards.stream().map(card -> withQuestions(card, getQuestionsForCard(card.id()))).toList();
    }

    public ListeningDictationCard getCard(String cardId, UUID userId) {
        String sql = """
                SELECT c.id, c.title, c.test_number, c.part, c.year, c.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.status, c.status) AS status,
                       c.created_at, c.updated_at
                FROM listening_dictation_cards c
                LEFT JOIN user_listening_progress p ON p.card_id = c.id AND p.user_id = ?
                WHERE c.id = ?
                """;

        List<ListeningDictationCard> cards = jdbc.query(sql, (rs, rowNum) -> new ListeningDictationCard(
                rs.getString("id"),
                rs.getString("title"),
                rs.getInt("test_number"),
                rs.getString("part"),
                rs.getString("year"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                displayProgressStatus(rs.getString("status")),
                0,
                Collections.emptyList(),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), userId, cardId);

        if (cards.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + cardId);
        }

        ListeningDictationCard card = cards.get(0);
        List<ListeningDictationQuestion> questions = getQuestionsForCard(cardId);

        return withQuestions(card, questions);
    }

    @Transactional
    public ListeningDictationCard createCard(ListeningCardRequest request) {
        validateCardRequest(request);
        String id = UUID.randomUUID().toString();
        jdbc.update("""
                INSERT INTO listening_dictation_cards (id, title, test_number, part, year, total_questions, status)
                VALUES (?, ?, ?, ?, ?, ?, 'NOT_STARTED')
                """, id, request.title().trim(), request.testNumber(), request.part(), request.year(),
                request.totalQuestions());
        savePrimaryQuestion(id, request);
        return getCard(id, null);
    }

    @Transactional
    public ListeningDictationCard updateCard(String id, ListeningCardRequest request) {
        validateCardRequest(request);
        int updated = jdbc.update("""
                UPDATE listening_dictation_cards
                SET title = ?, test_number = ?, part = ?, year = ?, total_questions = ?, updated_at = now()
                WHERE id = ?
                """, request.title().trim(), request.testNumber(), request.part(), request.year(),
                request.totalQuestions(), id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
        savePrimaryQuestion(id, request);
        return getCard(id, null);
    }

    @Transactional
    public void deleteCard(String id) {
        if (jdbc.update("DELETE FROM listening_dictation_cards WHERE id = ?", id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
    }

    private void savePrimaryQuestion(String cardId, ListeningCardRequest request) {
        List<Long> questionIds = jdbc.query(
                "SELECT id FROM listening_dictation_questions WHERE card_id = ? ORDER BY question_index ASC",
                (rs, rowNum) -> rs.getLong(1), cardId);
        if (questionIds.isEmpty()) {
            jdbc.update("""
                    INSERT INTO listening_dictation_questions
                        (card_id, question_index, part, audio_url, full_transcript, vietnamese_translation)
                    VALUES (?, 0, ?, ?, ?, ?)
                    """, cardId, request.part(), request.audioUrl(), request.fullTranscript(),
                    request.vietnameseTranslation());
        } else {
            jdbc.update("""
                    UPDATE listening_dictation_questions
                    SET part = ?, audio_url = ?, full_transcript = ?, vietnamese_translation = ?, updated_at = now()
                    WHERE id = ?
                    """, request.part(), request.audioUrl(), request.fullTranscript(),
                    request.vietnameseTranslation(), questionIds.get(0));
        }
    }

    public List<ListeningUnit> listUnits() {
        return jdbc.query("""
                SELECT id, part, unit_type, title, target_level, total_questions, theory_summary,
                       rules::text AS rules_json, vocab_bag::text AS vocab_bag_json,
                       questions::text AS questions_json, status
                FROM listening_part_units
                ORDER BY part ASC, unit_type ASC, created_at DESC
                """, this::mapUnit);
    }

    @Transactional
    public ListeningUnit createUnit(ListeningUnitRequest request) {
        validateUnitRequest(request);
        String id = UUID.randomUUID().toString();
        jdbc.update("""
                INSERT INTO listening_part_units
                    (id, part, unit_type, title, target_level, total_questions, theory_summary, rules, vocab_bag, questions, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, 'PUBLISHED')
                """, id, request.part(), request.type(), request.title().trim(), request.targetLevel(),
                request.totalQuestions(), valueOrEmpty(request.theorySummary()), toJson(request.rules()),
                toJson(request.vocabBag()), toJson(request.questions()));
        return getUnit(id);
    }

    @Transactional
    public ListeningUnit updateUnit(String id, ListeningUnitRequest request) {
        validateUnitRequest(request);
        int updated = jdbc.update("""
                UPDATE listening_part_units
                SET part = ?, unit_type = ?, title = ?, target_level = ?, total_questions = ?,
                    theory_summary = ?, rules = ?::jsonb, vocab_bag = ?::jsonb,
                    questions = ?::jsonb, updated_at = now()
                WHERE id = ?
                """, request.part(), request.type(), request.title().trim(), request.targetLevel(),
                request.totalQuestions(), valueOrEmpty(request.theorySummary()), toJson(request.rules()),
                toJson(request.vocabBag()), toJson(request.questions()), id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm nghe: " + id);
        }
        return getUnit(id);
    }

    @Transactional
    public void deleteUnit(String id) {
        if (jdbc.update("DELETE FROM listening_part_units WHERE id = ?", id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm nghe: " + id);
        }
    }

    private ListeningUnit getUnit(String id) {
        List<ListeningUnit> units = jdbc.query("""
                SELECT id, part, unit_type, title, target_level, total_questions, theory_summary,
                       rules::text AS rules_json, vocab_bag::text AS vocab_bag_json,
                       questions::text AS questions_json, status
                FROM listening_part_units WHERE id = ?
                """, this::mapUnit, id);
        if (units.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm nghe: " + id);
        }
        return units.get(0);
    }

    private ListeningUnit mapUnit(ResultSet rs, int rowNum) throws SQLException {
        return new ListeningUnit(
                rs.getString("id"),
                rs.getString("part"),
                rs.getString("unit_type"),
                rs.getString("title"),
                rs.getString("target_level"),
                rs.getInt("total_questions"),
                0,
                0,
                0,
                "Chưa luyện tập",
                rs.getString("theory_summary"),
                parseStringList(rs.getString("rules_json")),
                parseList(rs.getString("vocab_bag_json")),
                parseList(rs.getString("questions_json")),
                rs.getString("status"));
    }

    private void validateCardRequest(ListeningCardRequest request) {
        if (request == null || request.testNumber() < 1 || request.totalQuestions() < 1
                || !isListeningPart(request.part()) || isBlank(request.year()) || isBlank(request.title())
                || isBlank(request.audioUrl()) || isBlank(request.fullTranscript())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin bài nghe chưa hợp lệ.");
        }
    }

    private void validateUnitRequest(ListeningUnitRequest request) {
        if (request == null || !isListeningPart(request.part())
                || !List.of("level", "category").contains(request.type())
                || isBlank(request.title()) || request.totalQuestions() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin chủ điểm nghe chưa hợp lệ.");
        }
    }

    private boolean isListeningPart(String part) {
        return List.of("Part 1", "Part 2", "Part 3", "Part 4").contains(part);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyList() : value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Nội dung chủ điểm nghe không hợp lệ.", e);
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String displayProgressStatus(String status) {
        return switch (status == null ? "" : status) {
            case "IN_PROGRESS" -> "Đang luyện tập";
            case "COMPLETED" -> "Đã hoàn thành";
            case "NOT_STARTED" -> "Chưa bắt đầu";
            default -> status;
        };
    }

    private ListeningDictationCard withQuestions(ListeningDictationCard card,
            List<ListeningDictationQuestion> questions) {
        return new ListeningDictationCard(card.id(), card.title(), card.testNumber(), card.part(), card.year(),
                card.totalQuestions(), card.completedQuestions(), card.status(), card.progressPercent(),
                questions, card.createdAt(), card.updatedAt());
    }

    public List<ListeningDictationQuestion> getQuestionsForCard(String cardId) {
        String sql = """
                SELECT id, card_id, question_index, part, audio_url, image_url,
                       full_transcript, vietnamese_translation,
                       options::text AS options_json,
                       option_translations::text AS opt_trans_json,
                       correct_answer, explanation, trap_note,
                       vocab_list::text AS vocab_json
                FROM listening_dictation_questions
                WHERE card_id = ?
                ORDER BY question_index ASC
                """;

        return jdbc.query(sql, this::mapQuestion, cardId);
    }

    private ListeningDictationQuestion mapQuestion(ResultSet rs, int rowNum) throws SQLException {
        return new ListeningDictationQuestion(
                rs.getLong("id"),
                rs.getString("card_id"),
                rs.getInt("question_index"),
                rs.getString("part"),
                rs.getString("audio_url"),
                rs.getString("image_url"),
                rs.getString("full_transcript"),
                rs.getString("vietnamese_translation"),
                parseMap(rs.getString("options_json")),
                parseMap(rs.getString("opt_trans_json")),
                rs.getString("correct_answer"),
                rs.getString("explanation"),
                rs.getString("trap_note"),
                parseList(rs.getString("vocab_json"))
        );
    }

    @Transactional
    public void saveProgress(UUID userId, SaveListeningProgressRequest req) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_listening_progress (user_id, card_id, completed_questions, total_questions, status, last_question_index, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, now())
                ON CONFLICT (user_id, card_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    status = EXCLUDED.status,
                    last_question_index = EXCLUDED.last_question_index,
                    updated_at = now()
                """;

        String status = req.status();
        if (status == null || "Đang luyện tập".equals(status)) {
            status = "IN_PROGRESS";
        } else if ("Đã hoàn thành".equals(status)) {
            status = "COMPLETED";
        } else if ("Chưa bắt đầu".equals(status)) {
            status = "NOT_STARTED";
        }

        jdbc.update(upsert, userId, req.cardId(), req.completedQuestions(), req.totalQuestions(),
                status, req.lastQuestionIndex());
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

    public record ListeningCardRequest(String title, int testNumber, String part, String year, int totalQuestions,
            String audioUrl, String fullTranscript, String vietnameseTranslation) {}

    public record ListeningUnitRequest(String part, String type, String title, String targetLevel,
            int totalQuestions, String theorySummary, List<String> rules,
            List<Map<String, Object>> vocabBag, List<Map<String, Object>> questions) {}

    public record ListeningUnit(String id, String part, String type, String title, String targetLevel,
            int totalQuestions, int completedQuestions, int correctCount, int wrongCount, String status,
            String theorySummary, List<String> rules, List<Map<String, Object>> vocabBag,
            List<Map<String, Object>> questions, String contentStatus) {}
}
