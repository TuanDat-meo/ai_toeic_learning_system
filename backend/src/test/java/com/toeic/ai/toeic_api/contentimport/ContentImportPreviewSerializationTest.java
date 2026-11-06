package com.toeic.ai.toeic_api.contentimport;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class ContentImportPreviewSerializationTest {
    private final ContentImportService service = new ContentImportService(
            new JdbcTemplate(), null, null, null, null);

    @Test
    void convertsStoredJsonObjectsToPlainMapsForApiResponses() {
        var result = service.readJsonObject("""
                {
                  "word":"factor",
                  "meaning":"nhân tố",
                  "examples":[{"sentenceEn":"Review the factor."}]
                }
                """);

        assertThat(result)
                .containsEntry("word", "factor")
                .containsEntry("meaning", "nhân tố")
                .containsKey("examples")
                .doesNotContainKey("array")
                .doesNotContainKey("bigDecimal");
    }

    @Test
    void convertsNullOrNonObjectStoredJsonToAnEmptyMap() {
        assertThat(service.readJsonObject(null)).isEmpty();
        assertThat(service.readJsonObject("[1, 2, 3]")).isEmpty();
    }
}
