package com.toeic.ai.toeic_api.community;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record CommunityPost(UUID id, UUID authorId, String authorName, String title, String content,
        String postType, Map<String, Object> questionSnapshot, long commentCount,
        Instant createdAt, Instant updatedAt) { }
