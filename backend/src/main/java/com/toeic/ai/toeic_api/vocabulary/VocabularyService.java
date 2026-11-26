package com.toeic.ai.toeic_api.vocabulary;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VocabularyService {

    private static final int MAX_SRS_INTERVAL_DAYS = 365;
    private static final Map<String, String> ENGLISH_WORD_VARIANTS = Map.ofEntries(
            Map.entry("color", "colour"), Map.entry("colour", "color"),
            Map.entry("centre", "center"), Map.entry("center", "centre"),
            Map.entry("organize", "organise"), Map.entry("organise", "organize"),
            Map.entry("analyze", "analyse"), Map.entry("analyse", "analyze"),
            Map.entry("defense", "defence"), Map.entry("defence", "defense"),
            Map.entry("license", "licence"), Map.entry("licence", "license"));

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VocabularyService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<VocabularyTestSet> listSets(String category, UUID userId) {
        return listSets(category, userId, false);
    }

    public List<VocabularyTestSet> listSetSummaries(String category) {
        StringBuilder query = new StringBuilder(
                "SELECT s.id, s.title, s.year, s.category, "
                        + "COALESCE((SELECT COUNT(*) FROM vocabulary_items w WHERE w.set_id = s.id), s.word_count, 0) AS word_count, "
                        + "s.status, s.release_at "
                        + "FROM vocabulary_test_sets s "
                        + "WHERE s.status = 'PUBLISHED' AND (s.release_at IS NULL OR s.release_at <= now())");
        List<Object> args = new ArrayList<>();
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            query.append(" AND s.category = ?");
            args.add(category);
        }
        query.append(" ORDER BY s.id ASC");
        return jdbc.query(query.toString(), (rs, rowNum) -> mapSetSummary(rs), args.toArray());
    }

    public List<VocabularyTestSet> listSets(String category, UUID userId, boolean includeUnpublished) {
        StringBuilder setSql = new StringBuilder(
                "SELECT s.id, s.title, s.year, s.category, "
                        + "COALESCE((SELECT COUNT(*) FROM vocabulary_items w WHERE w.set_id = s.id), s.word_count, 0) AS word_count, "
                        + "s.status, s.release_at FROM vocabulary_test_sets s WHERE 1=1");
        List<Object> setArgs = new ArrayList<>();
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            setSql.append(" AND s.category = ?");
            setArgs.add(category);
        }
        if (!includeUnpublished) {
            setSql.append(" AND s.status = 'PUBLISHED' AND (s.release_at IS NULL OR s.release_at <= now())");
        }
        setSql.append(" ORDER BY s.id ASC");
        List<VocabularyTestSet> sets = jdbc.query(setSql.toString(), (rs, rowNum) -> mapSetSummary(rs), setArgs.toArray());

        // Fetch words for all sets with user progress
        String wordSql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.meaning_source, w.meaning_edited,
                       w.example, w.example_meaning, w.level,
                       w.audio_url, w.audio_region, w.word_family, w.term_type, w.dictionary_source_url,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                ORDER BY w.set_id, w.order_index ASC, w.id ASC
                """;

        List<VocabularyWord> allWords = loadSenses(jdbc.query(wordSql, (rs, rowNum) -> mapWord(rs), userId));
        Map<String, List<VocabularyWord>> wordsBySet = new HashMap<>();
        for (VocabularyWord w : allWords) {
            wordsBySet.computeIfAbsent(w.setId(), k -> new ArrayList<>()).add(w);
        }

        List<VocabularyTestSet> result = new ArrayList<>();
        for (VocabularyTestSet s : sets) {
            List<VocabularyWord> words = wordsBySet.getOrDefault(s.id(), Collections.emptyList());
            result.add(new VocabularyTestSet(
                    s.id(),
                    s.title(),
                    s.year(),
                    s.category(),
                    words.size(),
                    s.status(),
                    s.releaseAt(),
                    words
            ));
        }
        return result;
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId) {
        return getSetDetails(setId, userId, false);
    }

    public VocabularyTestSet getSetDetails(String setId, UUID userId, boolean includeUnpublished) {
        String query = "SELECT id, title, year, category, word_count, status, release_at "
                + "FROM vocabulary_test_sets WHERE id = ?";
        if (!includeUnpublished) {
            query += " AND status = 'PUBLISHED' AND (release_at IS NULL OR release_at <= now())";
        }
        List<VocabularyTestSet> sets = jdbc.query(
                query, (rs, rowNum) -> mapSetSummary(rs), setId);

        if (sets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        VocabularyTestSet set = sets.get(0);
        List<VocabularyWord> words = getWordsForSet(setId, userId);
        return new VocabularyTestSet(set.id(), set.title(), set.year(), set.category(), words.size(),
                set.status(), set.releaseAt(), words);
    }

    public List<VocabularyWord> getWordsForSet(String setId, UUID userId) {
        String sql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.meaning_source, w.meaning_edited,
                       w.example, w.example_meaning, w.level,
                       w.audio_url, w.audio_region, w.word_family, w.term_type, w.dictionary_source_url,
                       COALESCE(p.starred, w.starred) AS starred,
                       COALESCE(p.status, 'NEW') AS status
                FROM vocabulary_items w
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                WHERE w.set_id = ?
                ORDER BY w.order_index ASC, w.id ASC
                """;

        return loadSenses(jdbc.query(sql, (rs, rowNum) -> mapWord(rs), userId, setId));
    }

    public StudentVocabularyDashboard getStudentDashboard(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }

        String summarySql = """
                SELECT
                    COUNT(DISTINCT w.id) AS total_words,
                    COUNT(DISTINCT CASE WHEN p.review_count > 0 AND p.status IN ('LEARNING', 'REVIEWING', 'MASTERED') THEN w.id END) AS learned_words,
                    COUNT(DISTINCT CASE WHEN COALESCE(p.status, 'NEW') = 'MASTERED' THEN w.id END) AS mastered_words,
                    COUNT(DISTINCT CASE WHEN p.review_count > 0 AND p.status = 'LEARNING' THEN w.id END) AS learning_words,
                    COUNT(DISTINCT CASE WHEN p.review_count > 0 AND p.status = 'REVIEWING' THEN w.id END) AS reviewing_words,
                    COUNT(DISTINCT CASE WHEN p.next_review_at <= now() THEN w.id END) AS due_for_review,
                    COUNT(DISTINCT s.id) AS total_sets
                FROM vocabulary_items w
                JOIN vocabulary_test_sets s ON s.id = w.set_id
                LEFT JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                WHERE s.status = 'PUBLISHED' AND (s.release_at IS NULL OR s.release_at <= now())
                """;

        var summary = jdbc.queryForObject(summarySql, (rs, rowNum) -> new StudentProgressSummary(
                rs.getLong("total_words"),
                rs.getLong("learned_words"),
                rs.getLong("mastered_words"),
                rs.getLong("learning_words"),
                rs.getLong("reviewing_words"),
                rs.getLong("due_for_review"),
                rs.getLong("total_sets")
        ), userId);

        int dailyStudyMinutesGoal = jdbc.queryForObject(
                "SELECT COALESCE((SELECT daily_study_minutes FROM learning_profiles WHERE user_id = ? LIMIT 1), 30)",
                Integer.class,
                userId
        );

        long memoryRate = summary.totalWords() == 0 ? 0 : Math.round(summary.masteredWords() * 100.0 / summary.totalWords());
        List<LocalDate> studyDays = jdbc.query(
                """
                SELECT DISTINCT (attempted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS study_day
                FROM vocabulary_learning_events
                WHERE user_id = ?
                  AND (attempted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                      >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 365
                ORDER BY study_day DESC
                """,
                (rs, rowNum) -> rs.getDate("study_day").toLocalDate(),
                userId);
        int streakDays = calculateStreak(studyDays);
        long studyMinutes = jdbc.queryForObject("""
                SELECT COALESCE(SUM(response_time_ms), 0) / 60000
                FROM vocabulary_learning_events
                WHERE user_id = ?
                """, Long.class, userId);
        AnswerCount answerCount = jdbc.queryForObject("""
                SELECT COUNT(*) AS total_answers,
                       COUNT(*) FILTER (WHERE is_correct) AS correct_answers
                FROM vocabulary_learning_events
                WHERE user_id = ?
                """, (rs, rowNum) -> new AnswerCount(
                rs.getLong("total_answers"),
                rs.getLong("correct_answers")), userId);

        StudentVocabularyGoal goal = getDailyGoal(userId);
        return new StudentVocabularyDashboard(
                summary.totalWords(),
                summary.learnedWords(),
                summary.masteredWords(),
                summary.learningWords(),
                summary.reviewingWords(),
                summary.dueForReview(),
                summary.totalSets(),
                memoryRate,
                (int) Math.min(studyMinutes, Integer.MAX_VALUE),
                streakDays,
                dailyStudyMinutesGoal,
                answerCount.totalAnswers(),
                answerCount.correctAnswers(),
                goal.newWordsGoal(),
                goal.reviewGoal(),
                goal.completedNewWords(),
                goal.completedReview(),
                goal.reachedNewGoal(),
                goal.reachedReviewGoal()
        );
    }

    private int calculateStreak(List<LocalDate> studyDays) {
        if (studyDays.isEmpty()) {
            return 0;
        }
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDate expected = studyDays.getFirst().equals(today) ? today : today.minusDays(1);
        if (studyDays.getFirst().isBefore(expected)) {
            return 0;
        }
        int streak = 0;
        for (LocalDate day : studyDays) {
            if (!day.equals(expected)) {
                break;
            }
            streak++;
            expected = expected.minusDays(1);
        }
        return streak;
    }

    @Transactional
    public StudentVocabularyGoal getDailyGoal(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }

        jdbc.update("""
                INSERT INTO vocabulary_daily_goals (
                    user_id, goal_date, new_words_goal, review_goal,
                    completed_new_words, completed_review, created_at, updated_at
                )
                VALUES (
                    ?,
                    (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
                    COALESCE((SELECT recommended_new_words_per_day FROM study_plans WHERE user_id = ? AND is_active = TRUE LIMIT 1), 10),
                    COALESCE((SELECT recommended_review_per_day FROM study_plans WHERE user_id = ? AND is_active = TRUE LIMIT 1), 20),
                    0, 0, now(), now()
                )
                ON CONFLICT (user_id, goal_date) DO NOTHING
                """, userId, userId, userId);

        String sql = """
                SELECT new_words_goal, review_goal, completed_new_words, completed_review
                FROM vocabulary_daily_goals
                WHERE user_id = ? AND goal_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                LIMIT 1
                """;
        List<StudentVocabularyGoal> goals = jdbc.query(sql, (rs, rowNum) -> new StudentVocabularyGoal(
                rs.getInt("new_words_goal"),
                rs.getInt("review_goal"),
                rs.getInt("completed_new_words"),
                rs.getInt("completed_review"),
                rs.getInt("completed_new_words") >= rs.getInt("new_words_goal"),
                rs.getInt("completed_review") >= rs.getInt("review_goal")
        ), userId);

        if (!goals.isEmpty()) {
            return goals.getFirst();
        }

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Không thể tải mục tiêu học từ vựng trong ngày.");
    }

    @Transactional
    public StudentVocabularyGoal upsertDailyGoal(UUID userId, int newWordsGoal, int reviewGoal) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        if (newWordsGoal < 0 || newWordsGoal > 500 || reviewGoal < 0 || reviewGoal > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mục tiêu phải nằm trong khoảng 0 đến 500 từ.");
        }
        int safeNewGoal = Math.max(0, newWordsGoal);
        int safeReviewGoal = Math.max(0, reviewGoal);

        jdbc.update("""
                INSERT INTO vocabulary_daily_goals (
                    user_id, goal_date, new_words_goal, review_goal,
                    completed_new_words, completed_review, created_at, updated_at
                )
                VALUES (?, (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, ?, ?, 0, 0, now(), now())
                ON CONFLICT (user_id, goal_date)
                DO UPDATE SET
                    new_words_goal = EXCLUDED.new_words_goal,
                    review_goal = EXCLUDED.review_goal,
                    updated_at = now()
                """,
                userId,
                safeNewGoal,
                safeReviewGoal
        );

        return getDailyGoal(userId);
    }

    public List<VocabularyWord> getDueReviewWords(UUID userId, String setId, int requestedLimit) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        int limit = Math.max(1, Math.min(requestedLimit, 500));
        String sql = """
                SELECT w.id, w.set_id, w.word, w.ipa, w.part_of_speech, w.meaning,
                       w.meaning_source, w.meaning_edited,
                       w.example, w.example_meaning, w.level,
                       w.audio_url, w.audio_region, w.word_family, w.term_type, w.dictionary_source_url,
                       COALESCE(p.starred, w.starred) AS starred,
                       p.status AS status
                FROM vocabulary_items w
                JOIN vocabulary_test_sets s ON s.id = w.set_id
                JOIN user_vocabulary_progress p ON p.word_id = w.id AND p.user_id = ?
                WHERE p.next_review_at <= now()
                  AND s.status = 'PUBLISHED' AND (s.release_at IS NULL OR s.release_at <= now())
                  AND (?::varchar IS NULL OR w.set_id = ?)
                ORDER BY p.incorrect_count DESC, p.next_review_at ASC
                LIMIT ?
                """;
        return loadSenses(jdbc.query(sql, (rs, rowNum) -> mapWord(rs), userId, setId, setId, limit));
    }

    public List<VocabularyHistoryItem> getLearningHistory(UUID userId, int requestedLimit, String requestedActivity) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        int limit = Math.max(1, Math.min(requestedLimit, 100));
        String activity = requestedActivity == null || requestedActivity.isBlank()
                ? null
                : normalizeActivityType(requestedActivity);
        return jdbc.query("""
                SELECT e.id, e.word_id, w.word, w.set_id, s.title AS set_title,
                       e.activity_type, e.question_type, e.student_answer, e.correct_answer,
                       e.is_correct, e.rating, e.response_time_ms, e.attempted_at
                FROM vocabulary_learning_events e
                JOIN vocabulary_items w ON w.id = e.word_id
                JOIN vocabulary_test_sets s ON s.id = w.set_id
                WHERE e.user_id = ? AND (?::varchar IS NULL OR e.activity_type = ?)
                ORDER BY e.attempted_at DESC, e.id DESC
                LIMIT ?
                """,
                (rs, rowNum) -> new VocabularyHistoryItem(
                        rs.getObject("id", UUID.class),
                        rs.getString("word_id"),
                        rs.getString("word"),
                        rs.getString("set_id"),
                        rs.getString("set_title"),
                        rs.getString("activity_type"),
                        rs.getString("question_type"),
                        rs.getString("student_answer"),
                        rs.getString("correct_answer"),
                        rs.getBoolean("is_correct"),
                        rs.getString("rating"),
                        rs.getInt("response_time_ms"),
                        rs.getTimestamp("attempted_at").toInstant().toString()),
                userId, activity, activity, limit);
    }

    @Transactional
    public VocabularyGameSession startGameSession(UUID userId, StartVocabularyGameRequest request) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        if (request == null || request.setId() == null || request.setId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần chọn bộ từ vựng để chơi.");
        }
        String gameType = normalizeGameType(request.gameType());
        String playMode = "SENTENCE".equals(gameType)
                ? normalizeSentenceGameMode(request.mode())
                : "CLASSIC";
        String difficulty = "SENTENCE".equals(gameType)
                ? normalizeSentenceDifficulty(request.difficulty())
                : "MEDIUM";
        Integer timeLimitSeconds = "TIME_ATTACK".equals(playMode)
                ? request.timeLimitSeconds()
                : null;
        if ("TIME_ATTACK".equals(playMode)
                && (timeLimitSeconds == null || !Set.of(30, 60, 90, 120).contains(timeLimitSeconds))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thời lượng Time Attack phải là 30, 60, 90 hoặc 120 giây.");
        }
        if ("CLASSIC".equals(playMode) && request.timeLimitSeconds() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Classic không sử dụng giới hạn thời gian.");
        }
        if (request.questionCount() != null) {
            if (request.questionCount() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số câu hỏi không hợp lệ.");
            }
            if (!"MATCHING".equals(gameType) && !Set.of(10, 20, 30).contains(request.questionCount())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Số câu hỏi phải là 10, 20, 30 hoặc toàn bộ câu khả dụng.");
            }
        }
        Integer publishedSetCount = jdbc.queryForObject("""
                SELECT count(*) FROM vocabulary_test_sets
                WHERE id = ? AND status = 'PUBLISHED'
                  AND (release_at IS NULL OR release_at <= now())
                """, Integer.class, request.setId().trim());
        if (publishedSetCount == null || publishedSetCount == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng đã phát hành.");
        }
        List<String> deckIds = request.deckIds() == null || request.deckIds().isEmpty()
                ? List.of(request.setId().trim())
                : request.deckIds().stream().filter(java.util.Objects::nonNull)
                        .map(deckId -> deckId.trim()).distinct().toList();
        if (deckIds.stream().anyMatch(id -> id.isBlank() || id.length() > 64 || id.contains(","))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách bộ từ vựng không hợp lệ.");
        }
        for (String deckId : deckIds) {
            Integer available = jdbc.queryForObject("""
                    SELECT count(*) FROM vocabulary_test_sets
                    WHERE id = ? AND status = 'PUBLISHED'
                      AND (release_at IS NULL OR release_at <= now())
                    """, Integer.class, deckId);
            if (available == null || available == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách có bộ từ chưa phát hành.");
            }
        }
        if (!deckIds.contains(request.setId().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bộ từ chính phải nằm trong danh sách bộ đã chọn.");
        }

        List<SentenceGameQuestion> questionPlan = "SENTENCE".equals(gameType)
                ? createSentenceQuestionPlan(deckIds, userId, request.questionCount(), difficulty)
                : List.of();
        if ("SENTENCE".equals(gameType) && questionPlan.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không đủ dữ liệu cùng từ loại và trình độ để tạo câu hỏi có đáp án nhiễu đáng tin cậy.");
        }

        UUID sessionId = UUID.randomUUID();
        int initialTotalQuestions = request.questionCount() != null ? request.questionCount() : 0;
        jdbc.update("""
                INSERT INTO vocabulary_game_sessions (
                    id, user_id, set_id, game_type, play_mode, time_limit_seconds, difficulty, total_questions
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, sessionId, userId, request.setId().trim(), gameType, playMode, timeLimitSeconds, difficulty, initialTotalQuestions);
        jdbc.update("""
                UPDATE vocabulary_game_sessions
                SET deck_ids = string_to_array(?, ',')
                WHERE id = ?
                """, String.join(",", deckIds), sessionId);
        for (int questionIndex = 0; questionIndex < questionPlan.size(); questionIndex++) {
            SentenceGameQuestion question = questionPlan.get(questionIndex);
            int currentQuestionIndex = questionIndex;
            jdbc.update(connection -> {
                var statement = connection.prepareStatement("""
                        INSERT INTO vocabulary_game_session_questions (
                            session_id, question_index, word_id, option_word_ids
                        )
                        VALUES (?, ?, ?, ?)
                        """);
                statement.setObject(1, sessionId);
                statement.setInt(2, currentQuestionIndex);
                statement.setString(3, question.wordId());
                statement.setArray(4, connection.createArrayOf(
                        "text", question.optionWordIds().toArray(String[]::new)));
                return statement;
            });
        }
        return getGameSession(userId, sessionId);
    }

    private List<SentenceGameQuestion> createSentenceQuestionPlan(
            List<String> deckIds, UUID userId, Integer requestedCount, String difficulty) {
        List<VocabularyWord> setWords = deckIds.stream()
                .flatMap(deckId -> getWordsForSet(deckId, userId).stream())
                .collect(java.util.stream.Collectors.toMap(
                        word -> word.id(),
                        word -> word,
                        (first, ignored) -> first,
                        LinkedHashMap::new))
                .values()
                .stream()
                .toList();
        List<VocabularyWord> targets = setWords.stream()
                .filter(word -> word.example() != null && containsWholeWord(word.example(), word.word()))
                .filter(word -> word.partOfSpeech() != null && !word.partOfSpeech().isBlank())
                .filter(word -> word.level() != null && !word.level().isBlank())
                .filter(word -> isSentenceDifficultyLevel(word.level(), difficulty))
                .toList();
        List<SentenceGameQuestion> plan = new ArrayList<>();

        for (VocabularyWord target : targets) {
            List<VocabularyWord> distractors = setWords.stream()
                    .filter(candidate -> !candidate.id().equals(target.id()))
                    .filter(candidate -> candidate.partOfSpeech() != null
                            && candidate.partOfSpeech().equalsIgnoreCase(target.partOfSpeech()))
                    .filter(candidate -> candidate.level() != null
                            && candidate.level().equalsIgnoreCase(target.level()))
                    .filter(candidate -> !sameWordFamily(target, candidate))
                    .filter(candidate -> !shareSynonym(target, candidate))
                    .toList();
            if (distractors.size() < 3) {
                continue;
            }

            List<VocabularyWord> shuffledDistractors = new ArrayList<>(distractors);
            Collections.shuffle(shuffledDistractors);
            List<String> options = new ArrayList<>(List.of(target.id()));
            shuffledDistractors.stream().limit(3).map(word -> word.id()).forEach(options::add);
            Collections.shuffle(options);
            plan.add(new SentenceGameQuestion(0, target.id(), options));
        }

        Collections.shuffle(plan);
        int questionLimit = requestedCount == null ? plan.size() : Math.min(requestedCount, plan.size());
        List<SentenceGameQuestion> limitedPlan = new ArrayList<>(plan.subList(0, questionLimit));
        for (int index = 0; index < limitedPlan.size(); index++) {
            SentenceGameQuestion question = limitedPlan.get(index);
            limitedPlan.set(index, new SentenceGameQuestion(index, question.wordId(), question.optionWordIds()));
        }
        return limitedPlan;
    }

    private String normalizeSentenceDifficulty(String difficulty) {
        if (difficulty == null || difficulty.isBlank()) {
            return "MEDIUM";
        }
        String normalized = difficulty.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("ALL", "EASY", "MEDIUM", "HARD").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cấp độ SENTENCE MASTER không hợp lệ.");
        }
        return normalized;
    }

    private boolean isSentenceDifficultyLevel(String level, String difficulty) {
        String cefrLevel = formatLevel(level);
        return switch (difficulty) {
            case "ALL" -> true;
            case "EASY" -> Set.of("A1", "A2").contains(cefrLevel);
            case "HARD" -> Set.of("C1", "C2").contains(cefrLevel);
            default -> Set.of("B1", "B2").contains(cefrLevel);
        };
    }

    private boolean containsWholeWord(String sentence, String word) {
        return word != null && !word.isBlank()
                && Pattern.compile("(?i)(?<![\\p{L}\\p{N}])" + Pattern.quote(word) + "(?![\\p{L}\\p{N}])")
                .matcher(sentence)
                .find();
    }

    private boolean sameWordFamily(VocabularyWord left, VocabularyWord right) {
        return left.wordFamily() != null && !left.wordFamily().isBlank()
                && left.wordFamily().equalsIgnoreCase(right.wordFamily());
    }

    private boolean shareSynonym(VocabularyWord left, VocabularyWord right) {
        Set<String> leftSynonyms = left.senses().stream()
                .map(sense -> sense.synonyms())
                .filter(value -> value != null && !value.isBlank())
                .flatMap(value -> java.util.Arrays.stream(value.split("[,;|\\n]")))
                .map(this::normalizeAnswer)
                .collect(java.util.stream.Collectors.toSet());
        Set<String> rightSynonyms = right.senses().stream()
                .map(sense -> sense.synonyms())
                .filter(value -> value != null && !value.isBlank())
                .flatMap(value -> java.util.Arrays.stream(value.split("[,;|\\n]")))
                .map(this::normalizeAnswer)
                .collect(java.util.stream.Collectors.toSet());
        String leftWord = normalizeAnswer(left.word());
        String rightWord = normalizeAnswer(right.word());
        return leftSynonyms.contains(rightWord)
                || rightSynonyms.contains(leftWord)
                || leftSynonyms.stream().anyMatch(rightSynonyms::contains);
    }

    @Transactional
    public VocabularyGameSession completeGameSession(UUID userId, UUID sessionId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        List<VocabularyGameSessionState> sessions = jdbc.query("""
                SELECT id, game_type, completed_at, total_questions
                FROM vocabulary_game_sessions
                WHERE id = ? AND user_id = ?
                FOR UPDATE
                """, (rs, rowNum) -> new VocabularyGameSessionState(
                rs.getObject("id", UUID.class),
                rs.getString("game_type"),
                rs.getTimestamp("completed_at"),
                rs.getInt("total_questions")), sessionId, userId);
        if (sessions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt chơi.");
        }

        VocabularyGameSessionState session = sessions.getFirst();
        if (session.completedAt() == null) {
            String playMode = jdbc.queryForObject(
                    "SELECT play_mode FROM vocabulary_game_sessions WHERE id = ?",
                    String.class, sessionId);
            List<GameAnswerState> gameAnswers = jdbc.query("""
                    SELECT e.is_correct, e.game_result, e.used_hint,
                           GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (
                               e.attempted_at - COALESCE(
                                   LAG(e.attempted_at) OVER (ORDER BY e.game_question_index, e.attempted_at),
                                   gs.started_at
                               )
                           )) * 1000)::int) AS response_time_ms
                    FROM vocabulary_learning_events e
                    JOIN vocabulary_game_sessions gs ON gs.id = e.game_session_id
                    WHERE e.game_session_id = ?
                    ORDER BY e.game_question_index
                    """, (rs, rowNum) -> new GameAnswerState(
                    rs.getBoolean("is_correct"),
                    rs.getString("game_result"),
                    rs.getBoolean("used_hint"),
                    rs.getInt("response_time_ms")), sessionId);
            int combo = 0;
            int maxCombo = 0;
            int score = 0;
            int totalDamage = 0;
            int streak = 0;
            int enemyCharge = 0;
            int playerHpLost = 0;

            for (GameAnswerState answer : gameAnswers) {
                if ("BATTLE".equals(session.gameType())) {
                    if ("correct".equals(answer.result())
                            || answer.result() == null && answer.correct()) {
                        streak++;
                        boolean isCrit = (streak == 5 || streak == 10 || streak == 15);
                        int dmg = isCrit ? 2 : 1;
                        totalDamage += dmg;
                        int scoringCombo = answer.usedHint() ? Math.max(1, combo) : Math.min(combo + 1, 5);
                        score += gameScoreForAnswer("BATTLE", scoringCombo, answer.usedHint());
                        if (!answer.usedHint()) {
                            combo = scoringCombo;
                            maxCombo = Math.max(maxCombo, combo);
                        }
                    } else if ("near".equals(answer.result())) {
                        score += gameScoreForAnswer("BATTLE", Math.max(1, combo), answer.usedHint()) / 2;
                    } else {
                        streak = 0;
                        combo = 0;
                        enemyCharge++;
                        if (enemyCharge >= 2) {
                            enemyCharge = 0;
                            playerHpLost++;
                        }
                    }
                    continue;
                }
                boolean correct = answer.correct();
                if (correct) {
                    combo++;
                    maxCombo = Math.max(maxCombo, combo);
                    score += gameScoreForAnswer(session.gameType(), combo);
                    if ("TIME_ATTACK".equals(playMode)) {
                        score += timeAttackSpeedBonus(answer.responseTimeMs());
                    }
                } else {
                    combo = 0;
                }
            }
            GameAnswerSummary summary = jdbc.queryForObject("""
                    SELECT COUNT(*) FILTER (
                               WHERE game_result = 'correct' OR game_result IS NULL AND is_correct
                           ) AS correct_count,
                           COUNT(*) FILTER (
                               WHERE game_result IN ('wrong', 'timeout')
                                  OR game_result IS NULL AND NOT is_correct
                           ) AS wrong_count,
                           COUNT(*) AS total_count,
                           GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - (
                               SELECT started_at FROM vocabulary_game_sessions WHERE id = ?
                           ))))::int) AS duration_seconds
                    FROM vocabulary_learning_events
                    WHERE game_session_id = ?
                    """, (rs, rowNum) -> new GameAnswerSummary(
                    rs.getInt("correct_count"),
                    rs.getInt("wrong_count"),
                    rs.getInt("total_count"),
                    rs.getInt("duration_seconds")), sessionId, sessionId);

            Integer stars = null;
            Boolean won = null;
            Integer playerHpRemaining = null;
            Integer fleetHpRemaining = null;
            String tier = null;
            Integer avoidableMistakes = null;

            if ("BATTLE".equals(session.gameType())) {
                fleetHpRemaining = Math.max(0, 12 - totalDamage);
                playerHpRemaining = Math.max(0, 5 - playerHpLost);
                won = fleetHpRemaining == 0 && playerHpRemaining > 0;
                int totalAnswered = summary.totalCount();
                double accuracy = totalAnswered > 0 ? (summary.correctCount() * 100.0) / totalAnswered : 0.0;
                if (won) {
                    if (accuracy >= 90.0 && playerHpRemaining >= 4) {
                        stars = 3;
                    } else if (accuracy >= 70.0 && playerHpRemaining >= 2) {
                        stars = 2;
                    } else {
                        stars = 1;
                    }
                } else {
                    stars = 0;
                }
            } else if ("MATCHING".equals(session.gameType())) {
                List<GameScoringCalculator.MemoryMatchAttempt> attempts = jdbc.query("""
                        SELECT word_id, second_word_id, is_correct, game_question_index
                        FROM vocabulary_learning_events
                        WHERE game_session_id = ?
                        ORDER BY game_question_index ASC, attempted_at ASC
                        """, (rs, rowNum) -> new GameScoringCalculator.MemoryMatchAttempt(
                        rs.getString("word_id"),
                        rs.getString("second_word_id"),
                        rs.getBoolean("is_correct"),
                        rs.getInt("game_question_index")), sessionId);

                Set<String> wordIds = new HashSet<>();
                for (var a : attempts) {
                    if (a.firstWordId() != null) wordIds.add(a.firstWordId());
                    if (a.secondWordId() != null) wordIds.add(a.secondWordId());
                }

                Map<String, GameScoringCalculator.WordInfo> wordInfoMap = new HashMap<>();
                if (!wordIds.isEmpty()) {
                    String placeholders = String.join(",", Collections.nCopies(wordIds.size(), "?"));
                    List<GameScoringCalculator.WordInfo> infos = jdbc.query(
                            "SELECT id, word, meaning FROM vocabulary_items WHERE id IN (" + placeholders + ")",
                            (rs, rowNum) -> new GameScoringCalculator.WordInfo(
                                    rs.getString("id"),
                                    rs.getString("word"),
                                    rs.getString("meaning")),
                            wordIds.toArray());
                    for (var info : infos) {
                        wordInfoMap.put(info.id(), info);
                    }
                }

                int totalExpectedN = session.totalQuestions() > 0 ? session.totalQuestions() : summary.correctCount();
                GameScoringCalculator.MemoryMatchResult mmResult = GameScoringCalculator.calculateMemoryMatchResult(
                        totalExpectedN,
                        summary.durationSeconds(),
                        maxCombo,
                        attempts,
                        wordInfoMap
                );

                score = mmResult.score();
                stars = mmResult.stars();
                tier = mmResult.tier();
                avoidableMistakes = mmResult.avoidableMistakes();
                won = "S".equals(tier) || "A".equals(tier) || "B".equals(tier);

                // SRS update in the same transaction
                Set<String> penalizedWordIds = new HashSet<>();
                for (GameScoringCalculator.WrongWordDetail wd : mmResult.wrongWords()) {
                    if (!wd.matched() || wd.avoidableCount() >= 2) {
                        if (penalizedWordIds.add(wd.vocabularyId())) {
                            updateWordSrs(userId, wd.vocabularyId(), false, "AGAIN");
                        }
                    }
                }
                Set<String> wrongWordIds = mmResult.wrongWords().stream()
                        .map(GameScoringCalculator.WrongWordDetail::vocabularyId)
                        .collect(Collectors.toSet());
                Set<String> rewardedWordIds = new HashSet<>();
                for (var a : attempts) {
                    if (a.isCorrect() && a.firstWordId() != null && !wrongWordIds.contains(a.firstWordId())) {
                        if (rewardedWordIds.add(a.firstWordId())) {
                            updateWordSrs(userId, a.firstWordId(), true, "GOOD");
                        }
                    }
                }
            }

            int finalCorrectCount = summary.correctCount();
            int finalWrongCount = "MATCHING".equals(session.gameType())
                    ? Math.max(0, summary.totalCount() - summary.correctCount())
                    : summary.wrongCount();
            int finalTotalQuestions = "MATCHING".equals(session.gameType())
                    ? (session.totalQuestions() > 0 ? session.totalQuestions() : summary.correctCount())
                    : summary.totalCount();

            jdbc.update("""
                    UPDATE vocabulary_game_sessions
                    SET completed_at = now(),
                        score = ?,
                        correct_count = ?,
                        wrong_count = ?,
                        total_questions = ?,
                        duration_seconds = ?,
                        max_combo = ?,
                        stars = ?,
                        won = ?,
                        player_hp_remaining = ?,
                        fleet_hp_remaining = ?,
                        tier = ?,
                        avoidable_mistakes = ?
                    WHERE id = ? AND user_id = ? AND completed_at IS NULL
                    """,
                    score,
                    finalCorrectCount,
                    finalWrongCount,
                    finalTotalQuestions,
                    summary.durationSeconds(),
                    maxCombo,
                    stars,
                    won,
                    playerHpRemaining,
                    fleetHpRemaining,
                    tier,
                    avoidableMistakes != null ? avoidableMistakes : 0,
                    sessionId,
                    userId);
        }
        return getGameSession(userId, sessionId);
    }

    public List<VocabularyGameScore> getGameScores(UUID userId, String setId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return jdbc.query("""
                SELECT game_type, MAX(score) AS best_score, COUNT(*) AS completed_plays,
                       MAX(completed_at) AS last_played_at
                FROM vocabulary_game_sessions
                WHERE user_id = ? AND completed_at IS NOT NULL
                  AND (?::varchar IS NULL OR set_id = ?)
                GROUP BY game_type
                ORDER BY game_type
                """, (rs, rowNum) -> new VocabularyGameScore(
                rs.getString("game_type"),
                rs.getInt("best_score"),
                rs.getLong("completed_plays"),
                timestampToString(rs.getTimestamp("last_played_at"))),
                userId, setId, setId);
    }

    public List<WeakVocabularyWord> getWeakVocabularyWords(UUID userId, int requestedLimit) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        int limit = Math.max(1, Math.min(requestedLimit, 500));
        return jdbc.query("""
                SELECT w.id AS word_id, w.word, w.set_id, s.title AS set_title,
                       w.meaning, p.status, p.correct_count, p.incorrect_count, p.next_review_at
                FROM user_vocabulary_progress p
                JOIN vocabulary_items w ON w.id = p.word_id
                JOIN vocabulary_test_sets s ON s.id = w.set_id
                WHERE p.user_id = ? AND p.incorrect_count > 0
                  AND s.status = 'PUBLISHED' AND (s.release_at IS NULL OR s.release_at <= now())
                ORDER BY p.incorrect_count DESC, p.next_review_at ASC NULLS FIRST, w.word
                LIMIT ?
                """, (rs, rowNum) -> new WeakVocabularyWord(
                rs.getString("word_id"),
                rs.getString("word"),
                rs.getString("set_id"),
                rs.getString("set_title"),
                rs.getString("meaning"),
                rs.getString("status"),
                rs.getInt("correct_count"),
                rs.getInt("incorrect_count"),
                timestampToString(rs.getTimestamp("next_review_at"))), userId, limit);
    }

    public List<VocabularyDailyStat> getDailyLearningStats(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return jdbc.query("""
                SELECT (attempted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS study_date,
                       COUNT(*) AS answer_count,
                       COUNT(*) FILTER (WHERE is_correct) AS correct_count,
                       COALESCE(SUM(response_time_ms), 0) AS response_time_ms
                FROM vocabulary_learning_events
                WHERE user_id = ?
                  AND attempted_at >= (
                      ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - 6)::timestamp
                      AT TIME ZONE 'Asia/Ho_Chi_Minh'
                  )
                GROUP BY study_date
                ORDER BY study_date
                """, (rs, rowNum) -> new VocabularyDailyStat(
                rs.getDate("study_date").toLocalDate().toString(),
                rs.getLong("answer_count"),
                rs.getLong("correct_count"),
                rs.getLong("response_time_ms")), userId);
    }

    public VocabularyGameSession getGameSession(UUID userId, UUID sessionId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        List<VocabularyGameSession> sessions = jdbc.query("""
                SELECT id, set_id, game_type, started_at, completed_at, score,
                       correct_count, wrong_count, total_questions, duration_seconds, max_combo,
                       stars, won, player_hp_remaining, fleet_hp_remaining,
                       play_mode, time_limit_seconds, difficulty, tier, avoidable_mistakes
                FROM vocabulary_game_sessions
                WHERE id = ? AND user_id = ?
                """, (rs, rowNum) -> new VocabularyGameSession(
                rs.getObject("id", UUID.class),
                rs.getString("set_id"),
                rs.getString("game_type"),
                timestampToString(rs.getTimestamp("started_at")),
                timestampToString(rs.getTimestamp("completed_at")),
                rs.getInt("score"),
                rs.getInt("correct_count"),
                rs.getInt("wrong_count"),
                rs.getInt("total_questions"),
                rs.getInt("duration_seconds"),
                rs.getInt("max_combo"),
                rs.getObject("stars", Integer.class),
                rs.getObject("won", Boolean.class),
                rs.getObject("player_hp_remaining", Integer.class),
                rs.getObject("fleet_hp_remaining", Integer.class),
                rs.getString("play_mode"),
                rs.getObject("time_limit_seconds", Integer.class),
                List.of(),
                rs.getString("difficulty"),
                rs.getString("tier"),
                null,
                rs.getInt("correct_count"),
                rs.getInt("wrong_count"),
                rs.getInt("avoidable_mistakes"),
                List.of()), sessionId, userId);
        if (sessions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt chơi.");
        }
        VocabularyGameSession session = sessions.getFirst();
        List<SentenceGameQuestion> questions = jdbc.query("""
                SELECT question_index, word_id, option_word_ids
                FROM vocabulary_game_session_questions
                WHERE session_id = ?
                ORDER BY question_index
                """, (rs, rowNum) -> {
            java.sql.Array optionArray = rs.getArray("option_word_ids");
            String[] optionIds = optionArray == null ? new String[0] : (String[]) optionArray.getArray();
            return new SentenceGameQuestion(
                    rs.getInt("question_index"),
                    rs.getString("word_id"),
                    List.of(optionIds));
        }, sessionId);

        List<GameScoringCalculator.WrongWordDetail> wrongWords = List.of();
        String tier = session.tier();
        int avoidableMistakes = session.avoidableMistakes() != null ? session.avoidableMistakes() : 0;

        if ("MATCHING".equals(session.gameType())) {
            List<GameScoringCalculator.MemoryMatchAttempt> attempts = jdbc.query("""
                    SELECT word_id, second_word_id, is_correct, game_question_index
                    FROM vocabulary_learning_events
                    WHERE game_session_id = ?
                    ORDER BY game_question_index ASC, attempted_at ASC
                    """, (rs, rowNum) -> new GameScoringCalculator.MemoryMatchAttempt(
                    rs.getString("word_id"),
                    rs.getString("second_word_id"),
                    rs.getBoolean("is_correct"),
                    rs.getInt("game_question_index")), sessionId);

            Set<String> wordIds = new HashSet<>();
            for (var a : attempts) {
                if (a.firstWordId() != null) wordIds.add(a.firstWordId());
                if (a.secondWordId() != null) wordIds.add(a.secondWordId());
            }

            Map<String, GameScoringCalculator.WordInfo> wordInfoMap = new HashMap<>();
            if (!wordIds.isEmpty()) {
                String placeholders = String.join(",", Collections.nCopies(wordIds.size(), "?"));
                List<GameScoringCalculator.WordInfo> infos = jdbc.query(
                        "SELECT id, word, meaning FROM vocabulary_items WHERE id IN (" + placeholders + ")",
                        (rs, rowNum) -> new GameScoringCalculator.WordInfo(
                                rs.getString("id"),
                                rs.getString("word"),
                                rs.getString("meaning")),
                        wordIds.toArray());
                for (var info : infos) {
                    wordInfoMap.put(info.id(), info);
                }
            }

            int N = session.totalQuestions() > 0 ? session.totalQuestions() : session.correctCount();
            GameScoringCalculator.MemoryMatchResult mmResult = GameScoringCalculator.calculateMemoryMatchResult(
                    N,
                    session.durationSeconds(),
                    session.maxCombo(),
                    attempts,
                    wordInfoMap
            );
            wrongWords = mmResult.wrongWords();
            if (tier == null) {
                tier = mmResult.tier();
            }
            avoidableMistakes = mmResult.avoidableMistakes();
        }

        int totalAnswered = session.correctCount() + session.wrongCount();
        int accuracy = totalAnswered > 0
                ? (int) Math.round(((double) session.correctCount() / totalAnswered) * 100.0)
                : 0;

        return new VocabularyGameSession(
                session.id(), session.setId(), session.gameType(), session.startedAt(), session.completedAt(),
                session.score(), session.correctCount(), session.wrongCount(), session.totalQuestions(),
                session.durationSeconds(), session.maxCombo(), session.stars(), session.won(),
                session.playerHpRemaining(), session.fleetHpRemaining(), session.mode(),
                session.timeLimitSeconds(), questions, session.difficulty(),
                tier, accuracy, session.correctCount(), session.wrongCount(),
                avoidableMistakes, wrongWords);
    }

    public BattleSessionState getBattleSessionState(UUID userId, UUID sessionId) {
        VocabularyGameSession session = getGameSession(userId, sessionId);
        List<BattleSessionEventItem> events = jdbc.query("""
                SELECT game_question_index, word_id, game_result, is_correct, damage, used_hint
                FROM vocabulary_learning_events
                WHERE game_session_id = ?
                ORDER BY game_question_index ASC
                """, (rs, rowNum) -> new BattleSessionEventItem(
                rs.getInt("game_question_index"),
                rs.getString("word_id"),
                rs.getString("game_result"),
                rs.getBoolean("is_correct"),
                rs.getDouble("damage"),
                rs.getBoolean("used_hint")), sessionId);

        int playerHp = 5;
        int fleetHp = 12;
        int counterCharge = 0;
        int streak = 0;
        int combo = 0;

        for (var ev : events) {
            boolean isCorrect = "correct".equals(ev.gameResult()) || (ev.gameResult() == null && ev.correct());
            boolean isNear = "near".equals(ev.gameResult());
            if (isCorrect) {
                streak++;
                boolean isCrit = (streak == 5 || streak == 10 || streak == 15);
                double dmg = isCrit ? 2.0 : 1.0;
                fleetHp = Math.max(0, fleetHp - (int) dmg);
                if (!ev.usedHint()) {
                    combo = Math.min(combo + 1, 5);
                }
            } else if (isNear) {
                // Streak & combo preserved, no enemy charge
            } else {
                streak = 0;
                combo = 0;
                counterCharge++;
                if (counterCharge >= 2) {
                    counterCharge = 0;
                    playerHp = Math.max(0, playerHp - 1);
                }
            }
        }

        String battleState = fleetHp <= 0 ? "VICTORY"
                : playerHp <= 0 || events.size() >= 20 ? "DEFEAT"
                : "AIMING";

        return new BattleSessionState(session, events, playerHp, fleetHp, combo, counterCharge, battleState);
    }

    @Transactional
    public VocabularyAnswerResult recordAnswer(UUID userId, RecordVocabularyAnswerRequest request) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        if (request == null || request.requestId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu mã yêu cầu.");
        }
        String effectiveWordId = request.firstWordId() != null && !request.firstWordId().isBlank()
                ? request.firstWordId().trim()
                : (request.wordId() != null ? request.wordId().trim() : "");
        if (effectiveWordId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu mã yêu cầu hoặc từ vựng.");
        }
        if (effectiveWordId.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã từ vựng không hợp lệ.");
        }
        if (request.responseTimeMs() < 0 || request.responseTimeMs() > 600_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian trả lời phải từ 0 đến 600.000 ms.");
        }

        String activity = normalizeActivityType(request.activityType());
        String questionType = normalizeQuestionType(request.questionType());
        String rating = normalizeRating(request.rating());
        validateGameSession(
                userId,
                request.gameSessionId(),
                effectiveWordId,
                request.requestId(),
                request.gameQuestionIndex(),
                questionType,
                activity,
                request.result());

        String sessionGameType = request.gameSessionId() == null ? null : jdbc.queryForObject("""
                SELECT game_type FROM vocabulary_game_sessions WHERE id = ? AND user_id = ?
                """, String.class, request.gameSessionId(), userId);
        boolean isMatching = "MATCHING".equals(sessionGameType);

        boolean hasBattleshipMetadata = request.result() != null || request.usedHint() != null || request.usedItem() != null
                || request.enemyType() != null || request.damage() != null
                || request.gameMode() != null || request.wordLevel() != null;
        if (hasBattleshipMetadata && request.gameSessionId() != null) {
            if (!"BATTLE".equals(sessionGameType)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Kết quả mở rộng chỉ được dùng cho Battleship.");
            }
        }
        if ("FLASHCARD_RATING".equals(questionType) && rating == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đánh giá flashcard không hợp lệ.");
        }
        if ("FLASHCARD_RATING".equals(questionType)
                && !Set.of("FLASHCARD", "REVIEW", "GAME").contains(activity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đánh giá SRS chỉ hợp lệ trong flashcard hoặc ôn tập.");
        }
        if (!"FLASHCARD_RATING".equals(questionType) && rating != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không gửi mức tự đánh giá cho câu hỏi có đáp án.");
        }
        if (!"FLASHCARD_RATING".equals(questionType) && request.answer() == null
                && request.secondWordId() == null
                && !"timeout".equalsIgnoreCase(request.result())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần gửi câu trả lời.");
        }
        if (request.answer() != null && request.answer().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Câu trả lời không được dài quá 500 ký tự.");
        }
        if (request.damage() != null && (request.damage() < 0 || request.damage() > 20)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sát thương game không hợp lệ.");
        }
        if (request.enemyType() != null && !Set.of("patrol", "destroyer", "battleship", "boss").contains(request.enemyType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại tàu game không hợp lệ.");
        }
        if (request.gameMode() != null && !Set.of("single_deck", "all_decks", "by_level").contains(request.gameMode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chế độ chọn từ game không hợp lệ.");
        }
        if (request.wordLevel() != null && request.wordLevel().length() > 16) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cấp độ từ vựng không hợp lệ.");
        }
        if (request.usedItem() != null && !Set.of("shield", "repair", "double_shot", "hint").contains(request.usedItem())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vật phẩm game không hợp lệ.");
        }
        if (hasBattleshipMetadata && request.gameSessionId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin Battleship cần có phiên game hợp lệ.");
        }

        List<VocabularyAnswerKey> keys = jdbc.query("""
                SELECT w.word, w.meaning, s.meaning AS sense_meaning, s.synonyms
                FROM vocabulary_items w
                JOIN vocabulary_test_sets set_info ON set_info.id = w.set_id
                LEFT JOIN vocabulary_item_senses s ON s.vocabulary_item_id = w.id
                WHERE w.id = ? AND set_info.status = 'PUBLISHED'
                  AND (set_info.release_at IS NULL OR set_info.release_at <= now())
                """,
                (rs, rowNum) -> new VocabularyAnswerKey(
                        rs.getString("word"),
                        rs.getString("meaning"),
                        rs.getString("sense_meaning"),
                        rs.getString("synonyms")),
                effectiveWordId);
        if (keys.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng đã phát hành.");
        }

        List<String> acceptedAnswers = acceptedAnswers(keys, questionType);
        String correctAnswer = acceptedAnswers.isEmpty() ? keys.getFirst().word() : acceptedAnswers.getFirst();
        String gameResult = null;
        boolean correct;
        String storedAnswer;
        String secondWordId = null;

        if (isMatching) {
            secondWordId = request.secondWordId() != null && !request.secondWordId().isBlank()
                    ? request.secondWordId().trim()
                    : (request.answer() != null ? request.answer().trim() : "");
            if (secondWordId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần gửi từ thứ hai cho lượt ghép cặp.");
            }
            Integer secondWordValid = jdbc.queryForObject("""
                    SELECT COUNT(*)
                    FROM vocabulary_game_sessions gs
                    JOIN vocabulary_items w ON w.id = ?
                        AND (w.set_id = gs.set_id OR w.set_id = ANY(gs.deck_ids))
                    WHERE gs.id = ? AND gs.user_id = ?
                    """, Integer.class, secondWordId, request.gameSessionId(), userId);
            if (secondWordValid == null || secondWordValid == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Từ ghép thứ hai không thuộc phiên chơi này.");
            }
            List<String> matchedWords = jdbc.queryForList("""
                    SELECT word_id
                    FROM vocabulary_learning_events
                    WHERE game_session_id = ? AND is_correct = true AND request_id != ?
                    """, String.class, request.gameSessionId(), request.requestId());
            boolean alreadyMatched = matchedWords.contains(effectiveWordId) || matchedWords.contains(secondWordId);
            correct = effectiveWordId.equals(secondWordId) && !alreadyMatched;
            gameResult = correct ? "correct" : "wrong";
            storedAnswer = secondWordId;
        } else {
            boolean exactCorrect = "FLASHCARD_RATING".equals(questionType)
                    ? !"AGAIN".equals(rating)
                    : acceptedAnswers.stream().anyMatch(expected -> answersMatch(request.answer(), expected));
            boolean allowNearAnswer = request.gameSessionId() != null
                    && !Set.of("SENTENCE", "MATCHING").contains(sessionGameType);
            correct = exactCorrect;
            if (request.result() != null) {
                String requestedResult = request.result().trim().toLowerCase(Locale.ROOT);
                if (!Set.of("correct", "near", "wrong", "timeout").contains(requestedResult)
                    || request.gameSessionId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kết quả câu trả lời game không hợp lệ.");
                }
                boolean near = allowNearAnswer && !exactCorrect && isNearAnswer(request.answer(), acceptedAnswers);
                if ("correct".equals(requestedResult) && !exactCorrect) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kết quả câu trả lời không khớp đáp án.");
                }
                if ("near".equals(requestedResult) && !near && !exactCorrect) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Câu trả lời gần đúng không hợp lệ.");
                }
                if ("timeout".equals(requestedResult) && request.answer() != null && !request.answer().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Câu hết giờ không được có đáp án.");
                }
                gameResult = "timeout".equals(requestedResult) ? "timeout"
                    : exactCorrect ? "correct" : near ? "near" : "wrong";
                correct = exactCorrect || near;
            } else if (request.gameSessionId() != null) {
                boolean near = allowNearAnswer && !exactCorrect && isNearAnswer(request.answer(), acceptedAnswers);
                gameResult = exactCorrect ? "correct" : (near ? "near" : "wrong");
                correct = exactCorrect || near;
            }
            storedAnswer = "FLASHCARD_RATING".equals(questionType)
                    ? rating : request.answer() == null ? "" : request.answer().trim();
        }

        int inserted = jdbc.update("""
                INSERT INTO vocabulary_learning_events (
                    id, user_id, word_id, request_id, activity_type, question_type,
                    student_answer, correct_answer, is_correct, rating, response_time_ms,
                    game_session_id, game_question_index, game_result, used_hint, used_item,
                    enemy_type, damage, game_mode, word_level, second_word_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (user_id, request_id) DO NOTHING
                """,
                UUID.randomUUID(),
                userId,
                effectiveWordId,
                request.requestId(),
                activity,
                questionType,
                storedAnswer,
                correctAnswer,
                correct,
                rating,
                request.responseTimeMs(),
                request.gameSessionId(),
                request.gameQuestionIndex(),
                gameResult,
                request.usedHint() != null && request.usedHint(),
                request.usedItem(),
                request.enemyType(),
                request.damage(),
                request.gameMode(),
                request.wordLevel(),
                secondWordId);

        if (inserted == 0) {
            List<ExistingVocabularyAnswer> existingAnswers = jdbc.query("""
                    SELECT word_id, activity_type, question_type, student_answer, rating,
                           game_session_id, game_question_index, game_result, used_hint, used_item,
                           second_word_id
                    FROM vocabulary_learning_events
                    WHERE user_id = ? AND request_id = ?
                    """, (rs, rowNum) -> new ExistingVocabularyAnswer(
                    rs.getString("word_id"),
                    rs.getString("activity_type"),
                    rs.getString("question_type"),
                    rs.getString("student_answer"),
                    rs.getString("rating"),
                    rs.getObject("game_session_id", UUID.class),
                    rs.getObject("game_question_index", Integer.class),
                    rs.getString("game_result"),
                    rs.getBoolean("used_hint"),
                    rs.getString("used_item"),
                    rs.getString("second_word_id")), userId, request.requestId());
            if (existingAnswers.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Từ này đã được trả lời trong lượt chơi hiện tại.");
            }
            ExistingVocabularyAnswer existing = existingAnswers.getFirst();
            if (!existing.wordId().equals(effectiveWordId)
                    || !existing.activityType().equals(activity)
                    || !existing.questionType().equals(questionType)
                    || !existing.studentAnswer().equals(storedAnswer)
                    || !java.util.Objects.equals(existing.rating(), rating)
                    || !java.util.Objects.equals(existing.gameSessionId(), request.gameSessionId())
                    || !java.util.Objects.equals(existing.gameQuestionIndex(), request.gameQuestionIndex())
                    || !java.util.Objects.equals(existing.result(), gameResult)
                    || existing.usedHint() != (request.usedHint() != null && request.usedHint())
                    || !java.util.Objects.equals(existing.usedItem(), request.usedItem())
                    || (isMatching && !java.util.Objects.equals(existing.secondWordId(), secondWordId))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Mã yêu cầu đã được sử dụng cho một câu trả lời khác.");
            }
            VocabularyAnswerResult dupResult = jdbc.queryForObject("""
                    SELECT e.id, e.is_correct, e.correct_answer, p.status, p.next_review_at,
                           e.game_result, TRUE AS duplicate
                    FROM vocabulary_learning_events e
                    LEFT JOIN user_vocabulary_progress p ON p.user_id = e.user_id AND p.word_id = e.word_id
                    WHERE e.user_id = ? AND e.request_id = ?
                    """, this::mapAnswerResult, userId, request.requestId());
            if (request.gameSessionId() != null) {
                if ("BATTLE".equals(sessionGameType)) {
                    return enrichBattleAnswerResult(dupResult, userId, request.gameSessionId());
                }
            }
            return dupResult;
        }

        if (isMatching) {
            // Memory Match SRS updates are consolidated in completeGameSession in a single transaction
        } else {
            jdbc.update("""
                    INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, updated_at)
                    VALUES (?, ?, 'LEARNING', false, now())
                    ON CONFLICT (user_id, word_id) DO NOTHING
                    """, userId, effectiveWordId);

            List<VocabularySrsState> previousStates = jdbc.query("""
                    SELECT status, srs_ease_factor, srs_interval_days, srs_repetitions, review_count
                    FROM user_vocabulary_progress
                    WHERE user_id = ? AND word_id = ?
                    FOR UPDATE
                    """, (rs, rowNum) -> new VocabularySrsState(
                    rs.getString("status"),
                    rs.getDouble("srs_ease_factor"),
                    rs.getInt("srs_interval_days"),
                    rs.getInt("srs_repetitions"),
                    rs.getInt("review_count")), userId, effectiveWordId);
            VocabularySrsState previous = previousStates.getFirst();
            VocabularySrsSchedule schedule = calculateSrsSchedule(previous, correct, rating);

            jdbc.update("""
                    UPDATE user_vocabulary_progress
                    SET status = ?,
                        srs_ease_factor = ?,
                        srs_interval_days = ?,
                        srs_repetitions = ?,
                        correct_count = correct_count + ?,
                        incorrect_count = CASE
                            WHEN ? THEN GREATEST(0, incorrect_count - 1)
                            ELSE CASE WHEN ? THEN incorrect_count + 1 ELSE incorrect_count END
                        END,
                        review_count = review_count + 1,
                        last_reviewed_at = now(),
                        next_review_at = ?,
                        updated_at = now()
                    WHERE user_id = ? AND word_id = ?
                    """,
                    schedule.status(),
                    schedule.easeFactor(),
                    schedule.intervalDays(),
                    schedule.repetitions(),
                    correct ? 1 : 0,
                    correct && (rating == null || "GOOD".equals(rating) || "EASY".equals(rating)),
                    !correct,
                    schedule.nextReviewAt(),
                    userId,
                    effectiveWordId);

            incrementDailyGoal(userId, activity, previous.reviewCount() == 0);
        }

        VocabularyAnswerResult rawResult = jdbc.queryForObject("""
                SELECT e.id, e.is_correct, e.correct_answer, p.status, p.next_review_at,
                       e.game_result, FALSE AS duplicate
                FROM vocabulary_learning_events e
                LEFT JOIN user_vocabulary_progress p ON p.user_id = e.user_id AND p.word_id = e.word_id
                WHERE e.user_id = ? AND e.request_id = ?
                """, this::mapAnswerResult, userId, request.requestId());

        if (request.gameSessionId() != null) {
            if ("BATTLE".equals(sessionGameType)) {
                return enrichBattleAnswerResult(rawResult, userId, request.gameSessionId());
            }
        }
        return rawResult;
    }

    private void incrementDailyGoal(UUID userId, String activity, boolean isFirstLearning) {
        int newCount = isFirstLearning ? 1 : 0;
        int reviewCount = isFirstLearning || "LEARN".equals(activity) ? 0 : 1;
        if (newCount == 0 && reviewCount == 0) {
            return;
        }
        jdbc.update("""
                INSERT INTO vocabulary_daily_goals (
                    user_id, goal_date, new_words_goal, review_goal,
                    completed_new_words, completed_review, created_at, updated_at
                )
                VALUES (
                    ?,
                    (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
                    COALESCE((SELECT recommended_new_words_per_day FROM study_plans WHERE user_id = ? AND is_active = TRUE LIMIT 1), 10),
                    COALESCE((SELECT recommended_review_per_day FROM study_plans WHERE user_id = ? AND is_active = TRUE LIMIT 1), 20),
                    ?, ?, now(), now()
                )
                ON CONFLICT (user_id, goal_date) DO UPDATE SET
                    completed_new_words = vocabulary_daily_goals.completed_new_words + EXCLUDED.completed_new_words,
                    completed_review = vocabulary_daily_goals.completed_review + EXCLUDED.completed_review,
                    updated_at = now()
                """, userId, userId, userId, newCount, reviewCount);
    }

    private VocabularyAnswerResult mapAnswerResult(ResultSet rs, int rowNum) throws SQLException {
        Timestamp nextReviewAt = rs.getTimestamp("next_review_at");
        return new VocabularyAnswerResult(
                rs.getObject("id", UUID.class),
                rs.getBoolean("is_correct"),
                rs.getString("correct_answer"),
                rs.getString("status"),
                timestampToString(nextReviewAt),
                rs.getString("game_result"),
                rs.getBoolean("duplicate"));
    }

    private List<String> acceptedAnswers(List<VocabularyAnswerKey> keys, String questionType) {
        List<String> answers = new ArrayList<>();
        for (VocabularyAnswerKey key : keys) {
            if ("ENGLISH_TO_VIETNAMESE".equals(questionType)) {
                addAcceptedMeaningVariants(answers, key.senseMeaning());
                addAcceptedMeaningVariants(answers, key.meaning());
            } else {
                addEnglishWordVariants(answers, key.word());
                if (key.synonyms() != null) {
                    for (String synonym : key.synonyms().split("[,;\\n|]")) {
                        addEnglishWordVariants(answers, synonym);
                    }
                }
            }
            if ("ENGLISH_TO_VIETNAMESE".equals(questionType) && key.synonyms() != null) {
                for (String synonym : key.synonyms().split("[,;\\n|/]")) {
                    addAcceptedMeaningVariants(answers, synonym);
                }
            }
        }
        return answers.stream().distinct().toList();
    }

    private void addAcceptedMeaningVariants(List<String> answers, String meaning) {
        if (meaning == null || meaning.isBlank()) {
            return;
        }
        String clean = meaning.trim();
        addAcceptedAnswer(answers, clean);
        for (String segment : clean.split("[,;\\n|/]")) {
            addAcceptedAnswer(answers, segment);
        }
    }

    private void addAcceptedAnswer(List<String> answers, String answer) {
        if (answer != null && !answer.isBlank()) {
            answers.add(answer.trim());
        }
    }

    private void addEnglishWordVariants(List<String> answers, String word) {
        if (word == null || word.isBlank()) {
            return;
        }
        String base = word.trim().toLowerCase(Locale.ROOT);
        answers.add(base);
        String variant = ENGLISH_WORD_VARIANTS.get(base);
        if (variant != null) {
            answers.add(variant);
        }
        answers.add(base + "s");
        answers.add(base + "es");
        if (base.endsWith("y") && base.length() > 1) {
            answers.add(base.substring(0, base.length() - 1) + "ies");
            answers.add(base.substring(0, base.length() - 1) + "ied");
        }
        answers.add(base + "ed");
        answers.add(base + "d");
        if (base.endsWith("e")) {
            answers.add(base.substring(0, base.length() - 1) + "ing");
        } else {
            answers.add(base + "ing");
            if (base.length() >= 3 && base.charAt(base.length() - 1) == base.charAt(base.length() - 2)) {
                answers.add(base + base.charAt(base.length() - 1) + "ed");
                answers.add(base + base.charAt(base.length() - 1) + "ing");
            }
        }
    }

    private boolean answersMatch(String actual, String expected) {
        return normalizeAnswer(actual).equals(normalizeAnswer(expected));
    }

    private boolean isNearAnswer(String actual, List<String> expectedAnswers) {
        if (actual == null) {
            return false;
        }
        String normalized = normalizeAnswer(actual);
        if (normalized.length() < 6) {
            return false;
        }
        return expectedAnswers.stream()
                .filter(expected -> normalizeAnswer(expected).length() >= 6)
                .anyMatch(expected -> levenshteinDistance(normalized, normalizeAnswer(expected)) == 1);
    }

    private int levenshteinDistance(String left, String right) {
        int[] previous = new int[left.length() + 1];
        for (int i = 0; i <= left.length(); i++) {
            previous[i] = i;
        }
        for (int row = 1; row <= right.length(); row++) {
            int[] current = new int[left.length() + 1];
            current[0] = row;
            for (int column = 1; column <= left.length(); column++) {
                current[column] = Math.min(
                        Math.min(current[column - 1] + 1, previous[column] + 1),
                        previous[column - 1] + (left.charAt(column - 1) == right.charAt(row - 1) ? 0 : 1));
            }
            previous = current;
        }
        return previous[left.length()];
    }

    private String normalizeAnswer(String answer) {
        return answer == null ? "" : answer.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[\\p{Punct}]+$", "")
                .replaceAll("\\s+", " ");
    }

    private String normalizeActivityType(String activity) {
        String normalized = activity == null ? "" : activity.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("LEARN", "FLASHCARD", "PRACTICE", "REVIEW", "GAME").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại hoạt động từ vựng không hợp lệ.");
        }
        return normalized;
    }

    private String normalizeQuestionType(String questionType) {
        String normalized = questionType == null ? "" : questionType.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("ENGLISH_TO_VIETNAMESE", "VIETNAMESE_TO_ENGLISH", "FILL_IN_BLANK",
                "TYPE_WORD", "AUDIO", "FLASHCARD_RATING").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dạng câu hỏi từ vựng không hợp lệ.");
        }
        return normalized;
    }

    private String normalizeRating(String rating) {
        if (rating == null || rating.isBlank()) {
            return null;
        }
        String normalized = rating.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("AGAIN", "HARD", "GOOD", "EASY").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mức đánh giá SRS không hợp lệ.");
        }
        return normalized;
    }

    private String normalizeGameType(String gameType) {
        String normalized = gameType == null ? "" : gameType.trim().toUpperCase(Locale.ROOT);
        if ("BATTLESHIP_VOCABULARY".equals(normalized)) {
            return "BATTLE";
        }
        if (!Set.of("RUNNER", "MATCHING", "BATTLE", "SENTENCE", "FLASHCARD", "TYPING").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại trò chơi từ vựng không hợp lệ.");
        }
        return normalized;
    }

    private String normalizeSentenceGameMode(String mode) {
        String normalized = mode == null || mode.isBlank() ? "CLASSIC" : mode.trim().toUpperCase(Locale.ROOT);
        if (!Set.of("CLASSIC", "TIME_ATTACK").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chế độ Sentence Master không hợp lệ.");
        }
        return normalized;
    }

    private int timeAttackSpeedBonus(int responseTimeMs) {
        if (responseTimeMs <= 5_000) {
            return 5;
        }
        if (responseTimeMs <= 10_000) {
            return 2;
        }
        return 0;
    }

    private VocabularyAnswerResult enrichBattleAnswerResult(
            VocabularyAnswerResult base,
            UUID userId,
            UUID sessionId) {
        List<GameAnswerState> answers = jdbc.query("""
                SELECT is_correct, game_result, used_hint
                FROM vocabulary_learning_events
                WHERE game_session_id = ?
                ORDER BY game_question_index ASC
                """, (rs, rowNum) -> new GameAnswerState(
                rs.getBoolean("is_correct"),
                rs.getString("game_result"),
                rs.getBoolean("used_hint"),
                0), sessionId);

        int playerHp = 5;
        int fleetHp = 12;
        int counterCharge = 0;
        int streak = 0;
        int combo = 0;
        int score = 0;
        double currentDamage = 0.0;
        boolean currentIsCritical = false;
        boolean currentCounterTriggered = false;

        for (int i = 0; i < answers.size(); i++) {
            GameAnswerState ans = answers.get(i);
            boolean isCorrect = "correct".equals(ans.result()) || (ans.result() == null && ans.correct());
            boolean isNear = "near".equals(ans.result());
            boolean usedHint = ans.usedHint();

            if (isCorrect) {
                streak++;
                boolean isCrit = (streak == 5 || streak == 10 || streak == 15);
                double dmg = isCrit ? 2.0 : 1.0;
                fleetHp = Math.max(0, fleetHp - (int) dmg);
                int scoringCombo = usedHint ? Math.max(1, combo) : Math.min(combo + 1, 5);
                score += gameScoreForAnswer("BATTLE", scoringCombo, usedHint);
                if (!usedHint) {
                    combo = scoringCombo;
                }
                if (i == answers.size() - 1) {
                    currentDamage = dmg;
                    currentIsCritical = isCrit;
                    currentCounterTriggered = false;
                }
            } else if (isNear) {
                score += gameScoreForAnswer("BATTLE", Math.max(1, combo), usedHint) / 2;
                if (i == answers.size() - 1) {
                    currentDamage = 0.0;
                    currentIsCritical = false;
                    currentCounterTriggered = false;
                }
            } else {
                streak = 0;
                combo = 0;
                counterCharge++;
                boolean counterFired = false;
                if (counterCharge >= 2) {
                    counterCharge = 0;
                    playerHp = Math.max(0, playerHp - 1);
                    counterFired = true;
                }
                if (i == answers.size() - 1) {
                    currentDamage = 0.0;
                    currentIsCritical = false;
                    currentCounterTriggered = counterFired;
                }
            }
        }

        // Cập nhật sát thương do server tự tính vào DB
        jdbc.update("""
                UPDATE vocabulary_learning_events
                SET damage = ?
                WHERE id = ?
                """, currentDamage, base.eventId());

        String battleState;
        if (fleetHp <= 0) {
            battleState = "VICTORY";
        } else if (playerHp <= 0 || answers.size() >= 20) {
            battleState = "DEFEAT";
        } else if (currentCounterTriggered) {
            battleState = "ENEMY_COUNTER";
        } else {
            battleState = "AIMING";
        }

        return new VocabularyAnswerResult(
                base.eventId(),
                base.correct(),
                base.correctAnswer(),
                base.status(),
                base.nextReviewAt(),
                base.result(),
                base.duplicate(),
                currentDamage,
                playerHp,
                fleetHp,
                score,
                combo,
                counterCharge,
                currentIsCritical,
                battleState
        );
    }

    private void validateGameSession(
            UUID userId,
            UUID sessionId,
            String wordId,
            UUID requestId,
            Integer questionIndex,
            String questionType,
            String activity,
            String answerResult) {
        if (sessionId == null) {
            if (questionIndex != null || "GAME".equals(activity)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Câu trả lời game cần có phiên chơi hợp lệ.");
            }
            return;
        }
        if (!"GAME".equals(activity) || questionIndex == null || questionIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lượt chơi chỉ hợp lệ cho hoạt động game.");
        }
        List<VocabularyGameSessionState> sessions = jdbc.query("""
                SELECT gs.completed_at, gs.game_type
                FROM vocabulary_game_sessions gs
                JOIN vocabulary_items w ON w.id = ?
                    AND (w.set_id = gs.set_id OR w.set_id = ANY(gs.deck_ids))
                WHERE gs.id = ? AND gs.user_id = ?
                FOR UPDATE OF gs
                """, (rs, rowNum) -> new VocabularyGameSessionState(
                sessionId, rs.getString("game_type"), rs.getTimestamp("completed_at")),
                wordId, sessionId, userId);
        if (sessions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lượt chơi hoặc từ vựng không hợp lệ.");
        }
        boolean flashcardGame = "FLASHCARD".equals(sessions.getFirst().gameType());
        if (flashcardGame != "FLASHCARD_RATING".equals(questionType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại câu hỏi không hợp lệ cho trò chơi này.");
        }
        if ("SENTENCE".equals(sessions.getFirst().gameType())
                && !"FILL_IN_BLANK".equals(questionType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Sentence Master chỉ chấp nhận câu hỏi điền từ.");
        }
        if (sessions.getFirst().completedAt() != null && jdbc.queryForObject("""
                SELECT count(*) FROM vocabulary_learning_events
                WHERE user_id = ? AND request_id = ? AND game_session_id = ? AND game_question_index = ?
                """, Integer.class, userId, requestId, sessionId, questionIndex) == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lượt chơi này đã được hoàn tất.");
        }
        if ("SENTENCE".equals(sessions.getFirst().gameType())) {
            String expectedWordId = jdbc.query("""
                    SELECT word_id
                    FROM vocabulary_game_session_questions
                    WHERE session_id = ? AND question_index = ?
                    """, (rs, rowNum) -> rs.getString("word_id"), sessionId, questionIndex)
                    .stream().findFirst().orElse(null);
            if (!wordId.equals(expectedWordId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Từ trả lời không khớp câu hỏi đã được cấp trong phiên.");
            }
            Integer sentenceExistingIndex = jdbc.query("""
                    SELECT game_question_index FROM vocabulary_learning_events
                    WHERE user_id = ? AND request_id = ? AND game_session_id = ?
                    """, (rs, rowNum) -> rs.getObject("game_question_index", Integer.class),
                    userId, requestId, sessionId).stream().findFirst().orElse(null);
            if (sentenceExistingIndex != null) {
                if (!sentenceExistingIndex.equals(questionIndex)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Mã yêu cầu đã được sử dụng cho câu hỏi khác.");
                }
                return;
            }
            if ("TIME_ATTACK".equals(jdbc.queryForObject("""
                    SELECT play_mode FROM vocabulary_game_sessions WHERE id = ?
                    """, String.class, sessionId))) {
                Boolean questionExpired = jdbc.queryForObject("""
                        SELECT now() >= COALESCE(
                            (
                                SELECT attempted_at
                                FROM vocabulary_learning_events
                                WHERE game_session_id = ? AND game_question_index < ?
                                ORDER BY game_question_index DESC
                                LIMIT 1
                            ),
                            (SELECT started_at FROM vocabulary_game_sessions WHERE id = ?)
                        ) + interval '15 seconds'
                        """, Boolean.class, sessionId, questionIndex, sessionId);
                if (Boolean.TRUE.equals(questionExpired) && !"timeout".equalsIgnoreCase(answerResult)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Đã hết giờ cho câu hỏi này.");
                }
            }
            Boolean timeExpired = jdbc.queryForObject("""
                    SELECT play_mode = 'TIME_ATTACK'
                       AND now() >= started_at + make_interval(secs => time_limit_seconds)
                    FROM vocabulary_game_sessions
                    WHERE id = ? AND user_id = ?
                    """, Boolean.class, sessionId, userId);
            if (Boolean.TRUE.equals(timeExpired)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Đã hết giờ Time Attack.");
            }
        }
        Integer existingIndex = jdbc.query("""
                SELECT game_question_index FROM vocabulary_learning_events
                WHERE user_id = ? AND request_id = ? AND game_session_id = ?
                """, (rs, rowNum) -> rs.getObject("game_question_index", Integer.class),
                userId, requestId, sessionId).stream().findFirst().orElse(null);
        if (existingIndex != null) {
            if (!existingIndex.equals(questionIndex)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã yêu cầu đã được sử dụng cho câu hỏi khác.");
            }
            return;
        }
        int nextIndex = jdbc.queryForObject("""
                SELECT COUNT(*) FROM vocabulary_learning_events WHERE game_session_id = ?
                """, Integer.class, sessionId);
        if (questionIndex != nextIndex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Câu hỏi game không đúng thứ tự.");
        }
    }

    private int gameScoreForAnswer(String gameType, int combo) {
        return gameScoreForAnswer(gameType, combo, false);
    }

    private int gameScoreForAnswer(String gameType, int combo, boolean usedHint) {
        if ("BATTLE".equals(gameType)) {
            int bonus = combo <= 1 ? 0 : Math.min(combo - 1, 4) * 5;
            int score = 10 + bonus;
            if (usedHint) {
                score = Math.max(0, score - 5);
            }
            return score;
        }
        return 10 + Math.min(combo - 1, 4) * 5;
    }

    private VocabularySrsSchedule calculateSrsSchedule(
            VocabularySrsState previous, boolean correct, String rating) {
        double ease = previous.easeFactor();
        int repetitions = previous.repetitions();
        int interval = previous.intervalDays();
        OffsetDateTime now = OffsetDateTime.now();
        if (!correct || "AGAIN".equals(rating)) {
            ease = Math.max(1.3, ease - 0.2);
            repetitions = 0;
            interval = 0;
            return new VocabularySrsSchedule("REVIEWING", ease, interval, repetitions, now.plusMinutes(10));
        }

        if ("HARD".equals(rating)) {
            ease = Math.max(1.3, ease - 0.15);
            interval = cappedCeilingSrsInterval(Math.max(1, interval) * 1.2);
        } else if ("EASY".equals(rating)) {
            ease += 0.15;
            interval = interval == 0 ? 4 : cappedCeilingSrsInterval(interval * ease * 1.3);
        } else {
            interval = interval == 0 ? 1 : repetitions == 1 ? 3 : cappedRoundedSrsInterval(interval * ease);
            double quality = "HARD".equals(rating) ? 3 : 4;
            ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        }
        repetitions++;
        String status = repetitions >= 3 && interval >= 21 ? "MASTERED" : "REVIEWING";
        return new VocabularySrsSchedule(status, ease, interval, repetitions, now.plusDays(interval));
    }

    private int cappedCeilingSrsInterval(double days) {
        return (int) Math.min(MAX_SRS_INTERVAL_DAYS, Math.max(1, Math.ceil(days)));
    }

    private int cappedRoundedSrsInterval(double days) {
        return (int) Math.min(MAX_SRS_INTERVAL_DAYS, Math.max(1, Math.round(days)));
    }

    private void updateWordSrs(UUID userId, String wordId, boolean correct, String rating) {
        if (wordId == null || wordId.isBlank()) {
            return;
        }
        jdbc.update("""
                INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, updated_at)
                VALUES (?, ?, 'LEARNING', false, now())
                ON CONFLICT (user_id, word_id) DO NOTHING
                """, userId, wordId);

        List<VocabularySrsState> previousStates = jdbc.query("""
                SELECT status, srs_ease_factor, srs_interval_days, srs_repetitions, review_count
                FROM user_vocabulary_progress
                WHERE user_id = ? AND word_id = ?
                FOR UPDATE
                """, (rs, rowNum) -> new VocabularySrsState(
                rs.getString("status"),
                rs.getDouble("srs_ease_factor"),
                rs.getInt("srs_interval_days"),
                rs.getInt("srs_repetitions"),
                rs.getInt("review_count")), userId, wordId);
        if (previousStates.isEmpty()) {
            return;
        }
        VocabularySrsState previous = previousStates.getFirst();
        VocabularySrsSchedule schedule = calculateSrsSchedule(previous, correct, rating);

        jdbc.update("""
                UPDATE user_vocabulary_progress
                SET status = ?,
                    srs_ease_factor = ?,
                    srs_interval_days = ?,
                    srs_repetitions = ?,
                    correct_count = correct_count + ?,
                    incorrect_count = CASE
                        WHEN ? THEN GREATEST(0, incorrect_count - 1)
                        ELSE CASE WHEN ? THEN incorrect_count + 1 ELSE incorrect_count END
                    END,
                    review_count = review_count + 1,
                    last_reviewed_at = now(),
                    next_review_at = ?,
                    updated_at = now()
                WHERE user_id = ? AND word_id = ?
                """,
                schedule.status(),
                schedule.easeFactor(),
                schedule.intervalDays(),
                schedule.repetitions(),
                correct ? 1 : 0,
                correct && ("GOOD".equals(rating) || "EASY".equals(rating)),
                !correct,
                schedule.nextReviewAt(),
                userId,
                wordId);

        incrementDailyGoal(userId, "VOCABULARY", previous.reviewCount() == 0);
    }

    @Transactional
    public VocabularyTestSet createSet(CreateSetRequest req) {
        String id = req.id() != null && !req.id().isBlank() ? req.id().trim()
                : "set-" + System.currentTimeMillis();
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "Bộ từ vựng mới";
        String year = req.year() != null && !req.year().isBlank() ? req.year().trim() : "2024";
        String category = req.category() != null && !req.category().isBlank() ? req.category().trim() : "2024";
        String status = formatStatus(req.status());
        Timestamp releaseAt = parseReleaseAt(req.releaseAt());

        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, release_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, ?, now(), now())
                """, id, title, year, category, status, releaseAt);

        return getSetDetails(id, null, true);
    }

    @Transactional
    public VocabularyTestSet updateSet(String setId, UpdateSetRequest req) {
        String title = req.title() != null && !req.title().isBlank() ? req.title().trim() : "";
        String year = req.year() != null ? req.year().trim() : "2024";
        String category = req.category() != null ? req.category().trim() : "2024";
        String status = formatStatus(req.status());
        Timestamp releaseAt = parseReleaseAt(req.releaseAt());

        int rows = jdbc.update("""
                UPDATE vocabulary_test_sets SET
                    title = CASE WHEN ? != '' THEN ? ELSE title END,
                    year = ?,
                    category = ?,
                    status = ?,
                    release_at = ?,
                    updated_at = now()
                WHERE id = ?
                """, title, title, year, category, status, releaseAt, setId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }
        return getSetDetails(setId, null, true);
    }

    @Transactional
    public void deleteSet(String setId) {
        int rows = jdbc.update("DELETE FROM vocabulary_test_sets WHERE id = ?", setId);
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }
    }

    @Transactional
    public VocabularyWord addWord(String setId, CreateWordRequest req) {
        // Verify set exists
        Integer count = jdbc.queryForObject("SELECT count(*) FROM vocabulary_test_sets WHERE id = ?", Integer.class, setId);
        if (count == null || count == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        String wordId = req.id() != null && !req.id().isBlank() ? req.id().trim()
                : "w-" + System.currentTimeMillis();
        String word = req.word() != null ? req.word().trim() : "";
        String ipa = req.ipa() != null ? req.ipa().trim() : "";
        String pos = req.partOfSpeech() != null ? req.partOfSpeech().trim() : "Noun";
        List<VocabularySenseInput> senses = normalizeSenses(req.senses(), pos, req.subCategory(), req.meaning(),
                req.example(), req.exampleMeaning());
        VocabularySenseInput primarySense = senses.get(0);
        pos = primarySense.partOfSpeech();
        String meaning = primarySense.meaning();
        String meaningSource = formatMeaningSource(req.meaningSource());
        boolean meaningEdited = Boolean.TRUE.equals(req.meaningEdited());
        String example = primarySense.example();
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String audioUrl = vocabularyAudioUrl(req.audioUrl(), word);
        String audioRegion = normalizeAudioRegion(req.audioRegion());
        String wordFamily = req.wordFamily() != null ? req.wordFamily().trim() : "";
        String termType = normalizeTermType(req.termType());
        String dictionarySourceUrl = normalizeDictionarySourceUrl(req.dictionarySourceUrl());
        String level = formatLevel(req.level());

        List<String> existingWordIds = jdbc.query(
                """
                SELECT id FROM vocabulary_items
                WHERE set_id = ? AND LOWER(TRIM(word)) = LOWER(TRIM(?))
                ORDER BY order_index, id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getString("id"),
                setId, word);
        if (!existingWordIds.isEmpty()) {
            String existingWordId = existingWordIds.get(0);
            jdbc.update("""
                    UPDATE vocabulary_items SET
                        ipa = COALESCE(NULLIF(ipa, ''), ?),
                        audio_url = COALESCE(NULLIF(audio_url, ''), ?),
                        audio_region = CASE WHEN audio_region IS NULL OR audio_region = 'UNKNOWN' THEN ? ELSE audio_region END,
                        word_family = COALESCE(NULLIF(word_family, ''), ?),
                        term_type = COALESCE(NULLIF(?, ''), term_type),
                        dictionary_source_url = COALESCE(NULLIF(?, ''), dictionary_source_url),
                        updated_at = now()
                    WHERE id = ?
                    """, ipa, audioUrl, audioRegion, wordFamily, termType, dictionarySourceUrl, existingWordId);
            for (VocabularySenseInput sense : senses) {
                upsertSense(existingWordId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                        sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms(), sense.definitionEn());
            }
            addRelatedForms(existingWordId, req.relatedForms());
            return getWordsForSet(setId, null).stream()
                    .filter(existing -> existing.id().equals(existingWordId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải từ vựng vừa được cập nhật."));
        }

        Integer maxOrder = jdbc.queryForObject("SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?", Integer.class, setId);
        int orderIndex = maxOrder != null ? maxOrder : 0;

        jdbc.update("""
                INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, audio_region, word_family, term_type, dictionary_source_url, starred, order_index, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, ?, now(), now())
                """, wordId, setId, word, ipa, pos, meaning, meaningSource, meaningEdited,
                example, exampleMeaning, level, audioUrl, audioRegion, wordFamily, termType, dictionarySourceUrl, orderIndex);
        replaceSenses(wordId, senses);
        replaceRelatedForms(wordId, req.relatedForms());

        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);

        return getWordsForSet(setId, null).stream()
                .filter(created -> created.id().equals(wordId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải từ vựng vừa tạo."));
    }

    @Transactional
    public void addWordsFromQuickImport(String setId, List<Map<String, Object>> rows) {
        if (setId == null || setId.isBlank()) {
            throw new IllegalArgumentException("Chọn bộ từ vựng trước khi nhập.");
        }
        if (rows == null || rows.isEmpty()) {
            throw new IllegalArgumentException("Không có dòng từ vựng để nhập.");
        }
        if (rows.size() > 5_000) {
            throw new IllegalArgumentException("Mỗi lần chỉ được nhập tối đa 5.000 từ.");
        }
        Integer setCount = jdbc.queryForObject(
                "SELECT count(*) FROM vocabulary_test_sets WHERE id = ?", Integer.class, setId);
        if (setCount == null || setCount == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ từ vựng: " + setId);
        }

        List<ObjectNode> normalizedRows = new ArrayList<>(rows.size());
        for (Map<String, Object> value : rows) {
            normalizedRows.add(objectMapper.valueToTree(value));
        }
        for (int index = 0; index < normalizedRows.size(); index++) {
            ObjectNode row = normalizedRows.get(index);
            if (row.path("word").asText("").isBlank()) {
                throw new IllegalArgumentException("Dòng " + (index + 1) + " thiếu từ tiếng Anh.");
            }
            if (row.path("meaning").asText("").isBlank()) {
                throw new IllegalArgumentException("Dòng " + (index + 1) + " thiếu nghĩa tiếng Việt.");
            }
            row.put("setId", setId);
        }
        normalizedRows.forEach(this::syncFromImportItem);
    }

    @Transactional
    public int fillMissingAudioUrls(String setId) {
        List<AudioSyncTarget> targets;
        if (setId == null || setId.isBlank()) {
            targets = jdbc.query(
                    """
                    SELECT id, word FROM vocabulary_items
                    WHERE audio_url IS NULL OR BTRIM(audio_url) = ''
                    """,
                    (rs, rowNum) -> new AudioSyncTarget(rs.getString("id"), rs.getString("word")));
        } else {
            targets = jdbc.query(
                    """
                    SELECT id, word FROM vocabulary_items
                    WHERE set_id = ? AND (audio_url IS NULL OR BTRIM(audio_url) = '')
                    """,
                    (rs, rowNum) -> new AudioSyncTarget(rs.getString("id"), rs.getString("word")),
                    setId);
        }
        if (targets.isEmpty()) return 0;

        List<Object[]> updates = new ArrayList<>();
        for (AudioSyncTarget target : targets) {
            String audioUrl = vocabularyAudioUrl("", target.word());
            if (!audioUrl.isBlank()) updates.add(new Object[] { audioUrl, target.id() });
        }
        if (updates.isEmpty()) return 0;
        jdbc.batchUpdate(
                """
                UPDATE vocabulary_items SET audio_url = ?, updated_at = now()
                WHERE id = ? AND (audio_url IS NULL OR BTRIM(audio_url) = '')
                """,
                updates);
        return updates.size();
    }

    @Transactional
    public VocabularyWord updateWord(String wordId, UpdateWordRequest req) {
        String word = req.word() != null ? req.word().trim() : "";
        String ipa = req.ipa() != null ? req.ipa().trim() : "";
        String pos = req.partOfSpeech() != null ? req.partOfSpeech().trim() : "";
        List<VocabularySenseInput> senses = normalizeSenses(req.senses(), pos, req.subCategory(), req.meaning(),
                req.example(), req.exampleMeaning());
        VocabularySenseInput primarySense = senses.get(0);
        pos = primarySense.partOfSpeech();
        String meaning = primarySense.meaning();
        String meaningSource = req.meaningSource() == null || req.meaningSource().isBlank()
                ? null : formatMeaningSource(req.meaningSource());
        Boolean meaningEdited = req.meaningEdited();
        String example = primarySense.example();
        String exampleMeaning = req.exampleMeaning() != null ? req.exampleMeaning().trim() : "";
        String audioUrl = vocabularyAudioUrl(req.audioUrl(), word);
        String audioRegion = normalizeAudioRegion(req.audioRegion());
        String wordFamily = req.wordFamily() != null ? req.wordFamily().trim() : "";
        String termType = normalizeTermType(req.termType());
        String dictionarySourceUrl = normalizeDictionarySourceUrl(req.dictionarySourceUrl());
        String level = formatLevel(req.level());

        int rows = jdbc.update("""
                UPDATE vocabulary_items SET
                    word = CASE WHEN ? != '' THEN ? ELSE word END,
                    ipa = ?,
                    part_of_speech = ?,
                    meaning = ?,
                    meaning_source = COALESCE(?, meaning_source),
                    meaning_edited = COALESCE(?, meaning_edited),
                    example = ?,
                    example_meaning = ?,
                    level = ?,
                    audio_url = ?,
                    audio_region = ?,
                    word_family = ?,
                    term_type = COALESCE(?, term_type),
                    dictionary_source_url = COALESCE(?, dictionary_source_url),
                    updated_at = now()
                WHERE id = ?
                """, word, word, ipa, pos, meaning, meaningSource, meaningEdited,
                example, exampleMeaning, level, audioUrl, audioRegion, wordFamily, termType,
                dictionarySourceUrl, wordId);

        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng: " + wordId);
        }

        replaceSenses(wordId, senses);
        if (req.relatedForms() != null) {
            replaceRelatedForms(wordId, req.relatedForms());
        }
        List<VocabularyWord> found = jdbc.query("SELECT id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, audio_region, word_family, term_type, dictionary_source_url, starred, 'NEW' AS status FROM vocabulary_items WHERE id = ?", (rs, rowNum) -> mapWord(rs), wordId);
        return loadSenses(found).get(0);
    }

    @Transactional
    public void deleteWord(String wordId) {
        List<String> setIds = jdbc.query("SELECT set_id FROM vocabulary_items WHERE id = ?", (rs, rowNum) -> rs.getString("set_id"), wordId);
        if (setIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy từ vựng: " + wordId);
        }
        String setId = setIds.get(0);
        jdbc.update("DELETE FROM vocabulary_items WHERE id = ?", wordId);
        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);
    }

    static String vocabularyAudioUrl(String audioUrl, String word) {
        String source = audioUrl == null ? "" : audioUrl.trim();
        if (!source.isEmpty()) return source;
        if (word == null || word.isBlank()) return "";
        String normalizedWord = word.replace('(', ' ').replace(')', ' ').trim().replaceAll("\\s+", " ");
        if (normalizedWord.length() > 80 || !normalizedWord.matches("(?i)^[a-z][a-z' -]*$")) return "";
        return "/api/dictionary/audio?word=" + URLEncoder.encode(normalizedWord, StandardCharsets.UTF_8);
    }

    @Transactional
    public void toggleStar(String wordId, UUID userId) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, updated_at)
                VALUES (?, ?, 'LEARNING', true, now())
                ON CONFLICT (user_id, word_id) DO UPDATE SET
                    starred = NOT user_vocabulary_progress.starred,
                    updated_at = now()
                """;
        jdbc.update(upsert, userId, wordId);
    }

    @Transactional
    public void updateWordStatus(String wordId, String status, UUID userId) {
        if (userId == null) return;

        String upsert = """
                INSERT INTO user_vocabulary_progress (user_id, word_id, status, starred, review_count, last_reviewed_at, updated_at)
                VALUES (?, ?, ?, false, 1, now(), now())
                ON CONFLICT (user_id, word_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    review_count = user_vocabulary_progress.review_count + 1,
                    last_reviewed_at = now(),
                    updated_at = now()
                """;
        jdbc.update(upsert, userId, wordId, status);
    }

    @Transactional
    public void syncFromImportItem(JsonNode data) {
        if (data == null) return;
        String word = data.path("word").asText("").trim();
        List<VocabularySenseInput> importedSenses = readImportedSenses(data.path("senses"));
        String meaning = data.path("meaning").asText("").trim();
        if (!importedSenses.isEmpty()) {
            meaning = importedSenses.get(0).meaning();
        }
        String meaningSource = formatMeaningSource(data.path("meaningSource").asText("EDITOR"));
        boolean meaningEdited = data.path("meaningEdited").asBoolean(false);
        if (word.isBlank() || meaning.isBlank()) return;

        String pos = VocabularyPartOfSpeech.normalize(data.has("pos") && !data.path("pos").asText("").isBlank()
                ? data.path("pos").asText("")
                : data.path("partOfSpeech").asText("Noun"));
        if (!importedSenses.isEmpty()) {
            pos = importedSenses.get(0).partOfSpeech();
        }
        String ipa = data.path("ipa").asText("").trim();
        String example = data.has("example") && !data.path("example").asText("").isBlank()
                ? data.path("example").asText("").trim()
                : data.path("exampleEn").asText("").trim();
        if (!importedSenses.isEmpty()) {
            example = importedSenses.get(0).example();
        }
        String exampleMeaning = data.path("exampleVi").asText("").trim();
        String suppliedAudioUrl = data.path("audioUrl").asText("").trim();
        String audioUrl = vocabularyAudioUrl(suppliedAudioUrl, word);
        String subCategory = data.path("subCategory").asText(data.path("sub_category").asText("")).trim();
        if (!importedSenses.isEmpty()) {
            subCategory = importedSenses.get(0).subCategory();
        }
        String wordFamily = data.path("wordFamily").asText(data.path("word_family").asText("")).trim();
        String level = formatLevel(data.path("level").asText("B1"));
        String topic = data.has("topic") && !data.path("topic").asText("").isBlank()
                ? data.path("topic").asText("").trim()
                : data.path("category").asText("").trim();

        // Target set resolution
        String setId;
        if (data.has("setId") && !data.path("setId").asText("").isBlank()) {
            String rawId = data.path("setId").asText("").trim();
            if (rawId.matches("^\\d+$")) {
                int num = Integer.parseInt(rawId);
                setId = String.format("set-%02d", num);
            } else if (rawId.startsWith("SET_")) {
                setId = rawId.toLowerCase(Locale.ROOT).replace('_', '-');
            } else {
                setId = rawId;
            }
        } else if (!topic.isBlank()) {
            // Match explicit topic metadata only; substring matches can route words to an unrelated set.
            List<String> foundSets = jdbc.query(
                    """
                    SELECT id FROM vocabulary_test_sets
                    WHERE LOWER(category) = LOWER(?)
                       OR LOWER(title) = LOWER(?)
                       OR LOWER(title) = LOWER(?)
                    ORDER BY CASE WHEN LOWER(category) = LOWER(?) THEN 0 ELSE 1 END
                    LIMIT 1
                    """,
                    (rs, rowNum) -> rs.getString("id"),
                    topic, topic, "Từ vựng: " + topic, topic);
            if (!foundSets.isEmpty()) {
                setId = foundSets.get(0);
            } else {
                setId = "set-" + slugify(topic);
                String title = "Từ vựng: " + topic;
                jdbc.update("""
                        INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, created_at, updated_at)
                        VALUES (?, ?, '2024', ?, 0, 'PUBLISHED', now(), now())
                        ON CONFLICT (id) DO NOTHING
                        """, setId, title, topic);
            }
        } else {
            setId = "ets2024-t1";
        }

        // Determine title and category for the test set
        String setTitle = "Bộ từ vựng: " + setId;
        String setCategory = "General";
        Timestamp releaseAt = parseReleaseAt(data.path("releaseAt").asText(""));
        if (data.has("category") && !data.path("category").asText("").isBlank()) {
            setTitle = data.path("category").asText("").trim();
        } else if (data.has("setName") && !data.path("setName").asText("").isBlank()) {
            setTitle = data.path("setName").asText("").trim();
        }

        if (setId.startsWith("set-")) {
            String numPart = setId.replaceAll("[^0-9]", "");
            if (!numPart.isEmpty()) {
                int idNum = Integer.parseInt(numPart);
                if (idNum >= 1 && idNum <= 3) setCategory = "corporate";
                else if (idNum >= 4 && idNum <= 6) setCategory = "finance_marketing";
                else if (idNum >= 7 && idNum <= 10) setCategory = "commerce_production";
                else if (idNum >= 11 && idNum <= 15) setCategory = "office_travel";
                else if (idNum >= 16 && idNum <= 20) setCategory = "tech_services";
            }
        }

        // Ensure target set exists in vocabulary_test_sets to satisfy foreign key constraint
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status, release_at, created_at, updated_at)
                VALUES (?, ?, '2024', ?, 0, 'PUBLISHED', COALESCE(?, now()), now(), now())
                ON CONFLICT (id) DO UPDATE SET
                    title = CASE WHEN vocabulary_test_sets.title LIKE 'Bộ từ vựng: %' AND EXCLUDED.title NOT LIKE 'Bộ từ vựng: %' THEN EXCLUDED.title ELSE vocabulary_test_sets.title END,
                    category = CASE WHEN vocabulary_test_sets.category = 'General' AND EXCLUDED.category <> 'General' THEN EXCLUDED.category ELSE vocabulary_test_sets.category END,
                    release_at = CASE
                        WHEN ?::timestamptz IS NULL THEN COALESCE(vocabulary_test_sets.release_at, now())
                        ELSE EXCLUDED.release_at
                    END,
                    updated_at = now()
                """, setId, setTitle, setCategory, releaseAt, releaseAt);

        // Upsert into vocabulary_items
        boolean createSeparateMeaning = "CREATE_NEW".equals(data.path("duplicateResolution").asText());
        List<String> existing = createSeparateMeaning ? List.of() : jdbc.query(
                """
                SELECT id FROM vocabulary_items
                WHERE set_id = ? AND LOWER(TRIM(word)) = LOWER(TRIM(?))
                ORDER BY order_index, id
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getString("id"),
                setId, word);

        String wordId;
        if (!existing.isEmpty()) {
            wordId = existing.get(0);
            jdbc.update("""
                    UPDATE vocabulary_items SET
                        ipa = COALESCE(NULLIF(?, ''), ipa),
                        part_of_speech = COALESCE(NULLIF(?, ''), part_of_speech),
                        meaning = ?,
                        meaning_source = ?,
                        meaning_edited = ?,
                        example = COALESCE(NULLIF(?, ''), example),
                        example_meaning = COALESCE(NULLIF(?, ''), example_meaning),
                        level = ?,
                        audio_url = CASE
                            WHEN ? <> '' THEN ?
                            WHEN audio_url IS NULL OR BTRIM(audio_url) = '' THEN ?
                            ELSE audio_url
                        END,
                        word_family = COALESCE(NULLIF(?, ''), word_family),
                        updated_at = now()
                    WHERE id = ?
                    """, ipa, pos, meaning, meaningSource, meaningEdited, example, exampleMeaning, level,
                    suppliedAudioUrl, suppliedAudioUrl, audioUrl, wordFamily, wordId);
        } else {
            String wordSlug = slugify(word);
            wordId = "w-" + wordSlug.substring(0, Math.min(wordSlug.length(), 53))
                    + "-" + UUID.randomUUID().toString().substring(0, 8);
            jdbc.update("""
                    INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, meaning_source, meaning_edited, example, example_meaning, level, audio_url, word_family, starred, order_index, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, false, (SELECT COALESCE(MAX(order_index) + 1, 0) FROM vocabulary_items WHERE set_id = ?), now(), now())
                    """, wordId, setId, word, ipa, pos, meaning, meaningSource, meaningEdited, example, exampleMeaning, level, audioUrl, wordFamily, setId);
        }
        if (importedSenses.isEmpty()) {
            upsertSense(wordId, pos, subCategory, meaning, example, exampleMeaning, "", "");
        } else {
            for (VocabularySenseInput sense : importedSenses) {
                upsertSense(wordId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                        sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms());
            }
        }

        // Update word count
        jdbc.update("UPDATE vocabulary_test_sets SET word_count = (SELECT count(*) FROM vocabulary_items WHERE set_id = ?), updated_at = now() WHERE id = ?", setId, setId);
    }

    private List<VocabularySenseInput> readImportedSenses(JsonNode sensesNode) {
        if (sensesNode == null || !sensesNode.isArray()) {
            return List.of();
        }
        List<VocabularySenseInput> senses = new ArrayList<>();
        for (JsonNode sense : sensesNode) {
            if (!sense.isObject()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa trong senses phải là một object.");
            }
            String partOfSpeech = VocabularyPartOfSpeech.normalize(sense.path("partOfSpeech")
                    .asText(sense.path("part_of_speech").asText(sense.path("pos").asText(""))));
            String meaning = sense.path("meaning")
                    .asText(sense.path("meaningVi").asText(sense.path("meaning_vi").asText(""))).trim();
            String definitionEn = sense.path("definitionEn").asText(sense.path("definition_en").asText("")).trim();
            if (partOfSpeech.isBlank() || (meaning.isBlank() && definitionEn.isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa cần có từ loại và định nghĩa tiếng Anh hoặc nghĩa tiếng Việt.");
            }
            senses.add(new VocabularySenseInput(
                    partOfSpeech,
                    sense.path("subCategory").asText(sense.path("sub_category").asText("")).trim(),
                    meaning,
                    sense.path("example").asText(sense.path("exampleEn").asText(sense.path("example_en").asText(""))).trim(),
                    sense.path("exampleMeaning").asText(sense.path("exampleVi").asText(sense.path("example_vi").asText(""))).trim(),
                    sense.path("synonyms").asText("").trim(),
                    sense.path("antonyms").asText("").trim(),
                    definitionEn
            ));
        }
        return senses;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialDataIfEmpty() {
        boolean initializeDefaultVocabulary = jdbc.update("""
                INSERT INTO vocabulary_seed_state (seed_key)
                VALUES ('default-vocabulary')
                ON CONFLICT (seed_key) DO NOTHING
                """) == 1;
        if (!initializeDefaultVocabulary) {
            jdbc.update("""
                    UPDATE vocabulary_test_sets s
                    SET word_count = (SELECT count(*) FROM vocabulary_items w WHERE w.set_id = s.id)
                    """);
            return;
        }

        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('ets2024-t1', 'ETS 2024 - Test 1 Vocabulary', '2024', '2024', 8, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('ets2024-t2', 'ETS 2024 - Test 2 Vocabulary', '2024', '2024', 8, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);
        jdbc.update("""
                INSERT INTO vocabulary_test_sets (id, title, year, category, word_count, status)
                VALUES ('600-essential', '600 Từ Vựng Thiết Yếu Cho TOEIC', '2024', '600_essential', 10, 'PUBLISHED')
                ON CONFLICT (id) DO NOTHING
                """);

        Integer t1WordCount = jdbc.queryForObject(
                "SELECT count(*) FROM vocabulary_items WHERE set_id = 'ets2024-t1'", Integer.class);
        if (t1WordCount == null || t1WordCount == 0) {
            String[][] wordsT1 = {
                {"w-1", "negotiate", "/nəˈɡoʊʃieɪt/", "Verb", "Đàm phán, thương lượng hợp đồng", "The executive team successfully negotiated a lucrative distribution agreement.", "Ban điều hành đã thương lượng thành công thỏa thuận phân phối.", "B2", "true"},
                {"w-2", "invoice", "/ˈɪnvɔɪs/", "Noun", "Hóa đơn thanh toán hàng hóa", "All invoices must be submitted to the finance department by the end of each month.", "Tất cả hóa đơn phải được nộp cho bộ phận tài chính vào cuối tháng.", "B1", "false"},
                {"w-3", "implement", "/ˈɪmplɪment/", "Verb", "Triển khai, thực thi chính sách mới", "We plan to implement the revised safety protocol starting next Monday.", "Chúng tôi dự định thực thi quy trình an toàn đã sửa đổi vào thứ Hai tới.", "B2", "false"},
                {"w-4", "itinerary", "/aɪˈtɪnəreri/", "Noun", "Lịch trình chuyến đi công tác", "The corporate travel coordinator emailed the complete flight itinerary.", "Điều phối viên đã gửi email lịch trình chuyến bay đầy đủ.", "B1", "false"},
                {"w-5", "warranty", "/ˈwɔːrənti/", "Noun", "Phiếu bảo hành chất lượng sản phẩm", "The commercial air conditioner is covered by an extensive three-year warranty.", "Máy điều hòa thương mại được bảo hành toàn diện trong 3 năm.", "B1", "true"},
                {"w-6", "collaborate", "/kəˈlæbəreɪt/", "Verb", "Hợp tác làm việc cùng nhau", "Our graphic designers collaborate closely with the copywriters on every ad campaign.", "Các nhà thiết kế đồ họa hợp tác chặt chẽ với người viết lời quảng cáo.", "B2", "false"},
                {"w-7", "revenue", "/ˈrevənuː/", "Noun", "Doanh thu của doanh nghiệp", "Annual revenue increased by fifteen percent following the expansion into overseas markets.", "Doanh thu hàng năm tăng 15% sau khi mở rộng ra thị trường nước ngoài.", "B2", "true"},
                {"w-8", "specifications", "/ˌspesɪfɪˈkeɪʃnz/", "Noun", "Thông số kỹ thuật chi tiết", "Engineers verified that the prototype strictly met all manufacturing specifications.", "Các kỹ sư xác nhận rằng mẫu thử nghiệm đáp ứng nghiêm ngặt thông số kỹ thuật.", "B2", "false"}
            };

            for (int i = 0; i < wordsT1.length; i++) {
                String[] w = wordsT1[i];
                jdbc.update("""
                        INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                        VALUES (?, 'ets2024-t1', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                        ON CONFLICT (id) DO NOTHING
                        """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
            }
        }

        Integer t2WordCount = jdbc.queryForObject(
                "SELECT count(*) FROM vocabulary_items WHERE set_id = 'ets2024-t2'", Integer.class);
        if (t2WordCount == null || t2WordCount == 0) {
            String[][] wordsT2 = {
                {"w-t2-1", "compromise", "/ˈkɑːmprəmaɪz/", "Noun", "Sự thỏa hiệp, thỏa thuận nhượng bộ", "The management reached a compromise with the union over working hours.", "Ban quản lý đã đạt được thỏa thuận thỏa hiệp với công đoàn về giờ làm việc.", "B2", "true"},
                {"w-t2-2", "delegate", "/ˈdelɪɡeɪt/", "Verb", "Ủy thác, phân công nhiệm vụ", "A successful manager knows how to delegate responsibilities effectively.", "Một người quản lý thành công biết cách phân công trách nhiệm một cách hiệu quả.", "B2", "false"},
                {"w-t2-3", "facilitate", "/fəˈsɪlɪteɪt/", "Verb", "Tạo điều kiện thuận lợi, hỗ trợ tiến trình", "The new software is designed to facilitate communication between departments.", "Phần mềm mới được thiết kế để tạo điều kiện liên lạc thuận lợi giữa các phòng ban.", "B2", "false"},
                {"w-t2-4", "mandatory", "/ˈmændətɔːri/", "Adjective", "Bắt buộc theo quy định", "Attendance at the workplace safety workshop is mandatory for all personnel.", "Tham dự hội thảo an toàn lao động là bắt buộc đối với tất cả nhân viên.", "B1", "true"},
                {"w-t2-5", "lucrative", "/ˈluːkrətɪv/", "Adjective", "Sinh lợi nhiều, mang lại lợi nhuận cao", "The merger opened up lucrative opportunities in the international market.", "Vụ sáp nhập đã mở ra những cơ hội sinh lời lớn tại thị trường quốc tế.", "B2", "false"},
                {"w-t2-6", "reimburse", "/ˌriːɪmˈbɜːrs/", "Verb", "Hoàn trả chi phí, bồi hoàn tiền", "The company will reimburse travel expenses within five business days.", "Công ty sẽ hoàn trả các khoản chi phí đi lại trong vòng năm ngày làm việc.", "B1", "true"},
                {"w-t2-7", "preliminary", "/prɪˈlɪmɪneri/", "Adjective", "Sơ bộ, mở đầu, chuẩn bị", "The preliminary findings of the financial audit will be released tomorrow.", "Các kết quả sơ bộ của đợt kiểm toán tài chính sẽ được công bố vào ngày mai.", "B2", "false"},
                {"w-t2-8", "tenant", "/ˈtenənt/", "Noun", "Người thuê nhà, bên thuê mặt bằng", "All tenants are required to follow the building noise regulations after 10 PM.", "Tất cả khách thuê được yêu cầu tuân thủ quy định về tiếng ồn sau 10 giờ tối.", "B1", "false"}
            };

            for (int i = 0; i < wordsT2.length; i++) {
                String[] w = wordsT2[i];
                jdbc.update("""
                        INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                        VALUES (?, 'ets2024-t2', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                        ON CONFLICT (id) DO NOTHING
                        """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
            }
        }

        Integer w600Count = jdbc.queryForObject(
                "SELECT count(*) FROM vocabulary_items WHERE set_id = '600-essential'", Integer.class);
        if (w600Count == null || w600Count == 0) {
            String[][] words600 = {
                {"w-600-1", "abide by", "/əˈbaɪd baɪ/", "Verb", "Tuân thủ, tuân theo hợp đồng", "Both parties agreed to abide by the terms stated in the agreement.", "Cả hai bên đã đồng ý tuân thủ các điều khoản được nêu trong hợp đồng.", "B1", "true"},
                {"w-600-2", "agreement", "/əˈɡriːmənt/", "Noun", "Hợp đồng, sự thỏa thuận", "The commercial agreement was signed after weeks of negotiations.", "Hợp đồng thương mại đã được ký kết sau nhiều tuần đàm phán.", "A2", "false"},
                {"w-600-3", "assurance", "/əˈʃʊrəns/", "Noun", "Sự cam đoan, sự bảo đảm", "The sales director gave his assurance that the delivery would arrive on schedule.", "Giám đốc bán hàng đã cam đoan rằng hàng sẽ đến đúng lịch trình.", "B2", "false"},
                {"w-600-4", "cancellation", "/ˌkænsəˈleɪʃn/", "Noun", "Sự hủy bỏ, chấm dứt", "The client clause specifies penalty fees in case of late contract cancellation.", "Điều khoản khách hàng quy định mức phí phạt trong trường hợp hủy hợp đồng trễ.", "B1", "true"},
                {"w-600-5", "determine", "/dɪˈtɜːrmɪn/", "Verb", "Xác định, quyết định một cách rõ ràng", "Market research helped the committee determine the most competitive retail price.", "Nghiên cứu thị trường đã giúp ủy ban xác định mức giá bán lẻ cạnh tranh nhất.", "B1", "false"},
                {"w-600-6", "engage", "/ɪnˈɡeɪdʒ/", "Verb", "Tham gia, cam kết tham gia", "The firm decided to engage an external consulting agency for market entry.", "Công ty đã quyết định thuê một đơn vị tư vấn bên ngoài để tiếp cận thị trường.", "B2", "false"},
                {"w-600-7", "establish", "/ɪˈstæblɪʃ/", "Verb", "Thiết lập, thành lập mối quan hệ", "The two enterprises collaborated to establish long-term strategic cooperation.", "Hai doanh nghiệp đã hợp tác nhằm thiết lập mối quan hệ chiến lược lâu dài.", "B1", "true"},
                {"w-600-8", "obligate", "/ˈɑːblɪɡeɪt/", "Verb", "Bắt buộc, ràng buộc nghĩa vụ", "The confidentiality clause obligates employees to protect proprietary data.", "Điều khoản bảo mật ràng buộc nhân viên phải bảo vệ dữ liệu độc quyền.", "B2", "false"},
                {"w-600-9", "party", "/ˈpɑːrti/", "Noun", "Bên tham gia hợp đồng / thỏa thuận", "The contract is only legally binding when signed by both interested parties.", "Hợp đồng chỉ có hiệu lực pháp lý khi được ký bởi cả hai bên liên quan.", "B1", "false"},
                {"w-600-10", "provision", "/prəˈvɪʒn/", "Noun", "Điều khoản hợp đồng, sự dự phòng", "Under the provisions of the lease, rent will increase by three percent annually.", "Theo các điều khoản của hợp đồng thuê, tiền thuê sẽ tăng 3% hàng năm.", "B2", "true"}
            };

            for (int i = 0; i < words600.length; i++) {
                String[] w = words600[i];
                jdbc.update("""
                        INSERT INTO vocabulary_items (id, set_id, word, ipa, part_of_speech, meaning, example, example_meaning, level, starred, order_index)
                        VALUES (?, '600-essential', ?, ?, ?, ?, ?, ?, ?, ?::boolean, ?)
                        ON CONFLICT (id) DO NOTHING
                        """, w[0], w[1], w[2], w[3], w[4], w[5], w[6], w[7], Boolean.parseBoolean(w[8]), i);
            }
        }

        jdbc.update("""
                UPDATE vocabulary_test_sets s
                SET word_count = (SELECT count(*) FROM vocabulary_items w WHERE w.set_id = s.id)
                """);
    }

    private VocabularyTestSet mapSetSummary(ResultSet rs) throws SQLException {
        return new VocabularyTestSet(
                rs.getString("id"),
                rs.getString("title"),
                rs.getString("year"),
                rs.getString("category"),
                rs.getInt("word_count"),
                rs.getString("status"),
                timestampToString(rs.getTimestamp("release_at")),
                Collections.emptyList()
        );
    }

    private VocabularyWord mapWord(ResultSet rs) throws SQLException {
        return new VocabularyWord(
                rs.getString("id"),
                rs.getString("set_id"),
                rs.getString("word"),
                rs.getString("ipa"),
                VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                rs.getString("meaning"),
                rs.getString("meaning_source"),
                rs.getBoolean("meaning_edited"),
                rs.getString("example"),
                rs.getString("example_meaning"),
                rs.getString("level"),
                rs.getString("audio_url"),
                rs.getString("audio_region"),
                rs.getString("word_family"),
                rs.getString("term_type"),
                rs.getString("dictionary_source_url"),
                rs.getBoolean("starred"),
                rs.getString("status"),
                List.of(),
                List.of()
        );
    }

    private List<VocabularyWord> loadSenses(List<VocabularyWord> words) {
        if (words.isEmpty()) return words;
        List<String> ids = words.stream().map(word -> word.id()).toList();
        String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
        Map<String, List<VocabularySense>> sensesByItem = new HashMap<>();
        Map<String, List<VocabularyRelatedForm>> relatedFormsByItem = new HashMap<>();
        jdbc.query(
                "SELECT id, vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms, definition_en "
                        + "FROM vocabulary_item_senses WHERE vocabulary_item_id IN (" + placeholders + ") "
                        + "ORDER BY order_index, id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    sensesByItem.computeIfAbsent(rs.getString("vocabulary_item_id"), ignored -> new ArrayList<>())
                        .add(new VocabularySense(
                                rs.getString("id"),
                                VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                                rs.getString("sub_category"),
                                rs.getString("meaning"),
                                rs.getString("example"),
                                rs.getString("example_meaning"),
                                rs.getString("synonyms"),
                                rs.getString("antonyms"),
                                rs.getString("definition_en")
                        ));
                },
                ids.toArray()
        );
        List<Object> relationArgs = new ArrayList<>(ids);
        relationArgs.addAll(ids);
        String relationSql = """
                SELECT r.source_word_id AS owner_id, w.id, w.word, w.part_of_speech, r.relation_type
                FROM vocabulary_item_relations r
                JOIN vocabulary_items w ON w.id = r.related_word_id
                WHERE r.source_word_id IN (%s)
                UNION
                SELECT r.related_word_id AS owner_id, w.id, w.word, w.part_of_speech, r.relation_type
                FROM vocabulary_item_relations r
                JOIN vocabulary_items w ON w.id = r.source_word_id
                WHERE r.related_word_id IN (%s)
                ORDER BY owner_id, word
                """.formatted(placeholders, placeholders);
        jdbc.query(
                relationSql,
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    relatedFormsByItem.computeIfAbsent(rs.getString("owner_id"), ignored -> new ArrayList<>())
                            .add(new VocabularyRelatedForm(
                                    rs.getString("id"),
                                    rs.getString("word"),
                                    VocabularyPartOfSpeech.normalize(rs.getString("part_of_speech")),
                                    rs.getString("relation_type")
                            ));
                },
                relationArgs.toArray()
        );
        return words.stream().map(word -> {
            List<VocabularySense> senses = deduplicateSenseRecords(sensesByItem.getOrDefault(word.id(), List.of()));
            if (senses.isEmpty() && word.meaning() != null && !word.meaning().isBlank()) {
                senses = List.of(new VocabularySense(null, word.partOfSpeech(), "", word.meaning(), word.example(),
                        word.exampleMeaning(), "", "", ""));
            }
            return new VocabularyWord(
                    word.id(), word.setId(), word.word(), word.ipa(), word.partOfSpeech(), word.meaning(),
                    word.meaningSource(), word.meaningEdited(), word.example(), word.exampleMeaning(), word.level(),
                    word.audioUrl(), word.audioRegion(), word.wordFamily(), word.termType(), word.dictionarySourceUrl(),
                    word.starred(), word.status(), senses, relatedFormsByItem.getOrDefault(word.id(), List.of())
            );
        }).toList();
    }

    private void replaceRelatedForms(String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        Map<String, String> uniqueForms = normalizeRelatedForms(wordId, relatedForms);
        jdbc.update("""
                DELETE FROM vocabulary_item_relations
                WHERE source_word_id = ? OR related_word_id = ?
                """, wordId, wordId);
        insertRelatedForms(wordId, uniqueForms);
    }

    private void addRelatedForms(String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        insertRelatedForms(wordId, normalizeRelatedForms(wordId, relatedForms));
    }

    private Map<String, String> normalizeRelatedForms(
            String wordId, List<VocabularyRelatedFormInput> relatedForms) {
        List<VocabularyRelatedFormInput> normalizedForms = relatedForms == null ? List.of() : relatedForms;
        Map<String, String> uniqueForms = new LinkedHashMap<>();
        for (VocabularyRelatedFormInput form : normalizedForms) {
            if (form == null || form.id() == null || form.id().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mỗi liên kết họ từ cần có từ đích.");
            }
            String relatedWordId = form.id().trim();
            if (wordId.equals(relatedWordId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể liên kết từ với chính nó.");
            }
            Integer exists = jdbc.queryForObject(
                    "SELECT count(*) FROM vocabulary_items WHERE id = ?", Integer.class, relatedWordId);
            if (exists == null || exists == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy từ được liên kết.");
            }
            String relationType = normalizeRelationType(form.relationType());
            uniqueForms.putIfAbsent(relatedWordId, relationType);
        }
        return uniqueForms;
    }

    private void insertRelatedForms(String wordId, Map<String, String> relatedForms) {
        relatedForms.forEach((relatedWordId, relationType) -> jdbc.update("""
                INSERT INTO vocabulary_item_relations (source_word_id, related_word_id, relation_type)
                VALUES (?, ?, ?)
                ON CONFLICT (source_word_id, related_word_id) DO UPDATE SET relation_type = EXCLUDED.relation_type
                """, wordId, relatedWordId, relationType));
    }

    private String normalizeRelationType(String relationType) {
        if (relationType == null || relationType.isBlank()) return "WORD_FAMILY";
        String normalized = relationType.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("WORD_FAMILY") || normalized.equals("INFLECTION")) return normalized;
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại liên kết từ vựng không hợp lệ.");
    }

    private List<VocabularySenseInput> normalizeSenses(
            List<VocabularySenseInput> requested,
            String fallbackPartOfSpeech,
            String fallbackSubCategory,
            String fallbackMeaning,
            String fallbackExample,
            String fallbackExampleMeaning) {
        List<VocabularySenseInput> senses = requested == null || requested.isEmpty()
                ? List.of(new VocabularySenseInput(
                        fallbackPartOfSpeech, fallbackSubCategory, fallbackMeaning, fallbackExample,
                        fallbackExampleMeaning, "", ""))
                : requested;
        Map<String, VocabularySenseInput> normalized = new LinkedHashMap<>();
        for (VocabularySenseInput sense : senses) {
            if (sense == null) continue;
            String pos = VocabularyPartOfSpeech.normalize(sense.partOfSpeech());
            String meaning = sense.meaning() == null ? "" : sense.meaning().trim();
            String definitionEn = sense.definitionEn() == null ? "" : sense.definitionEn().trim();
            if (pos.isEmpty() || (meaning.isEmpty() && definitionEn.isEmpty())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mỗi nghĩa cần có từ loại và định nghĩa tiếng Anh hoặc nghĩa tiếng Việt.");
            }
            VocabularySenseInput normalizedSense = new VocabularySenseInput(
                    pos,
                    sense.subCategory() == null ? "" : sense.subCategory().trim(),
                    meaning,
                    sense.example() == null ? "" : sense.example().trim(),
                    sense.exampleMeaning() == null ? "" : sense.exampleMeaning().trim(),
                    sense.synonyms() == null ? "" : sense.synonyms().trim(),
                    sense.antonyms() == null ? "" : sense.antonyms().trim(),
                    definitionEn
            );
            String key = senseKey(pos, meaning, definitionEn);
            VocabularySenseInput existing = normalized.get(key);
            if (existing == null) {
                normalized.put(key, normalizedSense);
            } else {
                normalized.put(key, new VocabularySenseInput(
                        existing.partOfSpeech(),
                        existing.subCategory().isBlank() ? normalizedSense.subCategory() : existing.subCategory(),
                        existing.meaning(),
                        existing.example().isBlank() ? normalizedSense.example() : existing.example(),
                        existing.exampleMeaning().isBlank() ? normalizedSense.exampleMeaning() : existing.exampleMeaning(),
                        mergeRelationTerms(existing.synonyms(), normalizedSense.synonyms()),
                        mergeRelationTerms(existing.antonyms(), normalizedSense.antonyms()),
                        existing.definitionEn().isBlank() ? normalizedSense.definitionEn() : existing.definitionEn()
                ));
            }
        }
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Từ vựng cần có ít nhất một nghĩa.");
        }
        return new ArrayList<>(normalized.values());
    }

    private List<VocabularySense> deduplicateSenseRecords(List<VocabularySense> senses) {
        Map<String, VocabularySense> unique = new LinkedHashMap<>();
        for (VocabularySense sense : senses) {
            String partOfSpeech = VocabularyPartOfSpeech.normalize(sense.partOfSpeech());
            String key = senseKey(partOfSpeech, sense.meaning(), sense.definitionEn());
            VocabularySense existing = unique.get(key);
            if (existing == null) {
                unique.put(key, new VocabularySense(
                        sense.id(), partOfSpeech, sense.subCategory(), sense.meaning(), sense.example(),
                        sense.exampleMeaning(), sense.synonyms(), sense.antonyms(), sense.definitionEn()));
            } else {
                unique.put(key, new VocabularySense(
                        existing.id(),
                        partOfSpeech,
                        existing.subCategory() == null || existing.subCategory().isBlank()
                                ? sense.subCategory() : existing.subCategory(),
                        existing.meaning(),
                        existing.example() == null || existing.example().isBlank()
                                ? sense.example() : existing.example(),
                        existing.exampleMeaning() == null || existing.exampleMeaning().isBlank()
                                ? sense.exampleMeaning() : existing.exampleMeaning(),
                        mergeRelationTerms(existing.synonyms(), sense.synonyms()),
                        mergeRelationTerms(existing.antonyms(), sense.antonyms()),
                        existing.definitionEn() == null || existing.definitionEn().isBlank()
                                ? sense.definitionEn() : existing.definitionEn()));
            }
        }
        return new ArrayList<>(unique.values());
    }

    private String senseKey(String partOfSpeech, String meaning, String definitionEn) {
        String identity = meaning == null || meaning.isBlank() ? "en:" + (definitionEn == null ? "" : definitionEn) : meaning;
        String normalizedMeaning = identity.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
        return VocabularyPartOfSpeech.normalize(partOfSpeech).toLowerCase(Locale.ROOT) + "|" + normalizedMeaning;
    }

    private String mergeRelationTerms(String existing, String incoming) {
        Map<String, String> terms = new LinkedHashMap<>();
        for (String value : List.of(existing == null ? "" : existing, incoming == null ? "" : incoming)) {
            for (String term : value.split("[,;|]")) {
                String trimmed = term.trim();
                if (!trimmed.isEmpty()) terms.putIfAbsent(trimmed.toLowerCase(Locale.ROOT), trimmed);
            }
        }
        return String.join(", ", terms.values());
    }

    private void replaceSenses(String itemId, List<VocabularySenseInput> senses) {
        jdbc.update("DELETE FROM vocabulary_item_senses WHERE vocabulary_item_id = ?", itemId);
        for (int index = 0; index < senses.size(); index++) {
            VocabularySenseInput sense = senses.get(index);
            jdbc.update("""
                    INSERT INTO vocabulary_item_senses (
                        vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms, definition_en, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, itemId, sense.partOfSpeech(), sense.subCategory(), sense.meaning(),
                    sense.example(), sense.exampleMeaning(), sense.synonyms(), sense.antonyms(), sense.definitionEn(), index);
        }
    }

    private void upsertSense(
            String itemId, String partOfSpeech, String subCategory, String meaning, String example,
            String exampleMeaning, String synonyms, String antonyms) {
        upsertSense(itemId, partOfSpeech, subCategory, meaning, example, exampleMeaning, synonyms, antonyms, "");
    }

    private void upsertSense(
            String itemId, String partOfSpeech, String subCategory, String meaning, String example,
            String exampleMeaning, String synonyms, String antonyms, String definitionEn) {
        String normalizedPartOfSpeech = VocabularyPartOfSpeech.normalize(partOfSpeech);
        String normalizedMeaning = meaning == null ? "" : meaning.trim().replaceAll("\\s+", " ");
        List<UUID> senseIds = jdbc.query(
                """
                SELECT id, part_of_speech, meaning, definition_en FROM vocabulary_item_senses
                WHERE vocabulary_item_id = ?
                """,
                (rs, rowNum) -> senseKey(normalizedPartOfSpeech, normalizedMeaning, definitionEn)
                        .equals(senseKey(rs.getString("part_of_speech"), rs.getString("meaning"),
                                rs.getString("definition_en")))
                                ? rs.getObject("id", UUID.class) : null,
                itemId).stream().filter(java.util.Objects::nonNull).toList();
        if (senseIds.isEmpty()) {
            jdbc.update("""
                    INSERT INTO vocabulary_item_senses (
                        vocabulary_item_id, part_of_speech, sub_category, meaning, example, example_meaning, synonyms, antonyms, definition_en, order_index
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (
                        SELECT COALESCE(MAX(order_index) + 1, 0)
                        FROM vocabulary_item_senses WHERE vocabulary_item_id = ?
                    ))
                    """, itemId, normalizedPartOfSpeech, subCategory, normalizedMeaning, example,
                    exampleMeaning, synonyms, antonyms, definitionEn, itemId);
            return;
        }
        jdbc.update("""
                UPDATE vocabulary_item_senses SET
                    sub_category = COALESCE(NULLIF(?, ''), sub_category),
                    example = COALESCE(NULLIF(?, ''), example),
                    example_meaning = COALESCE(NULLIF(?, ''), example_meaning),
                    synonyms = COALESCE(NULLIF(?, ''), synonyms),
                    antonyms = COALESCE(NULLIF(?, ''), antonyms),
                    definition_en = COALESCE(NULLIF(?, ''), definition_en),
                    updated_at = now()
                WHERE id = ?
                """, subCategory, example, exampleMeaning, synonyms, antonyms, definitionEn, senseIds.get(0));
    }

    private String timestampToString(Timestamp timestamp) {
        return timestamp == null ? null
                : timestamp.toInstant().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime().toString();
    }

    private Timestamp parseReleaseAt(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            String normalized = value.trim();
            var instant = normalized.endsWith("Z") || normalized.matches(".*[+-]\\d{2}:\\d{2}$")
                    ? OffsetDateTime.parse(normalized).toInstant()
                    : LocalDateTime.parse(normalized).atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
            return Timestamp.from(instant);
        } catch (java.time.format.DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thời gian phát hành không đúng định dạng.", exception);
        }
    }

    private String normalizeTermType(String termType) {
        if (termType == null || termType.isBlank()) return null;
        String normalized = termType.trim().toUpperCase(Locale.ROOT);
        if (Set.of("WORD", "PHRASAL_VERB", "NOUN_PHRASE", "ADJECTIVE_PHRASE",
                "COLLOCATION", "IDIOM", "OTHER_PHRASE", "UNKNOWN").contains(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại từ/cụm từ không hợp lệ.");
    }

    private String normalizeDictionarySourceUrl(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) return null;
        String normalized = sourceUrl.trim();
        if (normalized.length() > 2048
                || !(normalized.startsWith("https://api.dictionaryapi.dev/")
                || normalized.startsWith("https://en.wiktionary.org/wiki/"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn nguồn từ điển không hợp lệ.");
        }
        return normalized;
    }

    private String normalizeAudioRegion(String region) {
        if (region == null || region.isBlank()) return "UNKNOWN";
        String normalized = region.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "UK", "US" -> normalized;
            default -> "UNKNOWN";
        };
    }

    private String formatLevel(String level) {
        if (level == null || level.isBlank()) return "B1";
        String upper = level.trim().toUpperCase(Locale.ROOT);
        if (upper.equals("EASY") || upper.equals("A1")) return "A1";
        if (upper.equals("A2")) return "A2";
        if (upper.equals("B1") || upper.equals("MEDIUM")) return "B1";
        if (upper.equals("B2") || upper.equals("HARD")) return "B2";
        if (upper.equals("C1")) return "C1";
        if (upper.equals("C2")) return "C2";
        return "B1";
    }

    private String formatMeaningSource(String source) {
        if (source == null || source.isBlank()) return "EDITOR";
        String normalized = source.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("MINHQND") || normalized.equals("THICHHOC") || normalized.equals("EDITOR")) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nguồn nghĩa từ vựng không hợp lệ.");
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) return "PUBLISHED";
        String upper = status.trim().toUpperCase(Locale.ROOT);
        if (upper.equals("DRAFT") || upper.equals("PUBLISHED") || upper.equals("ARCHIVED")) {
            return upper;
        }
        return "PUBLISHED";
    }

    private String slugify(String input) {
        if (input == null) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    public record VocabularyTestSet(
            String id,
            String title,
            String year,
            String category,
            int wordCount,
            String status,
            String releaseAt,
            List<VocabularyWord> words
    ) {}

    public record VocabularyWord(
            String id,
            String setId,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String wordFamily,
            String termType,
            String dictionarySourceUrl,
            boolean starred,
            String status,
            List<VocabularySense> senses,
            List<VocabularyRelatedForm> relatedForms
    ) {}

    public record VocabularyRelatedForm(
            String id,
            String word,
            String partOfSpeech,
            String relationType
    ) {}

    public record VocabularyRelatedFormInput(String id, String relationType) {}

    private record AudioSyncTarget(String id, String word) {}

    public record VocabularySense(
            String id,
            String partOfSpeech,
            String subCategory,
            String meaning,
            String example,
            String exampleMeaning,
            String synonyms,
            String antonyms,
            String definitionEn
    ) {
        public VocabularySense(String id, String partOfSpeech, String subCategory, String meaning, String example) {
            this(id, partOfSpeech, subCategory, meaning, example, "", "", "", "");
        }

        public VocabularySense(
                String id, String partOfSpeech, String subCategory, String meaning, String example,
                String exampleMeaning, String synonyms, String antonyms) {
            this(id, partOfSpeech, subCategory, meaning, example, exampleMeaning, synonyms, antonyms, "");
        }
    }

    public record VocabularySenseInput(
            String partOfSpeech,
            String subCategory,
            String meaning,
            String example,
            String exampleMeaning,
            String synonyms,
            String antonyms,
            String definitionEn
    ) {
        public VocabularySenseInput(String partOfSpeech, String subCategory, String meaning, String example) {
            this(partOfSpeech, subCategory, meaning, example, "", "", "", "");
        }

        public VocabularySenseInput(
                String partOfSpeech, String subCategory, String meaning, String example,
                String synonyms, String antonyms) {
            this(partOfSpeech, subCategory, meaning, example, "", synonyms, antonyms, "");
        }

        public VocabularySenseInput(
                String partOfSpeech, String subCategory, String meaning, String example,
                String exampleMeaning, String synonyms, String antonyms) {
            this(partOfSpeech, subCategory, meaning, example, exampleMeaning, synonyms, antonyms, "");
        }
    }

    public record CreateSetRequest(
            String id,
            String title,
            String year,
            String category,
            String status,
            String releaseAt
    ) {}

    public record UpdateSetRequest(
            String title,
            String year,
            String category,
            String status,
            String releaseAt
    ) {}

    public record CreateWordRequest(
            String id,
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            Boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String subCategory,
            String wordFamily,
            List<VocabularySenseInput> senses,
            List<VocabularyRelatedFormInput> relatedForms,
            String termType,
            String dictionarySourceUrl
    ) {}

    public record UpdateWordRequest(
            String word,
            String ipa,
            String partOfSpeech,
            String meaning,
            String meaningSource,
            Boolean meaningEdited,
            String example,
            String exampleMeaning,
            String level,
            String audioUrl,
            String audioRegion,
            String subCategory,
            String wordFamily,
            List<VocabularySenseInput> senses,
            List<VocabularyRelatedFormInput> relatedForms,
            String termType,
            String dictionarySourceUrl
    ) {}

    public record UpdateDailyGoalRequest(int newWordsGoal, int reviewGoal) {}

    public record StartVocabularyGameRequest(
            String setId,
            String gameType,
            List<String> deckIds,
            String mode,
            Integer timeLimitSeconds,
            Integer questionCount,
            String difficulty) {
        public StartVocabularyGameRequest(
                String setId,
                String gameType,
                List<String> deckIds,
                String mode,
                Integer timeLimitSeconds,
                Integer questionCount) {
            this(setId, gameType, deckIds, mode, timeLimitSeconds, questionCount, null);
        }

        public StartVocabularyGameRequest(String setId, String gameType) {
            this(setId, gameType, null, null, null, null, null);
        }

        public StartVocabularyGameRequest(String setId, String gameType, List<String> deckIds) {
            this(setId, gameType, deckIds, null, null, null, null);
        }
    }

    public record VocabularyGameSession(
            UUID id,
            String setId,
            String gameType,
            String startedAt,
            String completedAt,
            int score,
            int correctCount,
            int wrongCount,
            int totalQuestions,
            int durationSeconds,
            int maxCombo,
            Integer stars,
            Boolean won,
            Integer playerHpRemaining,
            Integer fleetHpRemaining,
            String mode,
            Integer timeLimitSeconds,
            List<SentenceGameQuestion> questions,
            String difficulty,
            String tier,
            Integer accuracy,
            Integer correct,
            Integer wrong,
            Integer avoidableMistakes,
            List<GameScoringCalculator.WrongWordDetail> wrongWords
    ) {
        public VocabularyGameSession(
                UUID id,
                String setId,
                String gameType,
                String startedAt,
                String completedAt,
                int score,
                int correctCount,
                int wrongCount,
                int totalQuestions,
                int durationSeconds,
                int maxCombo) {
            this(id, setId, gameType, startedAt, completedAt, score, correctCount, wrongCount,
                        totalQuestions, durationSeconds, maxCombo, null, null, null, null,
                    "CLASSIC", null, List.of(), "MEDIUM", null, null, null, null, null, List.of());
        }

        public VocabularyGameSession(
                    UUID id,
                    String setId,
                    String gameType,
                    String startedAt,
                    String completedAt,
                    int score,
                    int correctCount,
                    int wrongCount,
                    int totalQuestions,
                    int durationSeconds,
                    int maxCombo,
                    Integer stars,
                    Boolean won,
                    Integer playerHpRemaining,
                    Integer fleetHpRemaining) {
                this(id, setId, gameType, startedAt, completedAt, score, correctCount, wrongCount,
                        totalQuestions, durationSeconds, maxCombo, stars, won, playerHpRemaining,
                        fleetHpRemaining, "CLASSIC", null, List.of(), "MEDIUM", null, null, null, null, null, List.of());
        }

        public VocabularyGameSession(
                UUID id,
                String setId,
                String gameType,
                String startedAt,
                String completedAt,
                int score,
                int correctCount,
                int wrongCount,
                int totalQuestions,
                int durationSeconds,
                int maxCombo,
                Integer stars,
                Boolean won,
                Integer playerHpRemaining,
                Integer fleetHpRemaining,
                String mode,
                Integer timeLimitSeconds,
                List<SentenceGameQuestion> questions,
                String difficulty) {
            this(id, setId, gameType, startedAt, completedAt, score, correctCount, wrongCount,
                    totalQuestions, durationSeconds, maxCombo, stars, won, playerHpRemaining,
                    fleetHpRemaining, mode, timeLimitSeconds, questions, difficulty, null, null, null, null, null, List.of());
        }
    }

    public record SentenceGameQuestion(int questionIndex, String wordId, List<String> optionWordIds) {}

    public record BattleSessionState(
            VocabularyGameSession session,
            List<BattleSessionEventItem> events,
            int playerHp,
            int fleetHp,
            int combo,
            int counterCharge,
            String battleState
    ) {}

    public record BattleSessionEventItem(
            int questionIndex,
            String wordId,
            String gameResult,
            boolean correct,
            double damage,
            boolean usedHint
    ) {}

    public record VocabularyGameScore(
            String gameType,
            int bestScore,
            long completedPlays,
            String lastPlayedAt
    ) {}

    public record WeakVocabularyWord(
            String wordId,
            String word,
            String setId,
            String setTitle,
            String meaning,
            String status,
            int correctCount,
            int incorrectCount,
            String nextReviewAt
    ) {}

    public record VocabularyDailyStat(
            String date,
            long answerCount,
            long correctCount,
            long responseTimeMs
    ) {}

    public record RecordVocabularyAnswerRequest(
            UUID requestId,
            String wordId,
            String activityType,
            String questionType,
            String answer,
            String rating,
            int responseTimeMs,
            UUID gameSessionId,
            Integer gameQuestionIndex,
            String result,
            Boolean usedHint,
            String usedItem,
            String enemyType,
            Double damage,
            String gameMode,
            String wordLevel,
            String firstWordId,
            String secondWordId
    ) {
        public RecordVocabularyAnswerRequest(
                UUID requestId,
                String wordId,
                String activityType,
                String questionType,
                String answer,
                String rating,
                int responseTimeMs,
                UUID gameSessionId,
                Integer gameQuestionIndex) {
            this(requestId, wordId, activityType, questionType, answer, rating, responseTimeMs,
                    gameSessionId, gameQuestionIndex, null, null, null, null, null, null, null, null, null);
        }

        public RecordVocabularyAnswerRequest(
                UUID requestId,
                String wordId,
                String activityType,
                String questionType,
                String answer,
                String rating,
                int responseTimeMs,
                UUID gameSessionId,
                Integer gameQuestionIndex,
                String result,
                Boolean usedHint,
                String usedItem,
                String enemyType,
                Double damage,
                String gameMode,
                String wordLevel) {
            this(requestId, wordId, activityType, questionType, answer, rating, responseTimeMs,
                    gameSessionId, gameQuestionIndex, result, usedHint, usedItem, enemyType, damage, gameMode, wordLevel, null, null);
        }
    }

    public record VocabularyAnswerResult(
            UUID eventId,
            boolean correct,
            String correctAnswer,
            String status,
            String nextReviewAt,
            String result,
            boolean duplicate,
            Double damage,
            Integer playerHp,
            Integer enemyHp,
            Integer score,
            Integer combo,
            Integer counterCharge,
            Boolean isCritical,
            String battleState
    ) {
        public VocabularyAnswerResult(
                UUID eventId,
                boolean correct,
                String correctAnswer,
                String status,
                String nextReviewAt,
                String result,
                boolean duplicate) {
            this(eventId, correct, correctAnswer, status, nextReviewAt, result, duplicate,
                    null, null, null, null, null, null, null, null);
        }
    }

    public record VocabularyHistoryItem(
            UUID id,
            String wordId,
            String word,
            String setId,
            String setTitle,
            String activityType,
            String questionType,
            String studentAnswer,
            String correctAnswer,
            boolean correct,
            String rating,
            int responseTimeMs,
            String attemptedAt
    ) {}

    public record StudentVocabularyDashboard(
            long totalWords,
            long learnedWords,
            long masteredWords,
            long learningWords,
            long reviewingWords,
            long dueForReview,
            long totalSets,
            long memoryRate,
            int studyMinutes,
            int streakDays,
            int dailyStudyMinutesGoal,
            long totalAnswers,
            long correctAnswers,
            int newWordsGoal,
            int reviewGoal,
            int completedNewWords,
            int completedReview,
            boolean reachedNewGoal,
            boolean reachedReviewGoal
    ) {}

    public record StudentVocabularyGoal(
            int newWordsGoal,
            int reviewGoal,
            int completedNewWords,
            int completedReview,
            boolean reachedNewGoal,
            boolean reachedReviewGoal
    ) {}

    private record StudentProgressSummary(
            long totalWords,
            long learnedWords,
            long masteredWords,
            long learningWords,
            long reviewingWords,
            long dueForReview,
            long totalSets
    ) {}

    private record VocabularyAnswerKey(String word, String meaning, String senseMeaning, String synonyms) {}

    private record VocabularySrsState(String status, double easeFactor, int intervalDays, int repetitions, int reviewCount) {}

    private record VocabularySrsSchedule(
            String status,
            double easeFactor,
            int intervalDays,
            int repetitions,
            OffsetDateTime nextReviewAt
    ) {}

    private record AnswerCount(long totalAnswers, long correctAnswers) {}

    private record VocabularyGameSessionState(UUID id, String gameType, Timestamp completedAt, int totalQuestions) {
        public VocabularyGameSessionState(UUID id, String gameType, Timestamp completedAt) {
            this(id, gameType, completedAt, 0);
        }
    }

    private record GameAnswerSummary(int correctCount, int wrongCount, int totalCount, int durationSeconds) {}

    private record ExistingVocabularyAnswer(
            String wordId,
            String activityType,
            String questionType,
            String studentAnswer,
            String rating,
            UUID gameSessionId,
            Integer gameQuestionIndex,
            String result,
            boolean usedHint,
            String usedItem,
            String secondWordId
    ) {}

    private record GameAnswerState(boolean correct, String result, boolean usedHint, int responseTimeMs) {}
}
