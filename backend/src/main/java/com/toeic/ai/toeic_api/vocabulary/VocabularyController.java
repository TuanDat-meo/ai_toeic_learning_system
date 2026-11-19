package com.toeic.ai.toeic_api.vocabulary;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/api/vocabulary/sets/summary")
    public List<VocabularyService.VocabularyTestSet> listSetSummaries(
            @RequestParam(required = false) String category) {
        return vocabularyService.listSetSummaries(category);
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

    @GetMapping("/api/vocabulary/dashboard")
    public VocabularyService.StudentVocabularyDashboard getDashboard(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getStudentDashboard(userId);
    }

    @GetMapping("/api/vocabulary/goals")
    public VocabularyService.StudentVocabularyGoal getDailyGoal(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getDailyGoal(userId);
    }

    @PutMapping("/api/vocabulary/goals")
    public VocabularyService.StudentVocabularyGoal upsertDailyGoal(
            @RequestBody VocabularyService.UpdateDailyGoalRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.upsertDailyGoal(userId, request.newWordsGoal(), request.reviewGoal());
    }

    @PostMapping("/api/vocabulary/answers")
    @ResponseStatus(HttpStatus.OK)
    public VocabularyService.VocabularyAnswerResult recordAnswer(
            @RequestBody VocabularyService.RecordVocabularyAnswerRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.recordAnswer(userId, request);
    }

    @GetMapping("/api/vocabulary/review/due")
    public List<VocabularyService.VocabularyWord> listDueReviewWords(
            @RequestParam(required = false) String setId,
            @RequestParam(defaultValue = "50") int limit,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getDueReviewWords(userId, setId, limit);
    }

    @PostMapping("/api/vocabulary/games/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public VocabularyService.VocabularyGameSession startGameSession(
            @RequestBody VocabularyService.StartVocabularyGameRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.startGameSession(userId, request);
    }

    @GetMapping("/api/vocabulary/games/sessions/{sessionId}")
    public VocabularyService.VocabularyGameSession getGameSession(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getGameSession(userId, sessionId);
    }

    @GetMapping("/api/vocabulary/games/sessions/{sessionId}/state")
    public VocabularyService.BattleSessionState getBattleSessionState(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getBattleSessionState(userId, sessionId);
    }

    @PostMapping("/api/vocabulary/games/sessions/{sessionId}/complete")
    public VocabularyService.VocabularyGameSession completeGameSession(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.completeGameSession(userId, sessionId);
    }

    @GetMapping("/api/vocabulary/games/scores")
    public List<VocabularyService.VocabularyGameScore> getGameScores(
            @RequestParam(required = false) String setId,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getGameScores(userId, setId);
    }

    @GetMapping("/api/vocabulary/weak-words")
    public List<VocabularyService.WeakVocabularyWord> getWeakVocabularyWords(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getWeakVocabularyWords(userId, limit);
    }

    @GetMapping("/api/vocabulary/stats/daily")
    public List<VocabularyService.VocabularyDailyStat> getDailyVocabularyStats(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getDailyLearningStats(userId);
    }

    @GetMapping("/api/vocabulary/history")
    public List<VocabularyService.VocabularyHistoryItem> getLearningHistory(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String activity,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ.");
        }
        return vocabularyService.getLearningHistory(userId, limit, activity);
    }

    // Admin endpoints (protected by hasRole('ADMIN') under /api/admin/**)
    @GetMapping("/api/admin/vocabulary/sets")
    public List<VocabularyService.VocabularyTestSet> adminListSets(
            @RequestParam(required = false) String category,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return vocabularyService.listSets(category, userId, true);
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

    @PostMapping("/api/admin/vocabulary/sets/{setId}/words/bulk")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addWordsBulk(
            @PathVariable String setId,
            @RequestBody List<Map<String, Object>> request) {
        vocabularyService.addWordsFromQuickImport(setId, request);
    }

    @PostMapping("/api/admin/vocabulary/audio/fill-missing")
    public AudioSyncResult fillMissingAudioUrls(@RequestParam(required = false) String setId) {
        return new AudioSyncResult(vocabularyService.fillMissingAudioUrls(setId));
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

    public record AudioSyncResult(int updatedCount) {}
}
