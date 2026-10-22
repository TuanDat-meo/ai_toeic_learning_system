package com.toeic.ai.toeic_api.mocktest;

import java.time.Instant;
import java.util.UUID;

public record MockTestSubmissionDto(
        UUID id,
        int testId,
        String testTitle,
        String volId,
        UUID userId,
        String studentName,
        String studentEmail,
        int score,
        int listeningScore,
        int readingScore,
        int correctCount,
        int totalCount,
        int durationSeconds,
        Instant completedAt,
        String status
) {}
