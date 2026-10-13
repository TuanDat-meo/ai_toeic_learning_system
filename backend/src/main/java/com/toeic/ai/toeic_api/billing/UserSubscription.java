package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.UUID;

public record UserSubscription(UUID id, UUID userId, String userName, String userEmail, UUID planId,
        String planName, Instant startDate, Instant endDate, boolean autoRenew, String status, String paymentMethod) { }
