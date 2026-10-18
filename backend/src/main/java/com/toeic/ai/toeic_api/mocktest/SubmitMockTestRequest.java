package com.toeic.ai.toeic_api.mocktest;

public record SubmitMockTestRequest(
    int testId,
    int score,
    int listeningScore,
    int readingScore,
    int correctCount,
    int totalCount,
    int durationSeconds
) {}
