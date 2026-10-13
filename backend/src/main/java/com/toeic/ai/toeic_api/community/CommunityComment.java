package com.toeic.ai.toeic_api.community;

import java.time.Instant;
import java.util.UUID;

public record CommunityComment(UUID id, UUID postId, UUID authorId, String authorName,
        String content, Instant createdAt) { }
