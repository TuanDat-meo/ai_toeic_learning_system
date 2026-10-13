package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.UUID;

public record PaymentTransaction(
        UUID id,
        String transactionCode,
        String orderCode,
        String userId,
        String userName,
        String userEmail,
        String planId,
        String planName,
        long amount,
        String paymentMethod,
        String status,
        Instant paidAt,
        String note,
        Instant createdAt) { }
