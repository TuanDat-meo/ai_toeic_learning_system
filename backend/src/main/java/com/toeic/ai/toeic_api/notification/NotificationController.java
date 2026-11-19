package com.toeic.ai.toeic_api.notification;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class NotificationController {
    private final NotificationService notifications;
    private final UserAccountService users;

    public NotificationController(NotificationService notifications, UserAccountService users) {
        this.notifications = notifications;
        this.users = users;
    }

    @GetMapping("/api/notifications")
    public List<Notification> list(
            @RequestParam(defaultValue = "30") int limit,
            Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        return notifications.listForUser(userId, limit);
    }

    @GetMapping("/api/notifications/unread-count")
    public Map<String, Integer> unreadCount(Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        return Map.of("unreadCount", notifications.getUnreadCount(userId));
    }

    @PatchMapping("/api/notifications/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable UUID id, Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        notifications.markAsRead(id, userId);
    }

    @PatchMapping("/api/notifications/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        notifications.markAllAsRead(userId);
    }

    @DeleteMapping("/api/notifications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        notifications.delete(id, userId);
    }
}
