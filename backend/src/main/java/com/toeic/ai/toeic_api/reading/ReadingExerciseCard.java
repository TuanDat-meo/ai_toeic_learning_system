package com.toeic.ai.toeic_api.reading;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ReadingExerciseCard(
    String id,
    String title,
    String category,
    String subCategory,
    String subtitle,
    String tag,
    int totalQuestions,
    int studiedQuestions,
    int correctAnswers,
    int wrongAnswers,
    boolean bookmarked,
    String passageText,
    String passageTextVi,
    List<Map<String, Object>> passages,
    Map<String, Object> theory,
    List<Map<String, Object>> sampleQuestions,
    Instant createdAt,
    Instant updatedAt
) {}
