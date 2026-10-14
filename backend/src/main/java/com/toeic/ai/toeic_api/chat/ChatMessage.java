package com.toeic.ai.toeic_api.chat;

import java.time.Instant;
import java.util.UUID;

public record ChatMessage(UUID id, UUID threadId, UUID senderId, String senderName,
        String senderRole, String content, UUID replyToId, String replyToSenderName,
        String replyToContent, Instant createdAt) { }
