package com.toeic.ai.toeic_api.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VocabularyPartOfSpeechTest {

    @Test
    void normalizesEnglishAndVietnameseAliasesToOneLabel() {
        assertThat(VocabularyPartOfSpeech.normalize("Động từ (Verb)")).isEqualTo("Verb");
        assertThat(VocabularyPartOfSpeech.normalize("v.")).isEqualTo("Verb");
        assertThat(VocabularyPartOfSpeech.normalize("Danh từ / N")).isEqualTo("Noun");
    }

    @Test
    void keepsMultipleCanonicalPartsOfSpeechDistinctAndConsistent() {
        assertThat(VocabularyPartOfSpeech.normalize("Danh từ / Động từ"))
                .isEqualTo("Noun / Verb");
        assertThat(VocabularyPartOfSpeech.normalize("Phrasal Verb"))
                .isEqualTo("Verb");
    }
}
