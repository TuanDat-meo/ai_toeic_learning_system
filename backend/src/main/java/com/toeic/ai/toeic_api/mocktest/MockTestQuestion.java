package com.toeic.ai.toeic_api.mocktest;

import java.util.List;
import java.util.Map;

public record MockTestQuestion(
    Long id,
    int testId,
    int questionNum,
    String part,
    String questionText,
    String passage,
    String bilingualPassage,
    String audioUrl,
    String imageUrl,
    Map<String, String> options,
    String correctAnswer,
    String explanation,
    String transcript,
    String translation,
    List<Map<String, Object>> vocabList
) {}
