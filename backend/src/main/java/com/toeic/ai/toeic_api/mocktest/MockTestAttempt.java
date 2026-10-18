package com.toeic.ai.toeic_api.mocktest;

import java.time.Instant;
import java.util.UUID;

public record MockTestAttempt(
        UUID id,
        int testId,
        int score,
        int listeningScore,
        int readingScore,
        int correctCount,
        int totalCount,
        int durationSeconds,
        Instant completedAt
) {}
