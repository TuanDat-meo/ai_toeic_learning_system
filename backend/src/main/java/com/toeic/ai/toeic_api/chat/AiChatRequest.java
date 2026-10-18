package com.toeic.ai.toeic_api.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AiChatRequest(@NotEmpty @Size(max = 12) List<@Valid AiChatTurn> messages) { }
