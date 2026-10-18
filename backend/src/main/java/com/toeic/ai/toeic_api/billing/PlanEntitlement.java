package com.toeic.ai.toeic_api.billing;

import java.util.Map;

public record PlanEntitlement(boolean enabled, Long limit, String unit, String period, Map<String, Object> config) { }
