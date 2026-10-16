package com.toeic.ai.toeic_api.vocabulary;

import java.util.List;
import java.util.Map;
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
public class VocabularyController {

    private final VocabularyService vocabularyService;
    private final UserAccountService userAccountService;

    public VocabularyController(VocabularyService vocabularyService, UserAccountService userAccountService) {
        this.vocabularyService = vocabularyService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/api/vocabulary/sets")
    public List<VocabularyTestSet> listSets(@RequestParam(required = false) String category) {
        return vocabularyService.listSets(category);
    }

    @GetMapping("/api/vocabulary/sets/{setId}")
    public VocabularyTestSet getSetDetails(@PathVariable String setId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return vocabularyService.getSetDetails(setId, userId);
    }

    @PostMapping("/api/vocabulary/words/{wordId}/star")
    @ResponseStatus(HttpStatus.OK)
    public void toggleStar(@PathVariable String wordId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        vocabularyService.toggleStar(wordId, userId);
    }

    @PostMapping("/api/vocabulary/words/{wordId}/status")
    @ResponseStatus(HttpStatus.OK)
    public void updateStatus(@PathVariable String wordId, @RequestBody Map<String, String> body, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        String status = body.getOrDefault("status", "LEARNING");
        vocabularyService.updateWordStatus(wordId, status, userId);
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
