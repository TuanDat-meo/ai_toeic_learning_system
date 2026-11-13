package com.toeic.ai.toeic_api.reading;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@Transactional
class ReadingPublicationStatusIntegrationTest {

    @Autowired
    private ReadingService readingService;

    @Test
    void draftsArePersistedButOnlyListedForAdmins() {
        UUID userId = UUID.randomUUID();
        ReadingExerciseCard draft = readingService.createCard(
                Map.of(
                        "title", "Reading draft " + UUID.randomUUID(),
                        "category", "part5",
                        "status", "draft",
                        "totalQuestions", 1),
                userId);

        assertThat(draft.status()).isEqualTo("draft");
        assertThat(readingService.listCards("part5", userId))
                .extracting(ReadingExerciseCard::id)
                .doesNotContain(draft.id());
        assertThat(readingService.listAdminCards("part5", userId))
                .extracting(ReadingExerciseCard::id)
                .contains(draft.id());
        assertThatThrownBy(() -> readingService.getCard(draft.id(), userId))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(readingService.getAdminCard(draft.id(), userId).status()).isEqualTo("draft");

        readingService.updateCard(
                draft.id(),
                Map.of(
                        "title", draft.title(),
                        "category", "part5",
                        "status", "published",
                        "totalQuestions", 1),
                userId);

        assertThat(readingService.listCards("part5", userId))
                .extracting(ReadingExerciseCard::id)
                .contains(draft.id());
    }
}
