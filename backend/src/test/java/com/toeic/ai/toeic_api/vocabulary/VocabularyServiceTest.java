package com.toeic.ai.toeic_api.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VocabularyServiceTest {

    @Test
    void createsAudioUrlForVocabularyWithOptionalParentheticalText() {
        assertThat(VocabularyService.vocabularyAudioUrl("", "according (to)"))
                .isEqualTo("/api/dictionary/audio?word=according+to");
    }

    @Test
    void doesNotCreateAudioUrlForUnsupportedPunctuation() {
        assertThat(VocabularyService.vocabularyAudioUrl("", "word/example")).isEmpty();
    }
}
