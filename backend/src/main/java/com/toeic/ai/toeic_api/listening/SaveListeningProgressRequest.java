package com.toeic.ai.toeic_api.listening;

import java.util.List;
import java.util.Map;

public record SaveListeningProgressRequest(
        String cardId,
        int completedQuestions,
        int totalQuestions,
        Integer correctCount,
        Integer wrongCount,
        List<Object> answeredQuestionIds,
        List<Object> wrongQuestionIds,
        List<Object> flaggedQuestionIds,
        Map<String, String> userNotes,
        Map<String, String> selfAssessments,
        String status,
        int lastQuestionIndex
) {
    public SaveListeningProgressRequest(
            String cardId,
            int completedQuestions,
            int totalQuestions,
            String status,
            int lastQuestionIndex
    ) {
        this(cardId, completedQuestions, totalQuestions, null, null, null, null, null, null, null, status, lastQuestionIndex);
    }
}
