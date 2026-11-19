package com.toeic.ai.toeic_api.listening;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/api/admin/listening/cards")
    public List<ListeningDictationCard> adminListCards() {
        return listeningService.listAdminCards();
    }

    @PostMapping("/api/admin/listening/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public ListeningDictationCard createCard(
            @RequestBody ListeningService.ListeningCardRequest request) {
        return listeningService.createCard(request);
    }

    @PutMapping("/api/admin/listening/cards/{cardId}")
    public ListeningDictationCard updateCard(
            @PathVariable String cardId,
            @RequestBody ListeningService.ListeningCardRequest request) {
        return listeningService.updateCard(cardId, request);
    }

    @PatchMapping("/api/admin/listening/cards/{cardId}/status")
    public ListeningDictationCard updateCardStatus(
            @PathVariable String cardId,
            @RequestBody Map<String, String> payload) {
        return listeningService.updateCardPublicationStatus(cardId, payload.get("contentStatus"));
    }

    @DeleteMapping("/api/admin/listening/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable String cardId) {
        listeningService.deleteCard(cardId);
    }

    @GetMapping("/api/listening/units")
    public List<ListeningService.ListeningUnit> listUnits(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.listUnits(userId);
    }

    @GetMapping("/api/admin/listening/units")
    public List<ListeningService.ListeningUnit> adminListUnits() {
        return listeningService.listAdminUnits();
    }

    @PostMapping("/api/admin/listening/units")
    @ResponseStatus(HttpStatus.CREATED)
    public ListeningService.ListeningUnit createUnit(
            @RequestBody ListeningService.ListeningUnitRequest request) {
        return listeningService.createUnit(request);
    }

    @PutMapping("/api/admin/listening/units/{unitId}")
    public ListeningService.ListeningUnit updateUnit(
            @PathVariable String unitId,
            @RequestBody ListeningService.ListeningUnitRequest request) {
        return listeningService.updateUnit(unitId, request);
    }

    @PatchMapping("/api/admin/listening/units/{unitId}/status")
    public ListeningService.ListeningUnit updateUnitStatus(
            @PathVariable String unitId,
            @RequestBody Map<String, String> payload) {
        return listeningService.updateUnitPublicationStatus(unitId, payload.get("contentStatus"));
    }

    @DeleteMapping("/api/admin/listening/units/{unitId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUnit(@PathVariable String unitId) {
        listeningService.deleteUnit(unitId);
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

    @PostMapping("/api/listening/units/progress")
    @ResponseStatus(HttpStatus.OK)
    public void saveUnitProgress(@RequestBody ListeningService.SaveListeningUnitProgressRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        listeningService.saveUnitProgress(userId, request);
    }

    @PostMapping("/api/listening/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public ListeningService.ListeningAttemptRecord recordAttempt(
            @RequestBody ListeningService.SaveListeningAttemptRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.recordAttempt(userId, request);
    }

    @GetMapping("/api/listening/attempts")
    public List<ListeningService.ListeningAttemptRecord> listAttempts(
            @RequestParam(value = "targetId", required = false) String targetId,
            @RequestParam(value = "limit", defaultValue = "30") int limit,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.listAttempts(userId, targetId, limit);
    }

    @GetMapping("/api/listening/analytics")
    public ListeningService.ListeningAnalyticsSummary getStudentAnalytics(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return listeningService.getStudentAnalyticsAndRecommendations(userId);
    }

    @GetMapping("/api/admin/listening/analytics")
    public ListeningService.AdminListeningAnalyticsSummary getAdminAnalytics() {
        return listeningService.getAdminAnalyticsAndRecommendations();
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
