package com.toeic.ai.toeic_api.learning;

import java.sql.Date;
import java.sql.Types;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearningOnboardingService {
    private final JdbcTemplate jdbcTemplate;

    public LearningOnboardingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isOnboardingCompleted(UUID userId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM learning_profiles WHERE user_id = ? AND onboarding_completed = TRUE)",
                Boolean.class, userId));
    }

    public LearningOnboardingState getOnboardingState(UUID userId) {
        List<LearningOnboardingState> states = jdbcTemplate.query("""
                SELECT id, target_score, exam_date, learning_reason, current_level, recent_score,
                       daily_study_minutes, onboarding_step, onboarding_completed
                FROM learning_profiles
                WHERE user_id = ?
                """, (result, rowNum) -> new LearningOnboardingState(
                result.getObject("id", UUID.class),
                (Integer) result.getObject("target_score"),
                result.getDate("exam_date") == null ? null : result.getDate("exam_date").toLocalDate(),
                result.getString("learning_reason"),
                result.getString("current_level"),
                (Integer) result.getObject("recent_score"),
                (Integer) result.getObject("daily_study_minutes"),
                result.getInt("onboarding_step"),
                result.getBoolean("onboarding_completed"),
                List.of(),
                List.of()), userId);

        if (states.isEmpty()) {
            return LearningOnboardingState.empty();
        }
        LearningOnboardingState state = states.getFirst();
        return new LearningOnboardingState(
                state.profileId(),
                state.targetScore(),
                state.examDate(),
                state.learningReason(),
                state.currentLevel(),
                state.recentScore(),
                state.dailyStudyMinutes(),
                state.currentStep(),
                state.completed(),
                jdbcTemplate.query(
                        "SELECT day_of_week FROM learning_profile_study_days WHERE learning_profile_id = ? ORDER BY day_of_week",
                        (result, rowNum) -> result.getInt("day_of_week"), state.profileId()),
                jdbcTemplate.query(
                        "SELECT interest FROM learning_profile_interests WHERE learning_profile_id = ? ORDER BY interest",
                        (result, rowNum) -> result.getString("interest"), state.profileId()));
    }

    @Transactional
    public void saveDraft(UUID userId, LearningOnboardingDraftRequest request) {
        saveProfile(
                userId,
                request.targetScore(),
                request.examDate(),
                request.learningReason(),
                request.currentLevel(),
                request.recentScore(),
                request.dailyStudyMinutes(),
                request.studyDays(),
                request.interests(),
                request.currentStep(),
                false);
    }

    @Transactional
    public void completeOnboarding(UUID userId, LearningOnboardingRequest request) {
        saveProfile(
                userId,
                request.targetScore(),
                request.examDate(),
                request.learningReason(),
                request.currentLevel(),
                request.recentScore(),
                request.dailyStudyMinutes(),
                request.studyDays(),
                request.interests(),
                4,
                true);
    }

    private void saveProfile(
            UUID userId,
            Integer targetScore,
            java.time.LocalDate examDate,
            String learningReason,
            String currentLevel,
            Integer recentScore,
            Integer dailyStudyMinutes,
            List<Integer> requestedStudyDays,
            List<String> requestedInterests,
            int currentStep,
            boolean completed) {
        jdbcTemplate.update(connection -> {
            var statement = connection.prepareStatement("""
                    INSERT INTO learning_profiles
                        (user_id, current_level, target_score, exam_date, learning_reason, recent_score,
                         daily_study_minutes, onboarding_step, onboarding_completed, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
                    ON CONFLICT (user_id) DO UPDATE SET
                        current_level = EXCLUDED.current_level,
                        target_score = EXCLUDED.target_score,
                        exam_date = EXCLUDED.exam_date,
                        learning_reason = EXCLUDED.learning_reason,
                        recent_score = EXCLUDED.recent_score,
                        daily_study_minutes = EXCLUDED.daily_study_minutes,
                        onboarding_step = EXCLUDED.onboarding_step,
                        onboarding_completed = EXCLUDED.onboarding_completed,
                        updated_at = now()
                    """);
            statement.setObject(1, userId);
            statement.setString(2, currentLevel);
            if (targetScore == null) {
                statement.setNull(3, Types.INTEGER);
            } else {
                statement.setInt(3, targetScore);
            }
            if (examDate == null) {
                statement.setNull(4, Types.DATE);
            } else {
                statement.setDate(4, Date.valueOf(examDate));
            }
            statement.setString(5, learningReason);
            if (recentScore == null) {
                statement.setNull(6, Types.INTEGER);
            } else {
                statement.setInt(6, recentScore);
            }
            if (dailyStudyMinutes == null) {
                statement.setNull(7, Types.INTEGER);
            } else {
                statement.setInt(7, dailyStudyMinutes);
            }
            statement.setInt(8, currentStep);
            statement.setBoolean(9, completed);
            return statement;
        });

        UUID profileId = jdbcTemplate.queryForObject(
                "SELECT id FROM learning_profiles WHERE user_id = ?", UUID.class, userId);
        jdbcTemplate.update("DELETE FROM learning_profile_study_days WHERE learning_profile_id = ?", profileId);
        jdbcTemplate.update("DELETE FROM learning_profile_interests WHERE learning_profile_id = ?", profileId);

        List<Integer> studyDays = requestedStudyDays.stream().distinct().toList();
        if (!studyDays.isEmpty()) {
            jdbcTemplate.batchUpdate(
                    "INSERT INTO learning_profile_study_days (learning_profile_id, day_of_week) VALUES (?, ?)",
                    studyDays,
                    studyDays.size(),
                    (statement, day) -> {
                        statement.setObject(1, profileId);
                        statement.setInt(2, day);
                    });
        }

        List<String> interests = requestedInterests.stream().distinct().toList();
        if (!interests.isEmpty()) {
            jdbcTemplate.batchUpdate(
                    "INSERT INTO learning_profile_interests (learning_profile_id, interest) VALUES (?, ?)",
                    interests,
                    interests.size(),
                    (statement, interest) -> {
                        statement.setObject(1, profileId);
                        statement.setString(2, interest);
                    });
        }
    }

    public record LearningOnboardingState(
            UUID profileId,
            Integer targetScore,
            java.time.LocalDate examDate,
            String learningReason,
            String currentLevel,
            Integer recentScore,
            Integer dailyStudyMinutes,
            int currentStep,
            boolean completed,
            List<Integer> studyDays,
            List<String> interests) {

        static LearningOnboardingState empty() {
            return new LearningOnboardingState(null, null, null, null, null, null, null, 0, false, List.of(), List.of());
        }
    }
}
