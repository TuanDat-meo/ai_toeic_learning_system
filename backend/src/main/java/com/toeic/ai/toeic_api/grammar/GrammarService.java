package com.toeic.ai.toeic_api.grammar;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GrammarService {

    private static final Pattern CATEGORY_CODE = Pattern.compile("^[a-z][a-z0-9_]{1,63}$");
    private static final List<String> TOEIC_PARTS = List.of("Part 5", "Part 6", "Part 7");
    private static final List<String> TARGET_SCORES = List.of("350_500", "500_750", "750_PLUS", "ALL");
    private static final List<String> DIFFICULTIES = List.of("EASY", "MEDIUM", "HARD");

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GrammarService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<GrammarTopic> listTopics(UUID userId) {
        return listTopics(userId, false);
    }

    public List<GrammarTopic> listAdminTopics(UUID userId) {
        return listTopics(userId, true);
    }

    private List<GrammarTopic> listTopics(UUID userId, boolean includeArchived) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula, g.source_url, g.source_notes,
                       g.grammar_group, g.parent_topic_id, g.toeic_parts::text AS toeic_parts,
                       g.difficulty, g.theory::text AS theory, g.metadata::text AS metadata,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       g.examples::text AS examples,
                       g.questions::text AS questions,
                       COALESCE((
                           SELECT jsonb_agg(jsonb_build_object(
                               'vocabularyItemId', v.id,
                               'word', v.word,
                               'partOfSpeech', l.part_of_speech,
                               'meaning', v.meaning
                           ) ORDER BY l.order_index)
                           FROM grammar_topic_vocabulary_words l
                           JOIN vocabulary_items v ON v.id = l.vocabulary_item_id
                           WHERE l.topic_id = g.id
                       ), '[]'::jsonb)::text AS word_family_words,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       (SELECT COUNT(*) FROM grammar_topic_questions linked WHERE linked.topic_id = g.id) AS linked_toeic_question_count,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at, g.archived_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                WHERE ? OR g.status <> 'ARCHIVED'
                ORDER BY g.order_index ASC, g.id ASC
                """;

        return jdbc.query(sql, this::mapTopicFull, userId, includeArchived);
    }

    public GrammarTopic getTopic(String topicId, UUID userId) {
        String sql = """
                SELECT g.id, g.code, g.title, g.english_title, g.part, g.target_score, g.status,
                       g.summary, g.formula, g.source_url, g.source_notes,
                       g.grammar_group, g.parent_topic_id, g.toeic_parts::text AS toeic_parts,
                       g.difficulty, g.theory::text AS theory, g.metadata::text AS metadata,
                       g.signal_words::text AS signal_words,
                       g.traps::text AS traps,
                       g.examples::text AS examples,
                       g.questions::text AS questions,
                       COALESCE((
                           SELECT jsonb_agg(jsonb_build_object(
                               'vocabularyItemId', v.id,
                               'word', v.word,
                               'partOfSpeech', l.part_of_speech,
                               'meaning', v.meaning
                           ) ORDER BY l.order_index)
                           FROM grammar_topic_vocabulary_words l
                           JOIN vocabulary_items v ON v.id = l.vocabulary_item_id
                           WHERE l.topic_id = g.id
                       ), '[]'::jsonb)::text AS word_family_words,
                       COALESCE(p.completed_questions, 0) AS completed_questions,
                       COALESCE(jsonb_array_length(g.questions), 0) AS total_questions,
                       (SELECT COUNT(*) FROM grammar_topic_questions linked WHERE linked.topic_id = g.id) AS linked_toeic_question_count,
                       COALESCE(p.status, 'Chưa học') AS user_status,
                       g.created_at, g.updated_at, g.archived_at
                FROM grammar_topics g
                LEFT JOIN user_grammar_progress p ON p.topic_id = g.id AND p.user_id = ?
                WHERE g.id = ? AND g.status <> 'ARCHIVED'
                """;

        List<GrammarTopic> topics = jdbc.query(sql, this::mapTopicFull, userId, topicId);
        if (topics.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm ngữ pháp: " + topicId);
        }
        return topics.get(0);
    }

    public List<GrammarCategory> listCategories() {
        return jdbc.query("""
                SELECT code, name, field_definitions::text AS field_definitions, is_system
                FROM grammar_categories
                ORDER BY is_system DESC, name ASC
                """, (rs, rowNum) -> new GrammarCategory(
                rs.getString("code"),
                rs.getString("name"),
                parseMapList(rs.getString("field_definitions")),
                rs.getBoolean("is_system")));
    }

    @Transactional
    public GrammarCategory createCategory(GrammarCategoryRequest request) {
        validateCategoryRequest(request);
        try {
            jdbc.update("""
                    INSERT INTO grammar_categories (code, name, field_definitions, is_system)
                    VALUES (?, ?, ?::jsonb, false)
                    """, request.code().trim(), request.name().trim(), toJsonString(request.fieldDefinitions()));
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw badRequest("Mã nhóm ngữ pháp đã tồn tại.");
        }
        return findCategory(request.code().trim());
    }

    @Transactional
    public GrammarCategory updateCategory(String code, GrammarCategoryRequest request) {
        if (request == null) {
            throw badRequest("Dữ liệu nhóm ngữ pháp không hợp lệ.");
        }
        validateCategoryRequest(new GrammarCategoryRequest(code, request.name(), request.fieldDefinitions()));
        int updated = jdbc.update("""
                UPDATE grammar_categories
                SET name = ?, field_definitions = ?::jsonb, updated_at = now()
                WHERE code = ?
                """, request.name().trim(), toJsonString(request.fieldDefinitions()), code);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm ngữ pháp.");
        }
        return findCategory(code);
    }

    @Transactional
    public void deleteCategory(String code) {
        Boolean isSystem = jdbc.query(
                "SELECT is_system FROM grammar_categories WHERE code = ?",
                rs -> rs.next() ? rs.getBoolean(1) : null,
                code);
        if (isSystem == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm ngữ pháp.");
        }
        if (isSystem) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể xóa nhóm ngữ pháp tích hợp.");
        }
        Integer topicCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM grammar_topics WHERE grammar_group = ?", Integer.class, code);
        if (topicCount != null && topicCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhóm đang được chủ điểm sử dụng, không thể xóa.");
        }
        jdbc.update("DELETE FROM grammar_categories WHERE code = ?", code);
    }

    @Transactional
    public GrammarTopic createTopic(CreateGrammarTopicRequest req) {
        lockGrammarHierarchy();
        if (req == null) {
            throw badRequest("Dữ liệu chuyên đề không hợp lệ.");
        }
        String title = req.titleVi() != null && !req.titleVi().isBlank() ? req.titleVi()
                : (req.title() != null && !req.title().isBlank() ? req.title() : "Chủ điểm ngữ pháp");
        String englishTitle = req.titleEn() != null && !req.titleEn().isBlank() ? req.titleEn()
                : (req.englishTitle() != null && !req.englishTitle().isBlank() ? req.englishTitle() : title);
        String code = req.code() != null && !req.code().isBlank() ? req.code().trim()
                : generateTopicCode(title);
        String part = req.part() != null && !req.part().isBlank() ? formatPart(req.part()) : "Part 5";
        String targetScore = normalizeTargetScore(req.targetScore() != null && !req.targetScore().isBlank()
                ? req.targetScore() : "350-500");
        String status = req.status() != null && !req.status().isBlank() ? req.status() : "DRAFT";
        if ("ARCHIVED".equalsIgnoreCase(status)) {
            throw badRequest("Hãy sử dụng chức năng lưu trữ để lưu trữ chủ điểm.");
        }
        String summary = req.summary() != null ? req.summary() : "";
        String formula = req.formula() != null ? req.formula() : "";
        String id = "g-" + UUID.randomUUID();
        String sourceUrl = normalizeBritishCouncilUrl(req.sourceUrl());
        String grammarGroup = req.grammarGroup() != null && !req.grammarGroup().isBlank()
                ? req.grammarGroup().trim() : "other";
        String parentTopicId = blankToNull(req.parentTopicId());
        String difficulty = req.difficulty() != null && !req.difficulty().isBlank() ? req.difficulty() : "MEDIUM";
        List<String> toeicParts = req.toeicParts() != null ? req.toeicParts() : List.of(part);
        Map<String, String> theory = req.theory() != null ? req.theory() : Map.of();
        Map<String, Object> metadata = req.metadata() != null ? req.metadata() : Map.of();
        validateSourceNotes(req.sourceNotes());
        validateTopic(title, englishTitle, part, targetScore, status, summary, formula, grammarGroup,
                parentTopicId, difficulty, toeicParts, theory, metadata, req.examples(), req.wordFamilyWords());
        validatePublishableTopic(status, req.questions(), id);
        String signalWords = toJsonString(req.signalWords() != null ? req.signalWords() : List.of());
        String traps = toJsonString(req.traps() != null ? req.traps() : List.of());
        String examples = toJsonString(req.examples() != null ? req.examples() : List.of());
        String questions = toJsonString(req.questions() != null ? req.questions() : List.of());

        Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM grammar_topics", Integer.class);
        int orderIndex = req.orderIndex() != null ? req.orderIndex() : (maxOrder != null ? maxOrder : 0);

        String insertSql = """
                INSERT INTO grammar_topics (
                    id, code, title, english_title, part, target_score, status, summary, formula,
                    signal_words, traps, examples, questions, order_index, source_url, source_notes,
                    grammar_group, parent_topic_id, toeic_parts, difficulty, theory, metadata, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, ?, ?, ?, ?, ?, ?::jsonb, ?, ?::jsonb, ?::jsonb, now(), now())
                """;
        jdbc.update(insertSql, id, code, title, englishTitle, part, targetScore, status, summary, formula,
                signalWords, traps, examples, questions, orderIndex, sourceUrl,
                safeText(req.sourceNotes()), grammarGroup, parentTopicId, toJsonString(toeicParts), difficulty,
                toJsonString(theory), toJsonString(metadata));
        if (req.wordFamilyWords() != null) {
            syncWordFamilyWords(id, req.wordFamilyWords());
        }

        return getTopic(id, null);
    }

    @Transactional
    public GrammarTopicHierarchy createTopicWithNewParent(CreateGrammarTopicWithParentRequest request) {
        if (request == null || request.child() == null) {
            throw badRequest("Dữ liệu chủ điểm cha và chủ điểm con không hợp lệ.");
        }
        String parentTitleVi = request.parentTitleVi() == null ? "" : request.parentTitleVi().trim();
        String parentTitleEn = request.parentTitleEn() == null ? "" : request.parentTitleEn().trim();
        if (parentTitleVi.isBlank() || parentTitleVi.length() > 120
                || parentTitleEn.isBlank() || parentTitleEn.length() > 120) {
            throw badRequest("Tên chủ điểm cha bằng tiếng Việt và tiếng Anh là bắt buộc, tối đa 120 ký tự.");
        }

        CreateGrammarTopicRequest child = request.child();
        CreateGrammarTopicRequest parent = new CreateGrammarTopicRequest(
                null, parentTitleVi, parentTitleEn, parentTitleVi, parentTitleEn,
                child.part(), child.targetScore(), "DRAFT",
                "Chủ điểm tổng hợp, tập hợp các chủ điểm con liên quan.",
                "Xem công thức và nội dung chi tiết tại từng chủ điểm con.",
                null, null, child.grammarGroup(), null, child.toeicParts(),
                child.difficulty(), Map.of(), Map.of(), List.of(), List.of(), List.of(),
                List.of(), List.of(), null);
        GrammarTopic createdParent = createTopic(parent);
        CreateGrammarTopicRequest childWithParent = new CreateGrammarTopicRequest(
                child.code(), child.titleVi(), child.titleEn(), child.title(), child.englishTitle(),
                child.part(), child.targetScore(), child.status(), child.summary(), child.formula(),
                child.sourceUrl(), child.sourceNotes(), child.grammarGroup(), createdParent.id(),
                child.toeicParts(), child.difficulty(), child.theory(), child.metadata(),
                child.wordFamilyWords(), child.signalWords(), child.traps(), child.examples(),
                child.questions(), child.orderIndex());
        GrammarTopic createdChild = createTopic(childWithParent);
        return new GrammarTopicHierarchy(createdParent, createdChild);
    }

    @Transactional
    public GrammarTopic updateTopic(String id, UpdateGrammarTopicRequest req) {
        lockGrammarHierarchy();
        if (req == null) {
            throw badRequest("Dữ liệu chuyên đề không hợp lệ.");
        }
        GrammarTopic existing = getTopic(id, null);
        if ("ARCHIVED".equals(existing.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể chỉnh sửa chủ điểm đã lưu trữ. Hãy khôi phục trước.");
        }
        String title = firstNonBlank(req.titleVi(), req.title(), existing.title());
        String englishTitle = firstNonBlank(req.titleEn(), req.englishTitle(), existing.englishTitle());
        String code = firstNonBlank(req.code(), existing.code());
        String part = req.part() != null ? formatPart(req.part()) : formatPart(existing.part());
        String targetScore = req.targetScore() != null ? normalizeTargetScore(req.targetScore()) : existing.targetScore();
        String status = req.status() != null ? req.status() : existing.status();
        if ("ARCHIVED".equalsIgnoreCase(status)) {
            throw badRequest("Hãy sử dụng chức năng lưu trữ để lưu trữ chủ điểm.");
        }
        String summary = req.summary() != null ? req.summary() : existing.summary();
        String formula = req.formula() != null ? req.formula() : existing.formula();
        String sourceUrl = normalizeBritishCouncilUrl(req.sourceUrl());
        if (req.sourceUrl() == null) {
            sourceUrl = existing.sourceUrl();
        }
        String sourceNotes = req.sourceNotes() != null ? req.sourceNotes() : existing.sourceNotes();
        validateSourceNotes(sourceNotes);
        String grammarGroup = req.grammarGroup() != null ? req.grammarGroup() : existing.grammarGroup();
        String parentTopicId = req.parentTopicId() != null ? blankToNull(req.parentTopicId()) : existing.parentTopicId();
        String difficulty = req.difficulty() != null ? req.difficulty() : existing.difficulty();
        List<String> toeicParts = req.toeicParts() != null ? req.toeicParts() : existing.toeicParts();
        Map<String, String> theory = req.theory() != null ? req.theory() : existing.theory();
        Map<String, Object> metadata = req.metadata() != null ? req.metadata() : existing.metadata();
        List<Map<String, Object>> topicExamples = req.examples() != null ? req.examples() : existing.examples();
        List<Map<String, Object>> topicQuestions = req.questions() != null ? req.questions() : existing.questions();
        validateTopic(title, englishTitle, part, targetScore, status, summary, formula, grammarGroup,
                parentTopicId, difficulty, toeicParts, theory, metadata, topicExamples, req.wordFamilyWords());
        validatePublishableTopic(status, topicQuestions, id);
        validateNoParentCycle(id, parentTopicId);
        String signalWords = toJsonString(req.signalWords() != null ? req.signalWords() : existing.signalWords());
        String traps = toJsonString(req.traps() != null ? req.traps() : existing.traps());
        String examples = toJsonString(topicExamples);

        String updateSql = """
                UPDATE grammar_topics SET
                    title = ?,
                    english_title = ?,
                    code = ?,
                    part = ?,
                    target_score = ?,
                    status = ?,
                    summary = ?,
                    formula = ?,
                    source_url = ?,
                    source_notes = ?,
                    grammar_group = ?,
                    parent_topic_id = ?,
                    toeic_parts = ?::jsonb,
                    difficulty = ?,
                    theory = ?::jsonb,
                    metadata = ?::jsonb,
                    signal_words = ?::jsonb,
                    traps = ?::jsonb,
                    examples = ?::jsonb,
                    questions = ?::jsonb,
                    updated_at = now()
                WHERE id = ?
                """;
        int rows = jdbc.update(updateSql, title, englishTitle, code, part, targetScore, status, summary, formula,
                sourceUrl, sourceNotes, grammarGroup, parentTopicId, toJsonString(toeicParts), difficulty,
                toJsonString(theory), toJsonString(metadata), signalWords, traps, examples,
                toJsonString(topicQuestions), id);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
        if (req.wordFamilyWords() != null) {
            syncWordFamilyWords(id, req.wordFamilyWords());
        }
        return getTopic(id, null);
    }

    @Transactional
    public void deleteTopic(String id) {
        deleteTopic(id, new DeleteTopicRequest("NONE", null));
    }

    @Transactional
    public TopicLifecycleImpact getTopicLifecycleImpact(String id) {
        return loadTopicLifecycleImpact(id);
    }

    @Transactional
    public void deleteTopic(String id, DeleteTopicRequest request) {
        lockGrammarHierarchy();
        String status = findTopicStatusForUpdate(id);
        if ("ARCHIVED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chủ điểm đã lưu trữ. Hãy khôi phục trước khi xóa.");
        }
        TopicLifecycleImpact impact = loadTopicLifecycleImpact(id);
        String action = request == null || request.childAction() == null
                ? "NONE" : request.childAction().trim().toUpperCase(Locale.ROOT);
        String targetParentId = request == null ? null : request.targetParentId();
        if (impact.childCount() > 0) {
            if (!"ROOTS".equals(action) && !"MOVE".equals(action)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Chủ điểm còn " + impact.childCount()
                                + " chủ điểm con. Hãy chuyển con thành chủ điểm độc lập hoặc sang chủ điểm cha khác.");
            }
            String destinationId = null;
            if ("MOVE".equals(action)) {
                destinationId = blankToNull(targetParentId);
                if (destinationId == null) {
                    throw badRequest("Cần chọn chủ điểm cha đích.");
                }
                if (id.equals(destinationId)) {
                    throw badRequest("Không thể chuyển chủ điểm con vào chính chủ điểm đang xóa.");
                }
                String destinationStatus = findTopicStatusForUpdate(destinationId);
                if ("ARCHIVED".equals(destinationStatus)) {
                    throw badRequest("Không thể chuyển chủ điểm vào một chủ điểm cha đã lưu trữ.");
                }
                for (ChildTopicSummary child : impact.children()) {
                    validateNoParentCycle(child.id(), destinationId);
                }
            }
            jdbc.update("UPDATE grammar_topics SET parent_topic_id = ?, updated_at = now() WHERE parent_topic_id = ?",
                    destinationId, id);
        } else if (!"NONE".equals(action)) {
            throw badRequest("Chủ điểm không có con cần chuyển.");
        }

        if (impact.userProgressCount() > 0 || impact.wordFamilyLinkCount() > 0
                || impact.toeicQuestionLinkCount() > 0 || impact.learningPathLinkCount() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa vì chủ điểm còn dữ liệu liên kết. Hãy lưu trữ để giữ nguyên tiến độ, Word Family và câu hỏi TOEIC.");
        }
        int rows;
        try {
            rows = jdbc.update("DELETE FROM grammar_topics WHERE id = ?", id);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa vì dữ liệu liên kết vừa được cập nhật. Hãy lưu trữ chủ điểm để giữ nguyên dữ liệu.",
                    exception);
        }
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
    }

    @Transactional
    public void archiveTopic(String id) {
        lockGrammarHierarchy();
        String status = findTopicStatusForUpdate(id);
        if ("ARCHIVED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chủ điểm đã được lưu trữ.");
        }
        jdbc.update("UPDATE grammar_topics SET parent_topic_id = NULL, updated_at = now() WHERE parent_topic_id = ?", id);
        int rows = jdbc.update("""
                UPDATE grammar_topics
                SET archived_from_status = status, status = 'ARCHIVED', archived_at = now(), updated_at = now()
                WHERE id = ? AND status <> 'ARCHIVED'
                """, id);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
    }

    @Transactional
    public GrammarTopic restoreTopic(String id) {
        lockGrammarHierarchy();
        int rows = jdbc.update("""
                UPDATE grammar_topics
                SET status = COALESCE(NULLIF(archived_from_status, 'ARCHIVED'), 'DRAFT'),
                    archived_from_status = NULL, archived_at = NULL, updated_at = now()
                WHERE id = ? AND status = 'ARCHIVED'
                """, id);
        if (rows == 0) {
            String status = findTopicStatus(id);
            if (status == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chủ điểm chưa được lưu trữ.");
        }
        return getTopic(id, null);
    }

    @Transactional
    public GrammarTopic addQuestion(String topicId, Map<String, Object> question) {
        GrammarTopic topic = getTopic(topicId, null);
        validateQuestion(question);
        List<Map<String, Object>> currentQuestions = new ArrayList<>(topic.questions());
        if (!question.containsKey("id") || question.get("id") == null || question.get("id").toString().isBlank()) {
            question.put("id", topicId + "-q-" + UUID.randomUUID());
        }
        currentQuestions.add(question);
        String questionsJson = toJsonString(currentQuestions);

        jdbc.update("UPDATE grammar_topics SET questions = ?::jsonb, updated_at = now() WHERE id = ?", questionsJson, topicId);
        return getTopic(topicId, null);
    }

    @Transactional
    public GrammarTopic updateQuestion(String topicId, String questionId, Map<String, Object> question) {
        GrammarTopic topic = getTopic(topicId, null);
        validateQuestion(question);
        List<Map<String, Object>> currentQuestions = new ArrayList<>(topic.questions());
        int questionIndex = -1;
        for (int i = 0; i < currentQuestions.size(); i++) {
            if (questionId.equals(String.valueOf(currentQuestions.get(i).get("id")))) {
                questionIndex = i;
                break;
            }
        }
        if (questionIndex < 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy câu hỏi: " + questionId);
        }

        Map<String, Object> updatedQuestion = new java.util.LinkedHashMap<>(question);
        updatedQuestion.put("id", questionId);
        currentQuestions.set(questionIndex, updatedQuestion);
        jdbc.update("UPDATE grammar_topics SET questions = ?::jsonb, updated_at = now() WHERE id = ?",
                toJsonString(currentQuestions), topicId);
        return getTopic(topicId, null);
    }

    @Transactional
    public GrammarTopic deleteQuestion(String topicId, String questionId) {
        GrammarTopic topic = getTopic(topicId, null);
        List<Map<String, Object>> currentQuestions = new ArrayList<>(topic.questions());
        if ("PUBLISHED".equals(topic.status()) && currentQuestions.size() == 1
                && !hasChildTopics(topicId) && !hasLinkedToeicQuestions(topicId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa câu hỏi cuối cùng của chủ điểm đang phát hành. Hãy chuyển chủ điểm về bản nháp trước.");
        }
        boolean removed = currentQuestions.removeIf(question ->
                questionId.equals(String.valueOf(question.get("id"))));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy câu hỏi: " + questionId);
        }
        jdbc.update("UPDATE grammar_topics SET questions = ?::jsonb, updated_at = now() WHERE id = ?",
                toJsonString(currentQuestions), topicId);
        return getTopic(topicId, null);
    }

    private void validateQuestion(Map<String, Object> question) {
        if (question == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu câu hỏi không hợp lệ.");
        }
        Object questionText = question.get("questionText");
        Object explanation = question.get("explanation");
        Object correctAnswer = question.get("correctAnswer");
        Object options = question.get("options");
        if (questionText == null || questionText.toString().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung câu hỏi là bắt buộc.");
        }
        if (!(options instanceof Map<?, ?> optionMap)
                || List.of("A", "B", "C", "D").stream()
                        .anyMatch(key -> optionMap.get(key) == null || optionMap.get(key).toString().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần nhập đầy đủ phương án A, B, C và D.");
        }
        if (correctAnswer == null
                || !List.of("A", "B", "C", "D").contains(correctAnswer.toString().toUpperCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đáp án đúng phải là A, B, C hoặc D.");
        }
        if (explanation == null || explanation.toString().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giải thích câu hỏi là bắt buộc.");
        }
        Object part = question.get("part");
        if (part == null || !List.of("PART_5", "PART_6", "PART_7", "Part 5", "Part 6", "Part 7")
                .contains(part.toString())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần thi phải là Part 5, Part 6 hoặc Part 7.");
        }
    }

    private String normalizeBritishCouncilUrl(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) return null;
        try {
            java.net.URI uri = java.net.URI.create(sourceUrl.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !"learnenglish.britishcouncil.org".equalsIgnoreCase(uri.getHost())
                    || uri.getUserInfo() != null
                    || uri.getPort() != -1 && uri.getPort() != 443) {
                throw new IllegalArgumentException();
            }
            return uri.toString();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nguồn tham khảo phải là liên kết HTTPS thuộc learnenglish.britishcouncil.org.");
        }
    }

    @Transactional
    public void bulkUpdateStatus(List<String> ids, String status) {
        if (ids == null || ids.isEmpty()) return;
        if (!List.of("DRAFT", "PUBLISHED").contains(status)) {
            throw badRequest("Trạng thái chỉ có thể là bản nháp hoặc đã phát hành.");
        }
        if ("PUBLISHED".equals(status)) {
            for (String id : ids) {
                String existingStatus = findTopicStatus(id);
                if (existingStatus == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
                }
                if ("ARCHIVED".equals(existingStatus)) continue;
                GrammarTopic topic = getTopic(id, null);
                validatePublishableTopic(status, topic.questions(), id);
            }
        }
        for (String id : ids) {
            jdbc.update("UPDATE grammar_topics SET status = ?, updated_at = now() WHERE id = ? AND status <> 'ARCHIVED'", status, id);
        }
    }

    private void validatePublishableTopic(String status, List<Map<String, Object>> questions, String topicId) {
        if (!"PUBLISHED".equals(status)) return;
        if ((questions == null || questions.isEmpty())
                && !hasChildTopics(topicId) && !hasLinkedToeicQuestions(topicId)) {
            throw badRequest("Chủ điểm chưa có câu hỏi. Hãy thêm ít nhất một câu hỏi trước khi phát hành.");
        }
        if (questions != null) {
            for (Map<String, Object> question : questions) validateQuestion(question);
        }
    }

    private boolean hasChildTopics(String topicId) {
        return Boolean.TRUE.equals(jdbc.query(
                "SELECT EXISTS(SELECT 1 FROM grammar_topics WHERE parent_topic_id = ?)",
                rs -> rs.next() && rs.getBoolean(1), topicId));
    }

    private boolean hasLinkedToeicQuestions(String topicId) {
        return Boolean.TRUE.equals(jdbc.query(
                "SELECT EXISTS(SELECT 1 FROM grammar_topic_questions WHERE topic_id = ?)",
                rs -> rs.next() && rs.getBoolean(1), topicId));
    }

    @Transactional
    public void bulkDelete(List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        lockGrammarHierarchy();
        for (String id : ids) {
            TopicLifecycleImpact impact = loadTopicLifecycleImpact(id);
            if ("ARCHIVED".equals(impact.status())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể xóa chủ điểm đã lưu trữ bằng thao tác hàng loạt. Hãy khôi phục trước.");
            }
            if (impact.childCount() > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể xóa hàng loạt chủ điểm đang có con. Hãy dùng thao tác xóa riêng để chọn cách chuyển con.");
            }
            if (impact.userProgressCount() > 0 || impact.wordFamilyLinkCount() > 0
                    || impact.toeicQuestionLinkCount() > 0 || impact.learningPathLinkCount() > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể xóa hàng loạt vì có dữ liệu liên kết. Hãy lưu trữ chủ điểm để bảo toàn dữ liệu.");
            }
            jdbc.update("DELETE FROM grammar_topics WHERE id = ?", id);
        }
    }

    @Transactional
    public void saveProgress(UUID userId, String topicId, int completed, int total, String status) {
        if (userId == null || topicId == null || topicId.isBlank()) return;

        String normalizedStatus = "NOT_STARTED";
        if ("COMPLETED".equalsIgnoreCase(status) || "Đã hoàn thành".equalsIgnoreCase(status) || (total > 0 && completed >= total)) {
            normalizedStatus = "COMPLETED";
        } else if ("IN_PROGRESS".equalsIgnoreCase(status) || "Đang học".equalsIgnoreCase(status) || completed > 0) {
            normalizedStatus = "IN_PROGRESS";
        }

        try {
            Integer exists = jdbc.queryForObject("SELECT count(*) FROM grammar_topics WHERE id = ?", Integer.class, topicId);
            if (exists == null || exists == 0) {
                String code = topicId.toUpperCase().replace("-", "_");
                jdbc.update("""
                        INSERT INTO grammar_topics (id, code, title, english_title, part, target_score, status, summary, formula, signal_words, traps, examples, questions, order_index, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 'Part 5', '350-500', 'PUBLISHED', '', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 0, now(), now())
                        ON CONFLICT (id) DO NOTHING
                        """, topicId, code, "Chuyên đề " + topicId, "Topic " + topicId);
            }

            String upsert = """
                    INSERT INTO user_grammar_progress (user_id, topic_id, completed_questions, total_questions, status, updated_at)
                    VALUES (?, ?, ?, ?, ?, now())
                    ON CONFLICT (user_id, topic_id) DO UPDATE SET
                        completed_questions = EXCLUDED.completed_questions,
                        total_questions = EXCLUDED.total_questions,
                        status = EXCLUDED.status,
                        updated_at = now()
                    """;

            jdbc.update(upsert, userId, topicId, completed, total, normalizedStatus);
        } catch (Exception e) {
            System.err.println("Failed to save grammar progress for user " + userId + " topic " + topicId + ": " + e.getMessage());
        }
    }

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        lockGrammarHierarchy();
        if (data == null) return;
        String title = data.path("title").asText("").trim();
        if (title.isBlank()) return;

        String englishTitle = data.has("englishTitle") && !data.path("englishTitle").asText("").isBlank()
                ? data.path("englishTitle").asText("").trim()
                : title;
        String rawPart = data.path("part").asText("Part 5").trim();
        String part = formatPart(rawPart);
        String rawTargetScore = data.has("targetScore") && !data.path("targetScore").asText("").isBlank()
                ? data.path("targetScore").asText().trim()
                : data.path("level").asText("350-500").trim();
        String targetScore = normalizeTargetScore(rawTargetScore);
        String status = data.path("status").asText("PUBLISHED").trim().toUpperCase(Locale.ROOT);
        if (!List.of("DRAFT", "PUBLISHED").contains(status)) {
            throw badRequest("Trạng thái chủ điểm nhập vào không hợp lệ.");
        }
        String summary = data.has("summary") && !data.path("summary").asText("").isBlank()
                ? data.path("summary").asText().trim()
                : data.path("explanation").asText("").trim();
        String formula = data.has("formula") && !data.path("formula").asText("").isBlank()
                ? data.path("formula").asText().trim()
                : data.path("rule").asText("").trim();

        String code = data.has("code") && !data.path("code").asText("").isBlank()
                ? data.path("code").asText("").trim()
                : generateTopicCode(title);
        String signalWords = serializeJsonArray(data.get("signalWords"));
        String traps = serializeJsonArray(data.get("traps"));
        String examples = formatExamples(data.get("examples"));
        String questions = data.has("questions") && data.get("questions").isArray()
                ? data.get("questions").toString()
                : "[]";
        String grammarGroup = data.path("grammarGroup").asText("other").trim();
        String difficulty = data.path("difficulty").asText("MEDIUM").trim().toUpperCase(Locale.ROOT);
        String sourceNotes = data.path("sourceNotes").asText("");
        if (sourceNotes.length() > 3000) {
            throw badRequest("Ghi chú nguồn không được vượt quá 3.000 ký tự.");
        }
        JsonNode toeicPartsNode = data.get("toeicParts");
        String toeicParts = toeicPartsNode != null && toeicPartsNode.isArray()
                ? toeicPartsNode.toString()
                : objectMapper.createArrayNode().add(part).toString();
        String theory = data.has("theory") && data.path("theory").isObject()
                ? data.path("theory").toString() : "{}";
        String metadata = data.has("metadata") && data.path("metadata").isObject()
                ? data.path("metadata").toString() : "{}";
        String parentTopicId = resolveImportParent(data);
        String wordFamilyWordsJson = data.has("wordFamilyWords") && data.path("wordFamilyWords").isArray()
                ? data.path("wordFamilyWords").toString() : null;
        if (hasStructuredTopicFields(data)) {
            List<String> topicParts = toeicPartsNode != null && toeicPartsNode.isArray()
                    ? convertImportValue(toeicPartsNode, new TypeReference<List<String>>() {},
                            "Danh sách Part TOEIC không hợp lệ.")
                    : List.of(part);
            Map<String, String> theoryFields = data.path("theory").isObject()
                    ? convertImportValue(data.path("theory"), new TypeReference<Map<String, String>>() {},
                            "Nội dung lý thuyết không hợp lệ.")
                    : Map.of();
            Map<String, Object> metadataFields = data.path("metadata").isObject()
                    ? convertImportValue(data.path("metadata"), new TypeReference<Map<String, Object>>() {},
                            "Metadata ngữ pháp không hợp lệ.")
                    : Map.of();
            List<Map<String, Object>> exampleFields = data.path("examples").isArray()
                    ? convertImportValue(data.path("examples"), new TypeReference<List<Map<String, Object>>>() {},
                            "Danh sách ví dụ không hợp lệ.")
                    : List.of();
            List<Map<String, Object>> wordFamilyWords = data.path("wordFamilyWords").isArray()
                    ? readWordFamilyWords(data.path("wordFamilyWords")) : List.of();
            validateTopic(title, englishTitle, part, targetScore, status, summary, formula, grammarGroup,
                    parentTopicId, difficulty, topicParts, theoryFields, metadataFields, exampleFields,
                    wordFamilyWords);
        }

        List<String> existing = jdbc.query(
                "SELECT id FROM grammar_topics WHERE code = ? OR LOWER(title) = LOWER(?) "
                        + "ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END LIMIT 1",
                (rs, rowNum) -> rs.getString("id"),
                code, title, code);

        if (!existing.isEmpty()) {
            String topicId = existing.get(0);
            String existingStatus = findTopicStatus(topicId);
            if ("ARCHIVED".equals(existingStatus)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể ghi đè chủ điểm đã lưu trữ bằng dữ liệu nhập. Hãy khôi phục trước.");
            }
            validateNoParentCycle(topicId, parentTopicId);
            String updateSql = """
                    UPDATE grammar_topics SET
                        title = ?,
                        english_title = COALESCE(?, english_title),
                        part = ?,
                        target_score = ?,
                        status = ?,
                        summary = ?,
                        formula = ?,
                        signal_words = ?::jsonb,
                        traps = ?::jsonb,
                        examples = ?::jsonb,
                        questions = CASE WHEN ?::jsonb != '[]'::jsonb THEN ?::jsonb ELSE questions END,
                        grammar_group = CASE WHEN ? THEN ? ELSE grammar_group END,
                        parent_topic_id = CASE WHEN ? THEN ? ELSE parent_topic_id END,
                        toeic_parts = CASE WHEN ? THEN ?::jsonb ELSE toeic_parts END,
                        difficulty = CASE WHEN ? THEN ? ELSE difficulty END,
                        theory = CASE WHEN ? THEN ?::jsonb ELSE theory END,
                        metadata = CASE WHEN ? THEN ?::jsonb ELSE metadata END,
                        source_notes = CASE WHEN ? THEN ? ELSE source_notes END,
                        updated_at = now()
                    WHERE id = ?
                    """;
            jdbc.update(updateSql, title, englishTitle, part, targetScore, status, summary, formula,
                    signalWords, traps, examples, questions, questions,
                    data.has("grammarGroup"), grammarGroup,
                    data.has("parentTitleVi") || data.has("parentTopicId"), parentTopicId,
                    data.has("toeicParts"), toeicParts,
                    data.has("difficulty"), difficulty,
                    data.has("theory"), theory,
                    data.has("metadata"), metadata,
                    data.has("sourceNotes"), sourceNotes, topicId);
            if (wordFamilyWordsJson != null) {
                syncWordFamilyWords(topicId, readWordFamilyWords(data.path("wordFamilyWords")));
            }
        } else {
            Integer maxOrder = jdbc.queryForObject(
                    "SELECT COALESCE(MAX(order_index) + 1, 0) FROM grammar_topics", Integer.class);
            int orderIndex = maxOrder != null ? maxOrder : 0;
            String topicId = "g-" + slugify(code) + "-" + UUID.randomUUID().toString().substring(0, 8);
            String insertSql = """
                    INSERT INTO grammar_topics (
                        id, code, title, english_title, part, target_score, status, summary, formula,
                        signal_words, traps, examples, questions, order_index, grammar_group,
                        parent_topic_id, toeic_parts, difficulty, theory, metadata, source_notes,
                        created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, ?,
                            ?, ?, ?::jsonb, ?, ?::jsonb, ?::jsonb, ?, now(), now())
                    """;
            jdbc.update(insertSql, topicId, code, title, englishTitle, part, targetScore, status, summary,
                    formula, signalWords, traps, examples, questions, orderIndex, grammarGroup,
                    parentTopicId, toeicParts, difficulty, theory, metadata, sourceNotes);
            if (wordFamilyWordsJson != null) {
                syncWordFamilyWords(topicId, readWordFamilyWords(data.path("wordFamilyWords")));
            }
        }
    }

    private boolean hasStructuredTopicFields(JsonNode data) {
        return data.has("grammarGroup") || data.has("parentTitleVi") || data.has("parentTopicId")
                || data.has("toeicParts") || data.has("difficulty") || data.has("status")
                || data.has("theory") || data.has("metadata") || data.has("wordFamilyWords");
    }

    private <T> T convertImportValue(JsonNode value, TypeReference<T> type, String errorMessage) {
        try {
            return objectMapper.convertValue(value, type);
        } catch (IllegalArgumentException exception) {
            throw badRequest(errorMessage);
        }
    }

    private String resolveImportParent(JsonNode data) {
        String parentTitle = data.path("parentTitleVi").asText("").trim();
        String parentTopicId = data.path("parentTopicId").asText("").trim();
        if (parentTitle.isBlank() && parentTopicId.isBlank()) return null;

        List<String> parents;
        if (!parentTopicId.isBlank()) {
            parents = jdbc.query("SELECT id FROM grammar_topics WHERE id = ?",
                    (rs, rowNum) -> rs.getString("id"), parentTopicId);
        } else {
            parents = jdbc.query("SELECT id FROM grammar_topics WHERE LOWER(TRIM(title)) = LOWER(TRIM(?))",
                    (rs, rowNum) -> rs.getString("id"), parentTitle);
        }
        if (parents.isEmpty()) {
            throw badRequest("Không tìm thấy chủ điểm cha trong file nhập: "
                    + (parentTitle.isBlank() ? parentTopicId : parentTitle));
        }
        if (parents.size() > 1) {
            throw badRequest("Tên chủ điểm cha bị trùng, không thể xác định duy nhất: " + parentTitle);
        }
        String resolvedId = parents.getFirst();
        if ("ARCHIVED".equals(findTopicStatus(resolvedId))) {
            throw badRequest("Không thể gắn chủ điểm con mới vào chủ điểm cha đã lưu trữ.");
        }
        if (!parentTopicId.isBlank() && !parentTitle.isBlank()) {
            Boolean titleMatches = jdbc.query(
                    "SELECT EXISTS(SELECT 1 FROM grammar_topics WHERE id = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?)))",
                    rs -> rs.next() && rs.getBoolean(1), resolvedId, parentTitle);
            if (!Boolean.TRUE.equals(titleMatches)) {
                throw badRequest("Mã chủ điểm cha và tên chủ điểm cha không khớp.");
            }
        }
        return resolvedId;
    }

    private List<Map<String, Object>> readWordFamilyWords(JsonNode words) {
        try {
            return objectMapper.convertValue(words, new TypeReference<List<Map<String, Object>>>() {});
        } catch (IllegalArgumentException exception) {
            throw badRequest("Liên kết Word Family không hợp lệ.");
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
                rs.getString("source_url"),
                rs.getString("source_notes"),
                rs.getString("grammar_group"),
                rs.getString("parent_topic_id"),
                parseStringList(rs.getString("toeic_parts")),
                rs.getString("difficulty"),
                parseStringMap(rs.getString("theory")),
                parseObjectMap(rs.getString("metadata")),
                parseMapList(rs.getString("word_family_words")),
                parseStringList(rs.getString("signal_words")),
                parseStringList(rs.getString("traps")),
                parseMapList(rs.getString("examples")),
                parseMapList(rs.getString("questions")),
                rs.getInt("completed_questions"),
                rs.getInt("total_questions"),
                rs.getInt("linked_toeic_question_count"),
                rs.getString("user_status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                rs.getTimestamp("archived_at") == null ? null : rs.getTimestamp("archived_at").toInstant()
        );
    }

    private TopicLifecycleImpact loadTopicLifecycleImpact(String id) {
        TopicLifecycleImpact impact = jdbc.query("""
                WITH RECURSIVE target AS (
                    SELECT *
                    FROM grammar_topics
                    WHERE id = ?
                ),
                topic_tree(id, questions, examples, theory, metadata, grammar_group, path) AS (
                    SELECT target.id, target.questions, target.examples, target.theory,
                           target.metadata, target.grammar_group,
                           ARRAY[target.id]::varchar[]
                    FROM target
                    UNION ALL
                    SELECT child.id, child.questions, child.examples, child.theory,
                           child.metadata, child.grammar_group,
                           topic_tree.path || child.id
                    FROM grammar_topics child
                    JOIN topic_tree ON child.parent_topic_id = topic_tree.id
                    WHERE NOT child.id = ANY(topic_tree.path)
                ),
                subtree_counts AS (
                    SELECT
                        COALESCE(SUM(CASE WHEN jsonb_typeof(questions) = 'array'
                                          THEN jsonb_array_length(questions) ELSE 0 END), 0) AS question_count,
                        COALESCE(SUM(CASE WHEN jsonb_typeof(examples) = 'array'
                                          THEN jsonb_array_length(examples) ELSE 0 END), 0) AS example_count,
                        COALESCE(SUM(
                            (SELECT COUNT(*) FROM jsonb_each_text(
                                CASE WHEN jsonb_typeof(theory) = 'object'
                                     THEN theory ELSE '{}'::jsonb END) field
                             WHERE btrim(field.value) <> '')
                            +
                            (SELECT COUNT(*) FROM jsonb_each_text(
                                CASE WHEN jsonb_typeof(metadata->'groupValues'->grammar_group) = 'object'
                                     THEN metadata->'groupValues'->grammar_group ELSE '{}'::jsonb END) field
                             WHERE btrim(field.value) <> '')
                        ), 0) AS theory_field_count
                    FROM topic_tree
                )
                SELECT g.id, g.title, g.status,
                       (SELECT COUNT(*) FROM grammar_topics child WHERE child.parent_topic_id = g.id) AS child_count,
                       CASE WHEN jsonb_typeof(g.questions) = 'array'
                            THEN jsonb_array_length(g.questions) ELSE 0 END AS question_count,
                       CASE WHEN jsonb_typeof(g.examples) = 'array'
                            THEN jsonb_array_length(g.examples) ELSE 0 END AS example_count,
                       (SELECT COUNT(*) FROM jsonb_each_text(
                            CASE WHEN jsonb_typeof(g.theory) = 'object'
                                 THEN g.theory ELSE '{}'::jsonb END) field
                        WHERE btrim(field.value) <> '')
                       +
                       (SELECT COUNT(*) FROM jsonb_each_text(
                            CASE WHEN jsonb_typeof(g.metadata->'groupValues'->g.grammar_group) = 'object'
                                 THEN g.metadata->'groupValues'->g.grammar_group ELSE '{}'::jsonb END) field
                        WHERE btrim(field.value) <> '') AS theory_field_count,
                       (SELECT COUNT(*) FROM grammar_topic_vocabulary_words link WHERE link.topic_id = g.id) AS word_family_link_count,
                       (SELECT COUNT(*) FROM grammar_topic_questions link WHERE link.topic_id = g.id) AS toeic_question_link_count,
                       (SELECT COUNT(*) FROM user_grammar_progress progress WHERE progress.topic_id = g.id) AS user_progress_count,
                       0 AS learning_path_link_count,
                       subtree_counts.question_count AS subtree_question_count,
                       subtree_counts.example_count AS subtree_example_count,
                       subtree_counts.theory_field_count AS subtree_theory_field_count,
                       (SELECT COUNT(*) FROM grammar_topic_vocabulary_words link
                        JOIN topic_tree ON topic_tree.id = link.topic_id) AS subtree_word_family_link_count,
                       (SELECT COUNT(*) FROM grammar_topic_questions link
                        JOIN topic_tree ON topic_tree.id = link.topic_id) AS subtree_toeic_question_link_count,
                       (SELECT COUNT(*) FROM user_grammar_progress progress
                        JOIN topic_tree ON topic_tree.id = progress.topic_id) AS subtree_user_progress_count,
                       0 AS subtree_learning_path_link_count
                FROM target g
                CROSS JOIN subtree_counts
                """, rs -> {
            if (!rs.next()) return null;
            return new TopicLifecycleImpact(
                    rs.getString("id"),
                    rs.getString("title"),
                    rs.getString("status"),
                    rs.getInt("child_count"),
                    rs.getInt("question_count"),
                    rs.getInt("example_count"),
                    rs.getInt("theory_field_count"),
                    rs.getInt("word_family_link_count"),
                    rs.getInt("toeic_question_link_count"),
                    rs.getInt("user_progress_count"),
                    rs.getInt("learning_path_link_count"),
                    rs.getInt("subtree_question_count"),
                    rs.getInt("subtree_example_count"),
                    rs.getInt("subtree_theory_field_count"),
                    rs.getInt("subtree_word_family_link_count"),
                    rs.getInt("subtree_toeic_question_link_count"),
                    rs.getInt("subtree_user_progress_count"),
                    rs.getInt("subtree_learning_path_link_count"),
                    List.of());
        }, id);
        if (impact == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
        List<ChildTopicSummary> children = jdbc.query("""
                SELECT id, code, title, status
                FROM grammar_topics
                WHERE parent_topic_id = ?
                ORDER BY order_index, id
                """, (rs, rowNum) -> new ChildTopicSummary(
                rs.getString("id"), rs.getString("code"), rs.getString("title"), rs.getString("status")), id);
        return new TopicLifecycleImpact(
                impact.topicId(), impact.title(), impact.status(), impact.childCount(),
                impact.questionCount(), impact.exampleCount(), impact.theoryFieldCount(),
                impact.wordFamilyLinkCount(), impact.toeicQuestionLinkCount(),
                impact.userProgressCount(), impact.learningPathLinkCount(),
                impact.subtreeQuestionCount(), impact.subtreeExampleCount(), impact.subtreeTheoryFieldCount(),
                impact.subtreeWordFamilyLinkCount(), impact.subtreeToeicQuestionLinkCount(),
                impact.subtreeUserProgressCount(), impact.subtreeLearningPathLinkCount(), children);
    }

    private void lockGrammarHierarchy() {
        jdbc.execute("LOCK TABLE grammar_topics IN SHARE ROW EXCLUSIVE MODE");
    }

    private String findTopicStatusForUpdate(String id) {
        lockGrammarHierarchy();
        String status = findTopicStatus(id);
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chủ điểm: " + id);
        }
        return status;
    }

    private String findTopicStatus(String id) {
        List<String> statuses = jdbc.query(
                "SELECT status FROM grammar_topics WHERE id = ?",
                (rs, rowNum) -> rs.getString("status"), id);
        return statuses.isEmpty() ? null : statuses.get(0);
    }

    private GrammarCategory findCategory(String code) {
        List<GrammarCategory> result = jdbc.query("""
                SELECT code, name, field_definitions::text AS field_definitions, is_system
                FROM grammar_categories WHERE code = ?
                """, (rs, rowNum) -> new GrammarCategory(
                rs.getString("code"),
                rs.getString("name"),
                parseMapList(rs.getString("field_definitions")),
                rs.getBoolean("is_system")), code);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm ngữ pháp.");
        }
        return result.get(0);
    }

    private void validateCategoryRequest(GrammarCategoryRequest request) {
        if (request == null || request.code() == null || !CATEGORY_CODE.matcher(request.code().trim()).matches()) {
            throw badRequest("Mã nhóm phải bắt đầu bằng chữ thường và chỉ chứa chữ thường, số hoặc dấu gạch dưới.");
        }
        if (request.name() == null || request.name().isBlank() || request.name().trim().length() > 120) {
            throw badRequest("Tên nhóm ngữ pháp là bắt buộc và tối đa 120 ký tự.");
        }
        List<Map<String, Object>> definitions = request.fieldDefinitions() != null
                ? request.fieldDefinitions() : List.of();
        if (definitions.size() > 30) {
            throw badRequest("Mỗi nhóm ngữ pháp chỉ được có tối đa 30 trường đặc thù.");
        }
        java.util.Set<String> keys = new java.util.HashSet<>();
        for (Map<String, Object> definition : definitions) {
            if (definition == null) {
                throw badRequest("Danh sách trường đặc thù không hợp lệ.");
            }
            Object keyValue = definition.get("key");
            Object labelValue = definition.get("label");
            Object optionsValue = definition.get("options");
            if (!(keyValue instanceof String key)
                    || !key.matches("^[a-zA-Z][a-zA-Z0-9_]{0,63}$")
                    || !(labelValue instanceof String label)
                    || label.isBlank() || label.length() > 120
                    || !keys.add(key)) {
                throw badRequest("Danh sách trường đặc thù không hợp lệ.");
            }
            if (optionsValue != null && (!(optionsValue instanceof List<?> options)
                    || options.size() > 100
                    || options.stream().anyMatch(option -> !(option instanceof String value)
                            || value.isBlank() || value.length() > 120))) {
                throw badRequest("Danh sách lựa chọn của trường đặc thù không hợp lệ.");
            }
        }
    }

    private void validateTopic(
            String title,
            String englishTitle,
            String part,
            String targetScore,
            String status,
            String summary,
            String formula,
            String grammarGroup,
            String parentTopicId,
            String difficulty,
            List<String> toeicParts,
            Map<String, String> theory,
            Map<String, Object> metadata,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> wordFamilyWords) {
        if (title == null || title.isBlank() || title.trim().length() > 120
                || englishTitle == null || englishTitle.isBlank() || englishTitle.trim().length() > 120) {
            throw badRequest("Tên chủ điểm tiếng Việt và tiếng Anh là bắt buộc, tối đa 120 ký tự.");
        }
        if (summary == null || summary.isBlank() || summary.length() > 1000) {
            throw badRequest("Tóm tắt là bắt buộc và tối đa 1.000 ký tự.");
        }
        if (formula == null || formula.isBlank() || formula.length() > 5000) {
            throw badRequest("Công thức / cấu trúc là bắt buộc và tối đa 5.000 ký tự.");
        }
        if (!TARGET_SCORES.contains(targetScore)) {
            throw badRequest("Mục tiêu điểm TOEIC không hợp lệ.");
        }
        if (!List.of("DRAFT", "PUBLISHED", "ARCHIVED").contains(status)) {
            throw badRequest("Trạng thái chủ điểm không hợp lệ.");
        }
        if (!DIFFICULTIES.contains(difficulty)) {
            throw badRequest("Độ khó không hợp lệ.");
        }
        if (part == null || !TOEIC_PARTS.contains(formatPart(part))) {
            throw badRequest("Part TOEIC không hợp lệ.");
        }
        if (grammarGroup == null || grammarGroup.isBlank()
                || !Boolean.TRUE.equals(jdbc.query(
                        "SELECT EXISTS(SELECT 1 FROM grammar_categories WHERE code = ?)",
                        rs -> rs.next() && rs.getBoolean(1), grammarGroup))) {
            throw badRequest("Chọn một nhóm ngữ pháp đang tồn tại.");
        }
        if (toeicParts == null || toeicParts.size() > TOEIC_PARTS.size()
                || toeicParts.stream().anyMatch(value -> !TOEIC_PARTS.contains(value))
                || toeicParts.stream().distinct().count() != toeicParts.size()) {
            throw badRequest("Các Part TOEIC phải là Part 5, Part 6 hoặc Part 7.");
        }
        if (parentTopicId != null) {
            if (parentTopicId.isBlank()
                    || !Boolean.TRUE.equals(jdbc.query(
                            "SELECT EXISTS(SELECT 1 FROM grammar_topics WHERE id = ?)",
                            rs -> rs.next() && rs.getBoolean(1), parentTopicId))) {
                throw badRequest("Chủ điểm cha không tồn tại.");
            }
        }
        if (theory != null && (theory.size() > 30
                || theory.values().stream().anyMatch(value -> value != null && value.length() > 5000))) {
            throw badRequest("Nội dung lý thuyết vượt giới hạn cho phép.");
        }
        if (metadata != null) {
            if (metadata.size() > 30 || toJsonString(metadata).length() > 50000) {
                throw badRequest("Metadata ngữ pháp vượt giới hạn cho phép.");
            }
            validateGroupMetadata(grammarGroup, metadata);
        }
        if (examples != null) {
            if (examples.size() > 50 || examples.stream().anyMatch(example -> example == null
                    || textValue(example, "sentence").isBlank()
                            || textValue(example, "sentence").length() > 1000
                            || textValue(example, "translation").isBlank()
                            || textValue(example, "translation").length() > 1000
                            || textValue(example, "analysis").length() > 2000
                            || textValue(example, "focusWord").length() > 200)) {
                throw badRequest("Mỗi ví dụ cần có câu tiếng Anh và bản dịch hợp lệ.");
            }
            if (examples.stream().anyMatch(example -> !validExampleAnnotations(example))) {
                throw badRequest("Chú giải ví dụ không hợp lệ hoặc vượt quá giới hạn cho phép.");
            }
        }
        if (wordFamilyWords != null) {
            if (!"parts_of_speech".equals(grammarGroup) && !wordFamilyWords.isEmpty()) {
                throw badRequest("Word Family chỉ áp dụng cho nhóm Từ loại.");
            }
            if (wordFamilyWords.size() > 100) {
                throw badRequest("Một Word Family không được vượt quá 100 từ.");
            }
        }
    }

    private boolean validExampleAnnotations(Map<String, Object> example) {
        Object rawAnnotations = example.get("annotations");
        if (rawAnnotations == null) return true;
        if (!(rawAnnotations instanceof List<?> annotations)
                || annotations.size() > 100
                || toJsonString(annotations).length() > 50000) return false;

        String sentence = textValue(example, "sentence");
        for (Object rawAnnotation : annotations) {
            if (!(rawAnnotation instanceof Map<?, ?> annotation)) return false;
            Object rawStart = annotation.get("start");
            Object rawEnd = annotation.get("end");
            if (!(rawStart instanceof Number startValue) || !(rawEnd instanceof Number endValue)) return false;

            int start = startValue.intValue();
            int end = endValue.intValue();
            String selectedText = stringValue(annotation.get("selectedText"));
            String kind = stringValue(annotation.get("kind"));
            String label = stringValue(annotation.get("label"));
            String color = stringValue(annotation.get("color"));
            if (startValue.doubleValue() != start || endValue.doubleValue() != end
                    || start < 0 || end <= start || end > sentence.length()
                    || !sentence.substring(start, end).equals(selectedText)
                    || selectedText.length() > 1000
                    || !List.of("grammar", "highlight", "note").contains(kind)
                    || label.isBlank() || label.length() > 80
                    || !List.of("blue", "emerald", "amber", "violet", "rose").contains(color)
                    || stringValue(annotation.get("explanation")).length() > 500
                    || stringValue(annotation.get("partOfSpeech")).length() > 80
                    || stringValue(annotation.get("number")).length() > 40
                    || stringValue(annotation.get("countability")).length() > 40
                    || stringValue(annotation.get("role")).length() > 80
                    || stringValue(annotation.get("phraseType")).length() > 80) {
                return false;
            }
        }
        return true;
    }

    private String stringValue(Object value) {
        return value instanceof String text ? text : "";
    }

    private void validateGroupMetadata(String grammarGroup, Map<String, Object> metadata) {
        Object rawGroups = metadata.get("groupValues");
        if (!(rawGroups instanceof Map<?, ?> groupValues)) return;
        Object rawCurrent = groupValues.get(grammarGroup);
        if (!(rawCurrent instanceof Map<?, ?> currentValues)) return;
        for (Map.Entry<?, ?> entry : currentValues.entrySet()) {
            if (!(entry.getKey() instanceof String key) || !key.matches("^[a-zA-Z][a-zA-Z0-9_]{0,63}$")
                    || entry.getValue() != null && (!(entry.getValue() instanceof String value) || value.length() > 5000)) {
                throw badRequest("Trường đặc thù không khớp với nhóm ngữ pháp đã chọn.");
            }
        }
    }

    private void syncWordFamilyWords(String topicId, List<Map<String, Object>> words) {
        jdbc.update("DELETE FROM grammar_topic_vocabulary_words WHERE topic_id = ?", topicId);
        java.util.Set<String> seen = new java.util.HashSet<>();
        for (int index = 0; index < words.size(); index++) {
            Map<String, Object> word = words.get(index);
            if (word == null) {
                throw badRequest("Liên kết Word Family không hợp lệ.");
            }
            Object rawId = word.get("vocabularyItemId");
            Object rawPartOfSpeech = word.get("partOfSpeech");
            if (!(rawId instanceof String vocabularyItemId) || vocabularyItemId.isBlank()
                    || !seen.add(vocabularyItemId)
                    || !(rawPartOfSpeech instanceof String partOfSpeech)
                    || partOfSpeech.isBlank() || partOfSpeech.length() > 64) {
                throw badRequest("Liên kết Word Family không hợp lệ.");
            }
            Boolean exists = jdbc.query(
                    "SELECT EXISTS(SELECT 1 FROM vocabulary_items WHERE id = ?)",
                    rs -> rs.next() && rs.getBoolean(1), vocabularyItemId);
            if (!Boolean.TRUE.equals(exists)) {
                throw badRequest("Không tìm thấy từ vựng được liên kết: " + vocabularyItemId);
            }
            jdbc.update("""
                    INSERT INTO grammar_topic_vocabulary_words (topic_id, vocabulary_item_id, part_of_speech, order_index)
                    VALUES (?, ?, ?, ?)
                    """, topicId, vocabularyItemId, partOfSpeech, index);
        }
    }

    private String textValue(Map<String, Object> item, String key) {
        Object value = item.get(key);
        return value instanceof String text ? text : "";
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) return candidate.trim();
        }
        return "";
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeTargetScore(String value) {
        if (value == null || value.isBlank()) return value;
        String normalized = value.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace("+", "_PLUS");
        if (List.of("350_500", "500_750", "750_PLUS", "ALL").contains(normalized)) return normalized;
        if (normalized.contains("750") || normalized.contains("850")) return "750_PLUS";
        if (normalized.contains("500") || normalized.contains("650")) return "500_750";
        if (normalized.contains("350") || normalized.contains("450")) return "350_500";
        return normalized;
    }

    private void validateSourceNotes(String sourceNotes) {
        if (sourceNotes != null && sourceNotes.length() > 3000) {
            throw badRequest("Ghi chú nguồn không được vượt quá 3.000 ký tự.");
        }
    }

    private void validateNoParentCycle(String topicId, String parentTopicId) {
        if (parentTopicId == null) return;
        Boolean cycle = jdbc.query("""
                WITH RECURSIVE ancestors(id, parent_topic_id) AS (
                    SELECT id, parent_topic_id FROM grammar_topics WHERE id = ?
                    UNION ALL
                    SELECT parent.id, parent.parent_topic_id
                    FROM grammar_topics parent
                    JOIN ancestors child ON parent.id = child.parent_topic_id
                )
                SELECT EXISTS(SELECT 1 FROM ancestors WHERE id = ?)
                """, rs -> rs.next() && rs.getBoolean(1), parentTopicId, topicId);
        if (Boolean.TRUE.equals(cycle)) {
            throw badRequest("Chủ điểm cha không được tạo vòng lặp phân cấp.");
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
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

    private Map<String, String> parseStringMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private Map<String, Object> parseObjectMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private String toJsonString(Object obj) {
        if (obj == null) return "[]";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung chuyên đề không thể chuyển thành JSON hợp lệ.", e);
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
            String sourceUrl,
            String sourceNotes,
            String grammarGroup,
            String parentTopicId,
            List<String> toeicParts,
            String difficulty,
            Map<String, String> theory,
            Map<String, Object> metadata,
            List<Map<String, Object>> wordFamilyWords,
            List<String> signalWords,
            List<String> traps,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> questions,
            int completedQuestions,
            int totalQuestions,
            int linkedToeicQuestionCount,
            String userStatus,
            java.time.Instant createdAt,
            java.time.Instant updatedAt,
            java.time.Instant archivedAt
    ) {}

    public record ChildTopicSummary(String id, String code, String title, String status) {}

    public record TopicLifecycleImpact(
            String topicId,
            String title,
            String status,
            int childCount,
            int questionCount,
            int exampleCount,
            int theoryFieldCount,
            int wordFamilyLinkCount,
            int toeicQuestionLinkCount,
            int userProgressCount,
            int learningPathLinkCount,
            int subtreeQuestionCount,
            int subtreeExampleCount,
            int subtreeTheoryFieldCount,
            int subtreeWordFamilyLinkCount,
            int subtreeToeicQuestionLinkCount,
            int subtreeUserProgressCount,
            int subtreeLearningPathLinkCount,
            List<ChildTopicSummary> children
    ) {}

    public record DeleteTopicRequest(String childAction, String targetParentId) {}

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
            String sourceUrl,
            String sourceNotes,
            String grammarGroup,
            String parentTopicId,
            List<String> toeicParts,
            String difficulty,
            Map<String, String> theory,
            Map<String, Object> metadata,
            List<Map<String, Object>> wordFamilyWords,
            List<String> signalWords,
            List<String> traps,
            List<Map<String, Object>> examples,
            List<Map<String, Object>> questions,
            Integer orderIndex
    ) {}

    public record CreateGrammarTopicWithParentRequest(
            String parentTitleVi,
            String parentTitleEn,
            CreateGrammarTopicRequest child
    ) {}

    public record GrammarTopicHierarchy(GrammarTopic parent, GrammarTopic child) {}

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
            String sourceUrl,
            String sourceNotes,
            String grammarGroup,
            String parentTopicId,
            List<String> toeicParts,
            String difficulty,
            Map<String, String> theory,
            Map<String, Object> metadata,
            List<Map<String, Object>> wordFamilyWords,
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

    public record GrammarCategory(
            String code,
            String name,
            List<Map<String, Object>> fieldDefinitions,
            boolean system
    ) {}

    public record GrammarCategoryRequest(
            String code,
            String name,
            List<Map<String, Object>> fieldDefinitions
    ) {}
}
