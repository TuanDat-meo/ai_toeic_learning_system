package com.toeic.ai.toeic_api.notification;

import java.time.Instant;
import java.util.UUID;

public record Notification(
        UUID id,
        UUID userId,
        String type,
        String title,
        String message,
        boolean isRead,
        String linkUrl,
        String referenceId,
        Instant createdAt
) {}
