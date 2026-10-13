package com.toeic.ai.toeic_api.learning;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record LearningOnboardingDraftRequest(
        Integer targetScore,
        @FutureOrPresent LocalDate examDate,
        @Pattern(regexp = "CAREER|STUDY|TRAVEL|PERSONAL") String learningReason,
        @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED") String currentLevel,
        @Min(0) @Max(990) Integer recentScore,
        @Min(15) @Max(90) Integer dailyStudyMinutes,
        @NotNull List<@NotNull @Min(1) @Max(7) Integer> studyDays,
        @NotNull List<@Pattern(regexp = "LISTENING|READING|VOCABULARY|GRAMMAR|MOCK_TESTS") String> interests,
        @NotNull @Min(0) @Max(4) Integer currentStep) {

    @AssertTrue(message = "Điểm mục tiêu không hợp lệ.")
    public boolean isTargetScoreSupported() {
        return targetScore == null || List.of(450, 600, 750, 900).contains(targetScore);
    }

    @AssertTrue(message = "Thời lượng học mỗi ngày không hợp lệ.")
    public boolean isDailyStudyMinutesSupported() {
        return dailyStudyMinutes == null || List.of(15, 30, 45, 60, 90).contains(dailyStudyMinutes);
    }
}
