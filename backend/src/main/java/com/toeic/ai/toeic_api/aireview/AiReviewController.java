package com.toeic.ai.toeic_api.aireview;

import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/admin/ai-review")
public class AiReviewController {
    private final AiReviewService aiReviewService;
    private final UserAccountService userAccountService;

    public AiReviewController(AiReviewService aiReviewService, UserAccountService userAccountService) {
        this.aiReviewService = aiReviewService;
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public AiReviewService.Queue getQueue(
            @RequestParam(defaultValue = "PENDING") AiReviewStatus status,
            @RequestParam(defaultValue = "50") int limit) {
        return aiReviewService.getQueue(status, limit);
    }

    @PostMapping("/{contentId}/approve")
    public AiReviewService.ReviewItem approve(@PathVariable UUID contentId, Authentication authentication,
            HttpServletRequest servletRequest) {
        return review(contentId, authentication, servletRequest, AiReviewDecision.APPROVE);
    }

    @PostMapping("/{contentId}/reject")
    public AiReviewService.ReviewItem reject(@PathVariable UUID contentId, Authentication authentication,
            HttpServletRequest servletRequest) {
        return review(contentId, authentication, servletRequest, AiReviewDecision.REJECT);
    }

    private AiReviewService.ReviewItem review(UUID contentId, Authentication authentication,
            HttpServletRequest servletRequest, AiReviewDecision decision) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        return aiReviewService.review(contentId, admin.id(), decision, servletRequest.getRemoteAddr());
    }
}
