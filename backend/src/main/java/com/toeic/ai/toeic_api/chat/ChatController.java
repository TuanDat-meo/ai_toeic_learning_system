package com.toeic.ai.toeic_api.chat;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class ChatController {
    private final ChatService chat;
    private final UserAccountService users;
    private final GeminiChatService gemini;
    private final JdbcTemplate jdbc;
    private final String geminiModel;

    public ChatController(
            ChatService chat,
            UserAccountService users,
            GeminiChatService gemini,
            JdbcTemplate jdbc,
            @Value("${gemini.model:gemini-2.5-flash}") String geminiModel) {
        this.chat = chat;
        this.users = users;
        this.gemini = gemini;
        this.jdbc = jdbc;
        this.geminiModel = geminiModel;
    }

    @PostMapping("/api/chat/ai")
    public AiChatResponse askAi(@Valid @RequestBody AiChatRequest request, Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        String lastPrompt = request.messages().stream()
                .filter(turn -> "user".equals(turn.role()))
                .reduce((first, second) -> second)
                .map(AiChatTurn::content)
                .orElse("(empty)");
        try {
            AiChatResponse response = gemini.reply(request.messages());
            logAiInteraction(user.id(), lastPrompt, response.reply(), "SUCCESS");
            return response;
        } catch (RuntimeException exception) {
            logAiInteraction(user.id(), lastPrompt, exception.getMessage(), "FAILED");
            throw exception;
        }
    }

    private void logAiInteraction(UUID userId, String prompt, String response, String status) {
        try {
            jdbc.update("""
                    INSERT INTO ai_interactions (user_id, type, prompt, response, model, status, completed_at)
                    VALUES (?, 'EXPLAIN_ANSWER', ?, ?, ?, ?, now())
                    """, userId, prompt, response, geminiModel, status);
        } catch (Exception ignored) {
            // Never block student AI chat if telemetry logging fails
        }
    }

    @GetMapping("/api/chat/discussion")
    public Map<String,Object> discussion() { return Map.of("onlineCount", chat.onlineCount(), "messages", chat.discussionMessages()); }

    @PostMapping("/api/chat/presence")
    public Map<String,Integer> heartbeat(Authentication auth) {
        chat.heartbeat(users.findManagedUser(auth.getName()).id());
        return Map.of("onlineCount", chat.onlineCount());
    }

    @PostMapping("/api/chat/discussion")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessage sendDiscussion(@Valid @RequestBody SendChatMessageRequest request, Authentication auth) {
        return chat.sendDiscussion(users.findManagedUser(auth.getName()).id(), request.content(), request.replyToId());
    }

    @PostMapping("/api/chat/support/thread")
    public Map<String,UUID> supportThread(Authentication auth) {
        return Map.of("threadId", chat.getOrCreateThread(users.findManagedUser(auth.getName()).id()));
    }

    @GetMapping("/api/chat/support/{threadId}/messages")
    public List<ChatMessage> supportMessages(@PathVariable UUID threadId, Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        return chat.supportMessages(threadId, user.id(), isSupportAgent(user.role()));
    }

    @PostMapping("/api/chat/support/{threadId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessage sendSupport(@PathVariable UUID threadId, @Valid @RequestBody SendChatMessageRequest request, Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        return chat.sendSupport(threadId, user.id(), isSupportAgent(user.role()), request.content(), request.replyToId());
    }

    @GetMapping("/api/admin/chat/support")
    public List<ChatThread> threads() { return chat.threads(); }

    private boolean isSupportAgent(String role) {
        return "ADMIN".equals(role) || "TEACHER".equals(role);
    }
}
