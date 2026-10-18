package com.toeic.ai.toeic_api.billing;

import java.util.List;

public record FeatureConfigField(String key, String label, String type, boolean required, List<String> options) { }
