package com.toeic.ai.toeic_api.questionbank;

import java.util.List;
import java.util.Map;

public record QuestionBankQuestion(
        String id,
        String code,
        String part,
        String questionText,
        String passage,
        String imageUrl,
        String audioUrl,
        List<QuestionBankOption> options,
        String correctAnswer,
        String skill,
        String difficulty,
        String explanation,
        String status,
        String createdAt,
        String bilingualPassage,
        String transcript,
        String translation,
        String questionTranslation,
        String trapNote,
        List<Map<String, Object>> vocabList
) {
}
