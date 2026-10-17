package com.toeic.ai.toeic_api.grammar;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record GrammarTopic(
    String id,
    String code,
    String title,
    String englishTitle,
    String part,
    String targetScore,
    String status,
    String summary,
    String formula,
    List<String> signalWords,
    List<String> traps,
    List<Map<String, Object>> examples,
    List<Map<String, Object>> questions,
    int completedQuestions,
    int totalQuestions,
    String userStatus,
    Instant createdAt,
    Instant updatedAt
) {}
