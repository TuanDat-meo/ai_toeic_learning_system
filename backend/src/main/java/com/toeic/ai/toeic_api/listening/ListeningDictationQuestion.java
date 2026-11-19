package com.toeic.ai.toeic_api.listening;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public record ListeningDictationQuestion(
        long id,
        String cardId,
        int questionIndex,
        String part,
        String question,
        String audioUrl,
        String imageUrl,
        String fullTranscript,
        String vietnameseTranslation,
        Map<String, String> options,
        Map<String, String> optionTranslations,
        String correctAnswer,
        String explanation,
        String trapNote,
        List<Map<String, Object>> vocabList,
        List<Map<String, Object>> segments
) {
    public ListeningDictationQuestion(
            long id,
            String cardId,
            int questionIndex,
            String part,
            String question,
            String audioUrl,
            String imageUrl,
            String fullTranscript,
            String vietnameseTranslation,
            Map<String, String> options,
            Map<String, String> optionTranslations,
            String correctAnswer,
            String explanation,
            String trapNote,
            List<Map<String, Object>> vocabList
    ) {
        this(id, cardId, questionIndex, part, question, audioUrl, imageUrl, fullTranscript,
                vietnameseTranslation, options, optionTranslations, correctAnswer,
                explanation, trapNote, vocabList, Collections.emptyList());
    }

    public ListeningDictationQuestion(
            long id,
            String cardId,
            int questionIndex,
            String part,
            String audioUrl,
            String imageUrl,
            String fullTranscript,
            String vietnameseTranslation,
            Map<String, String> options,
            Map<String, String> optionTranslations,
            String correctAnswer,
            String explanation,
            String trapNote,
            List<Map<String, Object>> vocabList
    ) {
        this(id, cardId, questionIndex, part, null, audioUrl, imageUrl, fullTranscript,
                vietnameseTranslation, options, optionTranslations, correctAnswer,
                explanation, trapNote, vocabList, Collections.emptyList());
    }
}
