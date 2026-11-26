package com.toeic.ai.toeic_api.questionbank;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

@Service
public class QuestionBankService {
    private static final Set<String> PARTS = Set.of("PART_1", "PART_2", "PART_3", "PART_4", "PART_5", "PART_6", "PART_7", "GRAMMAR", "VOCABULARY");
    private static final Set<String> DIFFICULTIES = Set.of("450-550", "550-650", "650-750", "750-850", "850-900+");
    private static final Set<String> STATUSES = Set.of("DRAFT", "PUBLISHED");

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuestionBankService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public UploadedMedia uploadMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file media.");
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = originalName.substring(Math.max(originalName.lastIndexOf('.'), 0) + 1)
                .trim().toLowerCase(Locale.ROOT);
        Map<String, String> supportedTypes = Map.of(
                "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png", "webp", "image/webp",
                "mp3", "audio/mpeg", "wav", "audio/wav", "m4a", "audio/mp4");
        String contentType = supportedTypes.get(extension);
        if (contentType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Chỉ hỗ trợ ảnh JPG, PNG, WEBP và audio MP3, WAV, M4A.");
        }
        long maxSize = contentType.startsWith("image/") ? 10L * 1024 * 1024 : 25L * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    contentType.startsWith("image/") ? "Ảnh không được vượt quá 10 MB." : "Audio không được vượt quá 25 MB.");
        }
        try {
            UUID id = UUID.randomUUID();
            String safeName = originalName.replaceAll("[\\r\\n\\\\/]", "_");
            if (safeName.length() > 255) safeName = safeName.substring(safeName.length() - 255);
            jdbc.update("""
                    INSERT INTO media_assets (id, storage_key, original_name, content_type, size_bytes, content)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, id, "question-bank/" + id + "." + extension, safeName,
                    contentType, file.getSize(), file.getBytes());
            return new UploadedMedia("/api/media-assets/" + id, safeName, file.getSize(), contentType);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đọc được file media đã chọn.", exception);
        }
    }

    public record UploadedMedia(String url, String fileName, long sizeBytes, String contentType) {}

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        List<QuestionBankOption> options = new java.util.ArrayList<>();
        JsonNode importedOptions = data.path("options");
        if (importedOptions.isArray()) {
            importedOptions.forEach(option -> options.add(new QuestionBankOption(
                    option.path("id").asText(), option.path("text").asText(),
                    option.path("isCorrect").asBoolean(option.path("id").asText().equalsIgnoreCase(data.path("correctAnswer").asText())))));
        }
        String code = data.path("code").asText("");
        if (!code.isBlank() && Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM toeic_question_bank WHERE external_code = ?)", Boolean.class, code))) {
            return;
        }
        String importedDifficulty = data.path("difficulty").asText("650-750").toUpperCase(Locale.ROOT);
        String difficulty = switch (importedDifficulty) {
            case "EASY" -> "550-650";
            case "MEDIUM" -> "650-750";
            case "HARD" -> "750-850";
            default -> importedDifficulty;
        };
        createQuestion(new QuestionBankQuestionRequest(
                code.isBlank() ? null : code,
                data.path("part").asText(),
                data.path("questionText").asText(),
                data.path("passage").asText(null),
                data.path("imageUrl").asText(null),
                data.path("audioUrl").asText(null),
                options,
                data.path("correctAnswer").asText(),
                data.path("skill").asText(),
                difficulty,
                data.path("explanation").asText(null),
                data.path("status").asText("DRAFT")));
    }

    @Transactional
    public void syncFromListeningImportItem(JsonNode data) {
        JsonNode questions = data.path("questions");
        if (questions.isArray()) {
            questions.forEach(question -> syncListeningQuestion(data, question));
        } else if (data.has("question") || data.has("questionText")) {
            syncListeningQuestion(data, data);
        }
    }

    private void syncListeningQuestion(JsonNode parent, JsonNode source) {
        String part = source.path("part").asText(parent.path("part").asText(""));
        String questionText = firstText(source, "questionText", "question", "fullTranscript", "transcript");
        if (questionText.isBlank()) questionText = firstText(parent, "questionText", "question", "fullTranscript", "transcript");
        String answer = firstText(source, "correctAnswer", "answer").toUpperCase(Locale.ROOT);
        List<QuestionBankOption> options = new java.util.ArrayList<>();
        JsonNode optionsNode = source.path("options");
        if (optionsNode.isObject()) {
            optionsNode.fields().forEachRemaining(entry -> options.add(new QuestionBankOption(
                    entry.getKey().toUpperCase(Locale.ROOT), entry.getValue().asText(), entry.getKey().equalsIgnoreCase(answer))));
        } else if (optionsNode.isArray()) {
            optionsNode.forEach(option -> options.add(new QuestionBankOption(
                    option.path("id").asText(), option.path("text").asText(),
                    option.path("isCorrect").asBoolean(option.path("id").asText().equalsIgnoreCase(answer)))));
        }
        if (questionText.isBlank() || answer.isBlank() || options.size() < 2) return;
        String partValue = part.trim().toUpperCase(Locale.ROOT).replaceAll("[\\s-]+", "_");
        if (partValue.matches("[1-4]")) partValue = "PART_" + partValue;
        if (!partValue.matches("PART_[1-4]")) return;
        String imageUrl = firstText(source, "imageUrl", "imageURL");
        if (imageUrl.isBlank()) imageUrl = firstText(parent, "imageUrl", "imageURL");
        String audioUrl = firstText(source, "audioUrl", "audioURL");
        if (audioUrl.isBlank()) audioUrl = firstText(parent, "audioUrl", "audioURL");
        String passage = firstText(source, "passage", "transcript", "fullTranscript");
        if (passage.isBlank()) passage = firstText(parent, "passage", "transcript", "fullTranscript");
        String parentCode = firstText(parent, "code", "id", "title");
        String questionCode = firstText(source, "code", "questionNumber", "id");
        String code = (parentCode.isBlank() ? "LISTENING" : parentCode) + "-"
                + (questionCode.isBlank()
                        ? partValue + "-" + Integer.toUnsignedString(questionText.hashCode(), 36)
                        : questionCode);
        code = code.replaceAll("[^A-Za-z0-9_-]", "-");
        if (code.length() > 120) code = code.substring(code.length() - 120);
        String difficulty = firstText(source, "difficulty");
        if (!DIFFICULTIES.contains(difficulty.toUpperCase(Locale.ROOT))) difficulty = "650-750";
        String explanation = firstText(source, "explanation", "trapNote");
        var normalized = objectMapper.createObjectNode();
        normalized.put("part", partValue);
        normalized.put("questionText", questionText);
        normalized.put("correctAnswer", answer);
        normalized.set("options", objectMapper.valueToTree(options.stream()
                .map(option -> Map.of("id", option.id(), "text", option.text(), "isCorrect", option.isCorrect())).toList()));
        normalized.put("skill", "Listening (Nghe hiểu)");
        normalized.put("difficulty", difficulty);
        normalized.put("imageUrl", imageUrl);
        normalized.put("audioUrl", audioUrl);
        normalized.put("passage", passage);
        normalized.put("code", code);
        normalized.put("explanation", explanation);
        normalized.put("status", "PUBLISHED");
        syncFromImportItem(normalized);
    }

    private String firstText(JsonNode data, String... fields) {
        for (String field : fields) {
            String value = data.path(field).asText("").trim();
            if (!value.isBlank()) return value;
        }
        return "";
    }

    public List<QuestionBankQuestion> listQuestions() {
        return jdbc.query("""
                SELECT id, external_code, part, question_text, passage, bilingual_passage,
                       audio_url, image_url, options::text AS options_json,
                       option_translations::text AS option_translations_json, correct_answer,
                       explanation, transcript, translation, question_translation, trap_note,
                       vocab_list::text AS vocab_json, difficulty, source_difficulty, source_audio_path, source_image_path,
                       status, skill, created_at::text AS created_at
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
                       audio_url, image_url, options::text AS options_json,
                       option_translations::text AS option_translations_json, correct_answer,
                       explanation, transcript, translation, question_translation, trap_note,
                       vocab_list::text AS vocab_json, difficulty, source_difficulty, source_audio_path, source_image_path,
                       status, skill, created_at::text AS created_at
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
                parseVocab(rs.getString("vocab_json")),
                rs.getString("source_difficulty"),
                rs.getString("source_audio_path"),
                rs.getString("source_image_path"),
                parseOptions(rs.getString("option_translations_json")));
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
        options.stream().sorted(java.util.Comparator.comparing((QuestionBankOption option) -> option.id()))
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
        if ("GRAMMAR".equals(part)) return "Grammar";
        if ("VOCABULARY".equals(part)) return "Vocabulary";
        return part != null && part.startsWith("PART_") ? "Part " + part.substring(5) : part;
    }

    private String toDatabaseDifficulty(String difficulty) {
        return difficulty.trim().toUpperCase();
    }

    private String fromDatabaseDifficulty(String difficulty) {
        return difficulty == null || difficulty.isBlank() ? "650-750" : difficulty;
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
