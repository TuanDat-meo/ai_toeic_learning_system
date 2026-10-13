package com.toeic.ai.toeic_api.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommunityCommentRequest(@NotBlank @Size(min = 1, max = 3000) String content) { }
