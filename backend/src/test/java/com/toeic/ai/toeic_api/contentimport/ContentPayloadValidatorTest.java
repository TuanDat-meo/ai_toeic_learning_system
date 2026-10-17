package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class ContentPayloadValidatorTest {
    private final ContentPayloadValidator validator = new ContentPayloadValidator();

    @Test
    void normalizesVocabularyAndItsArrayFields() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "word": "  Schedule ",
                  "meaning": " A plan of activities ",
                  "partOfSpeech": " noun ",
                  "synonyms": "[\\"timetable\\", \\" agenda \\"]"
                }
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("word").asText()).isEqualTo("Schedule");
        assertThat(result.normalizedData().path("pos").asText()).isEqualTo("noun");
        assertThat(result.normalizedData().path("synonyms").get(1).asText()).isEqualTo("agenda");
        assertThat(result.dedupeKey()).hasSize(64);
    }

    @Test
    void normalizesQuestionPartDifficultyAndCorrectOption() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "part": "Part 5",
                  "questionText": " Choose the correct word. ",
                  "correctAnswer": "b",
                  "skill": "Grammar",
                  "difficulty": "medium",
                  "options": [
                    {"id":"A","text":"option one"},
                    {"id":"B","text":"option two"}
                  ],
                  "explanation": "Reason"
                }
                """);

        var result = validator.validate(ContentType.QUESTION, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("part").asText()).isEqualTo("PART_5");
        assertThat(result.normalizedData().path("difficulty").asText()).isEqualTo("MEDIUM");
        assertThat(result.normalizedData().path("options").get(1).path("isCorrect").asBoolean()).isTrue();
    }

    @Test
    void reportsMissingFieldsAndUnsupportedColumns() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {"word":"", "meaning":"Meaning", "typoColumn":"value"}
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isFalse();
        assertThat(result.errors()).anyMatch(error -> error.contains("word"));
        assertThat(result.errors()).anyMatch(error -> error.contains("typoColumn"));
    }

    @Test
    void rejectsQuestionWhenCorrectAnswerDoesNotMatchOption() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "part":"PART_2",
                  "questionText":"Question",
                  "correctAnswer":"C",
                  "skill":"Listening",
                  "difficulty":"EASY",
                  "explanation":"Reason",
                  "options":[{"id":"A","text":"First"},{"id":"B","text":"Second"}]
                }
                """);

        var result = validator.validate(ContentType.QUESTION, raw);

        assertThat(result.errors()).hasSize(1);
    }
}
