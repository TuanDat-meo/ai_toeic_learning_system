package com.toeic.ai.toeic_api.vocabulary;

import java.util.List;

public record VocabularyTestSet(
    String id,
    String title,
    String year,
    String category,
    int wordCount,
    List<VocabularyWord> words
) {}
