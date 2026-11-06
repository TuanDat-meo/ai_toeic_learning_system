package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayOutputStream;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

class ImportFileParserTest {
    private final ImportFileParser parser = new ImportFileParser();

    @Test
    void parsesJsonArrayAndKeepsSourceRowNumbers() {
        var file = new MockMultipartFile("file", "vocab.json", "application/json",
                """
                {"items":[{"word":"apple","meaning":"fruit"},{"word":"orange","meaning":"fruit"}]}
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file);

        assertThat(rows).hasSize(2);
        assertThat(rows.get(1).rowNumber()).isEqualTo(2);
        assertThat(rows.get(1).data().path("word").asText()).isEqualTo("orange");
    }

    @Test
    void mapsVocabularySetJsonUsedByDataFolder() {
        var file = new MockMultipartFile("file", "vocabulary.json", "application/json",
                """
                {
                  "themeEn":"Office",
                  "words":[
                    {
                      "word":"schedule",
                      "partOfSpeech":"noun",
                      "meaningVi":"lịch trình",
                      "ipa":"/ˈskedʒuːl/",
                      "examples":[{"sentenceEn":"Check the schedule.","sentenceVi":"Kiểm tra lịch trình."}],
                      "audioFile":"Audio/Set_01/schedule.mp3"
                    }
                  ]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.VOCABULARY);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("word").asText()).isEqualTo("schedule");
        assertThat(rows.getFirst().data().path("meaning").asText()).isEqualTo("lịch trình");
        assertThat(rows.getFirst().data().path("exampleEn").asText()).isEqualTo("Check the schedule.");
        assertThat(rows.getFirst().data().has("audioUrl")).isFalse();
    }

    @Test
    void preservesVocabularySetMetadataOnEachWord() {
        var file = new MockMultipartFile("file", "vocabulary.json", "application/json",
                """
                {
                  "topic":"Office",
                  "setId":"office-set",
                  "words":[
                    {"word":"schedule","meaning":"lịch trình","topic":"Travel","setId":"travel-set"},
                    {"word":"meeting","meaning":"cuộc họp"}
                  ]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.VOCABULARY);

        assertThat(rows.get(0).data().path("topic").asText()).isEqualTo("Travel");
        assertThat(rows.get(0).data().path("setId").asText()).isEqualTo("travel-set");
        assertThat(rows.get(1).data().path("topic").asText()).isEqualTo("Office");
        assertThat(rows.get(1).data().path("setId").asText()).isEqualTo("office-set");
    }

    @Test
    void mapsKnownDataShapesInsideItemsWrapper() {
        var file = new MockMultipartFile("file", "vocabulary.json", "application/json",
                """
                {
                  "items":[
                    {
                      "setName":"Business",
                      "words":[{"word":"schedule","meaningVi":"lịch trình"}]
                    }
                  ]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.VOCABULARY);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("word").asText()).isEqualTo("schedule");
        assertThat(rows.getFirst().data().path("meaning").asText()).isEqualTo("lịch trình");
        assertThat(rows.getFirst().data().path("category").asText()).isEqualTo("Business");
    }

    @Test
    void mapsEtsQuestionsJsonToQuestionRows() {
        var file = new MockMultipartFile("file", "ets-test.json", "application/json",
                """
                {
                  "testCode":"ETS_2022_TEST_01",
                  "questions":[
                    {
                      "questionNumber":1,
                      "part":"Part 1: Photographs",
                      "questionEn":"A person is working.",
                      "options":{"A":"First","B":"Second","C":"Third","D":"Fourth"},
                      "correctAnswer":"B",
                      "explanation":"Choice B is correct.",
                      "difficultyLevel":{"level":1}
                    }
                  ]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.QUESTION);
        var validation = new ContentPayloadValidator().validate(ContentType.QUESTION, rows.getFirst().data());

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("part").asText()).isEqualTo("PART_1");
        assertThat(rows.getFirst().data().path("questionText").asText()).isEqualTo("A person is working.");
        assertThat(rows.getFirst().data().path("options")).hasSize(4);
        assertThat(rows.getFirst().data().path("code").asText()).isEqualTo("ETS_2022_TEST_01_1");
        assertThat(validation.valid()).isTrue();
    }

    @Test
    void mapsGrammarTopicJsonToOneGrammarRow() {
        var file = new MockMultipartFile("file", "grammar.json", "application/json",
                """
                {
                  "topicCode":"CD_01",
                  "codeName":"Phat_Am",
                  "titleVi":"Thì hiện tại đơn",
                  "titleEn":"Present Simple",
                  "category":"Ngữ Pháp TOEIC",
                  "description":"Dùng cho thói quen và sự thật.",
                  "coreTheory":"S + V(s/es)",
                  "signalClues":"always|usually",
                  "tipsAndTricks":"Thêm s/es.",
                  "commonTraps":"Bẫy chia động từ.",
                  "gradedQuestions":[{"question":"Example","options":{"A":"go","B":"goes"}}],
                  "summaryTable":"| Subject | Verb |",
                  "reference":"Grammar reference"
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.GRAMMAR);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("title").asText()).isEqualTo("Thì hiện tại đơn");
        assertThat(rows.getFirst().data().path("rule").asText()).isEqualTo("S + V(s/es)");
        assertThat(rows.getFirst().data().path("explanation").asText()).isEqualTo("Dùng cho thói quen và sự thật.");
        assertThat(rows.getFirst().data().path("code").asText()).isEqualTo("CD_01");
        assertThat(rows.getFirst().data().path("codeName").asText()).isEqualTo("Phat_Am");
        assertThat(rows.getFirst().data().path("category").asText()).isEqualTo("Ngữ Pháp TOEIC");
        assertThat(rows.getFirst().data().path("signalClues").asText()).isEqualTo("always|usually");
        assertThat(rows.getFirst().data().path("tipsAndTricks").asText()).isEqualTo("Thêm s/es.");
        assertThat(rows.getFirst().data().path("commonTraps").asText()).isEqualTo("Bẫy chia động từ.");
        assertThat(rows.getFirst().data().path("questions")).hasSize(1);
        assertThat(rows.getFirst().data().path("questions").get(0).path("options").path("B").asText())
                .isEqualTo("goes");
        assertThat(rows.getFirst().data().path("summaryTable").asText()).isEqualTo("| Subject | Verb |");
        assertThat(rows.getFirst().data().path("reference").asText()).isEqualTo("Grammar reference");
    }

