package com.toeic.ai.toeic_api.billing;

import java.util.List;

public record LearningFeature(String key, String name, String category, String description, String lifecycleStatus,
        String controlType, List<String> allowedUnits, List<String> allowedPeriods, List<FeatureConfigField> configFields,
        String parentFeatureKey) { }
