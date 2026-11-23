package com.toeic.ai.toeic_api.learning;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudyPlanService {

    private static final Logger log = LoggerFactory.getLogger(StudyPlanService.class);
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StudyPlanService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Sinh hoặc cập nhật kế hoạch học tập cá nhân hóa dựa trên Onboarding Profile & Kết quả kiểm tra
     */
    @Transactional
    public StudyPlanResponse generateOrRefreshStudyPlan(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }

        // 1. Lấy thông tin Onboarding Profile
        ProfileData profile = getProfileData(userId);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Học viên chưa hoàn thành khảo sát mục tiêu (Onboarding).");
        }

        // 2. Xác định điểm xuất phát thực tế (Baseline Score & Source)
        BaselineInfo baseline = determineBaseline(userId, profile);

        // 3. Tính toán khoảng cách và thời gian
        int targetScore = profile.targetScore() != null ? profile.targetScore() : 600;
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        LocalDate examDate = profile.examDate();

        int daysRemaining = 90; // Mặc định 3 tháng nếu chưa đặt ngày thi
        if (examDate != null) {
            long diff = ChronoUnit.DAYS.between(today, examDate);
            daysRemaining = (int) Math.max(7, diff);
        }

        int dailyMinutes = profile.dailyStudyMinutes() != null ? profile.dailyStudyMinutes() : 30;
        int weeklyDays = profile.studyDays().isEmpty() ? 5 : profile.studyDays().size();
        List<String> interests = profile.interests().isEmpty()
                ? List.of("VOCABULARY", "GRAMMAR", "LISTENING", "READING")
                : profile.interests();

        // 4. Heuristic Calculation Engine: Phân bổ mục tiêu khoa học
        int scoreGap = Math.max(0, targetScore - baseline.score());
        double difficultyMultiplier = targetScore >= 850 ? 1.4 : (targetScore >= 700 ? 1.2 : 1.0);

        // Phân bổ từ vựng theo thời gian và thời lượng học mỗi ngày
        int calculatedNewWords = calculateNewWordsPerDay(scoreGap, daysRemaining, dailyMinutes, difficultyMultiplier);
        int calculatedReviewWords = Math.min(200, Math.max(15, calculatedNewWords * 2));

        // Phân bổ ngữ pháp
        int calculatedGrammar = calculateGrammarPerDay(interests, dailyMinutes, baseline.score());

        // Phân bổ thời gian Listening / Reading (phút)
        int remainingMinutesForSkills = Math.max(10, dailyMinutes - (int) Math.round(calculatedNewWords * 1.2));
        int listeningMinutes = remainingMinutesForSkills / 2;
        int readingMinutes = remainingMinutesForSkills - listeningMinutes;

        if (interests.contains("LISTENING") && !interests.contains("READING")) {
            listeningMinutes = (int) Math.round(remainingMinutesForSkills * 0.7);
            readingMinutes = remainingMinutesForSkills - listeningMinutes;
        } else if (interests.contains("READING") && !interests.contains("LISTENING")) {
            readingMinutes = (int) Math.round(remainingMinutesForSkills * 0.7);
            listeningMinutes = remainingMinutesForSkills - readingMinutes;
        }

        // Phân bổ bài thi thử theo số tuần còn lại
        int mockTestsPerWeek = 1;
        if (daysRemaining <= 14) {
            mockTestsPerWeek = 2; // Giai đoạn nước rút
        } else if (daysRemaining <= 30 && dailyMinutes >= 45) {
            mockTestsPerWeek = 2;
        } else if (daysRemaining > 120) {
            mockTestsPerWeek = 1; // 1 đề mỗi 1-2 tuần
        }

        // 5. Sinh lời giải thích minh bạch (Explainable AI / Transparent Heuristic)
        String planExplanation = generateExplanation(
                baseline.score(),
                baseline.source(),
                targetScore,
                daysRemaining,
                dailyMinutes,
                weeklyDays,
                calculatedNewWords,
                calculatedReviewWords,
                mockTestsPerWeek,
                interests
        );

        // 6. Lưu vào bảng study_plans (UPSERT)
        String upsertPlanSql = """
                INSERT INTO study_plans (
                    user_id, source, target_score, baseline_score, baseline_source,
                    exam_date, days_remaining, daily_study_minutes, weekly_study_days,
                    recommended_new_words_per_day, recommended_review_per_day,
                    recommended_grammar_per_day, recommended_listening_minutes,
                    recommended_reading_minutes, recommended_mock_tests_per_week,
                    focus_areas, plan_explanation, is_active, created_at, updated_at
                ) VALUES (
                    ?, 'ONBOARDING', ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?,
                    ?, ?,
                    ?, ?,
                    ?, ?, TRUE, now(), now()
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    target_score = EXCLUDED.target_score,
                    baseline_score = EXCLUDED.baseline_score,
                    baseline_source = EXCLUDED.baseline_source,
                    exam_date = EXCLUDED.exam_date,
                    days_remaining = EXCLUDED.days_remaining,
                    daily_study_minutes = EXCLUDED.daily_study_minutes,
                    weekly_study_days = EXCLUDED.weekly_study_days,
                    recommended_new_words_per_day = EXCLUDED.recommended_new_words_per_day,
                    recommended_review_per_day = EXCLUDED.recommended_review_per_day,
                    recommended_grammar_per_day = EXCLUDED.recommended_grammar_per_day,
                    recommended_listening_minutes = EXCLUDED.recommended_listening_minutes,
                    recommended_reading_minutes = EXCLUDED.recommended_reading_minutes,
                    recommended_mock_tests_per_week = EXCLUDED.recommended_mock_tests_per_week,
                    focus_areas = EXCLUDED.focus_areas,
                    plan_explanation = EXCLUDED.plan_explanation,
                    is_active = TRUE,
                    updated_at = now()
                RETURNING id
                """;

        String[] focusAreasArray = interests.toArray(new String[0]);
        UUID planId = jdbc.queryForObject(upsertPlanSql, (rs, rowNum) -> rs.getObject("id", UUID.class),
                userId, targetScore, baseline.score(), baseline.source(),
                examDate == null ? null : Date.valueOf(examDate), daysRemaining, dailyMinutes, weeklyDays,
                calculatedNewWords, calculatedReviewWords, calculatedGrammar,
                listeningMinutes, readingMinutes, mockTestsPerWeek,
                focusAreasArray, planExplanation
        );

        // 7. Sinh mục tiêu từng tuần (Weekly Targets)
        generateWeeklyMilestones(planId, daysRemaining, calculatedNewWords, calculatedGrammar, mockTestsPerWeek);

        // 8. Tự động đồng bộ sang vocabulary_daily_goals của ngày hôm nay
        syncVocabularyGoalForToday(userId, calculatedNewWords, calculatedReviewWords);

        // 9. Ghi nhận log điều chỉnh kế hoạch
        recordAdjustment(planId, "ONBOARDING_INITIAL", null, getPlanSnapshot(planId));

        return getStudyPlan(userId);
    }

    /**
     * Lấy chi tiết kế hoạch học tập hiện tại của người dùng
     */
    public StudyPlanResponse getStudyPlan(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }

        String sql = """
                SELECT id, user_id, source, target_score, baseline_score, baseline_source,
                       exam_date, days_remaining, daily_study_minutes, weekly_study_days,
                       recommended_new_words_per_day, recommended_review_per_day,
                       recommended_grammar_per_day, recommended_listening_minutes,
                       recommended_reading_minutes, recommended_mock_tests_per_week,
                       focus_areas, plan_explanation, is_active, created_at, updated_at
                FROM study_plans
                WHERE user_id = ? AND is_active = TRUE
                LIMIT 1
                """;

        List<StudyPlanResponse> plans = jdbc.query(sql, (rs, rowNum) -> {
            UUID planId = rs.getObject("id", UUID.class);
            java.sql.Array focusArray = rs.getArray("focus_areas");
            List<String> focusList = Collections.emptyList();
            if (focusArray != null) {
                try {
                    String[] arr = (String[]) focusArray.getArray();
                    if (arr != null) focusList = Arrays.asList(arr);
                } catch (Exception ignored) {}
            }

            Date examDateSql = rs.getDate("exam_date");
            LocalDate examLocalDate = examDateSql != null ? examDateSql.toLocalDate() : null;

            // Lấy danh sách weekly targets
            List<WeeklyTarget> targets = getWeeklyTargets(planId);

            return new StudyPlanResponse(
                    planId,
                    rs.getInt("target_score"),
                    (Integer) rs.getObject("baseline_score"),
                    rs.getString("baseline_source"),
                    examLocalDate,
                    (Integer) rs.getObject("days_remaining"),
                    rs.getInt("daily_study_minutes"),
                    rs.getInt("weekly_study_days"),
                    rs.getInt("recommended_new_words_per_day"),
                    rs.getInt("recommended_review_per_day"),
                    rs.getInt("recommended_grammar_per_day"),
                    rs.getInt("recommended_listening_minutes"),
                    rs.getInt("recommended_reading_minutes"),
                    rs.getInt("recommended_mock_tests_per_week"),
                    focusList,
                    rs.getString("plan_explanation"),
                    rs.getBoolean("is_active"),
                    rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant().toString() : null,
                    rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant().toString() : null,
                    targets
            );
        }, userId);

        if (plans.isEmpty()) {
            // Nếu chưa có plan nhưng đã có onboarding profile, tự sinh plan ngay
            if (hasOnboardingProfile(userId)) {
                return generateOrRefreshStudyPlan(userId);
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa tìm thấy kế hoạch học tập. Vui lòng hoàn thành mục tiêu học tập trước.");
        }

        return plans.getFirst();
    }

    /**
     * Lấy tóm tắt nhanh cho Dashboard học viên (Rất nhẹ, tối ưu tốc độ < 10ms)
     */
    public StudyPlanSummary getStudyPlanSummary(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }

        try {
            StudyPlanResponse plan = getStudyPlan(userId);

            // Tính % tiến độ hoàn thành từ vựng + bài tập trong ngày
            Integer progressPercent = jdbc.queryForObject("""
                    SELECT CASE
                        WHEN new_words_goal + review_goal = 0 THEN 0
                        ELSE LEAST(100, ROUND(((completed_new_words + completed_review)::numeric / (new_words_goal + review_goal)::numeric) * 100))::int
                    END
                    FROM vocabulary_daily_goals
                    WHERE user_id = ? AND goal_date = (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                    LIMIT 1
                    """, Integer.class, userId);

            return new StudyPlanSummary(
                    plan.targetScore(),
                    plan.baselineScore(),
                    plan.daysRemaining(),
                    plan.recommendedNewWords(),
                    plan.recommendedReview(),
                    plan.recommendedGrammar(),
                    plan.recommendedMockTestsPerWeek(),
                    plan.planExplanation(),
                    plan.focusAreas(),
                    progressPercent != null ? progressPercent : 0,
                    plan.baselineSource()
            );
        } catch (ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return StudyPlanSummary.empty();
            }
            throw e;
        }
    }

    /**
     * Cho phép học viên điều chỉnh các chỉ số trong kế hoạch của mình
     */
    @Transactional
    public StudyPlanResponse updateStudyPlan(UUID userId, UpdateStudyPlanRequest request) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu yêu cầu không hợp lệ.");
        }

        StudyPlanResponse current = getStudyPlan(userId);
        String beforeSnapshot = getPlanSnapshot(current.planId());

        int newWords = request.newWordsPerDay() != null ? Math.max(0, Math.min(100, request.newWordsPerDay())) : current.recommendedNewWords();
        int reviewWords = request.reviewPerDay() != null ? Math.max(0, Math.min(300, request.reviewPerDay())) : current.recommendedReview();
        int grammar = request.grammarPerDay() != null ? Math.max(0, Math.min(50, request.grammarPerDay())) : current.recommendedGrammar();
        int listening = request.listeningMinutes() != null ? Math.max(0, Math.min(180, request.listeningMinutes())) : current.recommendedListeningMinutes();
        int reading = request.readingMinutes() != null ? Math.max(0, Math.min(180, request.readingMinutes())) : current.recommendedReadingMinutes();
        int mockTests = request.mockTestsPerWeek() != null ? Math.max(0, Math.min(7, request.mockTestsPerWeek())) : current.recommendedMockTestsPerWeek();

        jdbc.update("""
                UPDATE study_plans
                SET recommended_new_words_per_day = ?,
                    recommended_review_per_day = ?,
                    recommended_grammar_per_day = ?,
                    recommended_listening_minutes = ?,
                    recommended_reading_minutes = ?,
                    recommended_mock_tests_per_week = ?,
                    source = 'MANUAL_ADJUSTED',
                    updated_at = now()
                WHERE id = ?
                """, newWords, reviewWords, grammar, listening, reading, mockTests, current.planId());

        // Cập nhật lại bảng vocabulary_daily_goals hôm nay
        syncVocabularyGoalForToday(userId, newWords, reviewWords);

        // Ghi log thay đổi
        recordAdjustment(current.planId(), "USER_EDIT", beforeSnapshot, getPlanSnapshot(current.planId()));

        return getStudyPlan(userId);
    }

    // =========================================================================
    // PRIVATE HELPER & HEURISTIC ENGINE METHODS
    // =========================================================================

    private int calculateNewWordsPerDay(int scoreGap, int daysRemaining, int dailyMinutes, double difficultyMultiplier) {
        if (scoreGap <= 0) {
            // Học duy trì
            return dailyMinutes <= 15 ? 5 : (dailyMinutes <= 30 ? 8 : 12);
        }

        // Tốc độ cần tăng điểm mỗi ngày: delta / days
        double pointsPerDay = (double) scoreGap / Math.max(14, daysRemaining);
        
        // Trung bình cần khoảng 5-6 từ vựng mới được ghi nhớ để đóng góp ~1 điểm TOEIC
        double rawWordsNeeded = pointsPerDay * 5.5 * difficultyMultiplier;

        // Giới hạn theo thời gian học mỗi ngày
        int maxCapacity = switch (dailyMinutes) {
            case 15 -> 8;
            case 30 -> 15;
            case 45 -> 22;
            case 60 -> 30;
            default -> 40;
        };

        return (int) Math.round(Math.max(5, Math.min(maxCapacity, rawWordsNeeded)));
    }

    private int calculateGrammarPerDay(List<String> interests, int dailyMinutes, int baselineScore) {
        if (!interests.contains("GRAMMAR") && dailyMinutes <= 30) {
            return 3;
        }
        if (baselineScore < 500) {
            return dailyMinutes >= 45 ? 10 : 6; // Nền tảng yếu cần tập trung ngữ pháp
        }
        return dailyMinutes >= 45 ? 8 : 5;
    }

    private String generateExplanation(
            int baselineScore,
            String baselineSource,
            int targetScore,
            int daysRemaining,
            int dailyMinutes,
            int weeklyDays,
            int newWords,
            int reviewWords,
            int mockTests,
            List<String> interests) {

        int gap = targetScore - baselineScore;
        String sourceLabel = "MOCK_TEST".equals(baselineSource)
                ? "điểm thi thử gần nhất"
                : ("SELF_REPORTED".equals(baselineSource) ? "điểm bạn tự khai báo" : "đánh giá trình độ ban đầu");

        StringBuilder sb = new StringBuilder();
        if (gap > 0) {
            sb.append(String.format("Dựa trên %s (%d điểm) và mục tiêu %d điểm trong %d ngày tới (+%d điểm), ",
                    sourceLabel, baselineScore, targetScore, daysRemaining, gap));
        } else {
            sb.append(String.format("Bạn đã đạt band điểm mục tiêu (%d / %d điểm). Kế hoạch này được thiết kế để duy trì phản xạ và tối ưu hóa thời gian học %d ngày tới, ",
                    baselineScore, targetScore, daysRemaining));
        }

        sb.append(String.format("với lịch học %d ngày/tuần (%d phút/ngày). ", weeklyDays, dailyMinutes));
        sb.append(String.format("Hệ thống đề xuất nạp %d từ mới và ôn tập %d từ mỗi ngày theo chu kỳ lặp lại ngắt quãng (SRS). ", newWords, reviewWords));

        if (mockTests > 1) {
            sb.append(String.format("Do đang trong giai đoạn nước rút (%d ngày còn lại), bạn nên luyện %d đề thi thử mỗi tuần để làm quen áp lực thời gian.", daysRemaining, mockTests));
        } else {
            sb.append("Mỗi tuần bạn nên hoàn thành 1 bài thi thử để kiểm tra sự tiến bộ.");
        }

        return sb.toString();
    }

    private BaselineInfo determineBaseline(UUID userId, ProfileData profile) {
        // 1. Kiểm tra xem học viên có bài thi thử nào gần nhất trong hệ thống không
        try {
            Integer latestMockScore = jdbc.queryForObject("""
                    SELECT score FROM user_mock_test_attempts
                    WHERE user_id = ?
                    ORDER BY completed_at DESC
                    LIMIT 1
                    """, Integer.class, userId);

            if (latestMockScore != null && latestMockScore > 0) {
                return new BaselineInfo(latestMockScore, "MOCK_TEST");
            }
        } catch (EmptyResultDataAccessException ignored) {}

        // 2. Nếu có recentScore từ onboarding
        if (profile.recentScore() != null && profile.recentScore() > 0) {
            return new BaselineInfo(profile.recentScore(), "SELF_REPORTED");
        }

        // 3. Ước lượng dựa trên current_level tự đánh giá
        int estimatedScore = switch (profile.currentLevel() != null ? profile.currentLevel() : "BEGINNER") {
            case "ADVANCED" -> 750;
            case "INTERMEDIATE" -> 500;
            default -> 350;
        };

        return new BaselineInfo(estimatedScore, "SYSTEM_ESTIMATED");
    }

    private void generateWeeklyMilestones(UUID planId, int daysRemaining, int newWordsPerDay, int grammarPerDay, int mockTests) {
        int totalWeeks = Math.max(1, (int) Math.ceil((double) daysRemaining / 7));
        int weeksToGenerate = Math.min(12, totalWeeks); // Giới hạn trước 12 tuần

        jdbc.update("DELETE FROM study_plan_weekly_targets WHERE plan_id = ?", planId);

        String insertSql = """
                INSERT INTO study_plan_weekly_targets
                    (plan_id, week_number, focus_skill, target_items, completed_items, notes)
                VALUES (?, ?, ?, ?, 0, ?)
                """;

        for (int w = 1; w <= weeksToGenerate; w++) {
            // Tuần cuối cùng dồn sức vào luyện đề
            boolean isFinalPhase = (w >= weeksToGenerate - 1 && weeksToGenerate > 2);

            int weeklyVocab = isFinalPhase ? (int) (newWordsPerDay * 5 * 0.7) : (newWordsPerDay * 5);
            int weeklyGrammar = isFinalPhase ? 15 : (grammarPerDay * 5);
            int weeklyMock = isFinalPhase ? Math.max(2, mockTests) : mockTests;

            jdbc.update(insertSql, planId, w, "VOCABULARY", weeklyVocab, "Mục tiêu từ vựng tuần " + w);
            jdbc.update(insertSql, planId, w, "GRAMMAR", weeklyGrammar, "Chủ điểm ngữ pháp tuần " + w);
            jdbc.update(insertSql, planId, w, "MOCK_TEST", weeklyMock, "Đề thi thử tuần " + w);
        }
    }

    private void syncVocabularyGoalForToday(UUID userId, int newWordsGoal, int reviewGoal) {
        jdbc.update("""
                INSERT INTO vocabulary_daily_goals (
                    user_id, goal_date, new_words_goal, review_goal,
                    completed_new_words, completed_review, created_at, updated_at
                )
                VALUES (?, (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, ?, ?, 0, 0, now(), now())
                ON CONFLICT (user_id, goal_date) DO UPDATE SET
                    new_words_goal = EXCLUDED.new_words_goal,
                    review_goal = EXCLUDED.review_goal,
                    updated_at = now()
                """, userId, newWordsGoal, reviewGoal);
    }

    private void recordAdjustment(UUID planId, String reason, String beforeJson, String afterJson) {
        try {
            jdbc.update("""
                    INSERT INTO study_plan_adjustments (plan_id, reason, before_json, after_json, created_at)
                    VALUES (?, ?, ?::jsonb, ?::jsonb, now())
                    """, planId, reason, beforeJson, afterJson);
        } catch (Exception e) {
            log.warn("Không thể lưu lịch sử điều chỉnh kế hoạch: {}", e.getMessage());
        }
    }

    private String getPlanSnapshot(UUID planId) {
        try {
            return jdbc.queryForObject(
                    "SELECT to_jsonb(sp) FROM study_plans sp WHERE id = ?",
                    String.class, planId);
        } catch (Exception e) {
            return null;
        }
    }

    private List<WeeklyTarget> getWeeklyTargets(UUID planId) {
        return jdbc.query("""
                SELECT week_number, focus_skill, target_items, completed_items, notes
                FROM study_plan_weekly_targets
                WHERE plan_id = ?
                ORDER BY week_number ASC, focus_skill ASC
                """, (rs, rowNum) -> new WeeklyTarget(
                rs.getInt("week_number"),
                rs.getString("focus_skill"),
                rs.getInt("target_items"),
                rs.getInt("completed_items"),
                rs.getString("notes")
        ), planId);
    }

    private boolean hasOnboardingProfile(UUID userId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM learning_profiles WHERE user_id = ?)",
                Boolean.class, userId));
    }

    private ProfileData getProfileData(UUID userId) {
        List<ProfileData> list = jdbc.query("""
                SELECT id, target_score, exam_date, current_level, recent_score, daily_study_minutes
                FROM learning_profiles
                WHERE user_id = ?
                """, (rs, rowNum) -> {
            UUID profileId = rs.getObject("id", UUID.class);
            Date examDate = rs.getDate("exam_date");

            List<Integer> studyDays = jdbc.query(
                    "SELECT day_of_week FROM learning_profile_study_days WHERE learning_profile_id = ? ORDER BY day_of_week",
                    (r, i) -> r.getInt("day_of_week"), profileId);

            List<String> interests = jdbc.query(
                    "SELECT interest FROM learning_profile_interests WHERE learning_profile_id = ? ORDER BY interest",
                    (r, i) -> r.getString("interest"), profileId);

            return new ProfileData(
                    profileId,
                    (Integer) rs.getObject("target_score"),
                    examDate != null ? examDate.toLocalDate() : null,
                    rs.getString("current_level"),
                    (Integer) rs.getObject("recent_score"),
                    (Integer) rs.getObject("daily_study_minutes"),
                    studyDays,
                    interests
            );
        }, userId);

        return list.isEmpty() ? null : list.getFirst();
    }

    // =========================================================================
    // RECORDS & DTOS
    // =========================================================================

    public record StudyPlanResponse(
            UUID planId,
            int targetScore,
            Integer baselineScore,
            String baselineSource,
            LocalDate examDate,
            Integer daysRemaining,
            int dailyStudyMinutes,
            int weeklyStudyDays,
            int recommendedNewWords,
            int recommendedReview,
            int recommendedGrammar,
            int recommendedListeningMinutes,
            int recommendedReadingMinutes,
            int recommendedMockTestsPerWeek,
            List<String> focusAreas,
            String planExplanation,
            boolean active,
            String createdAt,
            String updatedAt,
            List<WeeklyTarget> weeklyTargets
    ) {}

    public record WeeklyTarget(
            int weekNumber,
            String focusSkill,
            int targetItems,
            int completedItems,
            String notes
    ) {}

    public record StudyPlanSummary(
            int targetScore,
            Integer baselineScore,
            Integer daysRemaining,
            int recommendedNewWords,
            int recommendedReview,
            int recommendedGrammar,
            int recommendedMockTestsPerWeek,
            String planExplanation,
            List<String> focusAreas,
            int progressPercent,
            String baselineSource
    ) {
        public static StudyPlanSummary empty() {
            return new StudyPlanSummary(0, null, null, 10, 20, 5, 1, null, Collections.emptyList(), 0, null);
        }
    }

    public record UpdateStudyPlanRequest(
            Integer newWordsPerDay,
            Integer reviewPerDay,
            Integer grammarPerDay,
            Integer listeningMinutes,
            Integer readingMinutes,
            Integer mockTestsPerWeek
    ) {}

    private record ProfileData(
            UUID profileId,
            Integer targetScore,
            LocalDate examDate,
            String currentLevel,
            Integer recentScore,
            Integer dailyStudyMinutes,
            List<Integer> studyDays,
            List<String> interests
    ) {}

    private record BaselineInfo(int score, String source) {}
}
