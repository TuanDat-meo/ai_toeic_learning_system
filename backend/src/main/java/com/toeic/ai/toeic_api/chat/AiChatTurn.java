package com.toeic.ai.toeic_api.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AiChatTurn(
        @NotBlank @Pattern(regexp = "user|model") String role,
        @NotBlank @Size(max = 2000) String content) { }
