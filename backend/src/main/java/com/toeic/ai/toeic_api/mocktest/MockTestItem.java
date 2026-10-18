package com.toeic.ai.toeic_api.mocktest;

import java.util.List;
import java.util.Map;

public record MockTestItem(
        int id,
        String volId,
        String title,
        String difficulty,
        Integer score,
        Integer listeningScore,
        Integer readingScore,
        String status,
        String completedAt,
        List<Map<String, Object>> keyVocab,
        List<MockTestAttempt> historyAttempts
) {}
