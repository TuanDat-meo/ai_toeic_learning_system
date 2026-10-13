package com.toeic.ai.toeic_api.billing;

import java.util.List;
import java.time.Instant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PlanRequest(@NotBlank @Size(max=80) @Pattern(regexp="[A-Za-z0-9_-]+") String code,
        @NotBlank @Size(max=160) String name, @Min(0) long originalPrice, @Min(0) long promotionalPrice,
        @NotBlank @Pattern(regexp="MONTHLY|QUARTERLY|YEARLY|LIFETIME") String billingCycle,
        @Min(0) int durationDays, @Size(max=100) String badgeTag, boolean isPopular,
        @NotNull @Size(max=30) List<@NotBlank @Size(max=300) String> features,
        @Min(0) int maxAiQueriesPerDay,
        @NotBlank @Pattern(regexp="ACTIVE|DRAFT|ARCHIVED") String status,
        @NotBlank @Pattern(regexp="FREE|PRO|PREMIUM|PROMOTION") String planCategory,
        @NotNull @Size(max=30) List<@NotBlank @Size(max=40) String> capabilityKeys,
        Instant offerStartsAt, Instant offerEndsAt) { }
