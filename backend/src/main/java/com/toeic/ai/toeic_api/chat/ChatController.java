package com.toeic.ai.toeic_api.chat;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    public ChatController(ChatService chat, UserAccountService users, GeminiChatService gemini) {
        this.chat = chat;
        this.users = users;
        this.gemini = gemini;
    }

    @PostMapping("/api/chat/ai")
    public AiChatResponse askAi(@Valid @RequestBody AiChatRequest request, Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        if (!"STUDENT".equals(user.role())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ học viên mới có thể sử dụng gia sư AI.");
        }
        return gemini.reply(request.messages());
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
        return chat.supportMessages(threadId, user.id(), "ADMIN".equals(user.role()));
    }

    @PostMapping("/api/chat/support/{threadId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessage sendSupport(@PathVariable UUID threadId, @Valid @RequestBody SendChatMessageRequest request, Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        return chat.sendSupport(threadId, user.id(), "ADMIN".equals(user.role()), request.content(), request.replyToId());
    }

    @GetMapping("/api/admin/chat/support")
    public List<ChatThread> threads() { return chat.threads(); }
}
