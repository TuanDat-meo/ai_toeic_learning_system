package com.toeic.ai.toeic_api.reading;

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
public class ReadingController {

    private final ReadingService readingService;
    private final UserAccountService userAccountService;

    public ReadingController(ReadingService readingService, UserAccountService userAccountService) {
        this.readingService = readingService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/api/reading/cards")
    public List<ReadingExerciseCard> listCards(@RequestParam(required = false) String category, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.listCards(category, userId);
    }

    @GetMapping("/api/reading/cards/{cardId}")
    public ReadingExerciseCard getCard(@PathVariable String cardId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.getCard(cardId, userId);
    }

    @PostMapping("/api/reading/cards/{cardId}/progress")
    @ResponseStatus(HttpStatus.OK)
    public void saveProgress(@PathVariable String cardId, @RequestBody Map<String, Object> body, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        int studied = body.get("studiedQuestions") instanceof Number n ? n.intValue() : 0;
        int correct = body.get("correctAnswers") instanceof Number n ? n.intValue() : 0;
        int wrong = body.get("wrongAnswers") instanceof Number n ? n.intValue() : 0;
        Boolean bookmarked = body.get("bookmarked") instanceof Boolean b ? b : null;
        readingService.saveProgress(userId, cardId, studied, correct, wrong, bookmarked);
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
