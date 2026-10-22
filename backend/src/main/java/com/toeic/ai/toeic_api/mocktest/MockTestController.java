package com.toeic.ai.toeic_api.mocktest;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class MockTestController {

    private final MockTestService mockTestService;
    private final UserAccountService userAccountService;

    public MockTestController(MockTestService mockTestService, UserAccountService userAccountService) {
        this.mockTestService = mockTestService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/api/mock-tests")
    public List<MockTestItem> listTests(@RequestParam(required = false) String volId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return mockTestService.listTests(volId, userId);
    }

    @GetMapping("/api/mock-tests/{testId}/questions")
    public List<MockTestQuestion> getQuestions(@PathVariable int testId) {
        return mockTestService.getTestQuestions(testId);
    }

    @PostMapping("/api/mock-tests/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public MockTestAttempt submitAttempt(@RequestBody SubmitMockTestRequest request, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return mockTestService.submitAttempt(userId, request);
    }

    @GetMapping("/api/admin/mock-tests/submissions")
    public List<MockTestSubmissionDto> listSubmissions(@RequestParam(required = false) Integer testId) {
        return mockTestService.listAllSubmissions(testId);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        try {
            return userAccountService.findManagedUser(authentication.getName()).id();
        } catch (Exception e) {
            return null;
        }
    }
}
