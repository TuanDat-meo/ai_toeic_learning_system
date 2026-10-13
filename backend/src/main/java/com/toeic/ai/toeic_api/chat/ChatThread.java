package com.toeic.ai.toeic_api.chat;

import java.time.Instant;
import java.util.UUID;

public record ChatThread(UUID id, UUID userId, String userName, String userEmail,
        String status, String lastMessage, Instant updatedAt) { }
