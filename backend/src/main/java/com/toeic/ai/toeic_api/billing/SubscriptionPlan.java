package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SubscriptionPlan(UUID id, String code, String name, long originalPrice, long promotionalPrice,
        String billingCycle, int durationDays, String badgeTag, boolean isPopular, List<String> features,
        int maxAiQueriesPerDay, String status, long purchaseCount, Instant createdAt, Instant updatedAt,
        String planCategory, List<String> capabilityKeys, Instant offerStartsAt, Instant offerEndsAt) { }
