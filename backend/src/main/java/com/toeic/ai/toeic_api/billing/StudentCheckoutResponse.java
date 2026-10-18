package com.toeic.ai.toeic_api.billing;

import java.time.Instant;

public record StudentCheckoutResponse(
        String transactionId,
        String orderCode,
        String planName,
        long amount,
        String status,
        String bankCode,
        String accountNumber,
        String accountName,
        String paymentContent,
        String qrImageUrl,
        Instant expiresAt) { }
