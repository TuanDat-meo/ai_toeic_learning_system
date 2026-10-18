package com.toeic.ai.toeic_api.listening;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class ListeningController {

    private final ListeningService listeningService;
    private final UserAccountService userAccountService;

    public ListeningController(ListeningService listeningService, UserAccountService userAccountService) {
        this.listeningService = listeningService;
        this.userAccountService = userAccountService;
    }

    @GetMapping("/api/listening/cards")
    public List<ListeningDictationCard> listCards(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.listCards(userId);
    }

    @GetMapping("/api/listening/cards/{cardId}")
    public ListeningDictationCard getCard(@PathVariable String cardId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.getCard(cardId, userId);
    }

    @PostMapping("/api/listening/progress")
    @ResponseStatus(HttpStatus.OK)
    public void saveProgress(@RequestBody SaveListeningProgressRequest request, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        listeningService.saveProgress(userId, request);
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
