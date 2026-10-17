package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@Transactional
class ContentImportServiceIntegrationTest {
    @Autowired
    private ContentImportService importService;

    @Test
    void previewsNormalizesDetectsDuplicatesAndPublishesOnlyValidRows() {
        String uniqueWord = "test-word-" + java.util.UUID.randomUUID();
        String json = """
                [
                  {"word":" %s ", "meaning":" Meaning "},
                  {"word":"%s", "meaning":"A duplicate"},
                  {"word":"missing-meaning"}
                ]
                """.formatted(uniqueWord, uniqueWord);
        var file = new MockMultipartFile("file", "words.json", "application/json",
                json.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var preview = importService.preview(ContentType.VOCABULARY, file, null);

        assertThat(preview.batch().status()).isEqualTo("PREVIEW");
        assertThat(preview.batch().totalRecords()).isEqualTo(3);
        assertThat(preview.batch().validCount()).isEqualTo(1);
        assertThat(preview.batch().duplicateCount()).isEqualTo(1);
        assertThat(preview.batch().invalidCount()).isEqualTo(1);
        assertThat(preview.items().getFirst().normalizedData().path("word").asText()).isEqualTo(uniqueWord);

        var published = importService.publish(preview.batch().id(), null);

        assertThat(published.status()).isEqualTo("PARTIAL");
        assertThat(published.publishedCount()).isEqualTo(1);
        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .anyMatch(item -> item.title().equals(uniqueWord));

        var duplicateFile = new MockMultipartFile("file", "duplicate.json", "application/json",
                """
                [{"word":"%s", "meaning":"Different meaning"}]
                """.formatted(uniqueWord.toUpperCase()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var duplicatePreview = importService.preview(ContentType.VOCABULARY, duplicateFile, null);
        assertThat(duplicatePreview.batch().duplicateCount()).isEqualTo(1);
        assertThat(duplicatePreview.batch().validCount()).isZero();
        assertThat(duplicatePreview.batch().status()).isEqualTo("NO_VALID_ROWS");
        assertThatThrownBy(() -> importService.publish(preview.batch().id(), null))
                .isInstanceOf(ResponseStatusException.class);
    }
}
