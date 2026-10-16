package com.toeic.ai.toeic_api.contentimport;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class ContentPayloadValidator {
    private static final Set<String> VOCABULARY_FIELDS = Set.of(
            "word", "meaning", "pos", "partOfSpeech", "ipa", "example", "exampleEn",
            "exampleVi", "topic", "level", "synonyms", "antonyms", "collocations");
    private static final Set<String> GRAMMAR_FIELDS = Set.of(
            "title", "rule", "explanation", "part", "examples", "level");
    private static final Set<String> LISTENING_FIELDS = Set.of(
            "title", "part", "transcript", "audioUrl", "durationSeconds", "source", "difficulty");
    private static final Set<String> READING_FIELDS = Set.of(
            "title", "part", "content", "topic", "difficulty", "source");
    private static final Set<String> QUESTION_FIELDS = Set.of(
            "part", "questionText", "passage", "options", "correctAnswer", "explanation",
            "skill", "difficulty", "imageUrl", "audioUrl", "code");
    private static final Set<String> MOCK_TEST_FIELDS = Set.of(
            "title", "description", "durationMinutes", "questionCodes", "level");

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ValidationResult validate(ContentType type, JsonNode raw) {
        ObjectNode normalized = objectMapper.createObjectNode();
        List<String> errors = new ArrayList<>();
        Set<String> allowedFields = fieldsFor(type);
        raw.fieldNames().forEachRemaining(field -> {
            if (!allowedFields.contains(field)) {
                errors.add("Không nhận diện được cột \"" + field + "\".");
            }
        });

        switch (type) {
            case VOCABULARY -> normalizeVocabulary(raw, normalized, errors);
            case GRAMMAR -> normalizeGrammar(raw, normalized, errors);
            case LISTENING -> normalizeListening(raw, normalized, errors);
            case READING -> normalizeReading(raw, normalized, errors);
            case QUESTION -> normalizeQuestion(raw, normalized, errors);
            case MOCK_TEST -> normalizeMockTest(raw, normalized, errors);
        }

        String title = titleFor(type, normalized);
        if (title.length() > 500) {
            errors.add("Tiêu đề không được vượt quá 500 ký tự.");
        }
        return new ValidationResult(normalized, List.copyOf(errors), digest(identityFor(type, normalized)), title);
    }

    private void normalizeVocabulary(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "word", errors, true);
        copyText(raw, out, "meaning", errors, true);
        copyText(raw, out, "pos", errors, false);
        if (!raw.has("pos")) copyText(raw, out, "partOfSpeech", errors, false);
        copyText(raw, out, "ipa", errors, false);
        copyText(raw, out, "example", errors, false);
        copyText(raw, out, "exampleEn", errors, false);
        copyText(raw, out, "exampleVi", errors, false);
        copyText(raw, out, "topic", errors, false);
        copyText(raw, out, "level", errors, false);
        normalizeStringArray(raw, out, "synonyms", errors);
        normalizeStringArray(raw, out, "antonyms", errors);
        normalizeStringArray(raw, out, "collocations", errors);
    }

    private void normalizeGrammar(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "title", errors, true);
        copyText(raw, out, "rule", errors, true);
        copyText(raw, out, "explanation", errors, true);
        copyText(raw, out, "part", errors, false);
        if (out.has("part")) normalizePart(out, "part", errors);
        copyText(raw, out, "level", errors, false);
        normalizeStringArray(raw, out, "examples", errors);
    }

    private void normalizeListening(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "title", errors, true);
        copyText(raw, out, "part", errors, true);
        copyText(raw, out, "transcript", errors, true);
        copyText(raw, out, "audioUrl", errors, true);
        copyText(raw, out, "source", errors, false);
        copyText(raw, out, "difficulty", errors, false);
        if (out.has("part")) {
            normalizePart(out, "part", errors);
            String part = out.path("part").asText();
            if (part.matches("PART_[5-7]")) errors.add("Listening chỉ hỗ trợ Part 1 đến Part 4.");
        }
        if (out.has("difficulty")) normalizeDifficulty(out, "difficulty", errors);
        validateUrl(out, "audioUrl", errors);
        copyInteger(raw, out, "durationSeconds", errors, false, 1, 86_400);
    }

    private void normalizeReading(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "title", errors, true);
        copyText(raw, out, "content", errors, true);
        copyText(raw, out, "part", errors, false);
        copyText(raw, out, "topic", errors, false);
        copyText(raw, out, "difficulty", errors, false);
        copyText(raw, out, "source", errors, false);
        if (out.has("part")) {
            normalizePart(out, "part", errors);
            if (!Set.of("PART_6", "PART_7").contains(out.path("part").asText())) {
                errors.add("Bài Reading chỉ hỗ trợ Part 6 hoặc Part 7.");
            }
        }
        if (out.has("difficulty")) normalizeDifficulty(out, "difficulty", errors);
    }

    private void normalizeQuestion(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "part", errors, true);
        copyText(raw, out, "questionText", errors, true);
        copyText(raw, out, "passage", errors, false);
        copyText(raw, out, "correctAnswer", errors, true);
        copyText(raw, out, "explanation", errors, true);
        copyText(raw, out, "skill", errors, true);
        copyText(raw, out, "difficulty", errors, true);
        copyText(raw, out, "imageUrl", errors, false);
        copyText(raw, out, "audioUrl", errors, false);
        copyText(raw, out, "code", errors, false);
        normalizePart(out, "part", errors);
        normalizeDifficulty(out, "difficulty", errors);
        validateUrl(out, "imageUrl", errors);
        validateUrl(out, "audioUrl", errors);
        normalizeOptions(raw, out, errors);
    }

    private void normalizeMockTest(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "title", errors, true);
        copyText(raw, out, "description", errors, true);
        copyText(raw, out, "level", errors, false);
        copyInteger(raw, out, "durationMinutes", errors, true, 1, 600);
        normalizeStringArray(raw, out, "questionCodes", errors);
        if (!out.has("questionCodes") || out.withArray("questionCodes").isEmpty()) {
            errors.add("Đề thi phải có ít nhất một mã câu hỏi.");
        } else {
            Set<String> uniqueCodes = new java.util.HashSet<>();
            out.withArray("questionCodes").forEach(code -> {
                if (!uniqueCodes.add(canonicalize(code.asText()))) {
                    errors.add("Mã câu hỏi trong đề thi bị lặp: " + code.asText() + ".");
                }
            });
        }
    }

    private void copyText(JsonNode raw, ObjectNode out, String field, List<String> errors, boolean required) {
        JsonNode value = raw.get(field);
        if (value == null && field.equals("pos")) value = raw.get("partOfSpeech");
        if (value == null || value.isNull()) {
            if (required) errors.add("Thiếu trường bắt buộc \"" + field + "\".");
            return;
        }
        if (!value.isValueNode()) {
            errors.add("Trường \"" + field + "\" phải là văn bản.");
            return;
        }
        String normalized = normalizeText(value.asText());
        if (normalized.isBlank()) {
            if (required) errors.add("Trường \"" + field + "\" không được để trống.");
            return;
        }
        out.put(field, normalized);
    }

    private void copyInteger(JsonNode raw, ObjectNode out, String field, List<String> errors,
            boolean required, int min, int max) {
        JsonNode value = raw.get(field);
        if (value == null || value.isNull() || (value.isTextual() && value.asText().isBlank())) {
            if (required) errors.add("Thiếu trường bắt buộc \"" + field + "\".");
            return;
        }
        try {
            int number = Integer.parseInt(value.asText().trim());
            if (number < min || number > max) {
                errors.add("Trường \"" + field + "\" phải nằm trong khoảng " + min + "–" + max + ".");
                return;
            }
            out.put(field, number);
        } catch (NumberFormatException exception) {
            errors.add("Trường \"" + field + "\" phải là số nguyên.");
        }
    }

    private void normalizeStringArray(JsonNode raw, ObjectNode out, String field, List<String> errors) {
        JsonNode value = raw.get(field);
        if (value == null || value.isNull() || (value.isTextual() && value.asText().isBlank())) {
            return;
        }
        JsonNode array = value;
        if (value.isTextual()) {
            String text = value.asText().trim();
            if (text.startsWith("[")) {
                try {
                    array = objectMapper.readTree(text);
                } catch (Exception exception) {
                    errors.add("Trường \"" + field + "\" phải là mảng JSON hợp lệ.");
                    return;
                }
            } else {
                ArrayNode split = objectMapper.createArrayNode();
                for (String part : text.split("\\|")) {
                    if (!part.isBlank()) split.add(part);
                }
                array = split;
            }
        }
        if (!array.isArray()) {
            errors.add("Trường \"" + field + "\" phải là một mảng.");
            return;
        }
        ArrayNode normalized = objectMapper.createArrayNode();
        for (JsonNode item : array) {
            if (!item.isValueNode()) {
                errors.add("Mỗi phần tử trong \"" + field + "\" phải là văn bản.");
                continue;
            }
            String text = normalizeText(item.asText());
            if (!text.isBlank()) normalized.add(text);
        }
        out.set(field, normalized);
    }

    private void normalizeOptions(JsonNode raw, ObjectNode out, List<String> errors) {
        JsonNode options = raw.get("options");
        if (options == null || options.isNull()) {
            errors.add("Thiếu trường bắt buộc \"options\".");
            return;
        }
        if (options.isTextual()) {
            try {
                options = objectMapper.readTree(options.asText());
            } catch (Exception exception) {
                errors.add("Trường \"options\" phải là mảng JSON hợp lệ.");
                return;
            }
        }
        if (!options.isArray() || options.size() < 2 || options.size() > 4) {
            errors.add("Câu hỏi cần có từ 2 đến 4 lựa chọn.");
            return;
        }
        String answer = out.path("correctAnswer").asText().toUpperCase(Locale.ROOT);
        out.put("correctAnswer", answer);
        ArrayNode normalizedOptions = objectMapper.createArrayNode();
        Set<String> optionIds = new java.util.HashSet<>();
        int index = 0;
        for (JsonNode option : options) {
            if (!option.isObject()) {
                errors.add("Mỗi lựa chọn phải là object có id và text.");
                index++;
                continue;
            }
            String id = normalizeText(option.path("id").asText(String.valueOf((char) ('A' + index))))
                    .toUpperCase(Locale.ROOT);
            String text = normalizeText(option.path("text").asText());
            if (id.isBlank() || text.isBlank()) {
                errors.add("Mỗi lựa chọn cần có mã và nội dung.");
            }
            if (!optionIds.add(id)) {
                errors.add("Mã lựa chọn bị trùng: " + id + ".");
            }
            ObjectNode normalizedOption = objectMapper.createObjectNode();
            normalizedOption.put("id", id);
            normalizedOption.put("text", text);
            normalizedOption.put("isCorrect", id.equals(answer));
            normalizedOptions.add(normalizedOption);
            index++;
        }
        if (!optionIds.contains(answer)) {
            errors.add("Đáp án đúng phải khớp mã của một lựa chọn.");
        }
        out.set("options", normalizedOptions);
    }

    private void normalizePart(ObjectNode out, String field, List<String> errors) {
        if (!out.has(field)) return;
        String part = out.path(field).asText().toUpperCase(Locale.ROOT)
                .replaceAll("[\\s-]+", "_");
        if (part.matches("[1-7]")) part = "PART_" + part;
        if (!part.matches("PART_[1-7]")) {
            errors.add("Trường \"" + field + "\" phải là Part 1 đến Part 7.");
            return;
        }
        out.put(field, part);
    }

    private void normalizeDifficulty(ObjectNode out, String field, List<String> errors) {
        if (!out.has(field)) return;
        String value = out.path(field).asText().toUpperCase(Locale.ROOT);
        if (value.equals("EASY") || value.equals("MEDIUM") || value.equals("HARD")) {
            out.put(field, value);
        } else {
            errors.add("Trường \"" + field + "\" chỉ nhận EASY, MEDIUM hoặc HARD.");
        }
    }

    private void validateUrl(ObjectNode out, String field, List<String> errors) {
        if (!out.has(field)) return;
        try {
            var uri = java.net.URI.create(out.path(field).asText());
            if (!Set.of("http", "https").contains(uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT))
                    || uri.getHost() == null) {
                errors.add("Trường \"" + field + "\" phải là URL http hoặc https hợp lệ.");
            }
        } catch (IllegalArgumentException exception) {
            errors.add("Trường \"" + field + "\" phải là URL http hoặc https hợp lệ.");
        }
    }

    private Set<String> fieldsFor(ContentType type) {
        return switch (type) {
            case VOCABULARY -> VOCABULARY_FIELDS;
            case GRAMMAR -> GRAMMAR_FIELDS;
            case LISTENING -> LISTENING_FIELDS;
            case READING -> READING_FIELDS;
            case QUESTION -> QUESTION_FIELDS;
            case MOCK_TEST -> MOCK_TEST_FIELDS;
        };
    }

    private String titleFor(ContentType type, ObjectNode data) {
        return switch (type) {
            case VOCABULARY -> data.path("word").asText("Từ vựng");
            case QUESTION -> data.path("questionText").asText("Câu hỏi");
            default -> data.path("title").asText(type.name());
        };
    }

    private String identityFor(ContentType type, ObjectNode data) {
        return switch (type) {
            case VOCABULARY -> data.path("word").asText();
            case GRAMMAR -> data.path("title").asText() + "|" + data.path("rule").asText();
            case LISTENING -> data.path("title").asText() + "|" + data.path("transcript").asText();
            case READING -> data.path("title").asText() + "|" + data.path("content").asText();
            case QUESTION -> {
                String code = data.path("code").asText();
                if (!code.isBlank()) yield "CODE|" + code;
                List<String> options = new ArrayList<>();
                data.path("options").forEach(option -> options.add(option.path("text").asText()));
                yield data.path("part").asText() + "|" + data.path("questionText").asText() + "|"
                        + String.join("|", options) + "|" + data.path("correctAnswer").asText();
            }
            case MOCK_TEST -> data.path("title").asText();
        };
    }

    private String digest(String identity) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(
                    canonicalize(identity).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required by the Java runtime.", exception);
        }
    }

    private String canonicalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKC)
                .trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        return Normalizer.normalize(value.replace("\r\n", "\n").replace('\r', '\n'),
                Normalizer.Form.NFC).trim();
    }

    public record ValidationResult(ObjectNode normalizedData, List<String> errors,
            String dedupeKey, String title) {
        public boolean valid() {
            return errors.isEmpty();
        }
    }
}
