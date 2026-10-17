package com.toeic.ai.toeic_api.billing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SePayWebhookRequest(
        Long id,
        String transferType,
        Long transferAmount,
        String content,
        String code) { }
