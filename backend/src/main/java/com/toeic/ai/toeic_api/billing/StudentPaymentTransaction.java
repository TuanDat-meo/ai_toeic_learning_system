package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.UUID;

public record StudentPaymentTransaction(
        UUID id,
        String transactionCode,
        String orderCode,
        String planName,
        long amount,
        String paymentMethod,
        String status,
        Instant paidAt,
        Instant createdAt) { }
