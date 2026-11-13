package com.toeic.ai.toeic_api.questionbank;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class QuestionBankService {
    private static final Set<String> PARTS = Set.of("PART_1", "PART_2", "PART_3", "PART_4", "PART_5", "PART_6", "PART_7");
    private static final Set<String> DIFFICULTIES = Set.of("EASY", "MEDIUM", "HARD");
    private static final Set<String> STATUSES = Set.of("DRAFT", "PUBLISHED");

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public QuestionBankService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public List<QuestionBankQuestion> listQuestions() {
        return jdbc.query("""
                SELECT id, external_code, part, question_text, passage, bilingual_passage,
                       audio_url, image_url, options::text AS options_json, correct_answer,
                       explanation, transcript, translation, question_translation, trap_note,
                       vocab_list::text AS vocab_json, difficulty, status, skill, created_at::text AS created_at
                FROM toeic_question_bank
                WHERE status <> 'ARCHIVED'
                ORDER BY created_at DESC, id DESC
                """, this::mapQuestion);
    }

    @Transactional
    public QuestionBankQuestion createQuestion(QuestionBankQuestionRequest request) {
        validateRequest(request);
        Long id = jdbc.queryForObject("""
                INSERT INTO toeic_question_bank (
                    external_code, part, question_text, passage, audio_url, image_url, options,
                    correct_answer, explanation, difficulty, status, skill
                ) VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?)
                RETURNING id
                """, Long.class,
                blankToNull(request.code()), toDatabasePart(request.part()), request.questionText().trim(),
                blankToNull(request.passage()), blankToNull(request.audioUrl()), blankToNull(request.imageUrl()),
                writeJson(optionsMap(request.options())), request.correctAnswer().trim().toUpperCase(),
                blankToNull(request.explanation()), toDatabaseDifficulty(request.difficulty()),
                request.status().toUpperCase(), request.skill().trim());

        if (blankToNull(request.code()) == null) {
            jdbc.update("UPDATE toeic_question_bank SET external_code = ? WHERE id = ?",
                    generatedCode(request.part(), id), id);
        }
        return getQuestion(id);
    }

    @Transactional
    public QuestionBankQuestion updateQuestion(long id, QuestionBankQuestionRequest request) {
        validateRequest(request);
        int updated = jdbc.update("""
                UPDATE toeic_question_bank
                SET part = ?, question_text = ?, passage = ?, audio_url = ?, image_url = ?,
                    options = ?::jsonb, correct_answer = ?, explanation = ?, difficulty = ?,
                    status = ?, skill = ?, updated_at = now()
                WHERE id = ? AND status <> 'ARCHIVED'
                """, toDatabasePart(request.part()), request.questionText().trim(),
                blankToNull(request.passage()), blankToNull(request.audioUrl()), blankToNull(request.imageUrl()),
                writeJson(optionsMap(request.options())), request.correctAnswer().trim().toUpperCase(),
                blankToNull(request.explanation()), toDatabaseDifficulty(request.difficulty()),
                request.status().toUpperCase(), request.skill().trim(), id);
        if (updated == 0) {
            throw notFound(id);
        }
        return getQuestion(id);
    }

    @Transactional
    public void deleteQuestion(long id) {
        if (!questionExists(id)) {
            throw notFound(id);
        }
        if (hasReferences(id)) {
            jdbc.update("""
                    UPDATE toeic_question_bank
                    SET status = 'ARCHIVED', updated_at = now()
                    WHERE id = ?
                    """, id);
        } else {
            jdbc.update("DELETE FROM toeic_question_bank WHERE id = ?", id);
        }
    }

    @Transactional
    public int deleteQuestions(List<Long> ids) {
        if (ids == null || ids.isEmpty() || ids.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một câu hỏi hợp lệ.");
        }
        List<Long> uniqueIds = ids.stream().distinct().toList();
        for (Long id : uniqueIds) {
            deleteQuestion(id);
        }
        return uniqueIds.size();
    }

    private QuestionBankQuestion getQuestion(long id) {
        return jdbc.query("""
                SELECT id, external_code, part, question_text, passage, bilingual_passage,
                       audio_url, image_url, options::text AS options_json, correct_answer,
                       explanation, transcript, translation, question_translation, trap_note,
                       vocab_list::text AS vocab_json, difficulty, status, skill, created_at::text AS created_at
                FROM toeic_question_bank
                WHERE id = ?
                """, rs -> rs.next() ? mapQuestion(rs, 0) : null, id);
    }

    private QuestionBankQuestion mapQuestion(ResultSet rs, int rowNum) throws SQLException {
        String correctAnswer = rs.getString("correct_answer");
        Map<String, String> options = parseOptions(rs.getString("options_json"));
        List<QuestionBankOption> questionOptions = options.entrySet().stream()
                .map(entry -> new QuestionBankOption(entry.getKey(), entry.getValue(),
                        entry.getKey().equalsIgnoreCase(correctAnswer)))
                .toList();

        return new QuestionBankQuestion(
                Long.toString(rs.getLong("id")),
                rs.getString("external_code"),
                fromDatabasePart(rs.getString("part")),
                rs.getString("question_text"),
                rs.getString("passage"),
                rs.getString("image_url"),
                rs.getString("audio_url"),
                questionOptions,
                correctAnswer,
                rs.getString("skill"),
                fromDatabaseDifficulty(rs.getString("difficulty")),
                rs.getString("explanation"),
                rs.getString("status"),
                rs.getString("created_at"),
                rs.getString("bilingual_passage"),
                rs.getString("transcript"),
                rs.getString("translation"),
                rs.getString("question_translation"),
                rs.getString("trap_note"),
                parseVocab(rs.getString("vocab_json")));
    }

    private void validateRequest(QuestionBankQuestionRequest request) {
        if (request == null || request.part() == null || request.difficulty() == null || request.status() == null
                || request.questionText() == null || request.skill() == null || request.correctAnswer() == null
                || request.options() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu bắt buộc của câu hỏi.");
        }
        String part = toDatabasePart(request.part());
        String difficulty = toDatabaseDifficulty(request.difficulty());
        String status = request.status().toUpperCase();
        if (!PARTS.contains(part) || !DIFFICULTIES.contains(difficulty) || !STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần thi, độ khó hoặc trạng thái không hợp lệ.");
        }
        if (request.questionText().isBlank() || request.skill().isBlank()
                || request.skill().length() > 128 || (request.code() != null && request.code().length() > 128)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nội dung câu hỏi và kỹ năng không được để trống; mã câu và kỹ năng tối đa 128 ký tự.");
        }
        String correctAnswer = request.correctAnswer().trim().toUpperCase();
        if (request.options().stream().anyMatch(java.util.Objects::isNull)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách phương án chứa dữ liệu không hợp lệ.");
        }
        Set<String> optionIds = request.options().stream()
                .map(option -> option.id() == null ? "" : option.id().trim().toUpperCase())
                .collect(java.util.stream.Collectors.toSet());
        if (optionIds.size() != request.options().size() || optionIds.size() < 2 || !optionIds.contains(correctAnswer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cần ít nhất hai phương án có mã riêng biệt và phải có phương án đúng.");
        }
        if (request.options().stream().anyMatch(option -> option.id() == null || option.id().isBlank()
                || option.text() == null || option.text().isBlank()
                || !Set.of("A", "B", "C", "D").contains(option.id().trim().toUpperCase()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã và nội dung phương án không được để trống.");
        }
    }

    private boolean questionExists(long id) {
        Boolean exists = jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM toeic_question_bank WHERE id = ?)",
                Boolean.class, id);
        return Boolean.TRUE.equals(exists);
    }

    private boolean hasReferences(long id) {
        Boolean referenced = jdbc.queryForObject("""
                SELECT EXISTS (
                    SELECT 1 FROM grammar_topic_questions WHERE question_id = ?
                    UNION ALL
                    SELECT 1 FROM mock_test_question_links WHERE question_id = ?
                    UNION ALL
                    SELECT 1 FROM user_mock_test_answers WHERE question_id = ?
                )
                """, Boolean.class, id, id, id);
        return Boolean.TRUE.equals(referenced);
    }

    private Map<String, String> optionsMap(List<QuestionBankOption> options) {
        Map<String, String> map = new LinkedHashMap<>();
        options.stream().sorted(java.util.Comparator.comparing(QuestionBankOption::id))
                .forEach(option -> map.put(option.id().trim().toUpperCase(), option.text().trim()));
        return map;
    }

    private Map<String, String> parseOptions(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception exception) {
            return Map.of();
        }
    }

    private List<Map<String, Object>> parseVocab(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception exception) {
            return List.of();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to serialize question options.", exception);
        }
    }

    private String toDatabasePart(String part) {
        return part.trim().toUpperCase().replace(" ", "_");
    }

    private String fromDatabasePart(String part) {
        return part != null && part.startsWith("PART_") ? "Part " + part.substring(5) : part;
    }

    private String toDatabaseDifficulty(String difficulty) {
        return difficulty.trim().toUpperCase();
    }

    private String fromDatabaseDifficulty(String difficulty) {
        return difficulty == null || difficulty.isBlank()
                ? "Medium"
                : difficulty.charAt(0) + difficulty.substring(1).toLowerCase();
    }

    private String generatedCode(String part, long id) {
        String partNumber = toDatabasePart(part).replace("PART_", "");
        return "P" + partNumber + "-" + String.format("%06d", id);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy câu hỏi " + id + ".");
    }
}
