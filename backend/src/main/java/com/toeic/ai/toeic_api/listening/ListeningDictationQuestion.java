package com.toeic.ai.toeic_api.listening;

import java.util.List;
import java.util.Map;

public record ListeningDictationQuestion(
    Long id,
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
) {}
