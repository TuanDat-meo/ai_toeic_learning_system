package com.toeic.ai.toeic_api.grammar;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GrammarOperationsService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GrammarOperationsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public QuestionReport createReport(UUID userId, QuestionReportRequest request) {
        if (request == null || request.questionId().isBlank()) {
            throw badRequest("Thiếu mã câu hỏi.");
        }
        Integer duplicate = jdbc.queryForObject(
                "SELECT count(*) FROM grammar_question_report WHERE reporter_id = ? AND question_id = ?",
                Integer.class, userId, request.questionId());
        if (duplicate != null && duplicate > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã báo lỗi câu hỏi này.");
        }
        jdbc.update("""
                INSERT INTO grammar_question_report(question_id, reporter_id, reason, message)
                VALUES (?, ?, ?, ?)
                """, request.questionId(), userId, request.reason(), request.message());
        Long id = jdbc.queryForObject(
                "SELECT id FROM grammar_question_report WHERE reporter_id = ? AND question_id = ?",
                Long.class, userId, request.questionId());
        audit(userId, "REPORT_QUESTION", "QUESTION", request.questionId(), null,
                Map.of("reason", request.reason()));
        return findReport(id);
    }

    public List<QuestionReport> mineReports(UUID userId) {
        return jdbc.query("""
                SELECT id, question_id, reporter_id, reason, message, status, handled_by,
                       handled_at, created_at
                FROM grammar_question_report WHERE reporter_id = ?
                ORDER BY created_at DESC
                """, (rs, row) -> mapReport(rs), userId);
    }

    public List<QuestionReport> adminReports() {
        return jdbc.query("""
                SELECT id, question_id, reporter_id, reason, message, status, handled_by,
                       handled_at, created_at
                FROM grammar_question_report ORDER BY created_at DESC
                """, (rs, row) -> mapReport(rs));
    }

    @Transactional
    public QuestionReport handleReport(Long id, UUID reviewerId, UpdateReportRequest request) {
        if (request == null || request.status() == null
                || !List.of("NEW", "IN_REVIEW", "FIXED", "REJECTED").contains(request.status())) {
            throw badRequest("Trạng thái báo lỗi không hợp lệ.");
        }
        int updated = jdbc.update("""
                UPDATE grammar_question_report
                SET status = ?, handled_by = ?, handled_at = now()
                WHERE id = ?
                """, request.status(), reviewerId, id);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo lỗi.");
        audit(reviewerId, "HANDLE_REPORT", "QUESTION_REPORT", String.valueOf(id), null,
                Map.of("status", request.status()));
        return findReport(id);
    }

    private QuestionReport findReport(Long id) {
        List<QuestionReport> rows = jdbc.query("""
                SELECT id, question_id, reporter_id, reason, message, status, handled_by,
                       handled_at, created_at
                FROM grammar_question_report WHERE id = ?
                """, (rs, row) -> mapReport(rs), id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo lỗi.");
        return rows.get(0);
    }

    private QuestionReport mapReport(ResultSet rs) throws SQLException {
        return new QuestionReport(
                rs.getLong("id"), rs.getString("question_id"), rs.getObject("reporter_id", UUID.class),
                rs.getString("reason"), rs.getString("message"), rs.getString("status"),
                rs.getObject("handled_by", UUID.class),
                rs.getTimestamp("handled_at") == null ? null : rs.getTimestamp("handled_at").toInstant(),
                rs.getTimestamp("created_at").toInstant());
    }

    @Transactional
    public void setBookmark(UUID userId, BookmarkRequest request) {
        if (request == null || request.targetId().isBlank()
                || !List.of("QUESTION", "TOPIC").contains(request.targetType())) {
            throw badRequest("Mục đánh dấu không hợp lệ.");
        }
        jdbc.update("""
                INSERT INTO grammar_bookmark(user_id, target_type, target_id, note)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (user_id, target_type, target_id)
                DO UPDATE SET note = EXCLUDED.note
                """, userId, request.targetType(), request.targetId(), request.note());
    }

    @Transactional
    public void removeBookmark(UUID userId, String targetType, String targetId) {
        jdbc.update("DELETE FROM grammar_bookmark WHERE user_id = ? AND target_type = ? AND target_id = ?",
                userId, targetType, targetId);
    }

    public List<BookmarkView> bookmarks(UUID userId) {
        return jdbc.query("""
                SELECT target_type, target_id, note, created_at
                FROM grammar_bookmark WHERE user_id = ?
                ORDER BY created_at DESC
                """, (rs, row) -> new BookmarkView(
                        rs.getString("target_type"), rs.getString("target_id"),
                        rs.getString("note"),
                        rs.getTimestamp("created_at").toInstant()), userId);
    }

    public Map<String, Object> trapAnalysis(UUID userId) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT question_id,
                       count(*) AS attempts,
                       count(*) FILTER (WHERE NOT is_correct) AS wrong_attempts,
                       CASE WHEN count(*) = 0 THEN 0
                            ELSE count(*) FILTER (WHERE NOT is_correct)::double precision / count(*)
                       END AS wrong_rate
                FROM grammar_attempt
                WHERE (?::uuid IS NULL OR user_id = ?)
                GROUP BY question_id
                ORDER BY wrong_rate DESC, wrong_attempts DESC
                """, userId, userId);
        return Map.of("questions", rows,
                "hasData", !rows.isEmpty());
    }

    public Map<String, Object> today(UUID userId) {
        Integer dueCount = jdbc.queryForObject("""
                SELECT count(*) FROM grammar_review_schedule
                WHERE user_id = ? AND due_at <= now()
                """, Integer.class, userId);
        List<Map<String, Object>> resumeRows = jdbc.queryForList("""
                SELECT g.id, g.title,
                       COALESCE(p.completed_questions, 0) AS completed_questions
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                WHERE g.deleted_at IS NULL AND g.status = 'PUBLISHED'
                  AND p.status = 'IN_PROGRESS'
                ORDER BY COALESCE(p.updated_at, g.created_at) DESC, g.order_index ASC
                LIMIT 1
                """, userId);
        Integer weakRuleCount = jdbc.queryForObject("""
                SELECT count(DISTINCT r.id)
                FROM grammar_rule r
                JOIN grammar_question_rule qr ON qr.rule_id = r.id
                JOIN grammar_attempt a ON a.question_id = qr.question_id
                WHERE a.user_id = ? AND NOT a.is_correct
                """, Integer.class, userId);
        Integer attemptCount = jdbc.queryForObject(
                "SELECT count(*) FROM grammar_attempt WHERE user_id = ?",
                Integer.class, userId);
        Map<String, Object> resume = resumeRows.isEmpty() ? Map.of() : resumeRows.get(0);
        return Map.of(
                "due", Map.of("count", dueCount == null ? 0 : dueCount),
                "resume", resume.isEmpty() ? Map.of() : Map.of(
                        "topicId", resume.get("id"),
                        "title", resume.get("title"),
                        "completedQuestions", resume.get("completed_questions")),
                "suggestion", Map.of(
                        "topicId", resume.isEmpty() ? "" : resume.get("id"),
                        "reason", !resume.isEmpty() && weakRuleCount != null && weakRuleCount > 0
                                ? "Có quy tắc đã từng làm sai"
                                : !resume.isEmpty() ? "Chủ điểm đang học chưa hoàn thành" : ""),
                "newLearner", (dueCount == null || dueCount == 0)
                        && resume.isEmpty()
                        && (attemptCount == null || attemptCount == 0));
    }

    public Map<String, Object> search(UUID userId, String keyword) {
        String q = keyword == null ? "" : keyword.trim();
        if (q.isBlank()) return Map.of("topics", List.of(), "rules", List.of(), "questions", List.of());
        String pattern = "%" + q.toLowerCase() + "%";
        List<Map<String, Object>> topics = jdbc.queryForList("""
                SELECT id, code, title, english_title, status
                FROM grammar_topics
                WHERE deleted_at IS NULL AND status <> 'ARCHIVED'
                  AND (lower(title) LIKE ? OR lower(english_title) LIKE ? OR lower(code) LIKE ?)
                ORDER BY title ASC LIMIT 20
                """, pattern, pattern, pattern);
        List<Map<String, Object>> rules = jdbc.queryForList("""
                SELECT id, topic_id, code, name
                FROM grammar_rule
                WHERE lower(name) LIKE ? OR lower(code) LIKE ?
                ORDER BY name ASC LIMIT 20
                """, pattern, pattern);
        List<Map<String, Object>> questions = jdbc.queryForList("""
                SELECT elem->>'id' AS question_id,
                       elem->>'questionText' AS question_text,
                       g.id AS topic_id
                FROM grammar_topics g
                CROSS JOIN LATERAL jsonb_array_elements(COALESCE(g.questions, '[]'::jsonb)) elem
                WHERE g.deleted_at IS NULL
                  AND lower(COALESCE(elem->>'questionText', elem->>'question', '')) LIKE ?
                LIMIT 20
                """, pattern);
        return Map.of("topics", topics, "rules", rules, "questions", questions);
    }

    public Map<String, Object> getUserSettings(UUID userId) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT daily_target_minutes, reminder_enabled, reminder_time::text,
                       timezone, sound_enabled, font_scale
                FROM grammar_user_settings WHERE user_id = ?
                """, userId);
        if (rows.isEmpty()) {
            return Map.of(
                    "dailyTargetMinutes", 20,
                    "reminderEnabled", false,
                    "reminderTime", "",
                    "timezone", "Asia/Ho_Chi_Minh",
                    "soundEnabled", true,
                    "fontScale", 100);
        }
        return rows.get(0);
    }

    @Transactional
    public Map<String, Object> putUserSettings(UUID userId, UserSettingsRequest request) {
        if (request == null) throw badRequest("Thiếu cấu hình học tập.");
        int minutes = Math.min(240, Math.max(5, request.dailyTargetMinutes()));
        int fontScale = Math.min(140, Math.max(90, request.fontScale()));
        jdbc.update("""
                INSERT INTO grammar_user_settings
                (user_id, daily_target_minutes, reminder_enabled, reminder_time, timezone, sound_enabled, font_scale, updated_at)
                VALUES (?, ?, ?, NULLIF(?, '')::time, ?, ?, ?, now())
                ON CONFLICT(user_id) DO UPDATE SET
                    daily_target_minutes = EXCLUDED.daily_target_minutes,
                    reminder_enabled = EXCLUDED.reminder_enabled,
                    reminder_time = EXCLUDED.reminder_time,
                    timezone = EXCLUDED.timezone,
                    sound_enabled = EXCLUDED.sound_enabled,
                    font_scale = EXCLUDED.font_scale,
                    updated_at = now()
                """, userId, minutes, request.reminderEnabled(),
                request.reminderTime() == null ? "" : request.reminderTime(),
                request.timezone(), request.soundEnabled(), fontScale);
        return getUserSettings(userId);
    }

    public Map<String, Object> pathSummary(UUID userId) {
        Integer published = jdbc.queryForObject(
                "SELECT count(*) FROM grammar_topics WHERE deleted_at IS NULL AND status = 'PUBLISHED'",
                Integer.class);
        Integer mastered = jdbc.queryForObject("""
                SELECT count(DISTINCT topic_id)
                FROM user_grammar_progress
                WHERE user_id = ? AND status = 'COMPLETED'
                """, Integer.class, userId);
        Integer inProgress = jdbc.queryForObject("""
                SELECT count(DISTINCT topic_id)
                FROM user_grammar_progress
                WHERE user_id = ? AND status = 'IN_PROGRESS'
                """, Integer.class, userId);
        return Map.of(
                "publishedCount", published == null ? 0 : published,
                "masteredCount", mastered == null ? 0 : mastered,
                "inProgressCount", inProgress == null ? 0 : inProgress);
    }

    public Map<String, Object> pagedAdminTopics(int page, int size, String status,
                                                 String search, String sort) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        String statusFilter = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)
                ? null : status.toUpperCase();
        String searchFilter = search == null ? null : search.trim().toLowerCase();
        String sortField = switch (sort == null ? "" : sort) {
            case "title" -> "title";
            case "updated" -> "updated_at";
            default -> "order_index";
        };
        String sql = """
                SELECT id, code, title, english_title, status, difficulty,
                       COALESCE(jsonb_array_length(questions), 0) AS question_count,
                       created_at, updated_at
                FROM grammar_topics
                WHERE deleted_at IS NULL
                  AND (? IS NULL OR status = ?)
                  AND (? IS NULL OR lower(title) LIKE '%' || ? || '%' OR lower(code) LIKE '%' || ? || '%')
                ORDER BY %s DESC, id ASC
                LIMIT ? OFFSET ?
                """.formatted(sortField);
        List<Map<String, Object>> items = jdbc.queryForList(sql,
                statusFilter, statusFilter, searchFilter, searchFilter, searchFilter,
                safeSize, safePage * safeSize);
        Integer total = jdbc.queryForObject("""
                SELECT count(*) FROM grammar_topics
                WHERE deleted_at IS NULL
                  AND (? IS NULL OR status = ?)
                  AND (? IS NULL OR lower(title) LIKE '%' || ? || '%' OR lower(code) LIKE '%' || ? || '%')
                """, Integer.class,
                statusFilter, statusFilter, searchFilter, searchFilter, searchFilter);
        return Map.of("items", items, "page", safePage, "size", safeSize,
                "total", total == null ? 0 : total);
    }

    public List<ReviewItem> dueReviews(UUID userId) {
        return jdbc.query("""
                SELECT s.question_id, s.due_at, s.interval_days, s.ease, s.streak,
                       COALESCE(q.topic_id, '') AS topic_id
                FROM grammar_review_schedule s
                LEFT JOIN (
                    SELECT DISTINCT topic_id, question_id
                    FROM grammar_attempt
                ) q ON q.question_id = s.question_id
                WHERE s.user_id = ? AND s.due_at <= now()
                ORDER BY s.due_at ASC
                """, (rs, row) -> new ReviewItem(
                        rs.getString("question_id"), rs.getString("topic_id"),
                        rs.getTimestamp("due_at").toInstant(),
                        rs.getInt("interval_days"), rs.getDouble("ease"), rs.getInt("streak")),
                userId);
    }

    public GrammarAnalytics analytics(UUID userId) {
        Long attempts = jdbc.queryForObject(
                "SELECT count(*) FROM grammar_attempt WHERE user_id = ?",
                Long.class, userId);
        Long firstAttempts = jdbc.queryForObject(
                "SELECT count(*) FROM (SELECT DISTINCT ON(question_id) question_id FROM grammar_attempt WHERE user_id = ? ORDER BY question_id, created_at ASC) x",
                Long.class, userId);
        Double firstAccuracy = jdbc.queryForObject("""
                SELECT COALESCE(AVG(CASE WHEN x.is_correct THEN 1.0 ELSE 0.0 END), 0)
                FROM (SELECT DISTINCT ON(question_id) question_id, is_correct
                      FROM grammar_attempt WHERE user_id = ? ORDER BY question_id, created_at ASC) x
                """, Double.class, userId);
        Double retention = jdbc.queryForObject("""
                SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
                FROM grammar_attempt
                WHERE user_id = ? AND created_at >= now() - INTERVAL '7 days'
                """, Double.class, userId);
        Double interleaved = jdbc.queryForObject("""
                SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
                FROM grammar_attempt WHERE user_id = ? AND mode = 'MIXED'
                """, Double.class, userId);
        Double avgTime = jdbc.queryForObject("""
                SELECT COALESCE(AVG(time_spent_ms), 0)
                FROM grammar_attempt WHERE user_id = ?
                """, Double.class, userId);
        Long repeatedErrors = jdbc.queryForObject("""
                SELECT COALESCE(count(*), 0)
                FROM (
                    SELECT question_id, count(*) FILTER (WHERE NOT is_correct) AS wrong_count
                    FROM grammar_attempt WHERE user_id = ? GROUP BY question_id
                ) x WHERE wrong_count > 1
                """, Long.class, userId);
        return new GrammarAnalytics(
                attempts == null ? 0 : attempts,
                firstAttempts == null ? 0 : firstAttempts,
                firstAccuracy == null ? 0 : firstAccuracy,
                retention == null ? 0 : retention,
                repeatedErrors == null ? 0 : repeatedErrors,
                interleaved == null ? 0 : interleaved,
                avgTime == null ? 0 : avgTime);
    }

    public Map<String, Object> adminCoverage() {
        Integer topics = jdbc.queryForObject("SELECT count(*) FROM grammar_topics WHERE deleted_at IS NULL", Integer.class);
        Integer leafTopics = jdbc.queryForObject("""
                SELECT count(*) FROM grammar_topics g
                WHERE deleted_at IS NULL
                  AND NOT EXISTS (SELECT 1 FROM grammar_topics c WHERE c.parent_topic_id = g.id)
                """, Integer.class);
        Integer withQuestions = jdbc.queryForObject("""
                SELECT count(*) FROM grammar_topics g
                WHERE g.deleted_at IS NULL
                  AND (
                    jsonb_array_length(COALESCE(g.questions, '[]'::jsonb)) > 0
                    OR EXISTS (SELECT 1 FROM grammar_topic_questions tq WHERE tq.topic_id = g.id)
                  )
                """, Integer.class);
        Integer missingRules = jdbc.queryForObject("""
                SELECT count(*) FROM grammar_topics g
                WHERE g.deleted_at IS NULL
                  AND NOT EXISTS (SELECT 1 FROM grammar_rule r WHERE r.topic_id = g.id)
                """, Integer.class);
        return Map.of(
                "topics", topics == null ? 0 : topics,
                "leafTopics", leafTopics == null ? 0 : leafTopics,
                "topicsWithQuestions", withQuestions == null ? 0 : withQuestions,
                "leafTopicsMissingRules", missingRules == null ? 0 : missingRules);
    }

    @Transactional
    public PassageView createPassage(UUID actorId, PassageRequest request) {
        if (request == null || request.type() == null
                || !List.of("PART6", "PART7").contains(request.type())
                || request.content() == null || request.content().isBlank()) {
            throw badRequest("Dữ liệu đoạn văn không hợp lệ.");
        }
        String id = "GP-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO grammar_passage(id, type, content, translation)
                VALUES (?, ?, ?, ?)
                """, id, request.type(), request.content(), request.translation());
        audit(actorId, "CREATE_PASSAGE", "GRAMMAR_PASSAGE", id, null, Map.of("type", request.type()));
        return new PassageView(id, request.type(), request.content(), request.translation());
    }

    public List<PassageView> passages() {
        return jdbc.query("""
                SELECT id, type, content, translation FROM grammar_passage ORDER BY created_at DESC
                """, (rs, row) -> new PassageView(
                        rs.getString("id"), rs.getString("type"),
                        rs.getString("content"), rs.getString("translation")));
    }

    public List<RuleView> rules(String topicId) {
        String sql = """
                SELECT id, topic_id, code, name, description, learning_objective
                FROM grammar_rule
                WHERE (? IS NULL OR topic_id = ?)
                ORDER BY created_at DESC
                """;
        return jdbc.query(sql, (rs, row) -> new RuleView(
                rs.getString("id"), rs.getString("topic_id"), rs.getString("code"),
                rs.getString("name"), rs.getString("description"),
                rs.getString("learning_objective")), topicId, topicId);
    }

    @Transactional
    public void linkPassage(String passageId, List<String> questionIds) {
        Integer exists = jdbc.queryForObject("SELECT count(*) FROM grammar_passage WHERE id = ?", Integer.class, passageId);
        if (exists == null || exists == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đoạn văn.");
        if (questionIds == null) throw badRequest("Thiếu danh sách câu hỏi.");
        jdbc.update("DELETE FROM grammar_question_passage WHERE passage_id = ?", passageId);
        for (String questionId : questionIds) {
            if (questionId != null && !questionId.isBlank()) {
                jdbc.update("""
                        INSERT INTO grammar_question_passage(question_id, passage_id)
                        VALUES (?, ?)
                        ON CONFLICT(question_id) DO UPDATE SET passage_id = EXCLUDED.passage_id
                        """, questionId, passageId);
            }
        }
    }

    @Transactional
    public RuleView createRule(UUID actorId, RuleRequest request) {
        if (request == null || request.topicId().isBlank()
                || request.code().isBlank() || request.name().isBlank()) {
            throw badRequest("Thiếu dữ liệu quy tắc.");
        }
        String id = "GR-" + UUID.randomUUID();
        try {
            jdbc.update("""
                    INSERT INTO grammar_rule(id, topic_id, code, name, description, learning_objective)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, id, request.topicId(), request.code(), request.name(),
                    request.description(), request.learningObjective());
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã quy tắc đã tồn tại trong chủ điểm.");
        }
        audit(actorId, "CREATE_RULE", "GRAMMAR_RULE", id, null, Map.of("topicId", request.topicId()));
        return new RuleView(id, request.topicId(), request.code(), request.name(),
                request.description(), request.learningObjective());
    }

    @Transactional
    public void linkRule(String ruleId, List<String> questionIds) {
        Integer exists = jdbc.queryForObject("SELECT count(*) FROM grammar_rule WHERE id = ?", Integer.class, ruleId);
        if (exists == null || exists == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quy tắc.");
        jdbc.update("DELETE FROM grammar_question_rule WHERE rule_id = ?", ruleId);
        for (String questionId : questionIds == null ? List.<String>of() : questionIds) {
            if (questionId != null && !questionId.isBlank()) {
                jdbc.update("INSERT INTO grammar_question_rule(question_id, rule_id) VALUES (?, ?)",
                        questionId, ruleId);
            }
        }
    }

    @Transactional
    public AiExplanationView cacheAiExplanation(UUID actorId, AiExplanationRequest request) {
        if (request == null || request.questionId().isBlank() || request.selectedOption().isBlank()
                || request.content().isBlank()) {
            throw badRequest("Thiếu dữ liệu giải thích AI.");
        }
        String model = request.model().isBlank() ? "UNKNOWN" : request.model();
        String promptVersion = request.promptVersion().isBlank() ? "v1" : request.promptVersion();
        jdbc.update("""
                INSERT INTO grammar_ai_explanation
                (question_id, selected_option, model, prompt_version, content, generated_at,
                 token_count, cost_estimate)
                VALUES (?, ?, ?, ?, ?, now(), ?, ?)
                ON CONFLICT(question_id, selected_option, prompt_version)
                DO UPDATE SET model = EXCLUDED.model, content = EXCLUDED.content,
                              generated_at = now(), token_count = EXCLUDED.token_count,
                              cost_estimate = EXCLUDED.cost_estimate
                """, request.questionId(), request.selectedOption(), model, promptVersion,
                request.content(), request.tokenCount(), request.costEstimate());
        Long id = jdbc.queryForObject(
                "SELECT id FROM grammar_ai_explanation WHERE question_id = ? AND selected_option = ? AND prompt_version = ?",
                Long.class, request.questionId(), request.selectedOption(), promptVersion);
        audit(actorId, "GENERATE_AI_EXPLANATION", "QUESTION", request.questionId(), null,
                Map.of("model", model, "promptVersion", promptVersion));
        return new AiExplanationView(id, request.questionId(), request.selectedOption(),
                model, promptVersion, request.content(), Instant.now(),
                request.tokenCount(), request.costEstimate());
    }

    public AiExplanationView getAiExplanation(String questionId, String selectedOption) {
        List<AiExplanationView> rows = jdbc.query("""
                SELECT id, question_id, selected_option, model, prompt_version, content,
                       generated_at, token_count, cost_estimate
                FROM grammar_ai_explanation
                WHERE question_id = ? AND selected_option = ?
                ORDER BY generated_at DESC LIMIT 1
                """, (rs, row) -> new AiExplanationView(
                        rs.getLong("id"), rs.getString("question_id"),
                        rs.getString("selected_option"), rs.getString("model"),
                        rs.getString("prompt_version"), rs.getString("content"),
                        rs.getTimestamp("generated_at").toInstant(),
                        rs.getObject("token_count", Integer.class),
                        rs.getObject("cost_estimate", Double.class)),
                questionId, selectedOption);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Chưa có giải thích AI được lưu cho câu hỏi này.");
        return rows.get(0);
    }

    @Transactional
    public void feedbackAiExplanation(Long explanationId, UUID userId, AiFeedbackRequest request) {
        Integer exists = jdbc.queryForObject(
                "SELECT count(*) FROM grammar_ai_explanation WHERE id = ?", Integer.class, explanationId);
        if (exists == null || exists == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy giải thích AI.");
        if (request == null) throw badRequest("Thiếu phản hồi.");
        jdbc.update("""
                INSERT INTO grammar_ai_feedback(explanation_id, user_id, helpful, inaccurate)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(explanation_id, user_id) DO UPDATE SET
                    helpful = EXCLUDED.helpful,
                    inaccurate = EXCLUDED.inaccurate
                """, explanationId, userId, request.helpful(), request.inaccurate());
    }

    @Transactional
    public ExamSessionView startExam(UUID userId, ExamStartRequest request) {
        if (request == null) throw badRequest("Thiếu dữ liệu thi thử.");
        int durationSeconds = request.durationSeconds() <= 0 ? 3600 : request.durationSeconds();
        String id = "EXAM-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO grammar_exam_session(id, user_id, topic_id, deadline_at)
                VALUES (?, ?, ?, now() + (? * INTERVAL '1 second'))
                """, id, userId, request.topicId(), durationSeconds);
        return getExamSession(id, userId);
    }

    public ExamSessionView getExamSession(String id, UUID userId) {
        List<ExamSessionView> rows = jdbc.query("""
                SELECT id, topic_id, started_at, deadline_at, submitted_at, suspicious, score, status
                FROM grammar_exam_session WHERE id = ? AND user_id = ?
                """, (rs, row) -> new ExamSessionView(
                        rs.getString("id"), rs.getString("topic_id"),
                        rs.getTimestamp("started_at").toInstant(),
                        rs.getTimestamp("deadline_at").toInstant(),
                        rs.getTimestamp("submitted_at") == null ? null : rs.getTimestamp("submitted_at").toInstant(),
                        rs.getBoolean("suspicious"), rs.getObject("score", Double.class),
                        rs.getString("status")),
                id, userId);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy phiên thi thử.");
        return rows.get(0);
    }

    @Transactional
    public ExamSessionView submitExam(String id, UUID userId, ExamSubmitRequest request) {
        ExamSessionView session = getExamSession(id, userId);
        if (!"IN_PROGRESS".equals(session.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phiên thi đã kết thúc.");
        }
        jdbc.update("""
                UPDATE grammar_exam_session
                SET submitted_at = now(),
                    suspicious = ?,
                    score = ?,
                    status = CASE WHEN deadline_at < now() THEN 'EXPIRED' ELSE 'SUBMITTED' END
                WHERE id = ? AND user_id = ?
                """, request.suspicious(), request.score(), id, userId);
        return getExamSession(id, userId);
    }

    @Transactional
    public RevisionView createRevision(UUID actorId, RevisionRequest request) {
        if (request == null || request.entityType().isBlank()
                || request.entityId().isBlank() || request.content() == null) {
            throw badRequest("Thiếu dữ liệu revision.");
        }
        Integer version = jdbc.queryForObject("""
                SELECT COALESCE(MAX(version), 0) + 1
                FROM grammar_content_revision
                WHERE entity_type = ? AND entity_id = ?
                """, Integer.class, request.entityType(), request.entityId());
        String contentJson;
        try {
            contentJson = objectMapper.writeValueAsString(request.content());
        } catch (Exception exception) {
            throw badRequest("Nội dung revision không hợp lệ.");
        }
        jdbc.update("""
                INSERT INTO grammar_content_revision
                (entity_type, entity_id, version, content_json, actor_id)
                VALUES (?, ?, ?, ?::jsonb, ?)
                """, request.entityType(), request.entityId(), version, contentJson, actorId);
        return new RevisionView(request.entityType(), request.entityId(), version, request.content(),
                actorId, Instant.now());
    }

    public List<RevisionView> revisions(String entityType, String entityId) {
        return jdbc.query("""
                SELECT entity_type, entity_id, version, content_json::text, actor_id, created_at
                FROM grammar_content_revision
                WHERE entity_type = ? AND entity_id = ?
                ORDER BY version DESC
                """, (rs, row) -> {
                    Map<String, Object> content = Map.of();
                    try {
                        content = objectMapper.readValue(rs.getString("content_json"), Map.class);
                    } catch (Exception ignored) {
                    }
                    return new RevisionView(
                            rs.getString("entity_type"), rs.getString("entity_id"),
                            rs.getInt("version"), content,
                            rs.getObject("actor_id", UUID.class),
                            rs.getTimestamp("created_at").toInstant());
                }, entityType, entityId);
    }

    public RevisionView restoreRevision(UUID actorId, String entityType,
                                        String entityId, int version) {
        List<RevisionView> rows = jdbc.query("""
                SELECT entity_type, entity_id, version, content_json::text, actor_id, created_at
                FROM grammar_content_revision
                WHERE entity_type = ? AND entity_id = ? AND version = ?
                """, (rs, row) -> {
                    Map<String, Object> content = Map.of();
                    try {
                        content = objectMapper.readValue(rs.getString("content_json"), Map.class);
                    } catch (Exception ignored) {
                    }
                    return new RevisionView(
                            rs.getString("entity_type"), rs.getString("entity_id"),
                            rs.getInt("version"), content,
                            rs.getObject("actor_id", UUID.class),
                            rs.getTimestamp("created_at").toInstant());
                }, entityType, entityId, version);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên bản.");
        RevisionView restored = rows.get(0);
        createRevision(actorId, new RevisionRequest(entityType, entityId, restored.content()));
        audit(actorId, "RESTORE_REVISION", entityType, entityId, null,
                Map.of("restoredVersion", version));
        return restored;
    }

    @Transactional
    public ImportBatchView createImportBatch(UUID actorId, ImportBatchRequest request) {
        if (request == null || request.sourceType().isBlank()) {
            throw badRequest("Thiếu khai báo nguồn nội dung.");
        }
        String id = "IMP-" + UUID.randomUUID();
        jdbc.update("""
                INSERT INTO grammar_content_import_batch(id, source_type, source_name, imported_by)
                VALUES (?, ?, ?, ?)
                """, id, request.sourceType(), request.sourceName(), actorId);
        audit(actorId, "CREATE_IMPORT_BATCH", "GRAMMAR_IMPORT", id, null,
                Map.of("sourceType", request.sourceType()));
        return new ImportBatchView(id, request.sourceType(), request.sourceName(), "PREVIEW");
    }

    @Transactional
    public ImportBatchView commitImportBatch(UUID actorId, String id) {
        int updated = jdbc.update("""
                UPDATE grammar_content_import_batch
                SET status = 'COMMITTED' WHERE id = ? AND status = 'PREVIEW'
                """, id);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Batch import không ở trạng thái có thể commit.");
        audit(actorId, "COMMIT_IMPORT", "GRAMMAR_IMPORT", id, null, Map.of("status", "COMMITTED"));
        return findImportBatch(id);
    }

    @Transactional
    public ImportBatchView undoImportBatch(UUID actorId, String id) {
        int updated = jdbc.update("""
                UPDATE grammar_content_import_batch
                SET status = 'UNDONE', undone_at = now()
                WHERE id = ? AND status = 'COMMITTED'
                """, id);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Batch import không ở trạng thái có thể hoàn tác.");
        audit(actorId, "UNDO_IMPORT", "GRAMMAR_IMPORT", id, null, Map.of("status", "UNDONE"));
        return findImportBatch(id);
    }

    public ImportBatchView findImportBatch(String id) {
        List<ImportBatchView> rows = jdbc.query("""
                SELECT id, source_type, source_name, status
                FROM grammar_content_import_batch WHERE id = ?
                """, (rs, row) -> new ImportBatchView(
                        rs.getString("id"), rs.getString("source_type"),
                        rs.getString("source_name"), rs.getString("status")), id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy batch import.");
        return rows.get(0);
    }

    private void audit(UUID actorId, String action, String entityType, String entityId,
                       Object before, Object after) {
        String beforeJson = "{}";
        String afterJson = "{}";
        try {
            beforeJson = before == null ? "{}" : objectMapper.writeValueAsString(before);
            afterJson = after == null ? "{}" : objectMapper.writeValueAsString(after);
        } catch (Exception ignored) {
        }
        jdbc.update("""
                INSERT INTO grammar_audit_log(actor_id, action, entity_type, entity_id, before_json, after_json)
                VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb)
                """, actorId, action, entityType, entityId,
                beforeJson, afterJson);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public record QuestionReportRequest(String questionId, String reason, String message) {}
    public record UpdateReportRequest(String status) {}
    public record BookmarkRequest(String targetType, String targetId, String note) {}
    public record PassageRequest(String type, String content, String translation) {}
    public record RuleRequest(String topicId, String code, String name, String description, String learningObjective) {}
    public record QuestionReport(long id, String questionId, UUID reporterId, String reason, String message,
                                 String status, UUID handledBy, Instant handledAt, Instant createdAt) {}
    public record BookmarkView(String targetType, String targetId, String note, Instant createdAt) {}
    public record ReviewItem(String questionId, String topicId, Instant dueAt, int intervalDays,
                             double ease, int streak) {}
    public record GrammarAnalytics(long attempts, long firstAttempts, double firstAttemptAccuracy,
                                   double retentionRate, long repeatedErrorCount,
                                   double interleavedAccuracy, double averageResponseTimeMs) {}
    public record PassageView(String id, String type, String content, String translation) {}
    public record RuleView(String id, String topicId, String code, String name,
                           String description, String learningObjective) {}
    public record AiExplanationRequest(String questionId, String selectedOption, String model,
                                       String promptVersion, String content, Integer tokenCount,
                                       Double costEstimate) {}
    public record AiFeedbackRequest(boolean helpful, boolean inaccurate) {}
    public record AiExplanationView(Long id, String questionId, String selectedOption,
                                    String model, String promptVersion, String content,
                                    Instant generatedAt, Integer tokenCount, Double costEstimate) {}
    public record ExamStartRequest(String topicId, int durationSeconds) {}
    public record ExamSubmitRequest(double score, boolean suspicious) {}
    public record ExamSessionView(String id, String topicId, Instant startedAt, Instant deadlineAt,
                                  Instant submittedAt, boolean suspicious, Double score, String status) {}
    public record RevisionRequest(String entityType, String entityId, Map<String, Object> content) {}
    public record RevisionView(String entityType, String entityId, int version,
                               Map<String, Object> content, UUID actorId, Instant createdAt) {}
    public record ImportBatchRequest(String sourceType, String sourceName) {}
    public record ImportBatchView(String id, String sourceType, String sourceName, String status) {}
    public record UserSettingsRequest(int dailyTargetMinutes, boolean reminderEnabled,
                                      String reminderTime, String timezone,
                                      boolean soundEnabled, int fontScale) {}
}
