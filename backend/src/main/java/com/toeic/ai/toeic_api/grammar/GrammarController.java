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
    private final GrammarOperationsService operationsService;

    public GrammarController(
            GrammarService grammarService,
            GrammarSuggestionService grammarSuggestionService,
            UserAccountService userAccountService,
            GrammarOperationsService operationsService) {
        this.grammarService = grammarService;
        this.grammarSuggestionService = grammarSuggestionService;
        this.userAccountService = userAccountService;
        this.operationsService = operationsService;
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

    @GetMapping("/api/grammar/topics/{topicId}/resume")
    public Map<String, Object> getResumeIndex(
            @PathVariable String topicId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return grammarService.getResumeIndex(userId, topicId);
    }

    @GetMapping("/api/grammar/config")
    public GrammarService.GrammarLearningConfig getLearningConfig(
            @org.springframework.web.bind.annotation.RequestParam(required=false) String topicId) {
        return grammarService.getLearningConfig(topicId);
    }

    @GetMapping("/api/admin/grammar/config")
    public GrammarService.GrammarLearningConfig getAdminLearningConfig(
            @org.springframework.web.bind.annotation.RequestParam(required=false) String topicId) {
        return grammarService.getLearningConfig(topicId);
    }

    @PutMapping("/api/admin/grammar/config")
    public GrammarService.GrammarLearningConfig putLearningConfig(
            @org.springframework.web.bind.annotation.RequestParam(required=false) String topicId,
            @RequestBody GrammarService.GrammarLearningConfig config,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return grammarService.putLearningConfig(topicId, config, actorId);
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
    public GrammarService.GrammarAttemptResult saveProgress(@RequestBody GrammarService.SaveGrammarAttemptRequest request, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (request == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu làm bài.");
        return grammarService.saveAttempt(userId, request);
    }

    // Admin endpoints (guarded by hasRole('ADMIN') for /api/admin/**)
    @GetMapping("/api/admin/grammar/topics")
    public List<GrammarService.GrammarTopic> adminListTopics(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return grammarService.listAdminTopics(userId);
    }

    @PostMapping("/api/admin/grammar/topics")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarService.GrammarTopic createTopic(
            @RequestBody GrammarService.CreateGrammarTopicRequest request,
            Authentication authentication) {
        if ("PUBLISHED".equalsIgnoreCase(request.status()) && !canPublish(authentication)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Chỉ REVIEWER hoặc ADMIN được phát hành.");
        }
        return grammarService.createTopic(request);
    }

    @PostMapping("/api/admin/grammar/topics/with-new-parent")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarService.GrammarTopicHierarchy createTopicWithNewParent(
            @RequestBody GrammarService.CreateGrammarTopicWithParentRequest request) {
        return grammarService.createTopicWithNewParent(request);
    }

    @PostMapping("/api/admin/grammar/suggestions")
    public GrammarSuggestionService.GrammarSuggestion suggestGrammarContent(
            @RequestBody GrammarSuggestionService.GrammarSuggestionRequest request) {
        return grammarSuggestionService.suggest(request);
    }

    @PutMapping("/api/admin/grammar/topics/{id}")
    public GrammarService.GrammarTopic updateTopic(
            @PathVariable String id,
            @RequestBody GrammarService.UpdateGrammarTopicRequest request,
            Authentication authentication) {
        if ("PUBLISHED".equalsIgnoreCase(request.status()) && !canPublish(authentication)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Chỉ REVIEWER hoặc ADMIN được phát hành.");
        }
        return grammarService.updateTopic(id, request);
    }

    @DeleteMapping("/api/admin/grammar/topics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(@PathVariable String id) {
        grammarService.deleteTopic(id);
    }

    @GetMapping("/api/admin/grammar/topics/{id}/lifecycle-impact")
    public GrammarService.TopicLifecycleImpact getTopicLifecycleImpact(@PathVariable String id) {
        return grammarService.getTopicLifecycleImpact(id);
    }

    @PostMapping("/api/admin/grammar/topics/{id}/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(
            @PathVariable String id,
            @RequestBody GrammarService.DeleteTopicRequest request) {
        grammarService.deleteTopic(id, request);
    }

    @PostMapping("/api/admin/grammar/topics/{id}/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveTopic(@PathVariable String id) {
        grammarService.archiveTopic(id);
    }

    @PostMapping("/api/admin/grammar/topics/{id}/restore")
    public GrammarService.GrammarTopic restoreTopic(@PathVariable String id) {
        return grammarService.restoreTopic(id);
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
    public void bulkUpdateStatus(
            @RequestBody GrammarService.BulkStatusRequest request,
            Authentication authentication) {
        if (request != null && request.ids() != null) {
            if ("PUBLISHED".equalsIgnoreCase(request.status()) && !canPublish(authentication)) {
                throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Chỉ REVIEWER hoặc ADMIN được phát hành.");
            }
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

    @PostMapping("/api/grammar/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.QuestionReport createQuestionReport(
            @RequestBody GrammarOperationsService.QuestionReportRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.createReport(userId, request);
    }

    @GetMapping("/api/grammar/reports/mine")
    public List<GrammarOperationsService.QuestionReport> mineQuestionReports(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.mineReports(userId);
    }

    @GetMapping("/api/admin/grammar/reports")
    public List<GrammarOperationsService.QuestionReport> adminQuestionReports() {
        return operationsService.adminReports();
    }

    @PutMapping("/api/admin/grammar/reports/{id}")
    public GrammarOperationsService.QuestionReport handleQuestionReport(
            @PathVariable Long id,
            @RequestBody GrammarOperationsService.UpdateReportRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        if (actorId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.handleReport(id, actorId, request);
    }

    @PostMapping("/api/grammar/bookmarks")
    @ResponseStatus(HttpStatus.OK)
    public void setBookmark(
            @RequestBody GrammarOperationsService.BookmarkRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        operationsService.setBookmark(userId, request);
    }

    @DeleteMapping("/api/grammar/bookmarks/{targetType}/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBookmark(
            @PathVariable String targetType,
            @PathVariable String targetId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        operationsService.removeBookmark(userId, targetType.toUpperCase(), targetId);
    }

    @GetMapping("/api/grammar/bookmarks")
    public List<GrammarOperationsService.BookmarkView> bookmarks(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.bookmarks(userId);
    }

    @GetMapping("/api/grammar/review/due")
    public List<GrammarOperationsService.ReviewItem> dueReviews(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.dueReviews(userId);
    }

    @GetMapping("/api/grammar/analytics")
    public GrammarOperationsService.GrammarAnalytics analytics(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.analytics(userId);
    }

    @GetMapping("/api/admin/grammar/analytics")
    public Map<String, Object> adminCoverage() {
        return operationsService.adminCoverage();
    }

    @GetMapping("/api/grammar/traps")
    public Map<String, Object> trapAnalysis(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return operationsService.trapAnalysis(userId);
    }

    @GetMapping("/api/grammar/today")
    public Map<String, Object> today(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.today(userId);
    }

    @GetMapping("/api/grammar/search")
    public Map<String, Object> search(
            @org.springframework.web.bind.annotation.RequestParam String keyword,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return operationsService.search(userId, keyword);
    }

    @GetMapping("/api/grammar/path/summary")
    public Map<String, Object> pathSummary(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.pathSummary(userId);
    }

    @GetMapping("/api/grammar/settings")
    public Map<String, Object> getGrammarSettings(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.getUserSettings(userId);
    }

    @PutMapping("/api/grammar/settings")
    public Map<String, Object> putGrammarSettings(
            @RequestBody GrammarOperationsService.UserSettingsRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.putUserSettings(userId, request);
    }

    @GetMapping("/api/admin/grammar/topics/page")
    public Map<String, Object> pagedAdminTopics(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue="0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue="20") int size,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue="ALL") String status,
            @org.springframework.web.bind.annotation.RequestParam(required=false) String search,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue="order") String sort) {
        return operationsService.pagedAdminTopics(page, size, status, search, sort);
    }

    @PostMapping("/api/admin/grammar/passages")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.PassageView createPassage(
            @RequestBody GrammarOperationsService.PassageRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.createPassage(actorId, request);
    }

    @GetMapping("/api/admin/grammar/passages")
    public List<GrammarOperationsService.PassageView> passages() {
        return operationsService.passages();
    }

    @GetMapping("/api/admin/grammar/rules")
    public List<GrammarOperationsService.RuleView> rules(
            @org.springframework.web.bind.annotation.RequestParam(required=false) String topicId) {
        return operationsService.rules(topicId);
    }

    @PutMapping("/api/admin/grammar/passages/{passageId}/questions")
    public void linkPassage(
            @PathVariable String passageId,
            @RequestBody Map<String, Object> body) {
        Object raw = body.get("questionIds");
        if (!(raw instanceof List<?> values)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thiếu danh sách questionIds.");
        }
        operationsService.linkPassage(passageId,
                values.stream().map(String::valueOf).toList());
    }

    @PostMapping("/api/admin/grammar/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.RuleView createRule(
            @RequestBody GrammarOperationsService.RuleRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.createRule(actorId, request);
    }

    @PutMapping("/api/admin/grammar/rules/{ruleId}/questions")
    public void linkRule(
            @PathVariable String ruleId,
            @RequestBody Map<String, Object> body) {
        Object raw = body.get("questionIds");
        if (!(raw instanceof List<?> values)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thiếu danh sách questionIds.");
        }
        operationsService.linkRule(ruleId,
                values.stream().map(String::valueOf).toList());
    }

    @PostMapping("/api/admin/grammar/ai-explanations")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.AiExplanationView cacheAiExplanation(
            @RequestBody GrammarOperationsService.AiExplanationRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.cacheAiExplanation(actorId, request);
    }

    @GetMapping("/api/grammar/ai-explanations")
    public GrammarOperationsService.AiExplanationView getAiExplanation(
            @org.springframework.web.bind.annotation.RequestParam String questionId,
            @org.springframework.web.bind.annotation.RequestParam String selectedOption) {
        return operationsService.getAiExplanation(questionId, selectedOption);
    }

    @PostMapping("/api/grammar/ai-explanations/{id}/feedback")
    @ResponseStatus(HttpStatus.OK)
    public void feedbackAiExplanation(
            @PathVariable Long id,
            @RequestBody GrammarOperationsService.AiFeedbackRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        operationsService.feedbackAiExplanation(id, userId, request);
    }

    @PostMapping("/api/grammar/exams")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.ExamSessionView startExam(
            @RequestBody GrammarOperationsService.ExamStartRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.startExam(userId, request);
    }

    @GetMapping("/api/grammar/exams/{id}")
    public GrammarOperationsService.ExamSessionView getExam(
            @PathVariable String id,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.getExamSession(id, userId);
    }

    @PostMapping("/api/grammar/exams/{id}/submit")
    public GrammarOperationsService.ExamSessionView submitExam(
            @PathVariable String id,
            @RequestBody GrammarOperationsService.ExamSubmitRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return operationsService.submitExam(id, userId, request);
    }

    @PostMapping("/api/admin/grammar/revisions")
    public GrammarOperationsService.RevisionView createRevision(
            @RequestBody GrammarOperationsService.RevisionRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.createRevision(actorId, request);
    }

    @GetMapping("/api/admin/grammar/revisions")
    public List<GrammarOperationsService.RevisionView> revisions(
            @org.springframework.web.bind.annotation.RequestParam String entityType,
            @org.springframework.web.bind.annotation.RequestParam String entityId) {
        return operationsService.revisions(entityType, entityId);
    }

    @PostMapping("/api/admin/grammar/revisions/{entityType}/{entityId}/{version}/restore")
    public GrammarOperationsService.RevisionView restoreRevision(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @PathVariable int version,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.restoreRevision(actorId, entityType, entityId, version);
    }

    @PostMapping("/api/admin/grammar/import-batches")
    @ResponseStatus(HttpStatus.CREATED)
    public GrammarOperationsService.ImportBatchView createImportBatch(
            @RequestBody GrammarOperationsService.ImportBatchRequest request,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.createImportBatch(actorId, request);
    }

    @PostMapping("/api/admin/grammar/import-batches/{id}/commit")
    public GrammarOperationsService.ImportBatchView commitImportBatch(
            @PathVariable String id,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.commitImportBatch(actorId, id);
    }

    @PostMapping("/api/admin/grammar/import-batches/{id}/undo")
    public GrammarOperationsService.ImportBatchView undoImportBatch(
            @PathVariable String id,
            Authentication authentication) {
        UUID actorId = extractUserId(authentication);
        return operationsService.undoImportBatch(actorId, id);
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

    private boolean canPublish(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(role -> "ROLE_ADMIN".equals(role) || "ROLE_REVIEWER".equals(role));
    }
}
