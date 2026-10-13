package com.toeic.ai.toeic_api.billing;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record PaymentTransactionRequest(
        @NotBlank @Size(max = 120) String transactionCode,
        @NotBlank @Size(max = 120) String orderCode,
        @NotNull UUID userId,
        @NotNull UUID planId,
        @PositiveOrZero long amount,
        @NotBlank String paymentMethod,
        @NotBlank String status,
        Instant paidAt,
        @Size(max = 1000) String note) { }
