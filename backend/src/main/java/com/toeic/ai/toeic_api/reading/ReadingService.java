package com.toeic.ai.toeic_api.reading;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReadingService {

    private static final Logger log = LoggerFactory.getLogger(ReadingService.class);

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReadingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ReadingExerciseCard> listCards(String category, UUID userId) {
        return listCards(category, userId, false);
    }

    public List<ReadingExerciseCard> listAdminCards(String category, UUID userId) {
        return listCards(category, userId, true);
    }

    private List<ReadingExerciseCard> listCards(String category, UUID userId, boolean includeDrafts) {
        String sql = """
                SELECT r.id, r.title, r.category, r.sub_category, r.subtitle, r.tag, r.status,
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
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            sql += " WHERE ";
            if (!includeDrafts) sql += "r.status = 'published' AND ";
            sql += "r.category = ?";
            params.add(category);
        } else if (!includeDrafts) {
            sql += " WHERE r.status = 'published'";
        }
        sql += " ORDER BY r.order_index ASC, r.id ASC";
        return jdbc.query(sql, this::mapCardSummary, params.toArray());
    }

    public ReadingExerciseCard getCard(String cardId, UUID userId) {
        return getCard(cardId, userId, false);
    }

    public ReadingExerciseCard getAdminCard(String cardId, UUID userId) {
        return getCard(cardId, userId, true);
    }

    private ReadingExerciseCard getCard(String cardId, UUID userId, boolean includeDrafts) {
        String sql = """
                SELECT r.id, r.title, r.category, r.sub_category, r.subtitle, r.tag, r.status,
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
                WHERE r.id = ? AND (? OR r.status = 'published')
                """;

        List<ReadingExerciseCard> cards = jdbc.query(sql, this::mapCardFull, userId, cardId, includeDrafts);
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
        if (count == null || count == 0) {
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
        syncPublishedImports();
    }

    @Transactional
    public void syncPublishedImports() {
        try {
            List<String> payloads = jdbc.queryForList(
                    "SELECT payload_json::text FROM imported_content WHERE content_type = 'READING' ORDER BY published_at ASC, id ASC",
                    String.class);
            for (String rawJson : payloads) {
                if (rawJson == null || rawJson.isBlank()) continue;
                try {
                    JsonNode node = objectMapper.readTree(rawJson);
                    syncFromImportItem(node);
                } catch (Exception ex) {
                    log.warn("Skipped syncing reading import payload: {}", ex.getMessage());
                }
            }
        } catch (Exception ex) {
            log.debug("Skipped syncPublishedImports on startup: {}", ex.getMessage());
        }
    }

    @Transactional
    public ReadingExerciseCard createCard(Map<String, Object> body, UUID userId) {
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu bài đọc không hợp lệ.");
        }
        JsonNode node = objectMapper.valueToTree(body);
        String id = upsertFromNode(node, null);
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu tiêu đề bài đọc.");
        }
        return getAdminCard(id, userId);
    }

    @Transactional
    public ReadingExerciseCard updateCard(String cardId, Map<String, Object> body, UUID userId) {
        if (body == null || cardId == null || cardId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu cập nhật bài đọc không hợp lệ.");
        }
        JsonNode node = objectMapper.valueToTree(body);
        String id = upsertFromNode(node, cardId);
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu tiêu đề bài đọc.");
        }
        return getAdminCard(id, userId);
    }

    @Transactional
    public void deleteCard(String cardId) {
        int deleted = jdbc.update("DELETE FROM reading_exercise_cards WHERE id = ?", clamp(cardId, 64));
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài đọc để xóa: " + cardId);
        }
    }

    public Map<String, Object> normalizeCardForPreview(JsonNode data) {
        NormalizedReadingCard card = normalizeCardData(data, null);
        if (card == null) {
            throw new IllegalArgumentException("Không thể chuẩn hóa dữ liệu bài đọc từ file.");
        }
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("id", card.id());
        out.put("title", card.title());
        out.put("category", card.category());
        out.put("subCategory", card.subCategory());
        out.put("subtitle", card.subtitle());
        out.put("tag", card.tag());
        out.put("status", card.status());
        out.put("totalQuestions", card.totalQuestions());
        out.put("passageText", card.passageText());
        out.put("passageTextVi", card.passageTextVi());
        out.put("passages", objectMapper.convertValue(card.passages(), new TypeReference<List<Map<String, Object>>>() {}));
        out.put("theory", objectMapper.convertValue(card.theory(), new TypeReference<Map<String, Object>>() {}));
        if (card.theory().has("vocabList")) {
            out.put("vocabList", objectMapper.convertValue(card.theory().path("vocabList"), new TypeReference<List<Map<String, Object>>>() {}));
        }
        out.put("sampleQuestions", objectMapper.convertValue(card.sampleQuestions(), new TypeReference<List<Map<String, Object>>>() {}));
        return out;
    }

    private ReadingExerciseCard mapCardSummary(ResultSet rs, int rowNum) throws SQLException {
        return new ReadingExerciseCard(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("sub_category"),
                rs.getString("subtitle"),
                rs.getString("tag"),
                rs.getString("status"),
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
                rs.getString("status"),
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

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        upsertFromNode(data, null);
    }

    private String upsertFromNode(JsonNode data, String forcedId) {
        NormalizedReadingCard card = normalizeCardData(data, forcedId);
        if (card == null) return null;

        String upsert = """
                INSERT INTO reading_exercise_cards (
                    id, title, category, sub_category, subtitle, tag, status,
                    total_questions, passage_text, passage_text_vi,
                    passages, theory, sample_questions, order_index, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, 0, now())
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    category = EXCLUDED.category,
                    sub_category = EXCLUDED.sub_category,
                    subtitle = EXCLUDED.subtitle,
                    tag = EXCLUDED.tag,
                    status = EXCLUDED.status,
                    total_questions = EXCLUDED.total_questions,
                    passage_text = EXCLUDED.passage_text,
                    passage_text_vi = EXCLUDED.passage_text_vi,
                    passages = EXCLUDED.passages,
                    theory = EXCLUDED.theory,
                    sample_questions = EXCLUDED.sample_questions,
                    updated_at = now()
                """;

        jdbc.update(upsert,
                card.id(), card.title(), card.category(), card.subCategory(),
                card.subtitle(), card.tag(), card.status(), card.totalQuestions(),
                card.passageText(), card.passageTextVi(),
                toJson(card.passages()), toJson(card.theory()), toJson(card.sampleQuestions()));
        return card.id();
    }

    private NormalizedReadingCard normalizeCardData(JsonNode data, String forcedId) {
        if (data == null || data.isNull()) return null;
        String title = data.path("title").asText("").trim();
        if (title.isBlank()) return null;

        String rawPart = data.path("part").asText("").trim();
        String rawCategory = data.path("category").asText("").trim().toLowerCase(Locale.ROOT);
        String category = "part5";
        if (rawPart.equalsIgnoreCase("PART_6") || rawPart.equalsIgnoreCase("part6") || rawCategory.equals("part6")) {
            category = "part6";
        } else if (rawPart.equalsIgnoreCase("PART_7") || rawPart.equalsIgnoreCase("part7") || rawCategory.equals("part7")) {
            category = "part7";
        } else if (rawCategory.equals("grammar")) {
            category = "grammar";
        } else if (rawPart.equalsIgnoreCase("PART_5") || rawPart.equalsIgnoreCase("part5") || rawCategory.equals("part5")) {
            category = "part5";
        }

        String defaultSubCategory = category.equals("part5") ? "word_types"
                : category.equals("part6") ? "text_types" : "levels";
        String subCategory = firstText(data, "subCategory");
        if (subCategory.isBlank()) subCategory = defaultSubCategory;

        String defaultTag = category.equals("part5") ? "Part 5 - Câu đơn"
                : category.equals("part6") ? "Part 6 - Điền đoạn"
                : category.equals("grammar") ? "Ngữ pháp Reading" : "Part 7 - Đọc hiểu";
        String tag = firstText(data, "tag", "topic");
        if (tag.isBlank()) tag = defaultTag;
        String status = firstText(data, "status");
        if (status.isBlank()) status = "published";
        if (!"draft".equals(status) && !"published".equals(status)) {
            throw new IllegalArgumentException("Trạng thái Reading phải là draft hoặc published.");
        }

        ArrayNode passagesNode = data.path("passages").isArray()
                ? (ArrayNode) data.path("passages").deepCopy()
                : objectMapper.createArrayNode();

        String passageText = firstText(data, "content", "passageText", "passage", "text", "body");
        if (passageText.isBlank() && !passagesNode.isEmpty()) {
            StringBuilder joined = new StringBuilder();
            for (JsonNode p : passagesNode) {
                String pText = firstText(p, "text", "content", "passage", "passageText");
                if (!pText.isBlank()) {
                    if (joined.length() > 0) joined.append("\n\n");
                    joined.append(pText);
                }
            }
            passageText = joined.toString();
        }
        String passageTextVi = firstText(data, "passageTextVi");

        JsonNode rawQuestions = data.has("sampleQuestions") ? data.path("sampleQuestions") : data.path("questions");
        ArrayNode normalizedQuestions = objectMapper.createArrayNode();
        if (rawQuestions.isArray()) {
            for (int i = 0; i < rawQuestions.size(); i++) {
                normalizedQuestions.add(normalizeSampleQuestion(
                        rawQuestions.get(i), i, passageText, passageTextVi));
            }
        }

        ObjectNode theoryNode = data.path("theory").isObject()
                ? (ObjectNode) data.path("theory").deepCopy()
                : objectMapper.createObjectNode();
        JsonNode cardVocabRaw = data.path("vocabList").isArray() ? data.path("vocabList")
                : data.path("vocabulary").isArray() ? data.path("vocabulary")
                : theoryNode.path("vocabList");
        if (cardVocabRaw.isArray() && !cardVocabRaw.isEmpty()) {
            ArrayNode normalizedCardVocab = normalizeVocabArray(cardVocabRaw);
            if (!normalizedCardVocab.isEmpty()) {
                theoryNode.set("vocabList", normalizedCardVocab);
            }
        }

        int defaultQCount = !normalizedQuestions.isEmpty() ? normalizedQuestions.size()
                : (category.equals("part5") ? 30 : category.equals("part6") ? 16 : 54);
        int totalQuestions = data.path("totalQuestions").asInt(defaultQCount);
        if (totalQuestions <= 0) totalQuestions = defaultQCount;

        String rawId = (forcedId != null && !forcedId.isBlank()) ? forcedId.trim()
                : data.path("id").asText("").trim();
        if (rawId.isBlank()) {
            rawId = "reading-" + category + "-" + Math.abs((long) title.hashCode());
        }
        String subtitle = firstText(data, "subtitle");
        if (subtitle.isBlank()) subtitle = "Luyện tập chuyên đề " + title;

        return new NormalizedReadingCard(
                clamp(rawId, 64),
                clamp(title, 255),
                clamp(category, 32),
                clamp(subCategory, 64),
                clamp(subtitle, 255),
                clamp(tag, 64),
                status,
                totalQuestions,
                passageText,
                passageTextVi,
                passagesNode,
                theoryNode,
                normalizedQuestions
        );
    }

    private ObjectNode normalizeSampleQuestion(
            JsonNode q, int idx, String fallbackPassage, String fallbackPassageVi) {
        ObjectNode out = objectMapper.createObjectNode();
        String qNum = firstText(q, "questionNum", "questionNumber", "id");
        out.put("questionNum", qNum.isBlank() ? String.valueOf(101 + idx) : qNum);
        out.put("question", firstText(q, "question", "questionText", "questionEn"));
        String bilingual = firstText(q, "bilingual", "questionVi");
        if (bilingual.isBlank() && q.path("translation").isObject()) {
            bilingual = firstText(q.path("translation"), "questionVi", "vi");
        }
        if (!bilingual.isBlank()) out.put("bilingual", bilingual);

        List<String> optsList = new ArrayList<>(List.of("", "", "", ""));
        int correctFromOptionObj = -1;
        JsonNode optsNode = q.path("options");
        if (optsNode.isArray()) {
            for (int i = 0; i < Math.min(4, optsNode.size()); i++) {
                JsonNode item = optsNode.get(i);
                if (item.isObject()) {
                    String optId = item.path("id").asText("").trim().toUpperCase(Locale.ROOT);
                    int targetIdx = optId.length() == 1 && optId.charAt(0) >= 'A' && optId.charAt(0) <= 'D'
                            ? optId.charAt(0) - 'A' : i;
                    optsList.set(targetIdx, item.path("text").asText(""));
                    if (item.path("isCorrect").asBoolean(false)) correctFromOptionObj = targetIdx;
                } else {
                    optsList.set(i, item.asText(""));
                }
            }
        } else if (optsNode.isObject()) {
            optsList.set(0, firstText(optsNode, "A", "a"));
            optsList.set(1, firstText(optsNode, "B", "b"));
            optsList.set(2, firstText(optsNode, "C", "c"));
            optsList.set(3, firstText(optsNode, "D", "d"));
        }
        ArrayNode optsArray = objectMapper.createArrayNode();
        optsList.forEach(optsArray::add);
        out.set("options", optsArray);

        int correctIdx = -1;
        if (q.has("correctIndex") && q.path("correctIndex").isInt()) {
            int candidate = q.path("correctIndex").asInt(0);
            if (candidate >= 0 && candidate <= 3) correctIdx = candidate;
        }
        if (correctIdx < 0 && q.has("correctAnswer")) {
            String letter = q.path("correctAnswer").asText("").trim().toUpperCase(Locale.ROOT);
            if (!letter.isEmpty() && letter.charAt(0) >= 'A' && letter.charAt(0) <= 'D') {
                correctIdx = letter.charAt(0) - 'A';
            }
        }
        if (correctIdx < 0) correctIdx = Math.max(0, correctFromOptionObj);
        out.put("correctIndex", correctIdx);

        out.put("explanation", firstText(q, "explanation", "solutionMethod"));
        if (q.path("optionMeanings").isArray()) out.set("optionMeanings", q.path("optionMeanings").deepCopy());
        if (q.path("steps").isArray()) out.set("steps", q.path("steps").deepCopy());

        String qPassage = firstText(q, "passageText", "passage");
        if (!qPassage.isBlank()) out.put("passageText", qPassage);
        else if (!fallbackPassage.isBlank()) out.put("passageText", fallbackPassage);

        String qPassageVi = firstText(q, "passageTextVi");
        if (!qPassageVi.isBlank()) out.put("passageTextVi", qPassageVi);
        else if (!fallbackPassageVi.isBlank()) out.put("passageTextVi", fallbackPassageVi);

        JsonNode qVocab = q.path("vocabList").isArray() ? q.path("vocabList") : q.path("vocabulary");
        if (qVocab.isArray()) {
            ArrayNode normalizedQVocab = normalizeVocabArray(qVocab);
            if (!normalizedQVocab.isEmpty()) out.set("vocabList", normalizedQVocab);
        }
        return out;
    }

    private ArrayNode normalizeVocabArray(JsonNode arrNode) {
        ArrayNode out = objectMapper.createArrayNode();
        if (arrNode == null || !arrNode.isArray()) return out;
        for (JsonNode entry : arrNode) {
            if (!entry.isObject()) continue;
            String word = firstText(entry, "word");
            if (word.isBlank()) continue;
            ObjectNode item = objectMapper.createObjectNode();
            item.put("word", word);
            String pos = firstText(entry, "pos", "partOfSpeech");
            item.put("pos", pos.isBlank() ? "n" : pos);
            String level = firstText(entry, "level");
            item.put("level", level.isBlank() ? "B1" : level);
            item.put("ipa", firstText(entry, "ipa", "phonetic"));
            String meaning = firstText(entry, "meaning", "meaningVi");
            item.put("meaning", meaning.isBlank() ? "Từ vựng trọng tâm" : meaning);
            if (entry.path("example").isObject()) {
                item.set("example", entry.path("example").deepCopy());
            }
            if (entry.path("collocations").isArray()) {
                item.set("collocations", entry.path("collocations").deepCopy());
            }
            if (entry.path("synonyms").isArray()) {
                item.set("synonyms", entry.path("synonyms").deepCopy());
            }
            if (entry.path("antonyms").isArray()) {
                item.set("antonyms", entry.path("antonyms").deepCopy());
            }
            if (entry.path("wordFamily").isArray()) {
                item.set("wordFamily", entry.path("wordFamily").deepCopy());
            }
            out.add(item);
        }
        return out;
    }

    private String firstText(JsonNode node, String... fields) {
        if (node == null || node.isNull()) return "";
        for (String field : fields) {
            JsonNode val = node.get(field);
            if (val != null && val.isValueNode()) {
                String txt = val.asText("").trim();
                if (!txt.isBlank()) return txt;
            }
        }
        return "";
    }

    private String clamp(String value, int maxLen) {
        if (value == null) return "";
        String trimmed = value.trim();
        return trimmed.length() > maxLen ? trimmed.substring(0, maxLen) : trimmed;
    }

    private record NormalizedReadingCard(
            String id,
            String title,
            String category,
            String subCategory,
            String subtitle,
            String tag,
            String status,
            int totalQuestions,
            String passageText,
            String passageTextVi,
            ArrayNode passages,
            ObjectNode theory,
            ArrayNode sampleQuestions) {
    }

    private String toJson(Object obj) {
        if (obj == null) return "{}";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
