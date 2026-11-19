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
        if (qNode.path("segments").isArray() && !qNode.path("segments").isEmpty()) {
            List<Map<String, Object>> segments = objectMapper.convertValue(
                    qNode.path("segments"), new TypeReference<List<Map<String, Object>>>() {});
            map.put("segments", segments);
        } else {
            map.put("segments", buildDefaultSegments(
                    String.valueOf(map.getOrDefault("fullTranscript", "")),
                    String.valueOf(map.getOrDefault("vietnameseTranslation", ""))
            ));
        }
        return map;
    }

    public static List<Map<String, Object>> buildDefaultSegments(String transcript, String translation) {
        if (transcript == null || transcript.isBlank()) {
            return Collections.emptyList();
        }
        String cleanEn = transcript.trim();
        String cleanVi = translation == null ? "" : translation.trim();

        // Split by speaker/option markers or sentence boundaries
        String[] rawEnParts = cleanEn.split("(?<=\\.|\\?|!)\\s+(?=[A-Z(\\[])|\\r?\\n+");
        List<String> enLines = new ArrayList<>();
        for (String part : rawEnParts) {
            String p = part.trim();
            if (!p.isEmpty()) enLines.add(p);
        }
        if (enLines.isEmpty()) {
            enLines.add(cleanEn);
        }

        String[] rawViParts = cleanVi.isEmpty()
                ? new String[0]
                : cleanVi.split("(?<=\\.|\\?|!)\\s+|\\r?\\n+");
        List<String> viLines = new ArrayList<>();
        for (String part : rawViParts) {
            String p = part.trim();
            if (!p.isEmpty()) viLines.add(p);
        }

        List<Map<String, Object>> segments = new ArrayList<>();
        double cursor = 0.0;
        for (int i = 0; i < enLines.size(); i++) {
            String line = enLines.get(i);
            String speaker = "";
            String textOnly = line;

            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("^(customer:|client:|man:|woman:|speaker\\s*\\d*:|m-[a-z]+:|w-[a-z]+:|\\([A-Da-d]\\))\\s*(.*)$",
                            java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(line);
            if (m.find()) {
                speaker = m.group(1).trim().replaceAll(":$", "");
                textOnly = m.group(2).trim();
                if (textOnly.isEmpty()) textOnly = line;
            }

            int wordCount = Math.max(1, textOnly.split("\\s+").length);
            double segDuration = Math.max(1.8, Math.round((wordCount * 0.42 + 0.6) * 10.0) / 10.0);
            double startTime = Math.round(cursor * 10.0) / 10.0;
            double endTime = Math.round((cursor + segDuration) * 10.0) / 10.0;
            cursor = endTime;

            Map<String, Object> seg = new LinkedHashMap<>();
            seg.put("id", i + 1);
            if (!speaker.isEmpty()) {
                seg.put("speaker", speaker);
            }
            seg.put("startTime", startTime);
            seg.put("endTime", endTime);
            seg.put("text", line);
            if (i < viLines.size()) {
                seg.put("translation", viLines.get(i));
            } else if (enLines.size() == 1 && !cleanVi.isEmpty()) {
                seg.put("translation", cleanVi);
            } else {
                seg.put("translation", "");
            }
            segments.add(seg);
        }
        return segments;
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
        Object rawSegments = q.get("segments");
        if (rawSegments == null || (rawSegments instanceof List<?> list && list.isEmpty())) {
            rawSegments = buildDefaultSegments(fullTranscript, vietnameseTranslation);
        }
        String segmentsJson = toJson(rawSegments);

        jdbc.update("""
                INSERT INTO listening_dictation_questions
                    (card_id, question_index, part, question_text, audio_url, image_url,
                     full_transcript, vietnamese_translation, options, option_translations,
                     correct_answer, explanation, trap_note, vocab_list, segments)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?::jsonb, ?::jsonb)
                """, cardId, questionIndex, part, questionText, audioUrl, imageUrl,
                fullTranscript, vietnameseTranslation, optionsJson, optTransJson,
                correctAnswer, explanation, trapNote, vocabJson, segmentsJson);
    }

    public List<ListeningDictationCard> listCards(UUID userId) {
        return queryCards(userId, false);
    }

    public List<ListeningDictationCard> listAdminCards() {
        return queryCards(null, true);
    }

    private List<ListeningDictationCard> queryCards(UUID userId, boolean includeDrafts) {
        String sql = """
                SELECT c.id, c.title, c.test_number, c.part, c.year, c.total_questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(p.correct_count, 0) AS correct_count,
                       COALESCE(p.wrong_count, 0) AS wrong_count,
                       COALESCE(p.status, c.status) AS status,
                       COALESCE(c.publication_status, 'PUBLISHED') AS publication_status,
                       COALESCE(p.answered_question_ids, '[]'::jsonb)::text AS answered_json,
                       COALESCE(p.wrong_question_ids, '[]'::jsonb)::text AS wrong_json,
                       COALESCE(p.flagged_question_ids, '[]'::jsonb)::text AS flagged_json,
                       COALESCE(p.user_notes, '{}'::jsonb)::text AS notes_json,
                       COALESCE(p.self_assessments, '{}'::jsonb)::text AS self_json,
                       COALESCE(p.last_question_index, 0) AS last_question_index,
                       c.created_at, c.updated_at
                FROM listening_dictation_cards c
                LEFT JOIN user_listening_progress p ON p.card_id = c.id AND p.user_id = ?
                """ + (includeDrafts ? "" : " WHERE COALESCE(c.publication_status, 'PUBLISHED') = 'PUBLISHED'\n") + """
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
                    rs.getInt("correct_count"),
                    rs.getInt("wrong_count"),
                    displayProgressStatus(rs.getString("status")),
                    pct,
                    Collections.emptyList(),
                    normalizePublicationStatus(rs.getString("publication_status")),
                    parseObjectList(rs.getString("answered_json")),
                    parseObjectList(rs.getString("wrong_json")),
                    parseObjectList(rs.getString("flagged_json")),
                    parseMap(rs.getString("notes_json")),
                    parseMap(rs.getString("self_json")),
                    rs.getInt("last_question_index"),
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
                       COALESCE(p.correct_count, 0) AS correct_count,
                       COALESCE(p.wrong_count, 0) AS wrong_count,
                       COALESCE(p.status, c.status) AS status,
                       COALESCE(c.publication_status, 'PUBLISHED') AS publication_status,
                       COALESCE(p.answered_question_ids, '[]'::jsonb)::text AS answered_json,
                       COALESCE(p.wrong_question_ids, '[]'::jsonb)::text AS wrong_json,
                       COALESCE(p.flagged_question_ids, '[]'::jsonb)::text AS flagged_json,
                       COALESCE(p.user_notes, '{}'::jsonb)::text AS notes_json,
                       COALESCE(p.self_assessments, '{}'::jsonb)::text AS self_json,
                       COALESCE(p.last_question_index, 0) AS last_question_index,
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
                    rs.getInt("correct_count"),
                    rs.getInt("wrong_count"),
                    displayProgressStatus(rs.getString("status")),
                    pct,
                    Collections.emptyList(),
                    normalizePublicationStatus(rs.getString("publication_status")),
                    parseObjectList(rs.getString("answered_json")),
                    parseObjectList(rs.getString("wrong_json")),
                    parseObjectList(rs.getString("flagged_json")),
                    parseMap(rs.getString("notes_json")),
                    parseMap(rs.getString("self_json")),
                    rs.getInt("last_question_index"),
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
        String pubStatus = normalizePublicationStatus(request.contentStatus());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : Math.max(1, request.totalQuestions());
        jdbc.update("""
                INSERT INTO listening_dictation_cards (id, title, test_number, part, year, total_questions, status, publication_status)
                VALUES (?, ?, ?, ?, ?, ?, 'NOT_STARTED', ?)
                """, id, request.title().trim(), request.testNumber(), part, request.year(), totalQ, pubStatus);
        saveCardQuestions(id, part, request);
        return getCard(id, null);
    }

    @Transactional
    public ListeningDictationCard updateCard(String id, ListeningCardRequest request) {
        validateCardRequest(request);
        String part = canonicalPartLabel(request.part());
        String pubStatus = normalizePublicationStatus(request.contentStatus());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : Math.max(1, request.totalQuestions());
        int updated = jdbc.update("""
                UPDATE listening_dictation_cards
                SET title = ?, test_number = ?, part = ?, year = ?, total_questions = ?, publication_status = ?, updated_at = now()
                WHERE id = ?
                """, request.title().trim(), request.testNumber(), part, request.year(), totalQ, pubStatus, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
        saveCardQuestions(id, part, request);
        return getCard(id, null);
    }

    @Transactional
    public ListeningDictationCard updateCardPublicationStatus(String id, String rawStatus) {
        String pubStatus = normalizePublicationStatus(rawStatus);
        int updated = jdbc.update("""
                UPDATE listening_dictation_cards
                SET publication_status = ?, updated_at = now()
                WHERE id = ?
                """, pubStatus, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài nghe: " + id);
        }
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
                       questions::text AS questions_json, COALESCE(status, 'PUBLISHED') AS status
                FROM listening_part_units
                WHERE COALESCE(status, 'PUBLISHED') = 'PUBLISHED'
                ORDER BY part ASC, unit_type ASC, created_at DESC
                """, this::mapUnit);
    }

    public List<ListeningUnit> listAdminUnits() {
        return jdbc.query("""
                SELECT id, part, unit_type, title, target_level, total_questions, theory_summary,
                       rules::text AS rules_json, vocab_bag::text AS vocab_bag_json,
                       questions::text AS questions_json, COALESCE(status, 'PUBLISHED') AS status
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
                       COALESCE(p.answered_question_ids, '[]'::jsonb)::text AS answered_json,
                       COALESCE(p.wrong_question_ids, '[]'::jsonb)::text AS wrong_json,
                       COALESCE(p.flagged_question_ids, '[]'::jsonb)::text AS flagged_json,
                       COALESCE(p.user_notes, '{}'::jsonb)::text AS notes_json,
                       COALESCE(p.last_question_index, 0) AS last_question_index,
                       u.theory_summary,
                       u.rules::text AS rules_json, u.vocab_bag::text AS vocab_bag_json,
                       u.questions::text AS questions_json, COALESCE(u.status, 'PUBLISHED') AS status
                FROM listening_part_units u
                LEFT JOIN user_listening_unit_progress p ON p.unit_id = u.id AND p.user_id = ?
                WHERE COALESCE(u.status, 'PUBLISHED') = 'PUBLISHED'
                ORDER BY u.part ASC, u.unit_type ASC, u.created_at DESC
                """, this::mapUnitWithProgress, userId);
    }

    @Transactional
    public ListeningUnit createUnit(ListeningUnitRequest request) {
        validateUnitRequest(request);
        String id = UUID.randomUUID().toString();
        String part = canonicalPartLabel(request.part());
        String pubStatus = normalizePublicationStatus(request.contentStatus());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        jdbc.update("""
                INSERT INTO listening_part_units
                    (id, part, unit_type, title, target_level, total_questions, theory_summary, rules, vocab_bag, questions, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?)
                """, id, part, request.type(), request.title().trim(), request.targetLevel(),
                totalQ, valueOrEmpty(request.theorySummary()), toJson(request.rules()),
                toJson(request.vocabBag()), toJson(request.questions()), pubStatus);
        return getUnit(id);
    }

    @Transactional
    public ListeningUnit updateUnit(String id, ListeningUnitRequest request) {
        validateUnitRequest(request);
        String part = canonicalPartLabel(request.part());
        String pubStatus = normalizePublicationStatus(request.contentStatus());
        int totalQ = request.questions() != null && !request.questions().isEmpty()
                ? Math.max(request.totalQuestions(), request.questions().size())
                : request.totalQuestions();
        int updated = jdbc.update("""
                UPDATE listening_part_units
                SET part = ?, unit_type = ?, title = ?, target_level = ?, total_questions = ?,
                    theory_summary = ?, rules = ?::jsonb, vocab_bag = ?::jsonb,
                    questions = ?::jsonb, status = ?, updated_at = now()
                WHERE id = ?
                """, part, request.type(), request.title().trim(), request.targetLevel(),
                totalQ, valueOrEmpty(request.theorySummary()), toJson(request.rules()),
                toJson(request.vocabBag()), toJson(request.questions()), pubStatus, id);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm nghe: " + id);
        }
        return getUnit(id);
    }

    @Transactional
    public ListeningUnit updateUnitPublicationStatus(String id, String rawStatus) {
        String pubStatus = normalizePublicationStatus(rawStatus);
        int updated = jdbc.update("""
                UPDATE listening_part_units
                SET status = ?, updated_at = now()
                WHERE id = ?
                """, pubStatus, id);
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
                rs.getString("status"),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyMap(),
                0);
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
                rs.getString("status"),
                parseObjectList(rs.getString("answered_json")),
                parseObjectList(rs.getString("wrong_json")),
                parseObjectList(rs.getString("flagged_json")),
                parseMap(rs.getString("notes_json")),
                rs.getInt("last_question_index"));
    }

    private void validateCardRequest(ListeningCardRequest request) {
        if (request == null || request.testNumber() < 1 || request.totalQuestions() < 0
                || !isListeningPart(request.part()) || isBlank(request.year()) || isBlank(request.title())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin bài nghe chưa hợp lệ.");
        }
        boolean isDraft = "DRAFT".equals(normalizePublicationStatus(request.contentStatus()));
        boolean hasQuestionsList = request.questions() != null && !request.questions().isEmpty();
        if (!isDraft && !hasQuestionsList && (isBlank(request.audioUrl()) || isBlank(request.fullTranscript()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin bài nghe chưa hợp lệ.");
        }
    }

    public static String normalizePublicationStatus(String raw) {
        if (raw == null || raw.isBlank()) return "PUBLISHED";
        String trimmed = raw.trim();
        if ("DRAFT".equalsIgnoreCase(trimmed) || "Bản nháp".equalsIgnoreCase(trimmed)) {
            return "DRAFT";
        }
        return "PUBLISHED";
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
        return new ListeningDictationCard(
                card.id(),
                card.title(),
                card.testNumber(),
                card.part(),
                card.year(),
                totalQ,
                card.completedQuestions(),
                card.correctCount(),
                card.wrongCount(),
                card.status(),
                card.progressPercent(),
                questions,
                card.contentStatus(),
                card.answeredQuestionIds(),
                card.wrongQuestionIds(),
                card.flaggedQuestionIds(),
                card.userNotes(),
                card.selfAssessments(),
                card.lastQuestionIndex(),
                card.createdAt(),
                card.updatedAt()
        );
    }

    public List<ListeningDictationQuestion> getQuestionsForCard(String cardId) {
        String sql = """
                SELECT id, card_id, question_index, part, question_text, audio_url, image_url,
                       full_transcript, vietnamese_translation,
                       options::text AS options_json,
                       option_translations::text AS opt_trans_json,
                       correct_answer, explanation, trap_note,
                       vocab_list::text AS vocab_json,
                       COALESCE(segments, '[]'::jsonb)::text AS segments_json
                FROM listening_dictation_questions
                WHERE card_id = ?
                ORDER BY question_index ASC
                """;

        return jdbc.query(sql, this::mapQuestion, cardId);
    }

    private ListeningDictationQuestion mapQuestion(ResultSet rs, int rowNum) throws SQLException {
        String transcript = rs.getString("full_transcript");
        String translation = rs.getString("vietnamese_translation");
        List<Map<String, Object>> parsedSegments = parseList(rs.getString("segments_json"));
        if (parsedSegments.isEmpty()) {
            parsedSegments = buildDefaultSegments(transcript, translation);
        }
        return new ListeningDictationQuestion(
                rs.getLong("id"),
                rs.getString("card_id"),
                rs.getInt("question_index"),
                canonicalPartLabel(rs.getString("part")),
                rs.getString("question_text"),
                rs.getString("audio_url"),
                rs.getString("image_url"),
                transcript,
                translation,
                parseMap(rs.getString("options_json")),
                parseMap(rs.getString("opt_trans_json")),
                rs.getString("correct_answer"),
                rs.getString("explanation"),
                rs.getString("trap_note"),
                parseList(rs.getString("vocab_json")),
                parsedSegments
        );
    }

    @Transactional
    public void saveProgress(UUID userId, SaveListeningProgressRequest req) {
        if (userId == null || req == null || isBlank(req.cardId())) return;

        String upsert = """
                INSERT INTO user_listening_progress
                    (user_id, card_id, completed_questions, total_questions, correct_count, wrong_count,
                     answered_question_ids, wrong_question_ids, flagged_question_ids, user_notes, self_assessments,
                     status, last_question_index, updated_at)
                VALUES (?, ?, ?, ?, COALESCE(?, 0), COALESCE(?, 0),
                        COALESCE(?::jsonb, '[]'::jsonb), COALESCE(?::jsonb, '[]'::jsonb),
                        COALESCE(?::jsonb, '[]'::jsonb), COALESCE(?::jsonb, '{}'::jsonb),
                        COALESCE(?::jsonb, '{}'::jsonb), ?, ?, now())
                ON CONFLICT (user_id, card_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    correct_count = COALESCE(?, user_listening_progress.correct_count),
                    wrong_count = COALESCE(?, user_listening_progress.wrong_count),
                    answered_question_ids = COALESCE(?::jsonb, user_listening_progress.answered_question_ids),
                    wrong_question_ids = COALESCE(?::jsonb, user_listening_progress.wrong_question_ids),
                    flagged_question_ids = COALESCE(?::jsonb, user_listening_progress.flagged_question_ids),
                    user_notes = COALESCE(?::jsonb, user_listening_progress.user_notes),
                    self_assessments = COALESCE(?::jsonb, user_listening_progress.self_assessments),
                    status = EXCLUDED.status,
                    last_question_index = EXCLUDED.last_question_index,
                    updated_at = now()
                """;

        String status = normalizeDbStatus(req.status(), req.completedQuestions(), req.totalQuestions());
        String answeredJson = req.answeredQuestionIds() != null ? toJson(req.answeredQuestionIds()) : null;
        String wrongJson = req.wrongQuestionIds() != null ? toJson(req.wrongQuestionIds()) : null;
        String flaggedJson = req.flaggedQuestionIds() != null ? toJson(req.flaggedQuestionIds()) : null;
        String notesJson = req.userNotes() != null ? toJsonObject(req.userNotes()) : null;
        String selfJson = req.selfAssessments() != null ? toJsonObject(req.selfAssessments()) : null;

        jdbc.update(upsert,
                userId,
                req.cardId(),
                Math.max(0, req.completedQuestions()),
                Math.max(0, req.totalQuestions()),
                req.correctCount(),
                req.wrongCount(),
                answeredJson,
                wrongJson,
                flaggedJson,
                notesJson,
                selfJson,
                status,
                Math.max(0, req.lastQuestionIndex()),
                req.correctCount(),
                req.wrongCount(),
                answeredJson,
                wrongJson,
                flaggedJson,
                notesJson,
                selfJson);
    }

    @Transactional
    public void saveUnitProgress(UUID userId, SaveListeningUnitProgressRequest req) {
        if (userId == null || req == null || isBlank(req.unitId())) return;

        String upsert = """
                INSERT INTO user_listening_unit_progress
                    (user_id, unit_id, completed_questions, total_questions, correct_count, wrong_count,
                     wrong_question_ids, answered_question_ids, flagged_question_ids, user_notes,
                     status, last_question_index, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb,
                        COALESCE(?::jsonb, '[]'::jsonb), COALESCE(?::jsonb, '{}'::jsonb),
                        ?, ?, now())
                ON CONFLICT (user_id, unit_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    correct_count = EXCLUDED.correct_count,
                    wrong_count = EXCLUDED.wrong_count,
                    wrong_question_ids = EXCLUDED.wrong_question_ids,
                    answered_question_ids = EXCLUDED.answered_question_ids,
                    flagged_question_ids = COALESCE(?::jsonb, user_listening_unit_progress.flagged_question_ids),
                    user_notes = COALESCE(?::jsonb, user_listening_unit_progress.user_notes),
                    status = EXCLUDED.status,
                    last_question_index = EXCLUDED.last_question_index,
                    updated_at = now()
                """;

        String status = normalizeDbStatus(req.status(), req.completedQuestions(), req.totalQuestions());
        String flaggedJson = req.flaggedQuestionIds() != null ? toJson(req.flaggedQuestionIds()) : null;
        String notesJson = req.userNotes() != null ? toJsonObject(req.userNotes()) : null;

        jdbc.update(upsert,
                userId,
                req.unitId(),
                Math.max(0, req.completedQuestions()),
                Math.max(0, req.totalQuestions()),
                Math.max(0, req.correctCount()),
                Math.max(0, req.wrongCount()),
                toJson(req.wrongQuestionIds()),
                toJson(req.answeredQuestionIds()),
                flaggedJson,
                notesJson,
                status,
                Math.max(0, req.lastQuestionIndex()),
                flaggedJson,
                notesJson);
    }

    @Transactional
    public ListeningAttemptRecord recordAttempt(UUID userId, SaveListeningAttemptRequest req) {
        if (userId == null || req == null || isBlank(req.targetId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin lịch sử làm bài chưa hợp lệ.");
        }
        String targetType = "UNIT".equalsIgnoreCase(req.targetType()) ? "UNIT" : "DICTATION";
        String targetTitle = valueOrEmpty(req.targetTitle()).trim();
        String part = canonicalPartLabel(req.part());
        String mode = isBlank(req.mode()) ? "PRACTICE" : req.mode().trim().toUpperCase(Locale.ROOT);
        int totalQ = Math.max(0, req.totalQuestions());
        int completedQ = Math.max(0, req.completedQuestions());
        int correct = Math.max(0, req.correctCount());
        int wrong = Math.max(0, req.wrongCount());
        int denom = Math.max(1, completedQ > 0 ? completedQ : (correct + wrong));
        int accuracy = (correct + wrong) > 0 ? Math.min(100, Math.round((correct * 100f) / denom)) : 0;
        int durationSec = Math.max(0, req.durationSeconds());
        int xpEarned = req.xpEarned() > 0 ? req.xpEarned() : correct * 10;
        String detailsJson = toJsonObject(req.details());

        Long insertedId = jdbc.queryForObject("""
                INSERT INTO user_listening_attempts
                    (user_id, target_type, target_id, target_title, part, mode,
                     total_questions, completed_questions, correct_count, wrong_count,
                     accuracy_percent, duration_seconds, xp_earned, details, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, now())
                RETURNING id
                """, Long.class,
                userId, targetType, req.targetId().trim(), targetTitle, part, mode,
                totalQ, completedQ, correct, wrong, accuracy, durationSec, xpEarned, detailsJson);

        return new ListeningAttemptRecord(
                insertedId != null ? insertedId : 0L,
                targetType,
                req.targetId().trim(),
                targetTitle,
                part,
                mode,
                totalQ,
                completedQ,
                correct,
                wrong,
                accuracy,
                durationSec,
                xpEarned,
                req.details() != null ? req.details() : Collections.emptyMap(),
                java.time.Instant.now()
        );
    }

    public List<ListeningAttemptRecord> listAttempts(UUID userId, String targetId, int limit) {
        if (userId == null) return Collections.emptyList();
        int safeLimit = Math.max(1, Math.min(100, limit));
        boolean filterTarget = targetId != null && !targetId.isBlank();
        String sql = """
                SELECT id, target_type, target_id, target_title, part, mode,
                       total_questions, completed_questions, correct_count, wrong_count,
                       accuracy_percent, duration_seconds, xp_earned,
                       details::text AS details_json, created_at
                FROM user_listening_attempts
                WHERE user_id = ?
                """ + (filterTarget ? " AND target_id = ?\n" : "") + """
                ORDER BY created_at DESC
                LIMIT ?
                """;
        Object[] args = filterTarget
                ? new Object[] { userId, targetId.trim(), safeLimit }
                : new Object[] { userId, safeLimit };
        return jdbc.query(sql, (rs, rowNum) -> new ListeningAttemptRecord(
                rs.getLong("id"),
                rs.getString("target_type"),
                rs.getString("target_id"),
                rs.getString("target_title"),
                canonicalPartLabel(rs.getString("part")),
                rs.getString("mode"),
                rs.getInt("total_questions"),
                rs.getInt("completed_questions"),
                rs.getInt("correct_count"),
                rs.getInt("wrong_count"),
                rs.getInt("accuracy_percent"),
                rs.getInt("duration_seconds"),
                rs.getInt("xp_earned"),
                parseObjectMap(rs.getString("details_json")),
                rs.getTimestamp("created_at").toInstant()
        ), args);
    }

    public static double computeBktMastery(int correctCount, int wrongCount) {
        double pL = 0.35; // Initial mastery prior P(L0)
        final double pT = 0.08; // Learning transition P(T)
        final double pS = 0.10; // Slip probability P(S)
        final double pG = 0.25; // Guess probability P(G)

        int total = Math.min(60, Math.max(0, correctCount + wrongCount));
        if (total == 0) return 0.0;

        double ratio = (double) correctCount / (correctCount + wrongCount);
        int simulatedCorrect = (int) Math.round(ratio * total);
        int simulatedWrong = total - simulatedCorrect;

        // Process sequentially or evenly
        int cRem = simulatedCorrect;
        int wRem = simulatedWrong;
        for (int step = 0; step < total; step++) {
            boolean isCorrectObs;
            if (cRem > 0 && wRem > 0) {
                // Distribute observations based on proportions
                if ((double) cRem / (cRem + wRem) >= 0.5) {
                    isCorrectObs = true;
                    cRem--;
                } else {
                    isCorrectObs = false;
                    wRem--;
                }
            } else if (cRem > 0) {
                isCorrectObs = true;
                cRem--;
            } else {
                isCorrectObs = false;
                wRem--;
            }

            double pObsGivenL = isCorrectObs ? (1.0 - pS) : pS;
            double pObsGivenNotL = isCorrectObs ? pG : (1.0 - pG);
            double denom = (pL * pObsGivenL) + ((1.0 - pL) * pObsGivenNotL);
            double pLPosterior = denom > 0 ? (pL * pObsGivenL) / denom : pL;
            // Learning transition only applies after correct or limited transition
            pL = pLPosterior + (1.0 - pLPosterior) * (isCorrectObs ? pT : pT * 0.2);
        }
        return Math.round(Math.min(0.99, Math.max(0.05, pL)) * 1000.0) / 10.0; // 0..99.0%
    }

    public static int estimateToeicListeningScore(int accuracyPercent, int totalAnswered) {
        if (totalAnswered <= 0) return 0;
        double confidenceWeight = Math.min(1.0, 0.55 + (Math.min(100, totalAnswered) / 100.0) * 0.45);
        int rawScaled = (int) Math.round(5 + (accuracyPercent / 100.0) * 490 * confidenceWeight);
        int roundedToFive = Math.round(rawScaled / 5.0f) * 5;
        return Math.max(5, Math.min(495, roundedToFive));
    }

    public ListeningAnalyticsSummary getStudentAnalyticsAndRecommendations(UUID userId) {
        List<String> parts = List.of("Part 1", "Part 2", "Part 3", "Part 4");
        Map<String, int[]> partCounts = new LinkedHashMap<>();
        for (String p : parts) {
            partCounts.put(p, new int[] { 0, 0, 0 }); // [answered, correct, wrong]
        }

        int totalAttempts = 0;
        int realExamAttempts = 0;
        int totalDurationSeconds = 0;
        int totalXpEarned = 0;
        List<ListeningRecommendationItem> recommendations = new ArrayList<>();

        if (userId != null) {
            List<ListeningAttemptRecord> recentAttempts = listAttempts(userId, null, 100);
            totalAttempts = recentAttempts.size();
            for (ListeningAttemptRecord att : recentAttempts) {
                if ("REAL_EXAM".equalsIgnoreCase(att.mode())) {
                    realExamAttempts++;
                }
                totalDurationSeconds += Math.max(0, att.durationSeconds());
                totalXpEarned += Math.max(0, att.xpEarned());
                String p = canonicalPartLabel(att.part());
                int[] counts = partCounts.computeIfAbsent(p, k -> new int[] { 0, 0, 0 });
                counts[0] += Math.max(att.completedQuestions(), att.correctCount() + att.wrongCount());
                counts[1] += Math.max(0, att.correctCount());
                counts[2] += Math.max(0, att.wrongCount());
            }

            // Merge unit progress so even users whose progress was saved before attempts table have full stats
            List<ListeningUnit> unitsWithProg = listUnits(userId);
            for (ListeningUnit u : unitsWithProg) {
                String p = canonicalPartLabel(u.part());
                int[] counts = partCounts.computeIfAbsent(p, k -> new int[] { 0, 0, 0 });
                if (counts[0] < u.completedQuestions()) {
                    counts[0] = u.completedQuestions();
                    counts[1] = Math.max(counts[1], u.correctCount());
                    counts[2] = Math.max(counts[2], u.wrongCount());
                }
                if (u.wrongCount() > 0 && recommendations.size() < 5) {
                    recommendations.add(new ListeningRecommendationItem(
                            "redo-unit-" + u.id(),
                            p,
                            "UNIT",
                            u.id(),
                            "Làm lại " + u.wrongCount() + " câu sai: " + u.title(),
                            "Bạn có " + u.wrongCount() + " câu trả lời sai trong chủ điểm " + u.title() + " (" + p + "). Ôn tập lại ngay để khắc phục lỗ hổng.",
                            "HIGH",
                            "REDO_WRONG",
                            u.wrongCount()
                    ));
                }
            }

            List<ListeningDictationCard> cardsWithProg = listCards(userId);
            for (ListeningDictationCard c : cardsWithProg) {
                String p = canonicalPartLabel(c.part());
                int[] counts = partCounts.computeIfAbsent(p, k -> new int[] { 0, 0, 0 });
                if (counts[0] == 0 && c.completedQuestions() > 0) {
                    counts[0] += c.completedQuestions();
                    counts[1] += c.correctCount() > 0 ? c.correctCount() : c.completedQuestions();
                    counts[2] += c.wrongCount();
                }
                if (c.wrongCount() > 0 && recommendations.size() < 5) {
                    String cardTitle = (c.title() != null && !c.title().isBlank())
                            ? c.title()
                            : ("Test " + c.testNumber() + " - " + p);
                    recommendations.add(new ListeningRecommendationItem(
                            "redo-dictation-" + c.id(),
                            p,
                            "DICTATION",
                            c.id(),
                            "Chép lại " + c.wrongCount() + " câu chưa chuẩn: " + cardTitle,
                            "Cải thiện khả năng bắt âm nối và từ khóa qua chế độ Chia câu Timestamp.",
                            "HIGH",
                            "DICTATION",
                            c.wrongCount()
                    ));
                }
            }
        }

        List<PartMasteryStat> partMastery = new ArrayList<>();
        int grandAnswered = 0;
        int grandCorrect = 0;
        int grandWrong = 0;
        PartMasteryStat weakestPart = null;

        for (String p : parts) {
            int[] c = partCounts.getOrDefault(p, new int[] { 0, 0, 0 });
            int ans = Math.max(c[0], c[1] + c[2]);
            int cor = c[1];
            int wrg = c[2];
            grandAnswered += ans;
            grandCorrect += cor;
            grandWrong += wrg;

            int acc = ans > 0 ? Math.min(100, Math.round((cor * 100f) / ans)) : 0;
            double bkt = computeBktMastery(cor, wrg);
            String level = ans == 0 ? "NOT_STARTED" : (bkt >= 78.0 ? "MASTERED" : (bkt >= 52.0 ? "DEVELOPING" : "WEAK"));
            PartMasteryStat stat = new PartMasteryStat(p, ans, cor, wrg, acc, bkt, level);
            partMastery.add(stat);

            if (weakestPart == null || (ans > 0 && stat.bktMasteryProbability() < weakestPart.bktMasteryProbability())
                    || (weakestPart.answeredCount() > 0 && ans == 0)) {
                weakestPart = stat;
            }
        }

        int overallAccuracy = grandAnswered > 0 ? Math.min(100, Math.round((grandCorrect * 100f) / grandAnswered)) : 0;
        int estimatedScore = estimateToeicListeningScore(overallAccuracy, grandAnswered);

        if (weakestPart != null && recommendations.size() < 5) {
            String targetPart = weakestPart.part();
            String reason = weakestPart.answeredCount() == 0
                    ? ("Bạn chưa có lượt luyện tập nào ở " + targetPart + ". Hãy bắt đầu ngay để hệ thống BKT đánh giá năng lực.")
                    : ("Độ thông thạo BKT ở " + targetPart + " hiện đạt " + weakestPart.bktMasteryProbability() + "% (Độ chính xác " + weakestPart.accuracyPercent() + "%). Nên ưu tiên luyện thêm chủ điểm này.");
            recommendations.add(new ListeningRecommendationItem(
                    "bkt-focus-" + targetPart.toLowerCase(Locale.ROOT).replace(" ", ""),
                    targetPart,
                    "UNIT",
                    "",
                    "Trọng tâm cải thiện " + targetPart + " theo mô hình BKT",
                    reason,
                    "MEDIUM",
                    "PRACTICE",
                    weakestPart.wrongCount()
            ));
        }

        if (realExamAttempts == 0 || (overallAccuracy >= 65 && recommendations.size() < 5)) {
            recommendations.add(new ListeningRecommendationItem(
                    "real-exam-challenge",
                    weakestPart != null ? weakestPart.part() : "Part 1",
                    "UNIT",
                    "",
                    "Thử sức Chế độ Thi thật (Real Exam Mode)",
                    "Audio chỉ phát 1 lần không tua lại, không lộ đáp án giữa chừng giúp rèn tâm lý phòng thi TOEIC thực tế.",
                    realExamAttempts == 0 ? "HIGH" : "LOW",
                    "REAL_EXAM",
                    0
            ));
        }

        return new ListeningAnalyticsSummary(
                totalAttempts,
                realExamAttempts,
                grandAnswered,
                grandCorrect,
                grandWrong,
                overallAccuracy,
                estimatedScore,
                totalDurationSeconds,
                totalXpEarned,
                partMastery,
                recommendations
        );
    }

    public AdminListeningAnalyticsSummary getAdminAnalyticsAndRecommendations() {
        Integer activeStudents = jdbc.queryForObject("""
                SELECT COUNT(DISTINCT user_id) FROM (
                    SELECT user_id FROM user_listening_attempts
                    UNION
                    SELECT user_id FROM user_listening_progress WHERE completed_questions > 0
                    UNION
                    SELECT user_id FROM user_listening_unit_progress WHERE completed_questions > 0
                ) u
                """, Integer.class);

        Integer totalAttempts = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_listening_attempts", Integer.class);
        Integer realExamAttempts = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_listening_attempts WHERE upper(mode) = 'REAL_EXAM'", Integer.class);
        Integer dictationAttempts = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_listening_attempts WHERE target_type = 'DICTATION'", Integer.class);
        Integer totalDurationSec = jdbc.queryForObject(
                "SELECT COALESCE(SUM(duration_seconds), 0) FROM user_listening_attempts", Integer.class);

        List<String> parts = List.of("Part 1", "Part 2", "Part 3", "Part 4");
        Map<String, int[]> partCounts = new LinkedHashMap<>();
        for (String p : parts) {
            partCounts.put(p, new int[] { 0, 0, 0 });
        }

        jdbc.query("""
                SELECT part,
                       COALESCE(SUM(completed_questions), 0) AS ans,
                       COALESCE(SUM(correct_count), 0) AS cor,
                       COALESCE(SUM(wrong_count), 0) AS wrg
                FROM user_listening_attempts
                GROUP BY part
                """, rs -> {
            String p = canonicalPartLabel(rs.getString("part"));
            int[] c = partCounts.computeIfAbsent(p, k -> new int[] { 0, 0, 0 });
            c[0] += rs.getInt("ans");
            c[1] += rs.getInt("cor");
            c[2] += rs.getInt("wrg");
        });

        List<PartMasteryStat> partBreakdown = new ArrayList<>();
        int grandAns = 0;
        int grandCor = 0;
        int grandWrg = 0;

        for (String p : parts) {
            int[] c = partCounts.getOrDefault(p, new int[] { 0, 0, 0 });
            int ans = Math.max(c[0], c[1] + c[2]);
            int cor = c[1];
            int wrg = c[2];
            grandAns += ans;
            grandCor += cor;
            grandWrg += wrg;
            int acc = ans > 0 ? Math.min(100, Math.round((cor * 100f) / ans)) : 0;
            double bkt = computeBktMastery(cor, wrg);
            String lvl = ans == 0 ? "NOT_STARTED" : (bkt >= 78.0 ? "MASTERED" : (bkt >= 52.0 ? "DEVELOPING" : "WEAK"));
            partBreakdown.add(new PartMasteryStat(p, ans, cor, wrg, acc, bkt, lvl));
        }

        int overallAcc = grandAns > 0 ? Math.min(100, Math.round((grandCor * 100f) / grandAns)) : 0;
        int avgScore = estimateToeicListeningScore(overallAcc, grandAns);

        List<ListeningRecommendationItem> systemRecs = new ArrayList<>();
        for (PartMasteryStat st : partBreakdown) {
            if (st.answeredCount() > 0 && st.accuracyPercent() < 70) {
                systemRecs.add(new ListeningRecommendationItem(
                        "admin-bkt-" + st.part(),
                        st.part(),
                        "UNIT",
                        "",
                        "Học viên toàn hệ thống đang gặp khó khăn ở " + st.part() + " (" + st.accuracyPercent() + "% đúng)",
                        "Độ thông thạo BKT trung bình đạt " + st.bktMasteryProbability() + "%. Khuyến nghị bổ sung thêm bài luyện theo dạng bẫy và bài nghe chép chia câu.",
                        "HIGH",
                        "PRACTICE",
                        st.wrongCount()
                ));
            }
        }
        if (systemRecs.isEmpty()) {
            systemRecs.add(new ListeningRecommendationItem(
                    "admin-bkt-ready",
                    "Part 3",
                    "UNIT",
                    "",
                    "Mô hình BKT & Recommendation Engine đang hoạt động trực tuyến",
                    "Tự động phân tích từng lượt nộp bài (Luyện tập, Nghe chép, Thi thật) để cá nhân hóa lộ trình học cho từng học viên.",
                    "MEDIUM",
                    "REAL_EXAM",
                    0
            ));
        }

        return new AdminListeningAnalyticsSummary(
                activeStudents != null ? activeStudents : 0,
                totalAttempts != null ? totalAttempts : 0,
                realExamAttempts != null ? realExamAttempts : 0,
                dictationAttempts != null ? dictationAttempts : 0,
                grandAns,
                grandCor,
                grandWrg,
                overallAcc,
                avgScore,
                Math.round((totalDurationSec != null ? totalDurationSec : 0) / 60f),
                partBreakdown,
                systemRecs
        );
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

    private List<Object> parseObjectList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> parseObjectMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public record ListeningCardRequest(String title, int testNumber, String part, String year, int totalQuestions,
            String audioUrl, String fullTranscript, String vietnameseTranslation,
            List<Map<String, Object>> questions, String contentStatus) {
        public ListeningCardRequest(String title, int testNumber, String part, String year, int totalQuestions,
                String audioUrl, String fullTranscript, String vietnameseTranslation) {
            this(title, testNumber, part, year, totalQuestions, audioUrl, fullTranscript, vietnameseTranslation, null, "PUBLISHED");
        }

        public ListeningCardRequest(String title, int testNumber, String part, String year, int totalQuestions,
                String audioUrl, String fullTranscript, String vietnameseTranslation,
                List<Map<String, Object>> questions) {
            this(title, testNumber, part, year, totalQuestions, audioUrl, fullTranscript, vietnameseTranslation, questions, "PUBLISHED");
        }
    }

    public record ListeningUnitRequest(String part, String type, String title, String targetLevel,
            int totalQuestions, String theorySummary, List<String> rules,
            List<Map<String, Object>> vocabBag, List<Map<String, Object>> questions, String contentStatus) {
        public ListeningUnitRequest(String part, String type, String title, String targetLevel,
                int totalQuestions, String theorySummary, List<String> rules,
                List<Map<String, Object>> vocabBag, List<Map<String, Object>> questions) {
            this(part, type, title, targetLevel, totalQuestions, theorySummary, rules, vocabBag, questions, "PUBLISHED");
        }
    }

    public record ListeningUnit(String id, String part, String type, String title, String targetLevel,
            int totalQuestions, int completedQuestions, int correctCount, int wrongCount, String status,
            String theorySummary, List<String> rules, List<Map<String, Object>> vocabBag,
            List<Map<String, Object>> questions, String contentStatus,
            List<Object> answeredQuestionIds, List<Object> wrongQuestionIds,
            List<Object> flaggedQuestionIds, Map<String, String> userNotes,
            int lastQuestionIndex) {
        public ListeningUnit(String id, String part, String type, String title, String targetLevel,
                int totalQuestions, int completedQuestions, int correctCount, int wrongCount, String status,
                String theorySummary, List<String> rules, List<Map<String, Object>> vocabBag,
                List<Map<String, Object>> questions, String contentStatus) {
            this(id, part, type, title, targetLevel, totalQuestions, completedQuestions, correctCount, wrongCount,
                    status, theorySummary, rules, vocabBag, questions, contentStatus,
                    Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections.emptyMap(), 0);
        }
    }

    public record SaveListeningUnitProgressRequest(
            String unitId,
            int completedQuestions,
            int totalQuestions,
            int correctCount,
            int wrongCount,
            List<Object> wrongQuestionIds,
            List<Object> answeredQuestionIds,
            List<Object> flaggedQuestionIds,
            Map<String, String> userNotes,
            String status,
            int lastQuestionIndex
    ) {
        public SaveListeningUnitProgressRequest(
                String unitId,
                int completedQuestions,
                int totalQuestions,
                int correctCount,
                int wrongCount,
                List<Object> wrongQuestionIds,
                List<Object> answeredQuestionIds,
                String status,
                int lastQuestionIndex
        ) {
            this(unitId, completedQuestions, totalQuestions, correctCount, wrongCount,
                    wrongQuestionIds, answeredQuestionIds, null, null, status, lastQuestionIndex);
        }
    }

    public record SaveListeningAttemptRequest(
            String targetType,
            String targetId,
            String targetTitle,
            String part,
            String mode,
            int totalQuestions,
            int completedQuestions,
            int correctCount,
            int wrongCount,
            int durationSeconds,
            int xpEarned,
            Map<String, Object> details
    ) {}

    public record ListeningAttemptRecord(
            long id,
            String targetType,
            String targetId,
            String targetTitle,
            String part,
            String mode,
            int totalQuestions,
            int completedQuestions,
            int correctCount,
            int wrongCount,
            int accuracyPercent,
            int durationSeconds,
            int xpEarned,
            Map<String, Object> details,
            java.time.Instant createdAt
    ) {}

    public record PartMasteryStat(
            String part,
            int answeredCount,
            int correctCount,
            int wrongCount,
            int accuracyPercent,
            double bktMasteryProbability,
            String proficiencyLevel
    ) {}

    public record ListeningRecommendationItem(
            String id,
            String part,
            String targetType,
            String targetId,
            String title,
            String reason,
            String priority,
            String recommendedMode,
            int wrongCount
    ) {}

    public record ListeningAnalyticsSummary(
            int totalAttempts,
            int realExamAttempts,
            int totalQuestionsAnswered,
            int totalCorrect,
            int totalWrong,
            int overallAccuracyPercent,
            int estimatedListeningScore,
            int totalDurationSeconds,
            int totalXpEarned,
            List<PartMasteryStat> partMastery,
            List<ListeningRecommendationItem> recommendations
    ) {}

    public record AdminListeningAnalyticsSummary(
            int activeListeningStudents,
            int totalAttempts,
            int realExamAttempts,
            int dictationAttempts,
            int totalQuestionsAnswered,
            int totalCorrect,
            int totalWrong,
            int overallAccuracyPercent,
            int averageEstimatedListeningScore,
            int totalStudyMinutes,
            List<PartMasteryStat> partBreakdown,
            List<ListeningRecommendationItem> bktRecommendations
    ) {}
}
