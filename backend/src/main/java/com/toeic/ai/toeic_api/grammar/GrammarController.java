package com.toeic.ai.toeic_api.grammar;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class GrammarController {

    private final GrammarService grammarService;
    private final GrammarSuggestionService grammarSuggestionService;
    private final UserAccountService userAccountService;

    public GrammarController(
            GrammarService grammarService,
            GrammarSuggestionService grammarSuggestionService,
            UserAccountService userAccountService) {
        this.grammarService = grammarService;
        this.grammarSuggestionService = grammarSuggestionService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/api/grammar/topics")
    public List<GrammarService.GrammarTopic> listTopics(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return grammarService.listTopics(userId);
    }

    @GetMapping("/api/grammar/topics/{topicId}")
    public GrammarService.GrammarTopic getTopic(@PathVariable String topicId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return grammarService.getTopic(topicId, userId);
    }

    @GetMapping("/api/admin/grammar/categories")
    public List<GrammarService.GrammarCategory> listCategories() {
        return grammarService.listCategories();
    }

    @PostMapping("/api/admin/grammar/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarService.GrammarCategory createCategory(
            @RequestBody GrammarService.GrammarCategoryRequest request) {
        return grammarService.createCategory(request);
    }

    @PutMapping("/api/admin/grammar/categories/{code}")
    public GrammarService.GrammarCategory updateCategory(
            @PathVariable String code,
            @RequestBody GrammarService.GrammarCategoryRequest request) {
        return grammarService.updateCategory(code, request);
    }

    @DeleteMapping("/api/admin/grammar/categories/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable String code) {
        grammarService.deleteCategory(code);
    }

    @PostMapping("/api/grammar/progress")
    @ResponseStatus(HttpStatus.OK)
    public void saveProgress(@RequestBody GrammarService.SaveGrammarProgressRequest request, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId != null && request != null) {
            grammarService.saveProgress(userId, request.topicId(), request.completedQuestions(), request.totalQuestions(), request.status());
        }
    }

    // Admin endpoints (guarded by hasRole('ADMIN') for /api/admin/**)
    @GetMapping("/api/admin/grammar/topics")
    public List<GrammarService.GrammarTopic> adminListTopics(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return grammarService.listTopics(userId);
    }

    @PostMapping("/api/admin/grammar/topics")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarService.GrammarTopic createTopic(@RequestBody GrammarService.CreateGrammarTopicRequest request) {
        return grammarService.createTopic(request);
    }

    @PostMapping("/api/admin/grammar/suggestions")
    public GrammarSuggestionService.GrammarSuggestion suggestGrammarContent(
            @RequestBody GrammarSuggestionService.GrammarSuggestionRequest request) {
        return grammarSuggestionService.suggest(request);
    }

    @PutMapping("/api/admin/grammar/topics/{id}")
    public GrammarService.GrammarTopic updateTopic(@PathVariable String id, @RequestBody GrammarService.UpdateGrammarTopicRequest request) {
        return grammarService.updateTopic(id, request);
    }

    @DeleteMapping("/api/admin/grammar/topics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(@PathVariable String id) {
        grammarService.deleteTopic(id);
    }

    @PostMapping("/api/admin/grammar/topics/{id}/questions")
    public GrammarService.GrammarTopic addQuestion(@PathVariable String id, @RequestBody Map<String, Object> question) {
        return grammarService.addQuestion(id, question);
    }

    @PutMapping("/api/admin/grammar/topics/{id}/questions/{questionId}")
    public GrammarService.GrammarTopic updateQuestion(
            @PathVariable String id,
            @PathVariable String questionId,
            @RequestBody Map<String, Object> question) {
        return grammarService.updateQuestion(id, questionId, question);
    }

    @DeleteMapping("/api/admin/grammar/topics/{id}/questions/{questionId}")
    public GrammarService.GrammarTopic deleteQuestion(
            @PathVariable String id,
            @PathVariable String questionId) {
        return grammarService.deleteQuestion(id, questionId);
    }

    @PostMapping("/api/admin/grammar/topics/bulk-status")
    @ResponseStatus(HttpStatus.OK)
    public void bulkUpdateStatus(@RequestBody GrammarService.BulkStatusRequest request) {
        if (request != null && request.ids() != null) {
            grammarService.bulkUpdateStatus(request.ids(), request.status());
        }
    }

    @PostMapping("/api/admin/grammar/topics/bulk-delete")
    @ResponseStatus(HttpStatus.OK)
    public void bulkDelete(@RequestBody GrammarService.BulkDeleteRequest request) {
        if (request != null && request.ids() != null) {
            grammarService.bulkDelete(request.ids());
        }
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
