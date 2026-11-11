package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class ContentPayloadValidatorTest {
    private final ContentPayloadValidator validator = new ContentPayloadValidator();

    @Test
    void reportsWhenFileSchemaDoesNotMatchSelectedContentType() throws Exception {
        var wrongDomainRow = new ParsedImportRow(1,
                new ObjectMapper().readTree("""
                        {"title":"Present Simple","rule":"S + V"}
                        """));

        assertThatThrownBy(() -> validator.validateFileShape(ContentType.VOCABULARY, List.of(wrongDomainRow)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Nội dung file không đúng chuẩn")
                .hasMessageContaining("Từ vựng");
    }


    @Test
    void keepsMissingFieldValidationForRowsWithMatchingContentTypeShape() throws Exception {
        var partialVocabularyRow = new ParsedImportRow(1,
                new ObjectMapper().readTree("""
                        {"word":"schedule"}
                        """));

        validator.validateFileShape(ContentType.VOCABULARY, List.of(partialVocabularyRow));
        var result = validator.validate(ContentType.VOCABULARY, partialVocabularyRow.data());

        assertThat(result.errors()).anyMatch(error -> error.contains("meaning"));
    }

    @Test
    void normalizesVocabularyAndItsArrayFields() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "word": "  Schedule ",
                  "meaning": " A plan of activities ",
                  "partOfSpeech": " noun ",
                  "synonyms": "[\\"timetable\\", \\" agenda \\"]",
                  "audioUrl": "https://cdn.example.com/schedule.mp3"
                }
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("word").asText()).isEqualTo("Schedule");
        assertThat(result.normalizedData().path("pos").asText()).isEqualTo("Noun");
        assertThat(result.normalizedData().path("synonyms").get(1).asText()).isEqualTo("agenda");
        assertThat(result.normalizedData().path("audioUrl").asText()).isEqualTo("https://cdn.example.com/schedule.mp3");
        assertThat(result.dedupeKey()).hasSize(64);
    }

    @Test
    void preservesVocabularySetName() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {"word":"schedule","meaning":"lịch trình","setId":"import-custom","setName":"TOEIC Office"}
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("setId").asText()).isEqualTo("import-custom");
        assertThat(result.normalizedData().path("setName").asText()).isEqualTo("TOEIC Office");
    }

    @Test
    void normalizesVocabularyWithMultipleSensesAndWordFamily() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "word": "work",
                  "senses": [
                    {"part_of_speech":"danh từ","sub_category":"Abstract noun","meaning_vi":"công việc","example_en":"The work is complete."},
                    {"pos":"v.","meaning":"làm việc"}
                  ],
                  "word_family": "worker, workplace"
                }
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("pos").asText()).isEqualTo("Noun");
        assertThat(result.normalizedData().path("meaning").asText()).isEqualTo("công việc");
        assertThat(result.normalizedData().path("wordFamily").asText()).isEqualTo("worker, workplace");
        assertThat(result.normalizedData().path("senses")).hasSize(2);
        assertThat(result.normalizedData().path("senses").get(0).path("subCategory").asText())
                .isEqualTo("Abstract noun");
        assertThat(result.normalizedData().path("senses").get(1).path("partOfSpeech").asText())
                .isEqualTo("Verb");
    }

    @Test
    void normalizesVocabularyPartOfSpeechAliasesToCanonicalLabels() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "word": "record",
                  "senses": [
                    {"partOfSpeech": "Động từ (Verb)", "meaning": "ghi lại"},
                    {"partOfSpeech": "v.", "meaning": "lưu lại"},
                    {"partOfSpeech": "Danh từ / N", "meaning": "bản ghi"}
                  ]
                }
                """);

        var result = validator.validate(ContentType.VOCABULARY, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("senses").get(0).path("partOfSpeech").asText())
                .isEqualTo("Verb");
        assertThat(result.normalizedData().path("senses").get(1).path("partOfSpeech").asText())
                .isEqualTo("Verb");
        assertThat(result.normalizedData().path("senses").get(2).path("partOfSpeech").asText())
                .isEqualTo("Noun");
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

    @Test
    void normalizesGrammarPayloadWithExtendedFields() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "title": " Present Simple ",
                  "rule": " S + V(s/es) ",
                  "explanation": " Diễn tả thói quen hoặc sự thật. ",
                  "part": "Part 5",
                  "level": "350-500",
                  "examples": [
                    "She works every day.",
                    {"sentence":"He plays tennis.","translation":"Anh ấy chơi tennis."}
                  ],
                  "signalWords": "always|usually|often",
                  "traps": ["Bẫy chia động từ ngôi thứ 3 số ít"]
                }
                """);

        var result = validator.validate(ContentType.GRAMMAR, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("title").asText()).isEqualTo("Present Simple");
        assertThat(result.normalizedData().path("rule").asText()).isEqualTo("S + V(s/es)");
        assertThat(result.normalizedData().path("explanation").asText()).isEqualTo("Diễn tả thói quen hoặc sự thật.");
        assertThat(result.normalizedData().path("part").asText()).isEqualTo("PART_5");
        assertThat(result.normalizedData().path("examples")).hasSize(2);
        assertThat(result.normalizedData().path("signalWords")).hasSize(3);
        assertThat(result.normalizedData().path("traps")).hasSize(1);
    }

    @Test
    void acceptsAndPreservesGrammarSourceFieldsAndGradedQuestions() throws Exception {
        var parsed = new ImportFileParser().parse(new org.springframework.mock.web.MockMultipartFile(
                "file", "grammar-topic.json", "application/json",
                """
                {
                  "topicCode":"CD_01",
                  "codeName":"Phat_Am",
                  "titleVi":"Phát Âm",
                  "titleEn":"Pronunciation",
                  "category":"Ngữ Âm",
                  "description":"Nền tảng phát âm.",
                  "coreTheory":"### Quy tắc\\nNội dung lý thuyết.",
                  "signalClues":"Dấu hiệu nhận biết.",
                  "tipsAndTricks":"Mẹo ghi nhớ.",
                  "commonTraps":"Các lỗi dễ nhầm.",
                  "gradedQuestions":[{
                    "id":1,
                    "question":"Chọn đáp án đúng.",
                    "options":{"A":"A","B":"B","C":"C","D":"D"},
                    "correctAnswer":"B",
                    "translation":{"questionVi":"Chọn đáp án đúng."},
                    "solutionMethod":"Giải thích đáp án."
                  }],
                  "summaryTable":"| Quy tắc | Ví dụ |",
                  "reference":"Tài liệu tham khảo"
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8)), ContentType.GRAMMAR);

        assertThat(parsed).hasSize(1);
        var result = validator.validate(ContentType.GRAMMAR, parsed.getFirst().data());

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("title").asText()).isEqualTo("Phát Âm");
        assertThat(result.normalizedData().path("englishTitle").asText()).isEqualTo("Pronunciation");
        assertThat(result.normalizedData().path("code").asText()).isEqualTo("CD_01");
        assertThat(result.normalizedData().path("codeName").asText()).isEqualTo("Phat_Am");
        assertThat(result.normalizedData().path("category").asText()).isEqualTo("Ngữ Âm");
        assertThat(result.normalizedData().path("rule").asText()).contains("Nội dung lý thuyết");
        assertThat(result.normalizedData().path("explanation").asText()).isEqualTo("Nền tảng phát âm.");
        assertThat(result.normalizedData().path("signalClues").asText()).isEqualTo("Dấu hiệu nhận biết.");
        assertThat(result.normalizedData().path("tipsAndTricks").asText()).isEqualTo("Mẹo ghi nhớ.");
        assertThat(result.normalizedData().path("commonTraps").asText()).isEqualTo("Các lỗi dễ nhầm.");
        assertThat(result.normalizedData().path("questions")).hasSize(1);
        assertThat(result.normalizedData().path("questions").get(0).path("translation").path("questionVi").asText())
                .isEqualTo("Chọn đáp án đúng.");
        assertThat(result.normalizedData().path("summaryTable").asText()).contains("Quy tắc");
        assertThat(result.normalizedData().path("reference").asText()).isEqualTo("Tài liệu tham khảo");
    }

    @Test
    void preservesStructuredGrammarHierarchyAndTopicFields() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "code": "NOUN-01",
                  "title": "Danh từ đếm được và không đếm được",
                  "englishTitle": "Countable and Uncountable Nouns",
                  "parentTitleVi": "Danh từ",
                  "grammarGroup": "parts_of_speech",
                  "targetScore": "ALL",
                  "part": "Part 5",
                  "toeicParts": ["Part 5", "Part 6"],
                  "difficulty": "EASY",
                  "status": "DRAFT",
                  "sourceNotes": "Imported from the nouns grammar source.",
                  "summary": "Phân biệt danh từ đếm được và không đếm được.",
                  "rule": "Determiner + Countable Noun",
                  "theory": {"definition": "A noun names a person, place, thing, or idea."},
                  "metadata": {"groupValues": {"parts_of_speech": {"wordType": "Noun"}}},
                  "signalWords": ["many", "much"],
                  "traps": ["Do not use much with countable nouns."],
                  "examples": [{
                    "sentence": "The manager reviewed the proposal.",
                    "translation": "Người quản lý đã xem xét bản đề xuất.",
                    "analysis": "Manager là danh từ làm chủ ngữ."
                  }]
                }
                """);

        var result = validator.validate(ContentType.GRAMMAR, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("parentTitleVi").asText()).isEqualTo("Danh từ");
        assertThat(result.normalizedData().path("grammarGroup").asText()).isEqualTo("parts_of_speech");
        assertThat(result.normalizedData().path("targetScore").asText()).isEqualTo("ALL");
        assertThat(result.normalizedData().path("status").asText()).isEqualTo("DRAFT");
        assertThat(result.normalizedData().path("sourceNotes").asText())
                .isEqualTo("Imported from the nouns grammar source.");
        assertThat(result.normalizedData().path("toeicParts")).hasSize(2);
        assertThat(result.normalizedData().path("theory").path("definition").asText()).contains("noun");
        assertThat(result.normalizedData().path("metadata").path("groupValues")
                .path("parts_of_speech").path("wordType").asText()).isEqualTo("Noun");
        assertThat(result.normalizedData().path("examples").get(0).path("analysis").asText())
                .contains("danh từ");
    }

    @Test
    void normalizesReadingPayloadWithPassagesTheorySampleQuestionsAndVocabularyAliases() throws Exception {
        var raw = new ObjectMapper().readTree("""
                {
                  "id": "rc-part7-test",
                  "title": "  Quarterly Shipping Update  ",
                  "category": "part7",
                  "subtitle": "  Email & Invoice  ",
                  "passages": [{"label": "Email", "text": "Your shipment has been dispatched."}],
                  "passageTextVi": "Lô hàng của bạn đã được gửi đi.",
                  "sampleQuestions": [
                    {
                      "questionNum": "153",
                      "question": "What is confirmed about the order?",
                      "options": ["It was shipped", "It was canceled", "It is delayed", "It needs payment"],
                      "correctIndex": 0
                    }
                  ],
                  "theory": {"summary": "Đọc tiêu đề và dòng đầu tiên email."},
                  "vocabulary": [{"word": "dispatch", "pos": "v", "meaning": "gửi đi"}]
                }
                """);

        validator.validateFileShape(ContentType.READING, List.of(new ParsedImportRow(1, raw)));
        var result = validator.validate(ContentType.READING, raw);

        assertThat(result.valid()).isTrue();
        assertThat(result.normalizedData().path("id").asText()).isEqualTo("rc-part7-test");
        assertThat(result.normalizedData().path("part").asText()).isEqualTo("PART_7");
        assertThat(result.normalizedData().path("content").asText()).isEqualTo("Your shipment has been dispatched.");
        assertThat(result.normalizedData().path("subtitle").asText()).isEqualTo("Email & Invoice");
        assertThat(result.normalizedData().path("questions")).hasSize(1);
        assertThat(result.normalizedData().path("theory").path("summary").asText()).contains("tiêu đề");
        assertThat(result.normalizedData().path("vocabList")).hasSize(1);
        assertThat(result.normalizedData().path("vocabList").get(0).path("word").asText()).isEqualTo("dispatch");
    }
}
