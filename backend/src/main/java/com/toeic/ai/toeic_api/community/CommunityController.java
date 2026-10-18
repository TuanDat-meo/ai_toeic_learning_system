package com.toeic.ai.toeic_api.community;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.toeic.ai.toeic_api.billing.EntitlementService;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class CommunityController {
    private final CommunityService community;
    private final UserAccountService users;
    private final EntitlementService entitlements;

    public CommunityController(CommunityService community, UserAccountService users, EntitlementService entitlements) {
        this.community = community;
        this.users = users;
        this.entitlements = entitlements;
    }

    @GetMapping("/api/community/posts")
    public List<CommunityPost> list(Authentication auth) {
        assertStudentCanUseCommunity(auth);
        return community.list();
    }

    @GetMapping("/api/community/posts/{id}")
    public CommunityPost get(@PathVariable UUID id, Authentication auth) {
        assertStudentCanUseCommunity(auth);
        return community.find(id);
    }

    @PostMapping("/api/community/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityPost create(@Valid @RequestBody CreateCommunityPostRequest request, Authentication auth) {
        assertStudentCanUseCommunity(auth);
        return community.create(request, users.findManagedUser(auth.getName()).id());
    }

    @DeleteMapping("/api/community/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) {
        assertStudentCanUseCommunity(auth);
        var user = users.findManagedUser(auth.getName());
        community.delete(id, user.id(), "ADMIN".equals(user.role()) || "TEACHER".equals(user.role()));
    }

    @GetMapping("/api/community/posts/{id}/comments")
    public List<CommunityComment> comments(@PathVariable UUID id, Authentication auth) {
        assertStudentCanUseCommunity(auth);
        return community.comments(id);
    }

    @PostMapping("/api/community/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityComment comment(@PathVariable UUID id, @Valid @RequestBody CreateCommunityCommentRequest request,
            Authentication auth) {
        assertStudentCanUseCommunity(auth);
        return community.addComment(id, users.findManagedUser(auth.getName()).id(), request.content());
    }

    private void assertStudentCanUseCommunity(Authentication auth) {
        var user = users.findManagedUser(auth.getName());
        if ("STUDENT".equals(user.role())) entitlements.assertCanUse(user.id(), "COMMUNITY");
    }
}
