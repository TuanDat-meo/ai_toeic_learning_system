package com.toeic.ai.toeic_api.listening;

public record SaveListeningProgressRequest(
    String cardId,
    int completedQuestions,
    int totalQuestions,
    int lastQuestionIndex,
    String status
) {}
