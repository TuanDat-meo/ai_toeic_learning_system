package com.toeic.ai.toeic_api.vocabulary;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    // Public / Student endpoints
    @GetMapping("/api/vocabulary/sets")
    public List<VocabularyService.VocabularyTestSet> listSets(
            @RequestParam(required = false) String category,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return vocabularyService.listSets(category, userId);
    }

    @GetMapping("/api/vocabulary/sets/{setId}")
    public VocabularyService.VocabularyTestSet getSetDetails(
            @PathVariable String setId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return vocabularyService.getSetDetails(setId, userId);
    }

    @PostMapping("/api/vocabulary/words/{wordId}/star")
    @ResponseStatus(HttpStatus.OK)
    public void toggleStar(@PathVariable String wordId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId != null) {
            vocabularyService.toggleStar(wordId, userId);
        }
    }

    @PostMapping("/api/vocabulary/words/{wordId}/status")
    @ResponseStatus(HttpStatus.OK)
    public void updateWordStatus(
            @PathVariable String wordId,
            @RequestParam String status,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId != null) {
            vocabularyService.updateWordStatus(wordId, status, userId);
        }
    }

    // Admin endpoints (protected by hasRole('ADMIN') under /api/admin/**)
    @GetMapping("/api/admin/vocabulary/sets")
    public List<VocabularyService.VocabularyTestSet> adminListSets(
            @RequestParam(required = false) String category,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return vocabularyService.listSets(category, userId);
    }

    @PostMapping("/api/admin/vocabulary/sets")
    @ResponseStatus(HttpStatus.CREATED)
    public VocabularyService.VocabularyTestSet createSet(@RequestBody VocabularyService.CreateSetRequest request) {
        return vocabularyService.createSet(request);
    }

    @PutMapping("/api/admin/vocabulary/sets/{id}")
    public VocabularyService.VocabularyTestSet updateSet(
            @PathVariable String id,
            @RequestBody VocabularyService.UpdateSetRequest request) {
        return vocabularyService.updateSet(id, request);
    }

    @DeleteMapping("/api/admin/vocabulary/sets/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSet(@PathVariable String id) {
        vocabularyService.deleteSet(id);
    }

    @PostMapping("/api/admin/vocabulary/sets/{setId}/words")
    @ResponseStatus(HttpStatus.CREATED)
    public VocabularyService.VocabularyWord addWord(
            @PathVariable String setId,
            @RequestBody VocabularyService.CreateWordRequest request) {
        return vocabularyService.addWord(setId, request);
    }

    @PutMapping("/api/admin/vocabulary/words/{wordId}")
    public VocabularyService.VocabularyWord updateWord(
            @PathVariable String wordId,
            @RequestBody VocabularyService.UpdateWordRequest request) {
        return vocabularyService.updateWord(wordId, request);
    }

    @DeleteMapping("/api/admin/vocabulary/words/{wordId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWord(@PathVariable String wordId) {
        vocabularyService.deleteWord(wordId);
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
