package com.toeic.ai.toeic_api.listening;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public record ListeningDictationCard(
        String id,
        String title,
        int testNumber,
        String part,
        String year,
        int totalQuestions,
        int completedQuestions,
        int correctCount,
        int wrongCount,
        String status,
        int progressPercent,
        List<ListeningDictationQuestion> questions,
        String contentStatus,
        List<Object> answeredQuestionIds,
        List<Object> wrongQuestionIds,
        List<Object> flaggedQuestionIds,
        Map<String, String> userNotes,
        Map<String, String> selfAssessments,
        int lastQuestionIndex,
        Instant createdAt,
        Instant updatedAt
) {
    public ListeningDictationCard(
            String id,
            String title,
            int testNumber,
            String part,
            String year,
            int totalQuestions,
            int completedQuestions,
            String status,
            int progressPercent,
            List<ListeningDictationQuestion> questions,
            String contentStatus,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(id, title, testNumber, part, year, totalQuestions, completedQuestions, 0, 0, status,
                progressPercent, questions, contentStatus, Collections.emptyList(), Collections.emptyList(),
                Collections.emptyList(), Collections.emptyMap(), Collections.emptyMap(), 0, createdAt, updatedAt);
    }

    public ListeningDictationCard(
            String id,
            String title,
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
    ) {
        this(id, title, testNumber, part, year, totalQuestions, completedQuestions, status, progressPercent,
                questions, "PUBLISHED", createdAt, updatedAt);
    }
}
