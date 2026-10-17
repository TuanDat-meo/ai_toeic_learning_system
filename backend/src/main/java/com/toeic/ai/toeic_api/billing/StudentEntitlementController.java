package com.toeic.ai.toeic_api.billing;

import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/billing/entitlements")
public class StudentEntitlementController {
    private final EntitlementService entitlements;
    private final UserAccountService users;

    public StudentEntitlementController(EntitlementService entitlements, UserAccountService users) {
        this.entitlements = entitlements;
        this.users = users;
    }

    @GetMapping("/usage")
    public java.util.List<EntitlementService.FeatureQuotaUsage> usage(Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        return entitlements.listUsage(userId);
    }

    @PostMapping("/use")
    public ConsumeLearningFeatureResponse consume(@Valid @RequestBody ConsumeLearningFeatureRequest request,
            Authentication authentication) {
        UUID userId = users.findManagedUser(authentication.getName()).id();
        long used = entitlements.consumeUse(userId, request.featureKey(), request.operationId());
        return new ConsumeLearningFeatureResponse(used);
    }

    public record ConsumeLearningFeatureResponse(long used) { }
}
