package com.toeic.ai.toeic_api.listening;

public record SaveListeningProgressRequest(
        String cardId,
        int completedQuestions,
        int totalQuestions,
        String status,
        int lastQuestionIndex
) {}
