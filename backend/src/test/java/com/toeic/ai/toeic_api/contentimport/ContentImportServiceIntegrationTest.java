package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.springframework.jdbc.core.JdbcTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.toeic.ai.toeic_api.grammar.GrammarService;
import com.toeic.ai.toeic_api.vocabulary.VocabularyService;

import com.toeic.ai.toeic_api.reading.ReadingService;

@SpringBootTest
@Transactional
class ContentImportServiceIntegrationTest {
    @Autowired
    private ContentImportService importService;
    @Autowired
    private ReadingService readingService;

    @Autowired
    private GrammarService grammarService;

    @Autowired
    private VocabularyService vocabularyService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void doesNotTreatDeletedGrammarTopicAsAnExistingImportDuplicate() {
        String suffix = java.util.UUID.randomUUID().toString().replace("-", "");
        String code = "I" + suffix.substring(0, 31);
        String title = "Import deletion test " + suffix;
        var file = new MockMultipartFile("file", "grammar.json", "application/json",
                """
                [{
                  "code":"%s",
                  "title":"%s",
                  "englishTitle":"Import deletion test",
                  "rule":"Noun + verb",
                  "explanation":"A unique grammar test topic.",
                  "status":"DRAFT"
                }]
                """.formatted(code, title).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var initialPreview = previewGrammar(file);
        assertThat(initialPreview.batch().validCount()).isEqualTo(1);
        importService.publish(initialPreview.batch().id(), null);

        String topicId = jdbcTemplate.queryForObject(
                "SELECT id FROM grammar_topics WHERE code = ?", String.class, code);
        grammarService.bulkDelete(java.util.List.of(topicId));

        var afterDeletionPreview = previewGrammar(file);
        assertThat(afterDeletionPreview.batch().validCount()).isEqualTo(1);
        assertThat(afterDeletionPreview.batch().duplicateCount()).isZero();

        var republished = importService.publish(afterDeletionPreview.batch().id(), null);
        assertThat(republished.publishedCount()).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT count(*) FROM grammar_topics WHERE code = ?", Integer.class, code)).isEqualTo(1);

        var activeDuplicatePreview = previewGrammar(file);
        assertThat(activeDuplicatePreview.batch().duplicateCount()).isEqualTo(1);
    }

    @Test
    void doesNotTreatAnUnpublishedVocabularyPreviewAsPublishedDuplicate() {
        String word = "draft-word-" + java.util.UUID.randomUUID();
        var firstFile = new MockMultipartFile("file", "first.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa thứ nhất"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var secondFile = new MockMultipartFile("file", "second.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa thứ hai"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var firstPreview = previewVocabulary(firstFile);
        var secondPreview = previewVocabulary(secondFile);

        assertThat(firstPreview.batch().validCount()).isEqualTo(1);
        assertThat(secondPreview.batch().validCount()).isEqualTo(1);
        assertThat(secondPreview.batch().duplicateCount()).isZero();
    }

    @Test
    void allowsReimportingVocabularyAfterItsLastSetEntryIsPermanentlyDeleted() {
        String word = "deleted-word-" + java.util.UUID.randomUUID();
        var file = new MockMultipartFile("file", "word.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa cần nhập lại"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var initialPreview = previewVocabulary(file);
        assertThat(initialPreview.batch().validCount()).isEqualTo(1);
        importService.publish(initialPreview.batch().id(), null);

        String wordId = jdbcTemplate.queryForObject(
                "SELECT id FROM vocabulary_items WHERE lower(word) = lower(?) ORDER BY created_at DESC LIMIT 1",
                String.class, word);
        vocabularyService.deleteWord(wordId);

        var afterDeletionPreview = previewVocabulary(file);
        assertThat(afterDeletionPreview.batch().validCount()).isEqualTo(1);
        assertThat(afterDeletionPreview.batch().duplicateCount()).isZero();

        var republished = importService.publish(afterDeletionPreview.batch().id(), null);
        assertThat(republished.publishedCount()).isEqualTo(1);
        assertThat(republished.status()).isEqualTo("PUBLISHED");

        var activeDuplicatePreview = previewVocabulary(file);
        assertThat(activeDuplicatePreview.batch().duplicateCount()).isEqualTo(1);
    }

    @Test
    void futureVocabularyReleaseDateIsAppliedToTheSetOnPublish() {
        String word = "scheduled-word-" + java.util.UUID.randomUUID();
        var file = new MockMultipartFile("file", "scheduled.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa sẽ phát hành theo lịch"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        String releaseAt = java.time.OffsetDateTime.now().plusMinutes(5).toString();

        var preview = importService.preview(
                ContentType.VOCABULARY, file, null, null, "Scheduled Vocabulary", releaseAt);
        var published = importService.publish(preview.batch().id(), null);

        assertThat(published.status()).isEqualTo("PUBLISHED");
        assertThat(published.releaseAt()).isNotNull();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT count(*) FROM vocabulary_items WHERE lower(word) = lower(?)", Integer.class, word))
                .isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject(
                """
                SELECT s.release_at FROM vocabulary_test_sets s
                JOIN vocabulary_items w ON w.set_id = s.id
                WHERE lower(w.word) = lower(?)
                """, java.sql.Timestamp.class, word))
                .isAfter(java.sql.Timestamp.from(java.time.Instant.now()));
        String setId = jdbcTemplate.queryForObject(
                "SELECT set_id FROM vocabulary_items WHERE lower(word) = lower(?)", String.class, word);
        assertThat(vocabularyService.listSets(null, null, true))
                .filteredOn(set -> set.id().equals(setId))
                .singleElement()
                .satisfies(set -> {
                    var actual = java.time.LocalDateTime.parse(set.releaseAt());
                    var expected = java.time.OffsetDateTime.parse(releaseAt)
                            .atZoneSameInstant(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
                            .toLocalDateTime();
                    assertThat(java.time.Duration.between(expected, actual).abs())
                            .isLessThanOrEqualTo(java.time.Duration.ofNanos(1_000));
                });
        assertThatThrownBy(() -> vocabularyService.getSetDetails(setId, null))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void immediateVocabularyPublishStoresTheSetReleaseTime() {
        String word = "immediate-release-" + java.util.UUID.randomUUID();
        String setName = "Immediate Release " + java.util.UUID.randomUUID();
        var file = new MockMultipartFile("file", "immediate.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa phát hành ngay"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var preview = importService.preview(
                ContentType.VOCABULARY, file, null, null, setName, null);
        assertThat(preview.batch().releaseAt()).isNull();
        var beforePublish = java.time.Instant.now().minusSeconds(1);
        var published = importService.publish(preview.batch().id(), null);
        var afterPublish = java.time.Instant.now().plusSeconds(1);

        assertThat(published.status()).isEqualTo("PUBLISHED");
        String setId = jdbcTemplate.queryForObject(
                "SELECT set_id FROM vocabulary_items WHERE lower(word) = lower(?)", String.class, word);
        var releaseAt = jdbcTemplate.queryForObject(
                "SELECT release_at FROM vocabulary_test_sets WHERE id = ?",
                java.sql.Timestamp.class, setId).toInstant();
        assertThat(releaseAt).isBetween(beforePublish, afterPublish);
        assertThat(vocabularyService.listSets(null, null, true))
                .filteredOn(set -> set.id().equals(setId))
                .singleElement()
                .satisfies(set -> assertThat(set.releaseAt()).isNotBlank());
    }

    @Test
    void allowsExplicitlyAddingANewMeaningToAnExistingWord() {
        String word = "multi-meaning-" + java.util.UUID.randomUUID();
        var file = new MockMultipartFile("file", "meanings.json", "application/json",
                """
                [
                  {"word":"%s", "meaning":"nghĩa thứ nhất"},
                  {"word":"%s", "meaning":"nghĩa thứ hai"}
                ]
                """.formatted(word, word).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var preview = previewVocabulary(file);
        var duplicate = preview.items().get(1);
        var resolved = importService.resolveVocabularyDuplicate(
                preview.batch().id(), duplicate.id(), "ADD_MEANING");

        assertThat(resolved.batch().validCount()).isEqualTo(2);
        assertThat(resolved.items().get(1).duplicateResolution()).isEqualTo("ADD_MEANING");
        var published = importService.publish(preview.batch().id(), null);

        assertThat(published.publishedCount()).isEqualTo(2);
        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .filteredOn(item -> item.title().equals(word))
                .singleElement()
                .satisfies(item -> assertThat(item.payload().path("meaning").asText())
                        .contains("nghĩa thứ nhất", "nghĩa thứ hai"));
    }

    @Test
    void addsMeaningToAnAlreadyPublishedVocabularyEntryOnlyWhenTheBatchIsPublished() {
        String word = "published-meaning-" + java.util.UUID.randomUUID();
        var firstFile = new MockMultipartFile("file", "first.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa cũ"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var firstPreview = previewVocabulary(firstFile);
        importService.publish(firstPreview.batch().id(), null);

        var secondFile = new MockMultipartFile("file", "second.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa mới"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var secondPreview = previewVocabulary(secondFile);
        assertThat(secondPreview.batch().duplicateCount()).isEqualTo(1);

        var resolved = importService.resolveVocabularyDuplicate(
                secondPreview.batch().id(), secondPreview.items().getFirst().id(), "ADD_MEANING");
        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .filteredOn(item -> item.title().equals(word))
                .singleElement()
                .satisfies(item -> assertThat(item.payload().path("meaning").asText()).isEqualTo("nghĩa cũ"));

        importService.publish(resolved.batch().id(), null);

        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .filteredOn(item -> item.title().equals(word))
                .singleElement()
                .satisfies(item -> assertThat(item.payload().path("meaning").asText())
                        .contains("nghĩa cũ", "nghĩa mới"));
    }

    @Test
    void allowsCreatingASeparateEntryForAnExistingWord() {
        String word = "separate-meaning-" + java.util.UUID.randomUUID();
        var file = new MockMultipartFile("file", "meanings.json", "application/json",
                """
                [
                  {"word":"%s", "meaning":"nghĩa thứ nhất"},
                  {"word":"%s", "meaning":"nghĩa thứ hai"}
                ]
                """.formatted(word, word).getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var preview = previewVocabulary(file);
        var duplicate = preview.items().get(1);
        var resolved = importService.resolveVocabularyDuplicate(
                preview.batch().id(), duplicate.id(), "CREATE_NEW");

        assertThat(resolved.batch().validCount()).isEqualTo(2);
        var published = importService.publish(preview.batch().id(), null);

        assertThat(published.publishedCount()).isEqualTo(2);
        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .filteredOn(item -> item.title().equals(word))
                .hasSize(2);
        var afterPublishFile = new MockMultipartFile("file", "again.json", "application/json",
                """
                [{"word":"%s", "meaning":"nghĩa thứ ba"}]
                """.formatted(word).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var afterPublish = previewVocabulary(afterPublishFile);
        assertThat(afterPublish.batch().duplicateCount()).isEqualTo(1);
    }

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

        var preview = previewVocabulary(file);

        assertThat(preview.batch().status()).isEqualTo("PREVIEW");
        assertThat(preview.batch().totalRecords()).isEqualTo(3);
        assertThat(preview.batch().validCount()).isEqualTo(1);
        assertThat(preview.batch().duplicateCount()).isEqualTo(1);
        assertThat(preview.batch().invalidCount()).isEqualTo(1);
        assertThat(preview.items().getFirst().normalizedData().get("word")).isEqualTo(uniqueWord);

        var published = importService.publish(preview.batch().id(), null);

        assertThat(published.status()).isEqualTo("PARTIAL");
        assertThat(published.publishedCount()).isEqualTo(1);
        assertThat(importService.listPublished(ContentType.VOCABULARY, 100))
                .anyMatch(item -> item.title().equals(uniqueWord));

        var duplicateFile = new MockMultipartFile("file", "duplicate.json", "application/json",
                """
                [{"word":"%s", "meaning":"Different meaning"}]
                """.formatted(uniqueWord.toUpperCase()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var duplicatePreview = previewVocabulary(duplicateFile);
        assertThat(duplicatePreview.batch().duplicateCount()).isEqualTo(1);
        assertThat(duplicatePreview.batch().validCount()).isZero();
        assertThat(duplicatePreview.batch().status()).isEqualTo("NO_VALID_ROWS");
        assertThatThrownBy(() -> importService.publish(preview.batch().id(), null))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void publishesReadingBatchAndSyncsCardWithVocabListToReadingModule() {
        String cardId = "test-reading-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        String json = """
                [
                  {
                    "id": "%s",
                    "title": "Executive Logistics Memo",
                    "part": "Part 7",
                    "content": "Please expedite the quarterly shipment to the Osaka warehouse.",
                    "passageTextVi": "Vui lòng đẩy nhanh lô hàng quý tới kho Osaka.",
                    "questions": [
                      {
                        "questionNum": "148",
                        "question": "Where should the shipment be sent?",
                        "options": ["Osaka", "Tokyo", "Seoul", "Busan"],
                        "correctIndex": 0,
                        "vocabList": [{"word": "expedite", "pos": "v", "ipa": "/ˈekspədaɪt/", "meaning": "đẩy nhanh tiến độ"}]
                      }
                    ],
                    "vocabList": [
                      {"word": "logistics", "pos": "n", "ipa": "/ləˈdʒɪstɪks/", "meaning": "hậu cần"}
                    ]
                  }
                ]
                """.formatted(cardId);
        var file = new MockMultipartFile("file", "reading.json", "application/json",
                json.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var preview = importService.preview(ContentType.READING, file, null);
        assertThat(preview.batch().validCount()).isEqualTo(1);

        var published = importService.publish(preview.batch().id(), null);
        assertThat(published.publishedCount()).isEqualTo(1);

        var syncedCard = readingService.getCard(cardId, null);
        assertThat(syncedCard.title()).isEqualTo("Executive Logistics Memo");
        assertThat(syncedCard.category()).isEqualTo("part7");
        assertThat(syncedCard.sampleQuestions()).hasSize(1);
        assertThat(syncedCard.theory()).containsKey("vocabList");
    }

    private ContentImportService.BatchDetails previewVocabulary(MockMultipartFile file) {
        return importService.preview(ContentType.VOCABULARY, file, null, null, "Test Vocabulary");
    }

    private ContentImportService.BatchDetails previewGrammar(MockMultipartFile file) {
        return importService.preview(ContentType.GRAMMAR, file, null);
    }
}
