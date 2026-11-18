package com.toeic.ai.toeic_api.listening;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class ListeningService {

    private static final Logger log = LoggerFactory.getLogger(ListeningService.class);

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ListeningService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncPublishedImports() {
        try {
            List<String> payloads = jdbc.queryForList(
                    "SELECT payload_json::text FROM imported_content WHERE content_type = 'LISTENING' ORDER BY published_at ASC, id ASC",
                    String.class);
            for (String rawJson : payloads) {
                if (rawJson == null || rawJson.isBlank()) continue;
                try {
                    JsonNode node = objectMapper.readTree(rawJson);
                    syncFromImportItem(node);
                } catch (Exception ex) {
                    log.warn("Skipped syncing listening import payload: {}", ex.getMessage());
                }
            }
        } catch (Exception ex) {
            log.debug("Skipped syncPublishedImports for listening: {}", ex.getMessage());
        }
    }

    @Transactional
    public void syncFromImportItem(JsonNode node) {
        if (node == null || !node.isObject()) return;

        String recordType = firstText(node, "recordType", "mode").toUpperCase(Locale.ROOT);
        String unitType = firstText(node, "unitType", "type").toLowerCase(Locale.ROOT);
        boolean isUnit = "UNIT".equals(recordType)
                || "level".equals(unitType)
                || "category".equals(unitType)
                || node.has("theorySummary")
                || node.has("rules")
                || node.has("vocabBag");

        if (isUnit) {
            upsertListeningUnitFromJson(node);
        } else {
            upsertDictationCardFromJson(node);
        }
    }

    private void upsertListeningUnitFromJson(JsonNode node) {
        String title = firstText(node, "title");
        if (title.isBlank()) return;
        String part = canonicalPartLabel(firstText(node, "part"));
        String unitType = firstText(node, "unitType", "type").toLowerCase(Locale.ROOT);
        if (!List.of("level", "category").contains(unitType)) {
            unitType = node.has("targetLevel") && !firstText(node, "targetLevel").isBlank() ? "level" : "category";
        }
        String targetLevel = firstText(node, "targetLevel", "level", "difficulty");
        String theorySummary = firstText(node, "theorySummary", "explanation", "transcript");
        List<String> rules = new ArrayList<>();
        if (node.path("rules").isArray()) {
            node.path("rules").forEach(r -> {
                if (!r.asText().isBlank()) rules.add(r.asText().trim());
            });
        }
        List<Map<String, Object>> vocabBag = new ArrayList<>();
        if (node.path("vocabBag").isArray()) {
            vocabBag = objectMapper.convertValue(node.path("vocabBag"), new TypeReference<>() {});
        } else if (node.path("vocabList").isArray()) {
            vocabBag = objectMapper.convertValue(node.path("vocabList"), new TypeReference<>() {});
        }

        List<Map<String, Object>> questions = extractQuestionsListFromNode(node, part);
        int totalQuestions = node.path("totalQuestions").asInt(questions.size() > 0 ? questions.size() : 1);
        if (totalQuestions < questions.size()) {
            totalQuestions = questions.size();
        }

        String requestedId = firstText(node, "id");
        String existingId = null;
        if (!requestedId.isBlank()) {
            List<String> byId = jdbc.queryForList(
                    "SELECT id FROM listening_part_units WHERE id = ?", String.class, requestedId);
            if (!byId.isEmpty()) existingId = byId.getFirst();
        }
        if (existingId == null) {
            List<String> byTitle = jdbc.queryForList(
                    "SELECT id FROM listening_part_units WHERE part = ? AND unit_type = ? AND lower(title) = lower(?) LIMIT 1",
                    String.class, part, unitType, title);
            if (!byTitle.isEmpty()) existingId = byTitle.getFirst();
        }

        if (existingId != null) {
            // If incoming node has only 1 question (e.g. from flat CSV row) and unit already exists, merge questions
            List<Map<String, Object>> finalQuestions = questions;
            if (questions.size() == 1 && !node.path("questions").isArray()) {
                ListeningUnit existingUnit = getUnit(existingId);
                List<Map<String, Object>> merged = new ArrayList<>(existingUnit.questions());
                Map<String, Object> newQ = questions.getFirst();
                boolean alreadyExists = merged.stream().anyMatch(q ->
                        String.valueOf(q.getOrDefault("fullTranscript", "")).equalsIgnoreCase(String.valueOf(newQ.getOrDefault("fullTranscript", "")))
                                && String.valueOf(q.getOrDefault("question", "")).equalsIgnoreCase(String.valueOf(newQ.getOrDefault("question", ""))));
                if (!alreadyExists) {
                    newQ.put("id", merged.size() + 1);
                    merged.add(newQ);
                }
                finalQuestions = merged;
                totalQuestions = Math.max(totalQuestions, finalQuestions.size());
            }

            jdbc.update("""
                    UPDATE listening_part_units
                    SET part = ?, unit_type = ?, title = ?, target_level = ?, total_questions = ?,
                        theory_summary = ?, rules = ?::jsonb, vocab_bag = ?::jsonb,
                        questions = ?::jsonb, updated_at = now()
                    WHERE id = ?
                    """, part, unitType, title, targetLevel, totalQuestions,
                    theorySummary, toJson(rules), toJson(vocabBag), toJson(finalQuestions), existingId);
        } else {
            String newId = !requestedId.isBlank() ? clampId(requestedId) : UUID.randomUUID().toString();
            jdbc.update("""
                    INSERT INTO listening_part_units
                        (id, part, unit_type, title, target_level, total_questions, theory_summary, rules, vocab_bag, questions, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, 'PUBLISHED')
                    """, newId, part, unitType, title, targetLevel, totalQuestions,
                    theorySummary, toJson(rules), toJson(vocabBag), toJson(questions));
        }
    }

    private void upsertDictationCardFromJson(JsonNode node) {
        String part = canonicalPartLabel(firstText(node, "part"));
        String year = firstText(node, "year");
        if (year.isBlank()) {
            String src = firstText(node, "source", "title");
            if (src.contains("2022")) year = "2022";
            else if (src.contains("2023")) year = "2023";
            else year = "2024";
        }
        int testNumber = node.path("testNumber").asInt(0);
        if (testNumber <= 0) {
            String titleText = firstText(node, "title");
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?i)test\\s*0?(\\d+)").matcher(titleText);
            testNumber = m.find() ? Integer.parseInt(m.group(1)) : 1;
        }
        String title = firstText(node, "title");
        if (title.isBlank()) {
            title = "Test " + testNumber + " - " + part;
        }

        List<Map<String, Object>> questions = extractQuestionsListFromNode(node, part);
        int totalQuestions = node.path("totalQuestions").asInt(questions.isEmpty() ? 1 : questions.size());
        if (totalQuestions < questions.size()) {
            totalQuestions = questions.size();
        }

        String requestedId = firstText(node, "id");
        String cardId = null;
        if (!requestedId.isBlank()) {
            List<String> byId = jdbc.queryForList(
                    "SELECT id FROM listening_dictation_cards WHERE id = ?", String.class, requestedId);
            if (!byId.isEmpty()) cardId = byId.getFirst();
        }
        if (cardId == null) {
            List<String> byTitle = jdbc.queryForList(
                    "SELECT id FROM listening_dictation_cards WHERE lower(title) = lower(?) AND year = ? AND part = ? LIMIT 1",
                    String.class, title, year, part);
            if (!byTitle.isEmpty()) cardId = byTitle.getFirst();
        }

        boolean isMultiQuestionPayload = node.path("questions").isArray() && !node.path("questions").isEmpty();

        if (cardId == null) {
            cardId = !requestedId.isBlank() ? clampId(requestedId) : UUID.randomUUID().toString();
            jdbc.update("""
                    INSERT INTO listening_dictation_cards (id, title, test_number, part, year, total_questions, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'NOT_STARTED')
                    """, cardId, title, testNumber, part, year, totalQuestions);
            replaceQuestionsForCard(cardId, part, questions);
        } else {
            if (isMultiQuestionPayload) {
                jdbc.update("""
                        UPDATE listening_dictation_cards
                        SET title = ?, test_number = ?, part = ?, year = ?, total_questions = ?, updated_at = now()
                        WHERE id = ?
                        """, title, testNumber, part, year, totalQuestions, cardId);
                replaceQuestionsForCard(cardId, part, questions);
            } else if (!questions.isEmpty()) {
                // Single question row from CSV/JSON import -> append or update
                Map<String, Object> q = questions.getFirst();
                String transcript = String.valueOf(q.getOrDefault("fullTranscript", ""));
                Integer existingCount = jdbc.queryForObject(
                        "SELECT count(*) FROM listening_dictation_questions WHERE card_id = ? AND lower(full_transcript) = lower(?)",
                        Integer.class, cardId, transcript);
                if (existingCount == null || existingCount == 0) {
                    Integer nextIdx = jdbc.queryForObject(
                            "SELECT COALESCE(MAX(question_index) + 1, 0) FROM listening_dictation_questions WHERE card_id = ?",
                            Integer.class, cardId);
                    insertSingleQuestionForCard(cardId, nextIdx != null ? nextIdx : 0, part, q);
                    Integer totalNow = jdbc.queryForObject(
                            "SELECT count(*) FROM listening_dictation_questions WHERE card_id = ?",
                            Integer.class, cardId);
                    jdbc.update("UPDATE listening_dictation_cards SET total_questions = GREATEST(total_questions, ?), updated_at = now() WHERE id = ?",
                            totalNow != null ? totalNow : 1, cardId);
                }
            }
        }
    }

    private List<Map<String, Object>> extractQuestionsListFromNode(JsonNode node, String defaultPart) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (node.path("questions").isArray() && !node.path("questions").isEmpty()) {
            int idx = 1;
            for (JsonNode qNode : node.path("questions")) {
                list.add(normalizeQuestionNode(qNode, defaultPart, idx++));
            }
            return list;
        }
        String transcript = firstText(node, "transcript", "fullTranscript");
        String audioUrl = firstText(node, "audioUrl");
        if (!transcript.isBlank() || !audioUrl.isBlank()) {
            list.add(normalizeQuestionNode(node, defaultPart, 1));
        }
        return list;
    }

    private Map<String, Object> normalizeQuestionNode(JsonNode qNode, String defaultPart, int fallbackId) {
        Map<String, Object> map = new LinkedHashMap<>();
        int qId = qNode.path("id").asInt(fallbackId);
        map.put("id", qId);
        String qPart = canonicalPartLabel(firstText(qNode, "part"));
        map.put("part", qPart.isBlank() ? defaultPart : qPart);
        String questionPrompt = firstText(qNode, "question", "questionText");
        if (!questionPrompt.isBlank()) {
            map.put("question", questionPrompt);
        }
        map.put("audioUrl", firstText(qNode, "audioUrl"));
        String imageUrl = firstText(qNode, "imageUrl");
        if (!imageUrl.isBlank()) {
            map.put("imageUrl", imageUrl);
        }
        map.put("fullTranscript", firstText(qNode, "fullTranscript", "transcript"));
        map.put("vietnameseTranslation", firstText(qNode, "vietnameseTranslation", "translation"));

        Map<String, String> optionsMap = new LinkedHashMap<>();
        JsonNode opts = qNode.path("options");
        if (opts.isObject()) {
            opts.properties().forEach(e -> optionsMap.put(e.getKey().toUpperCase(Locale.ROOT), e.getValue().asText("")));
        } else if (opts.isArray()) {
            int idx = 0;
            for (JsonNode item : opts) {
                if (item.isObject()) {
                    String key = item.path("id").asText(String.valueOf((char) ('A' + idx))).toUpperCase(Locale.ROOT);
                    optionsMap.put(key, item.path("text").asText(""));
                } else if (item.isValueNode()) {
                    optionsMap.put(String.valueOf((char) ('A' + idx)), item.asText(""));
                }
                idx++;
            }
        }
        if (!optionsMap.isEmpty()) {
            map.put("options", optionsMap);
        }

        if (qNode.path("optionTranslations").isObject()) {
            Map<String, String> optTrans = objectMapper.convertValue(
                    qNode.path("optionTranslations"), new TypeReference<Map<String, String>>() {});
            map.put("optionTranslations", optTrans);
        }

        String correctAnswer = firstText(qNode, "correctAnswer");
        if (!correctAnswer.isBlank()) {
            map.put("correctAnswer", correctAnswer.toUpperCase(Locale.ROOT));
        }
        map.put("explanation", firstText(qNode, "explanation"));
        String trapNote = firstText(qNode, "trapNote");
        if (!trapNote.isBlank()) {
            map.put("trapNote", trapNote);
        }
        if (qNode.path("vocabList").isArray()) {
            List<Map<String, Object>> vocabList = objectMapper.convertValue(
                    qNode.path("vocabList"), new TypeReference<List<Map<String, Object>>>() {});
            map.put("vocabList", vocabList);
        } else {
            map.put("vocabList", Collections.emptyList());
        }
        return map;
    }

    private void replaceQuestionsForCard(String cardId, String cardPart, List<Map<String, Object>> questions) {
        jdbc.update("DELETE FROM listening_dictation_questions WHERE card_id = ?", cardId);
        int idx = 0;
        for (Map<String, Object> q : questions) {
            insertSingleQuestionForCard(cardId, idx++, cardPart, q);
        }
    }

    private void insertSingleQuestionForCard(String cardId, int questionIndex, String cardPart, Map<String, Object> q) {
        String part = canonicalPartLabel(String.valueOf(q.getOrDefault("part", cardPart)));
        String questionText = q.get("question") != null ? String.valueOf(q.get("question")) : null;
        String audioUrl = String.valueOf(q.getOrDefault("audioUrl", ""));
        String imageUrl = q.get("imageUrl") != null ? String.valueOf(q.get("imageUrl")) : null;
        String fullTranscript = String.valueOf(q.getOrDefault("fullTranscript", ""));
        String vietnameseTranslation = String.valueOf(q.getOrDefault("vietnameseTranslation", ""));
        String optionsJson = toJsonObject(q.get("options"));
        String optTransJson = toJsonObject(q.get("optionTranslations"));
        String correctAnswer = q.get("correctAnswer") != null ? String.valueOf(q.get("correctAnswer")) : null;
        String explanation = q.get("explanation") != null ? String.valueOf(q.get("explanation")) : "";
        String trapNote = q.get("trapNote") != null ? String.valueOf(q.get("trapNote")) : null;
        String vocabJson = toJson(q.get("vocabList"));

        jdbc.update("""
                INSERT INTO listening_dictation_questions
                    (card_id, question_index, part, question_text, audio_url, image_url,
                     full_transcript, vietnamese_translation, options, option_translations,
                     correct_answer, explanation, trap_note, vocab_list)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?::jsonb)
                """, cardId, questionIndex, part, questionText, audioUrl, imageUrl,
                fullTranscript, vietnameseTranslation, optionsJson, optTransJson,
                correctAnswer, explanation, trapNote, vocabJson);
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

        List<ListeningDictationCard> cards = jdbc.query(sql, (rs, rowNum) -> {
            int totalQ = rs.getInt("total_questions");
            int completedQ = rs.getInt("completed_questions");
            int pct = totalQ > 0 ? Math.min(100, Math.round((completedQ * 100f) / totalQ)) : 0;
            return new ListeningDictationCard(
                    rs.getString("id"),
                    rs.getString("title"),
                    rs.getInt("test_number"),
                    canonicalPartLabel(rs.getString("part")),
                    rs.getString("year"),
                    totalQ,
                    completedQ,
                    displayProgressStatus(rs.getString("status")),
                    pct,
                    Collections.emptyList(),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("updated_at").toInstant()
            );
        }, userId);
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

        List<ListeningDictationCard> cards = jdbc.query(sql, (rs, rowNum) -> {
            int totalQ = rs.getInt("total_questions");
            int completedQ = rs.getInt("completed_questions");
            int pct = totalQ > 0 ? Math.min(100, Math.round((completedQ * 100f) / totalQ)) : 0;
            return new ListeningDictationCard(
                    rs.getString("id"),
                    rs.getString("title"),
                    rs.getInt("test_number"),
                    canonicalPartLabel(rs.getString("part")),
                    rs.getString("year"),
                    totalQ,
                    completedQ,
                    displayProgressStatus(rs.getString("status")),
                    pct,
                    Collections.emptyList(),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("updated_at").toInstant()
            );
        }, userId, cardId);

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
        String part = canonicalPartLabel(request.part());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        jdbc.update("""
                INSERT INTO listening_dictation_cards (id, title, test_number, part, year, total_questions, status)
                VALUES (?, ?, ?, ?, ?, ?, 'NOT_STARTED')
                """, id, request.title().trim(), request.testNumber(), part, request.year(), totalQ);
        saveCardQuestions(id, part, request);
        return getCard(id, null);
    }

    @Transactional
    public ListeningDictationCard updateCard(String id, ListeningCardRequest request) {
        validateCardRequest(request);
        String part = canonicalPartLabel(request.part());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        int updated = jdbc.update("""
                UPDATE listening_dictation_cards
                SET title = ?, test_number = ?, part = ?, year = ?, total_questions = ?, updated_at = now()
                WHERE id = ?
                """, request.title().trim(), request.testNumber(), part, request.year(), totalQ, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
        saveCardQuestions(id, part, request);
        return getCard(id, null);
    }

    @Transactional
    public void deleteCard(String id) {
        if (jdbc.update("DELETE FROM listening_dictation_cards WHERE id = ?", id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
    }

    private void saveCardQuestions(String cardId, String part, ListeningCardRequest request) {
        if (request.questions() != null && !request.questions().isEmpty()) {
            List<Map<String, Object>> normalizedList = new ArrayList<>();
            int idx = 1;
            for (Map<String, Object> rawQ : request.questions()) {
                JsonNode qNode = objectMapper.valueToTree(rawQ);
                normalizedList.add(normalizeQuestionNode(qNode, part, idx++));
            }
            replaceQuestionsForCard(cardId, part, normalizedList);
            return;
        }
        savePrimaryQuestion(cardId, part, request);
    }

    private void savePrimaryQuestion(String cardId, String part, ListeningCardRequest request) {
        List<Long> questionIds = jdbc.query(
                "SELECT id FROM listening_dictation_questions WHERE card_id = ? ORDER BY question_index ASC",
                (rs, rowNum) -> rs.getLong(1), cardId);
        if (questionIds.isEmpty()) {
            jdbc.update("""
                    INSERT INTO listening_dictation_questions
                        (card_id, question_index, part, audio_url, full_transcript, vietnamese_translation)
                    VALUES (?, 0, ?, ?, ?, ?)
                    """, cardId, part, request.audioUrl(), request.fullTranscript(),
                    request.vietnameseTranslation());
        } else {
            jdbc.update("""
                    UPDATE listening_dictation_questions
                    SET part = ?, audio_url = ?, full_transcript = ?, vietnamese_translation = ?, updated_at = now()
                    WHERE id = ?
                    """, part, request.audioUrl(), request.fullTranscript(),
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

    public List<ListeningUnit> listUnits(UUID userId) {
        if (userId == null) {
            return listUnits();
        }
        return jdbc.query("""
                SELECT u.id, u.part, u.unit_type, u.title, u.target_level, u.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.correct_count, 0) AS correct_count,
                       COALESCE(p.wrong_count, 0) AS wrong_count,
                       COALESCE(p.status, 'NOT_STARTED') AS user_status,
                       u.theory_summary,
                       u.rules::text AS rules_json, u.vocab_bag::text AS vocab_bag_json,
                       u.questions::text AS questions_json, u.status
                FROM listening_part_units u
                LEFT JOIN user_listening_unit_progress p ON p.unit_id = u.id AND p.user_id = ?
                ORDER BY u.part ASC, u.unit_type ASC, u.created_at DESC
                """, this::mapUnitWithProgress, userId);
    }

    @Transactional
    public ListeningUnit createUnit(ListeningUnitRequest request) {
        validateUnitRequest(request);
        String id = UUID.randomUUID().toString();
        String part = canonicalPartLabel(request.part());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        jdbc.update("""
                INSERT INTO listening_part_units
                    (id, part, unit_type, title, target_level, total_questions, theory_summary, rules, vocab_bag, questions, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, 'PUBLISHED')
                """, id, part, request.type(), request.title().trim(), request.targetLevel(),
                totalQ, valueOrEmpty(request.theorySummary()), toJson(request.rules()),
                toJson(request.vocabBag()), toJson(request.questions()));
        return getUnit(id);
    }

    @Transactional
    public ListeningUnit updateUnit(String id, ListeningUnitRequest request) {
        validateUnitRequest(request);
        String part = canonicalPartLabel(request.part());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        int updated = jdbc.update("""
                UPDATE listening_part_units
                SET part = ?, unit_type = ?, title = ?, target_level = ?, total_questions = ?,
                    theory_summary = ?, rules = ?::jsonb, vocab_bag = ?::jsonb,
                    questions = ?::jsonb, updated_at = now()
                WHERE id = ?
                """, part, request.type(), request.title().trim(), request.targetLevel(),
                totalQ, valueOrEmpty(request.theorySummary()), toJson(request.rules()),
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
                canonicalPartLabel(rs.getString("part")),
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

    private ListeningUnit mapUnitWithProgress(ResultSet rs, int rowNum) throws SQLException {
        String rawUserStatus = rs.getString("user_status");
        String displayStatus = switch (rawUserStatus == null ? "" : rawUserStatus) {
            case "COMPLETED" -> "Đã hoàn thành";
            case "IN_PROGRESS" -> "Đang học";
            default -> "Chưa luyện tập";
        };
        return new ListeningUnit(
                rs.getString("id"),
                canonicalPartLabel(rs.getString("part")),
                rs.getString("unit_type"),
                rs.getString("title"),
                rs.getString("target_level"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                rs.getInt("correct_count"),
                rs.getInt("wrong_count"),
                displayStatus,
                rs.getString("theory_summary"),
                parseStringList(rs.getString("rules_json")),
                parseList(rs.getString("vocab_bag_json")),
                parseList(rs.getString("questions_json")),
                rs.getString("status"));
    }

    private void validateCardRequest(ListeningCardRequest request) {
        if (request == null || request.testNumber() < 1 || request.totalQuestions() < 1
                || !isListeningPart(request.part()) || isBlank(request.year()) || isBlank(request.title())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin bài nghe chưa hợp lệ.");
        }
        boolean hasQuestionsList = request.questions() != null && !request.questions().isEmpty();
        if (!hasQuestionsList && (isBlank(request.audioUrl()) || isBlank(request.fullTranscript()))) {
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
        String canonical = canonicalPartLabel(part);
        return List.of("Part 1", "Part 2", "Part 3", "Part 4").contains(canonical);
    }

    public static String canonicalPartLabel(String part) {
        if (part == null || part.isBlank()) return "Part 1";
        String trimmed = part.trim();
        if (trimmed.matches("(?i)part[\\s_-]*1") || "1".equals(trimmed)) return "Part 1";
        if (trimmed.matches("(?i)part[\\s_-]*2") || "2".equals(trimmed)) return "Part 2";
        if (trimmed.matches("(?i)part[\\s_-]*3") || "3".equals(trimmed)) return "Part 3";
        if (trimmed.matches("(?i)part[\\s_-]*4") || "4".equals(trimmed)) return "Part 4";
        return trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private String clampId(String id) {
        String clean = id.trim();
        return clean.length() > 64 ? clean.substring(0, 64) : clean;
    }

    private String firstText(JsonNode node, String... fields) {
        if (node == null) return "";
        for (String field : fields) {
            JsonNode val = node.get(field);
            if (val != null && val.isValueNode()) {
                String txt = val.asText("").trim();
                if (!txt.isBlank()) return txt;
            }
        }
        return "";
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyList() : value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Nội dung chủ điểm nghe không hợp lệ.", e);
        }
    }

    private String toJsonObject(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyMap() : value);
        } catch (Exception e) {
            return "{}";
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
        int totalQ = Math.max(card.totalQuestions(), questions.size());
        return new ListeningDictationCard(card.id(), card.title(), card.testNumber(), card.part(), card.year(),
                totalQ, card.completedQuestions(), card.status(), card.progressPercent(),
                questions, card.createdAt(), card.updatedAt());
    }

    public List<ListeningDictationQuestion> getQuestionsForCard(String cardId) {
        String sql = """
                SELECT id, card_id, question_index, part, question_text, audio_url, image_url,
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
                canonicalPartLabel(rs.getString("part")),
                rs.getString("question_text"),
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
        if (userId == null || req == null || isBlank(req.cardId())) return;

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

        String status = normalizeDbStatus(req.status(), req.completedQuestions(), req.totalQuestions());
        jdbc.update(upsert, userId, req.cardId(), req.completedQuestions(), req.totalQuestions(),
                status, req.lastQuestionIndex());
    }

    @Transactional
    public void saveUnitProgress(UUID userId, SaveListeningUnitProgressRequest req) {
        if (userId == null || req == null || isBlank(req.unitId())) return;

        String upsert = """
                INSERT INTO user_listening_unit_progress
                    (user_id, unit_id, completed_questions, total_questions, correct_count, wrong_count,
                     wrong_question_ids, answered_question_ids, status, last_question_index, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, now())
                ON CONFLICT (user_id, unit_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    correct_count = EXCLUDED.correct_count,
                    wrong_count = EXCLUDED.wrong_count,
                    wrong_question_ids = EXCLUDED.wrong_question_ids,
                    answered_question_ids = EXCLUDED.answered_question_ids,
                    status = EXCLUDED.status,
                    last_question_index = EXCLUDED.last_question_index,
                    updated_at = now()
                """;

        String status = normalizeDbStatus(req.status(), req.completedQuestions(), req.totalQuestions());
        jdbc.update(upsert,
                userId,
                req.unitId(),
                Math.max(0, req.completedQuestions()),
                Math.max(0, req.totalQuestions()),
                Math.max(0, req.correctCount()),
                Math.max(0, req.wrongCount()),
                toJson(req.wrongQuestionIds()),
                toJson(req.answeredQuestionIds()),
                status,
                Math.max(0, req.lastQuestionIndex()));
    }

    private String normalizeDbStatus(String rawStatus, int completed, int total) {
        if (rawStatus != null) {
            if ("COMPLETED".equalsIgnoreCase(rawStatus) || "Đã hoàn thành".equals(rawStatus) || "completed".equalsIgnoreCase(rawStatus)) {
                return "COMPLETED";
            }
            if ("NOT_STARTED".equalsIgnoreCase(rawStatus) || "Chưa bắt đầu".equals(rawStatus) || "Chưa luyện tập".equals(rawStatus) || "not_started".equalsIgnoreCase(rawStatus)) {
                return "NOT_STARTED";
            }
            if ("IN_PROGRESS".equalsIgnoreCase(rawStatus) || "Đang luyện tập".equals(rawStatus) || "Đang học".equals(rawStatus) || "in_progress".equalsIgnoreCase(rawStatus)) {
                return "IN_PROGRESS";
            }
        }
        if (completed <= 0) return "NOT_STARTED";
        if (total > 0 && completed >= total) return "COMPLETED";
        return "IN_PROGRESS";
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
            String audioUrl, String fullTranscript, String vietnameseTranslation,
            List<Map<String, Object>> questions) {
        public ListeningCardRequest(String title, int testNumber, String part, String year, int totalQuestions,
                String audioUrl, String fullTranscript, String vietnameseTranslation) {
            this(title, testNumber, part, year, totalQuestions, audioUrl, fullTranscript, vietnameseTranslation, null);
        }
    }

    public record ListeningUnitRequest(String part, String type, String title, String targetLevel,
            int totalQuestions, String theorySummary, List<String> rules,
            List<Map<String, Object>> vocabBag, List<Map<String, Object>> questions) {}

    public record ListeningUnit(String id, String part, String type, String title, String targetLevel,
            int totalQuestions, int completedQuestions, int correctCount, int wrongCount, String status,
            String theorySummary, List<String> rules, List<Map<String, Object>> vocabBag,
            List<Map<String, Object>> questions, String contentStatus) {}

    public record SaveListeningUnitProgressRequest(
            String unitId,
            int completedQuestions,
            int totalQuestions,
            int correctCount,
            int wrongCount,
            List<Object> wrongQuestionIds,
            List<Object> answeredQuestionIds,
            String status,
            int lastQuestionIndex
    ) {}
}
