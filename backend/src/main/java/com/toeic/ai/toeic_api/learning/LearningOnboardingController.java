package com.toeic.ai.toeic_api.learning;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.user.ManagedUser;
import com.toeic.ai.toeic_api.user.UserAccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/learning-profile/onboarding")
public class LearningOnboardingController {
    private final LearningOnboardingService onboardingService;
    private final UserAccountService userAccountService;

    public LearningOnboardingController(
            LearningOnboardingService onboardingService,
            UserAccountService userAccountService) {
        this.onboardingService = onboardingService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/status")
    OnboardingStatus status(Authentication authentication) {
        return new OnboardingStatus(onboardingService.getOnboardingState(currentStudent(authentication)));
    }

    @org.springframework.web.bind.annotation.PutMapping("/draft")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void saveDraft(@Valid @RequestBody LearningOnboardingDraftRequest request, Authentication authentication) {
        onboardingService.saveDraft(currentStudent(authentication), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void complete(@Valid @RequestBody LearningOnboardingRequest request, Authentication authentication) {
        onboardingService.completeOnboarding(currentStudent(authentication), request);
    }

    private UUID currentStudent(Authentication authentication) {
        ManagedUser user = userAccountService.findManagedUser(authentication.getName());
        if (!"STUDENT".equals(user.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ học viên mới có thể thiết lập mục tiêu học tập.");
        }
        return user.id();
    }

    record OnboardingStatus(LearningOnboardingService.LearningOnboardingState state) {
    }
}
