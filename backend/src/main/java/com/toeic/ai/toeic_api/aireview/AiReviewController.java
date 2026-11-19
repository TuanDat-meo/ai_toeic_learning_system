package com.toeic.ai.toeic_api.aireview;

import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/admin/ai-review")
public class AiReviewController {
    private final AiReviewService aiReviewService;
    private final AiContentGenerationService aiContentGenerationService;
    private final UserAccountService userAccountService;

    public AiReviewController(
            AiReviewService aiReviewService,
            AiContentGenerationService aiContentGenerationService,
            UserAccountService userAccountService) {
        this.aiReviewService = aiReviewService;
        this.aiContentGenerationService = aiContentGenerationService;
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public AiReviewService.Queue getQueue(
            @RequestParam(defaultValue = "PENDING") AiReviewStatus status,
            @RequestParam(defaultValue = "50") int limit) {
        return aiReviewService.getQueue(status, limit);
    }

    @GetMapping("/audit")
    public AiReviewService.AuditOverview getAuditOverview(
            @RequestParam(defaultValue = "30") int limit) {
        return aiReviewService.getAuditOverview(limit);
    }

    @PostMapping("/generate")
    public AiContentGenerationService.GenerateResult generate(
            @RequestBody AiContentGenerationService.GenerateRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        return aiContentGenerationService.generate(request, admin.id(), servletRequest.getRemoteAddr());
    }

    @PutMapping("/{contentId}")
    public AiReviewService.ReviewItem updatePayload(
            @PathVariable UUID contentId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        return aiReviewService.updatePayload(contentId, payload, admin.id(), servletRequest.getRemoteAddr());
    }

    @PostMapping("/{contentId}/approve")
    public AiReviewService.ReviewItem approve(@PathVariable UUID contentId, Authentication authentication,
            HttpServletRequest servletRequest) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        return aiReviewService.review(contentId, admin.id(), AiReviewDecision.APPROVE, servletRequest.getRemoteAddr());
    }

    @PostMapping("/{contentId}/reject")
    public AiReviewService.ReviewItem reject(
            @PathVariable UUID contentId,
            @RequestBody(required = false) RejectRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        String category = request == null ? null : request.category();
        String reason = request == null ? null : request.reason();
        return aiReviewService.review(
                contentId, admin.id(), AiReviewDecision.REJECT, category, reason, servletRequest.getRemoteAddr());
    }

    public record RejectRequest(String category, String reason) { }
}