    @Test
    void mapsListeningAudioUnitsAndReportsLocalMediaAsMissingUrl() {
        var file = new MockMultipartFile("file", "listening.json", "application/json",
                """
                {
                  "audioUnits":[
                    {
                      "unitId":"ETS_T01_P1_Q01",
                      "testCode":"ETS_2022_TEST_01",
                      "partNumber":1,
                      "audioFile":"Audio_Cat_Tung_Cau/Test_01/q1.mp3",
                      "transcriptEn":"A person is working."
                    }
                  ]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.LISTENING);
        var validation = new ContentPayloadValidator().validate(ContentType.LISTENING, rows.getFirst().data());

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("part").asText()).isEqualTo("PART_1");
        assertThat(rows.getFirst().data().path("transcript").asText()).isEqualTo("A person is working.");
        assertThat(rows.getFirst().data().path("source").asText())
                .isEqualTo("Audio_Cat_Tung_Cau/Test_01/q1.mp3");
        assertThat(validation.errors()).anyMatch(error -> error.contains("audioUrl"));
    }

    @Test
    void rejectsEtsQuestionOnlyJsonWhenImportedAsReading() {
        var file = new MockMultipartFile("file", "ets-reading.json", "application/json",
                """
                {
                  "testCode":"ETS_2022_TEST_01",
                  "reading":{"part5":[{"questionNumber":101,"questionEn":"Choose the word."}]}
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        assertThatThrownBy(() -> parser.parse(file, ContentType.READING))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không có nội dung đoạn văn Reading")
                .hasMessageContaining("chọn loại Câu hỏi");
    }

    @Test
    void mapsEtsTestJsonToMockTestAndKeepsQuestionCodesConsistent() {
        var file = new MockMultipartFile("file", "ets-mock.json", "application/json",
                """
                {
                  "testCode":"ETS_2022_TEST_01",
                  "title":"ETS Test 01",
                  "description":"Full TOEIC test",
                  "questions":[{"questionNumber":1},{"questionNumber":2}]
                }
                """.getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file, ContentType.MOCK_TEST);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("title").asText()).isEqualTo("ETS Test 01");
        assertThat(rows.getFirst().data().path("durationMinutes").asInt()).isEqualTo(120);
        assertThat(rows.getFirst().data().path("questionCodes").toString())
                .isEqualTo("[\"ETS_2022_TEST_01_1\",\"ETS_2022_TEST_01_2\"]");
    }

    @Test
    void parsesCsvWithUtf8BomAndQuotedCommas() {
        var file = new MockMultipartFile("file", "grammar.csv", "text/csv",
                ("\uFEFFtitle,rule,explanation\nPresent Simple,Use for routines,\"A, B and C\"\n")
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8));

        var rows = parser.parse(file);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("explanation").asText()).isEqualTo("A, B and C");
    }

    @Test
    void parsesFirstSheetFromXlsx() throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            var sheet = workbook.createSheet("Vocabulary");
            var header = sheet.createRow(0);
            header.createCell(0).setCellValue("word");
            header.createCell(1).setCellValue("meaning");
            var row = sheet.createRow(1);
            row.createCell(0).setCellValue("schedule");
            row.createCell(1).setCellValue("a plan");
            workbook.write(output);
        }
        var file = new MockMultipartFile("file", "vocabulary.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());

        var rows = parser.parse(file);

        assertThat(rows).hasSize(1);
        assertThat(rows.getFirst().data().path("meaning").asText()).isEqualTo("a plan");
    }

    @Test
    void rejectsUnsupportedFileExtensions() {
        var file = new MockMultipartFile("file", "content.pdf", "application/pdf", new byte[] { 1 });

        assertThatThrownBy(() -> parser.parse(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CSV, XLSX hoặc JSON");
    }
}
