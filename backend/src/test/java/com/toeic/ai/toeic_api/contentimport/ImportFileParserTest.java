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
