package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.UUID;

public record StudentSubscription(
        UUID id,
        UUID planId,
        String planName,
        Instant startDate,
        Instant endDate,
        boolean autoRenew,
        String status,
        String paymentMethod) { }
