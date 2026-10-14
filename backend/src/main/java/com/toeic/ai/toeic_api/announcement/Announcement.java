package com.toeic.ai.toeic_api.announcement;

import java.time.Instant;
import java.util.UUID;

public record Announcement(
        UUID id,
        String title,
        String summary,
        String content,
        String type,
        String target,
        String status,
        boolean isPinned,
        String actionUrl,
        long readCount,
        boolean isRead,
        Instant createdAt,
        Instant updatedAt,
        String createdBy) { }
