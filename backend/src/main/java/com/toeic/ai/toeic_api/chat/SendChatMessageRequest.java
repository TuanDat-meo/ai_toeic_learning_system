package com.toeic.ai.toeic_api.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record SendChatMessageRequest(@NotBlank @Size(max = 2000) String content, UUID replyToId) { }
