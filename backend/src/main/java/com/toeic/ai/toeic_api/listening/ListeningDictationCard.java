package com.toeic.ai.toeic_api.listening;

import java.time.Instant;
import java.util.List;

public record ListeningDictationCard(
        String id,
        int testNumber,
        String part,
        String year,
        int totalQuestions,
        int completedQuestions,
        String status,
        int progressPercent,
        List<ListeningDictationQuestion> questions,
        Instant createdAt,
        Instant updatedAt
) {}
