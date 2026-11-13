package com.toeic.ai.toeic_api.mocktest;

import java.util.List;
import java.util.Map;

public record MockTestUpsertRequest(
        String volId,
        String title,
        String difficulty,
        String description,
        Integer durationMinutes,
        String status,
        List<Map<String, Object>> keyVocab
) {}
