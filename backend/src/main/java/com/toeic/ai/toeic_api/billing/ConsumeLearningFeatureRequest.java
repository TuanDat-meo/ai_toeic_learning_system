package com.toeic.ai.toeic_api.billing;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConsumeLearningFeatureRequest(@NotBlank String featureKey, @NotNull UUID operationId) { }
