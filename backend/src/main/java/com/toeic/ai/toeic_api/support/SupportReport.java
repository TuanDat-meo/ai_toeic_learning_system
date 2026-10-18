package com.toeic.ai.toeic_api.support;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record SupportReport(
        UUID id,
        String ticketCode,
        String reporterId,
        String userName,
        String userEmail,
        String category,
        String title,
        String description,
        String source,
        String questionRef,
        Map<String, Object> questionSnapshot,
        String relatedContent,
        String priority,
        String status,
        String adminReply,
        Map<String, Object> correction,
        Instant createdAt,
        Instant updatedAt,
        Instant repliedAt) { }
