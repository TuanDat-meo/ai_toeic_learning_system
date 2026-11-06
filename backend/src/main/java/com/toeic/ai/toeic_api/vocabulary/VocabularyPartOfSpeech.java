package com.toeic.ai.toeic_api.vocabulary;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class VocabularyPartOfSpeech {

    private static final Map<String, List<String>> ALIASES = Map.of(
            "Noun", List.of("noun", "n", "danh tu"),
            "Verb", List.of("verb", "v", "dong tu", "phrasal verb", "modal verb", "auxiliary verb"),
            "Adjective", List.of("adjective", "adj", "a", "tinh tu"),
            "Adverb", List.of("adverb", "adv", "trang tu", "pho tu"),
            "Pronoun", List.of("pronoun", "pron", "dai tu"),
            "Preposition", List.of("preposition", "prep", "gioi tu"),
            "Conjunction", List.of("conjunction", "conj", "lien tu"),
            "Interjection", List.of("interjection", "interj", "than tu"),
            "Determiner", List.of("determiner", "det", "tu han dinh"),
            "Phrase", List.of("phrase", "phr", "cum tu", "cum dong tu", "cum danh tu",
                    "cum gioi tu", "prepositional phrase", "noun phrase", "verb phrase", "adjective phrase",
                    "adverb phrase", "conjunction phrase"));

    private VocabularyPartOfSpeech() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) return "";
        List<String> parts = List.of(value.split("\\s*(?:/|\\||;|,|\\bor\\b)\\s*"));
        if (parts.size() > 1) {
            LinkedHashSet<String> normalizedParts = new LinkedHashSet<>();
            for (String part : parts) {
                String normalized = normalizeSingle(part);
                if (normalized.isBlank()) return value.trim();
                normalizedParts.add(normalized);
            }
            return String.join(" / ", normalizedParts);
        }
        return normalizeSingle(value);
    }

    private static String normalizeSingle(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
        if (normalized.isBlank()) return "";

        List<String> matches = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : ALIASES.entrySet()) {
            if (entry.getValue().stream().map(VocabularyPartOfSpeech::normalizeAlias).anyMatch(alias ->
                    normalized.equals(alias) || normalized.startsWith(alias + " ")
                            || normalized.endsWith(" " + alias) || normalized.contains(" " + alias + " "))) {
                matches.add(entry.getKey());
            }
        }
        return matches.size() == 1 ? matches.get(0) : value.trim();
    }

    private static String normalizeAlias(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }
}
