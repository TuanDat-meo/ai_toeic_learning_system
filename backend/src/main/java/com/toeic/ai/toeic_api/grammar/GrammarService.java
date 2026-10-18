package com.toeic.ai.toeic_api.grammar;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GrammarService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GrammarService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<GrammarTopic> listTopics(UUID userId) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       g.examples::text AS examples,
                       g.questions::text AS questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                ORDER BY g.order_index ASC, g.id ASC
                """;

        return jdbc.query(sql, this::mapTopicFull, userId);
    }

    public GrammarTopic getTopic(String topicId, UUID userId) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       g.examples::text AS examples,
                       g.questions::text AS questions,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                WHERE g.id = ?
                """;

        List<GrammarTopic> topics = jdbc.query(sql, this::mapTopicFull, userId, topicId);
        if (topics.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm ngữ pháp: " + topicId);
        }
        return topics.get(0);
    }

    @Transactional
    public GrammarTopic createTopic(CreateGrammarTopicRequest req) {
        String title = req.titleVi() != null && !req.titleVi().isBlank() ? req.titleVi()
                : (req.title() != null && !req.title().isBlank() ? req.title() : "Chủ điểm ngữ pháp");
        String englishTitle = req.titleEn() != null && !req.titleEn().isBlank() ? req.titleEn()
                : (req.englishTitle() != null && !req.englishTitle().isBlank() ? req.englishTitle() : title);
        String code = req.code() != null && !req.code().isBlank() ? req.code().trim()
                : generateTopicCode(title);
        String part = req.part() != null && !req.part().isBlank() ? formatPart(req.part()) : "Part 5";
        String targetScore = req.targetScore() != null && !req.targetScore().isBlank() ? req.targetScore() : "350-500";
        String status = req.status() != null && !req.status().isBlank() ? req.status() : "DRAFT";
        String summary = req.summary() != null ? req.summary() : "";
        String formula = req.formula() != null ? req.formula() : "";
        String signalWords = toJsonString(req.signalWords() != null ? req.signalWords() : List.of());
        String traps = toJsonString(req.traps() != null ? req.traps() : List.of());
        String examples = toJsonString(req.examples() != null ? req.examples() : List.of());
        String questions = toJsonString(req.questions() != null ? req.questions() : List.of());

        String id = "g-" + System.currentTimeMillis();
        Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM grammar_topics", Integer.class);
        int orderIndex = req.orderIndex() != null ? req.orderIndex() : (maxOrder != null ? maxOrder : 0);

        String insertSql = """
                INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, ?, now(), now())
                """;
        jdbc.update(insertSql, id, code, title, englishTitle, part, targetScore, status, summary, formula,
                signalWords, traps, examples, questions, orderIndex);

        return getTopic(id, null);
    }

    @Transactional
    public GrammarTopic updateTopic(String id, UpdateGrammarTopicRequest req) {
        String title = req.titleVi() != null && !req.titleVi().isBlank() ? req.titleVi()
                : (req.title() != null ? req.title() : "");
        String englishTitle = req.titleEn() != null && !req.titleEn().isBlank() ? req.titleEn()
                : (req.englishTitle() != null ? req.englishTitle() : title);
        String code = req.code() != null ? req.code().trim() : "";
        String part = req.part() != null ? formatPart(req.part()) : "Part 5";
        String targetScore = req.targetScore() != null ? req.targetScore() : "350-500";
        String status = req.status() != null ? req.status() : "PUBLISHED";
        String summary = req.summary() != null ? req.summary() : "";
        String formula = req.formula() != null ? req.formula() : "";
        String signalWords = toJsonString(req.signalWords() != null ? req.signalWords() : List.of());
        String traps = toJsonString(req.traps() != null ? req.traps() : List.of());
        String examples = toJsonString(req.examples() != null ? req.examples() : List.of());

        String updateSql = """
                UPDATE grammar_topics SET
                    title = CASE WHEN ? != '' THEN ? ELSE title END,
                    english_title = CASE WHEN ? != '' THEN ? ELSE english_title END,
                    code = CASE WHEN ? != '' THEN ? ELSE code END,
                    part = ?,
                    target_score = ?,
                    status = ?,
                    summary = ?,
                    formula = ?,
                    signal_words = ?::jsonb,
                    traps = ?::jsonb,
                    examples = ?::jsonb,
                    updated_at = now()
                WHERE id = ?
                """;
        int rows = jdbc.update(updateSql, title, title, englishTitle, englishTitle, code, code,
                part, targetScore, status, summary, formula, signalWords, traps, examples, id);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
        return getTopic(id, null);
    }

    @Transactional
    public void deleteTopic(String id) {
        int rows = jdbc.update("DELETE FROM grammar_topics WHERE id = ?", id);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
    }

    @Transactional
    public GrammarTopic addQuestion(String topicId, Map<String, Object> question) {
        GrammarTopic topic = getTopic(topicId, null);
        List<Map<String, Object>> currentQuestions = new ArrayList<>(topic.questions());
        if (!question.containsKey("id") || question.get("id") == null || question.get("id").toString().isBlank()) {
            question.put("id", topicId + "-q" + (currentQuestions.size() + 1));
        }
        currentQuestions.add(question);
        String questionsJson = toJsonString(currentQuestions);

        jdbc.update("UPDATE grammar_topics SET questions = ?::jsonb, updated_at = now() WHERE id = ?", questionsJson, topicId);
        return getTopic(topicId, null);
    }

    @Transactional
    public void bulkUpdateStatus(List<String> ids, String status) {
        if (ids == null || ids.isEmpty()) return;
        for (String id : ids) {
            jdbc.update("UPDATE grammar_topics SET status = ?, updated_at = now() WHERE id = ?", status, id);
        }
    }

    @Transactional
    public void bulkDelete(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        for (String id : ids) {
            jdbc.update("DELETE FROM grammar_topics WHERE id = ?", id);
        }
    }

    @Transactional
    public void saveProgress(UUID userId, String topicId, int completed, int total, String status) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_grammar_progress (user_id, topic_id, completed_questions, total_questions, status, updated_at)
                VALUES (?, ?, ?, ?, ?, now())
                ON CONFLICT (user_id, topic_id) DO UPDATE SET
                    completed_questions = EXCLUDED.completed_questions,
                    total_questions = EXCLUDED.total_questions,
                    status = EXCLUDED.status,
                    updated_at = now()
                """;

        jdbc.update(upsert, userId, topicId, completed, total, status);
    }

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        if (data == null) return;
        String title = data.path("title").asText("").trim();
        if (title.isBlank()) return;

        String englishTitle = data.has("englishTitle") && !data.path("englishTitle").asText("").isBlank()
                ? data.path("englishTitle").asText("").trim()
                : title;
        String rawPart = data.path("part").asText("Part 5").trim();
        String part = formatPart(rawPart);
        String targetScore = data.has("level") && !data.path("level").asText("").isBlank()
                ? data.path("level").asText("350-500").trim()
                : "350-500";
        String summary = data.has("explanation") ? data.path("explanation").asText("").trim() : "";
        String formula = data.has("rule") ? data.path("rule").asText("").trim() : "";

        String code = data.has("code") && !data.path("code").asText("").isBlank()
                ? data.path("code").asText("").trim()
                : generateTopicCode(title);

        String signalWords = serializeJsonArray(data.get("signalWords"));
        String traps = serializeJsonArray(data.get("traps"));
        String examples = formatExamples(data.get("examples"));
        String questions = data.has("questions") && data.get("questions").isArray()
                ? data.get("questions").toString()
                : "[]";

        List<String> existing = jdbc.query(
                "SELECT id FROM grammar_topics WHERE code = ? OR LOWER(title) = LOWER(?) LIMIT 1",
                (rs, rowNum) -> rs.getString("id"),
                code, title);

        if (!existing.isEmpty()) {
            String topicId = existing.get(0);
            String updateSql = """
                    UPDATE grammar_topics SET
                        title = ?,
                        english_title = COALESCE(?, english_title),
                        part = ?,
                        target_score = ?,
                        status = 'PUBLISHED',
                        summary = ?,
                        formula = ?,
                        signal_words = ?::jsonb,
                        traps = ?::jsonb,
                        examples = ?::jsonb,
                        questions = CASE WHEN ?::jsonb != '[]'::jsonb THEN ?::jsonb ELSE questions END,
                        updated_at = now()
                    WHERE id = ?
                    """;
            jdbc.update(updateSql, title, englishTitle, part, targetScore, summary, formula,
                    signalWords, traps, examples, questions, questions, topicId);
        } else {
            String topicId = "g-" + slugify(code) + "-" + UUID.randomUUID().toString().substring(0, 8);
            Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM grammar_topics", Integer.class);
            int orderIndex = maxOrder != null ? maxOrder : 0;

            String insertSql = """
                    INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, ?, now(), now())
                    """;
            jdbc.update(insertSql, topicId, code, title, englishTitle, part, targetScore, summary, formula,
                    signalWords, traps, examples, questions, orderIndex);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM grammar_topics", Integer.class);
        if (count == null || count == 0) {
            String signals = "[\"career experiences\", \"own\", \"by oneself\", \"on one's own\", \"colleagues\"]";
            String traps = "[\"Bẫy chọn đại từ tân ngữ (him/them) thay vì tính từ sở hữu (his/their)\", \"Bẫy đại từ phản thân: by himself = on his own\"]";
            String examples = "[{\"sentence\":\"Former Sendai Company CEO Ken Nakata spoke about his career experiences.\",\"translation\":\"Cựu CEO Ken Nakata đã nói về những trải nghiệm nghề nghiệp của mình.\",\"analysis\":\"Đứng trước danh từ career experiences bắt buộc dùng his.\"}]";
            String questions = "[{\"id\":\"pro24-q1\",\"part\":\"Part 5\",\"questionText\":\"Former Sendai Company CEO Ken Nakata spoke about _______ career experiences at the international business conference.\",\"options\":{\"A\":\"he\",\"B\":\"his\",\"C\":\"him\",\"D\":\"himself\"},\"correctAnswer\":\"B\",\"explanation\":\"Cụm career experiences cần tính từ sở hữu his đứng trước bổ nghĩa.\",\"trapNote\":\"Tránh chọn him vì sau giới từ có danh từ đi kèm.\",\"translation\":\"Cựu CEO Ken Nakata nói về trải nghiệm của mình.\",\"difficulty\":\"350-500\"},{\"id\":\"pro24-q2\",\"part\":\"Part 5\",\"questionText\":\"Board members reviewed the quarterly expenditure report and compared _______ with the projected annual figures.\",\"options\":{\"A\":\"it\",\"B\":\"its\",\"C\":\"itself\",\"D\":\"they\"},\"correctAnswer\":\"A\",\"explanation\":\"Chỗ trống cần một đại từ tân ngữ it để thay thế cho expenditure report.\",\"trapNote\":\"Không chọn its vì không có danh từ theo sau.\",\"translation\":\"Hội đồng quản trị xem xét báo cáo chi tiêu và so sánh nó với số liệu dự kiến.\",\"difficulty\":\"350-500\"}]";

            jdbc.update("""
                    INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index)
                    VALUES ('g-pronouns-2024', 'PRO-2024', 'Đại Từ & Tính Từ Sở Hữu (ETS 2024)', 'Pronouns & Possessive Forms in ETS 2024',
                        'Part 5', '350-500', 'PUBLISHED',
                        'Nhóm câu hỏi xuất hiện liên tục trong đề thi ETS 2024 kiểm tra chức năng chủ ngữ, tân ngữ, tính từ sở hữu và đại từ phản thân.',
                        'S + V + O | Tính từ sở hữu + Noun | by + myself/himself',
                        ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, 0)
                    """, signals, traps, examples, questions);

            String signalsTenses = "[\"already\", \"recently\", \"since\", \"for the past 3 years\", \"next week\"]";
            String trapsTenses = "[\"Nhầm thì hiện tại hoàn thành với quá khứ đơn khi có mốc thời gian cụ thể (in 2020)\"]";
            String examplesTenses = "[{\"sentence\":\"The committee has reviewed all incoming grant proposals.\",\"translation\":\"Hội đồng đã xem xét tất cả đề xuất tài trợ.\",\"analysis\":\"Diễn tả hành động đã hoàn thành tính đến thời điểm hiện tại.\"}]";
            String questionsTenses = "[{\"id\":\"tenses-q1\",\"part\":\"Part 5\",\"questionText\":\"The quality control team _______ all manufactured components before dispatching them to clients.\",\"options\":{\"A\":\"inspects\",\"B\":\"inspecting\",\"C\":\"inspection\",\"D\":\"to inspect\"},\"correctAnswer\":\"A\",\"explanation\":\"Câu thiếu động từ chính chia theo chủ ngữ số ít quality control team.\",\"trapNote\":\"Không chọn inspecting vì thiếu to be.\",\"translation\":\"Đội kiểm tra chất lượng kiểm tra các bộ phận trước khi gửi.\",\"difficulty\":\"450-650\"}]";

            jdbc.update("""
                    INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index)
                    VALUES ('g-tenses-2024', 'TENSES-2024', 'Các Thì Cơ Bản & Phối Hợp Thì Trong TOEIC', 'Verb Tenses in TOEIC',
                        'Part 5', '450-650', 'PUBLISHED',
                        'Nắm vững 6 thì trọng tâm hay xuất hiện nhất trong bài thi TOEIC Part 5 & 6.',
                        'Present Simple, Past Simple, Present Perfect, Future Simple',
                        ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, 1)
                    """, signalsTenses, trapsTenses, examplesTenses, questionsTenses);
        }

        // Also sync any published GRAMMAR rows from imported_content
        try {
            List<String> publishedJson = jdbc.query(
                    "SELECT payload_json::text FROM imported_content WHERE content_type = 'GRAMMAR'",
                    (rs, rowNum) -> rs.getString(1));
            for (String json : publishedJson) {
                try {
                    JsonNode node = objectMapper.readTree(json);
                    syncFromImportItem(node);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}
    }

    private GrammarTopic mapTopicFull(ResultSet rs, int rowNum) throws SQLException {
        return new GrammarTopic(
                rs.getString("id"),
                rs.getString("code"),
                rs.getString("title"),
                rs.getString("english_title"),
                rs.getString("part"),
                rs.getString("target_score"),
                rs.getString("status"),
                rs.getString("summary"),
                rs.getString("formula"),
                parseStringList(rs.getString("signal_words")),
                parseStringList(rs.getString("traps")),
                parseMapList(rs.getString("examples")),
                parseMapList(rs.getString("questions")),
                rs.getInt("completed_questions"),
                rs.getInt("total_questions"),
                rs.getString("user_status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        );
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> parseMapList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String toJsonString(Object obj) {
        if (obj == null) return "[]";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeJsonArray(JsonNode node) {
        if (node == null || node.isNull() || node.isEmpty()) return "[]";
        return node.toString();
    }

    private String formatExamples(JsonNode examplesNode) {
        if (examplesNode == null || examplesNode.isNull() || examplesNode.isEmpty()) {
            return "[]";
        }
        if (examplesNode.isArray()) {
            ArrayNode arr = objectMapper.createArrayNode();
            for (JsonNode item : examplesNode) {
                if (item.isObject()) {
                    arr.add(item);
                } else if (item.isValueNode()) {
                    ObjectNode obj = objectMapper.createObjectNode();
                    obj.put("sentence", item.asText());
                    obj.put("translation", "");
                    obj.put("analysis", "");
                    arr.add(obj);
                }
            }
            return arr.toString();
        }
        return "[]";
    }

    private String formatPart(String part) {
        if (part == null || part.isBlank()) return "Part 5";
        String upper = part.trim().toUpperCase(Locale.ROOT);
        if (upper.startsWith("PART_")) {
            return "Part " + upper.substring(5);
        }
        if (upper.startsWith("PART ")) {
            return "Part " + upper.substring(5);
        }
        return part.trim();
    }

    private String generateTopicCode(String title) {
        String slug = slugify(title).toUpperCase(Locale.ROOT).replace("-", "");
        if (slug.length() > 8) slug = slug.substring(0, 8);
        if (slug.isBlank()) slug = "GT";
        return "GT-" + slug + "-" + (int)(Math.random() * 900 + 100);
    }

    private String slugify(String input) {
        if (input == null) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    public record GrammarTopic(
            String id,
            String code,
            String title,
            String englishTitle,
            String part,
            String targetScore,
            String status,
            String summary,
            String formula,
            List<String> signalWords,
            List<String> traps,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> questions,
            int completedQuestions,
            int totalQuestions,
            String userStatus,
            java.time.Instant createdAt,
            java.time.Instant updatedAt
    ) {}

    public record CreateGrammarTopicRequest(
            String code,
            String titleVi,
            String titleEn,
            String title,
            String englishTitle,
            String part,
            String targetScore,
            String status,
            String summary,
            String formula,
            List<String> signalWords,
            List<String> traps,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> questions,
            Integer orderIndex
    ) {}

    public record UpdateGrammarTopicRequest(
            String code,
            String titleVi,
            String titleEn,
            String title,
            String englishTitle,
            String part,
            String targetScore,
            String status,
            String summary,
            String formula,
            List<String> signalWords,
            List<String> traps,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> questions,
            Integer orderIndex
    ) {}

    public record SaveGrammarProgressRequest(
            String topicId,
            int completedQuestions,
            int totalQuestions,
            String status
    ) {}

    public record BulkStatusRequest(
            List<String> ids,
            String status
    ) {}

    public record BulkDeleteRequest(
            List<String> ids
    ) {}
}
