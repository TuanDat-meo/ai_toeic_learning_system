package com.toeic.ai.toeic_api.vocabulary;

public record VocabularyWord(
    String id,
    String setId,
    String word,
    String ipa,
    String partOfSpeech,
    String meaning,
    String example,
    String exampleMeaning,
    String level,
    boolean starred,
    String status
) {}
