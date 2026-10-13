package com.toeic.ai.toeic_api.announcement;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class AnnouncementController {
    private final AnnouncementService announcements;
    private final UserAccountService users;

    public AnnouncementController(AnnouncementService announcements, UserAccountService users) {
        this.announcements = announcements;
        this.users = users;
    }

    @GetMapping("/api/admin/announcements")
    public List<Announcement> adminList() { return announcements.listForAdmin(); }

    @PostMapping("/api/admin/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public Announcement create(@Valid @RequestBody AnnouncementRequest request, Authentication auth) {
        return announcements.create(request, users.findManagedUser(auth.getName()).id());
    }

    @PutMapping("/api/admin/announcements/{id}")
    public Announcement update(@PathVariable UUID id, @Valid @RequestBody AnnouncementRequest request) {
        return announcements.update(id, request);
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { announcements.delete(id); }

    @GetMapping("/api/announcements")
    public List<Announcement> studentList(Authentication auth) {
        return announcements.listForStudent(users.findManagedUser(auth.getName()).id());
    }

    @PatchMapping("/api/announcements/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID id, Authentication auth) {
        announcements.markRead(id, users.findManagedUser(auth.getName()).id());
    }
}
