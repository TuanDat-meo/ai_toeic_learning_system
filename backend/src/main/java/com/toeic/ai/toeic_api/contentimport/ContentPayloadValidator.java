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
import com.toeic.ai.toeic_api.vocabulary.VocabularyPartOfSpeech;

@Component
public class ContentPayloadValidator {
    private static final Set<String> VOCABULARY_FIELDS = Set.of(
            "word", "meaning", "pos", "partOfSpeech", "ipa", "example", "exampleEn",
            "exampleVi", "topic", "category", "setName", "setId", "set_id", "level", "synonyms", "antonyms",
            "collocations", "audioUrl", "imageUrl", "senses", "subCategory", "sub_category",
            "wordFamily", "word_family");
    private static final Set<String> GRAMMAR_FIELDS = Set.of(
            "title", "titleVi", "titleEn", "englishTitle", "english_title",
            "code", "topicCode", "codeName", "category",
            "rule", "coreTheory", "formula", "explanation", "description", "summary",
            "part", "level", "targetScore", "target_score",
            "examples", "signalWords", "signal_words", "signalClues", "traps", "commonTraps",
            "tipsAndTricks", "summaryTable", "reference", "questions", "gradedQuestions",
            "imageUrl", "audioUrl");
    private static final Set<String> LISTENING_FIELDS = Set.of(
            "title", "part", "transcript", "audioUrl", "imageUrl", "durationSeconds", "source", "difficulty");
    private static final Set<String> READING_FIELDS = Set.of(
            "title", "part", "content", "topic", "difficulty", "source", "audioUrl", "imageUrl");
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

    public void validateFileShape(ContentType type, List<ParsedImportRow> rows) {
        Set<String> signatureFields = signatureFieldsFor(type);
        boolean hasMatchingShape = rows.stream().anyMatch(row -> {
            JsonNode data = row.data();
            for (String field : signatureFields) {
                if (data.has(field)) return true;
            }
            return false;
        });
        if (!hasMatchingShape) {
            throw new IllegalArgumentException("Nội dung file không đúng chuẩn cho mục \"" + labelFor(type)
                    + "\". Hãy kiểm tra loại dữ liệu đã chọn và cấu trúc file.");
        }
    }

    private Set<String> signatureFieldsFor(ContentType type) {
        return switch (type) {
            case VOCABULARY -> Set.of("word", "meaning", "meaningVi", "definitionEn");
            case GRAMMAR -> Set.of(
                    "title", "titleVi", "rule", "formula", "coreTheory", "englishTitle", "topicCode");
            case LISTENING -> Set.of("transcript", "transcriptEn", "audioUrl", "audioURL", "durationSeconds");
            case READING -> Set.of("content", "text", "passage", "body");
            case QUESTION -> Set.of("questionText", "questionEn", "question", "options", "correctAnswer");
            case MOCK_TEST -> Set.of("questionCodes", "questions", "durationMinutes", "testCode");
        };
    }

    private String labelFor(ContentType type) {
        return switch (type) {
            case VOCABULARY -> "Từ vựng";
            case GRAMMAR -> "Ngữ pháp";
            case LISTENING -> "Listening";
            case READING -> "Reading";
            case QUESTION -> "Câu hỏi";
            case MOCK_TEST -> "Đề thi thử";
        };
    }

    private void normalizeVocabulary(JsonNode raw, ObjectNode out, List<String> errors) {
        copyText(raw, out, "word", errors, true);
        copyText(raw, out, "meaning", errors, false);
        copyText(raw, out, "pos", errors, false);
        if (!raw.has("pos")) copyText(raw, out, "partOfSpeech", errors, false);
        normalizeVocabularySenses(raw, out, errors);
        if (out.path("meaning").asText().isBlank() && out.path("senses").isArray()
                && !out.path("senses").isEmpty()) {
            out.put("meaning", out.path("senses").get(0).path("meaning").asText());
        }
        if (out.path("meaning").asText().isBlank()) {
            errors.add("Thiếu trường bắt buộc \"meaning\" hoặc một nghĩa trong \"senses\".");
        }
        if (out.path("pos").asText().isBlank() && out.path("senses").isArray()
                && !out.path("senses").isEmpty()) {
            out.put("pos", out.path("senses").get(0).path("partOfSpeech").asText());
        }
        if (out.has("pos")) {
            out.put("pos", VocabularyPartOfSpeech.normalize(out.path("pos").asText()));
        }
        copyText(raw, out, "ipa", errors, false);
        copyText(raw, out, "example", errors, false);
        copyText(raw, out, "exampleEn", errors, false);
        copyText(raw, out, "exampleVi", errors, false);
        copyText(raw, out, "subCategory", errors, false);
        if (!raw.has("subCategory")) copyText(raw, out, "sub_category", errors, false);
        if (out.has("sub_category")) out.put("subCategory", out.remove("sub_category").asText());
        copyText(raw, out, "wordFamily", errors, false);
        if (!raw.has("wordFamily")) copyText(raw, out, "word_family", errors, false);
        if (out.has("word_family")) out.put("wordFamily", out.remove("word_family").asText());
        copyText(raw, out, "topic", errors, false);
        if (raw.has("category")) copyText(raw, out, "category", errors, false);
        if (raw.has("setName")) copyText(raw, out, "setName", errors, false);
        if (raw.has("setId")) {
            copyText(raw, out, "setId", errors, false);
        } else if (raw.has("set_id")) {
            copyText(raw, out, "set_id", errors, false);
            if (out.has("set_id")) out.put("setId", out.remove("set_id").asText());
        }
        copyText(raw, out, "level", errors, false);
        normalizeStringArray(raw, out, "synonyms", errors);
        normalizeStringArray(raw, out, "antonyms", errors);
        normalizeStringArray(raw, out, "collocations", errors);
        copyText(raw, out, "audioUrl", errors, false);
        copyText(raw, out, "imageUrl", errors, false);
        validateUrl(out, "audioUrl", errors);
        validateUrl(out, "imageUrl", errors);
    }

    private void normalizeVocabularySenses(JsonNode raw, ObjectNode out, List<String> errors) {
        if (!raw.has("senses")) return;
        JsonNode input = raw.path("senses");
        if (!input.isArray()) {
            errors.add("Trường \"senses\" phải là một mảng.");
            return;
        }
        ArrayNode senses = objectMapper.createArrayNode();
        int index = 0;
        for (JsonNode value : input) {
            if (!value.isObject()) {
                errors.add("Mỗi phần tử trong \"senses\" phải là object.");
                index++;
                continue;
            }
            String partOfSpeech = VocabularyPartOfSpeech.normalize(
                    firstText(value, "partOfSpeech", "part_of_speech", "pos"));
            String meaning = firstText(value, "meaning", "meaningVi", "meaning_vi");
            if (partOfSpeech.isBlank()) {
                errors.add("Nghĩa thứ " + (index + 1) + " cần có \"partOfSpeech\".");
            }
            if (meaning.isBlank()) {
                errors.add("Nghĩa thứ " + (index + 1) + " cần có \"meaning\".");
            }
            ObjectNode sense = objectMapper.createObjectNode();
            if (!partOfSpeech.isBlank()) sense.put("partOfSpeech", partOfSpeech);
            if (!meaning.isBlank()) sense.put("meaning", meaning);
            String subCategory = firstText(value, "subCategory", "sub_category");
            String example = firstText(value, "example", "exampleEn", "example_en");
            if (!subCategory.isBlank()) sense.put("subCategory", subCategory);
            if (!example.isBlank()) sense.put("example", example);
            senses.add(sense);
            index++;
        }
        out.set("senses", senses);
    }

    private String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value != null && value.isValueNode()) {
                String text = normalizeText(value.asText());
                if (!text.isBlank()) return text;
            }
        }
        return "";
    }

    private void normalizeGrammar(JsonNode raw, ObjectNode out, List<String> errors) {
        if (raw.has("title")) {
            copyText(raw, out, "title", errors, true);
        } else if (raw.has("titleVi")) {
            copyText(raw, out, "titleVi", errors, true);
            if (out.has("titleVi")) {
                out.put("title", out.remove("titleVi").asText());
            }
        } else {
            errors.add("Thiếu trường bắt buộc \"title\".");
        }

        if (raw.has("englishTitle")) {
            copyText(raw, out, "englishTitle", errors, false);
        } else if (raw.has("english_title")) {
            copyText(raw, out, "english_title", errors, false);
            if (out.has("english_title")) {
                out.put("englishTitle", out.remove("english_title").asText());
            }
        } else if (raw.has("titleEn")) {
            copyText(raw, out, "titleEn", errors, false);
            if (out.has("titleEn")) {
                out.put("englishTitle", out.remove("titleEn").asText());
            }
        }

        copyText(raw, out, "code", errors, false);
        if (!out.has("code")) copyText(raw, out, "topicCode", errors, false);
        copyText(raw, out, "codeName", errors, false);
        copyText(raw, out, "category", errors, false);

        if (raw.has("rule")) {
            copyText(raw, out, "rule", errors, true);
        } else if (raw.has("formula")) {
            copyText(raw, out, "formula", errors, true);
            if (out.has("formula")) {
                out.put("rule", out.remove("formula").asText());
            }
        } else {
            errors.add("Thiếu trường bắt buộc \"rule\" hoặc \"formula\".");
        }

        if (raw.has("explanation")) {
            copyText(raw, out, "explanation", errors, true);
        } else if (raw.has("summary")) {
            copyText(raw, out, "summary", errors, true);
            if (out.has("summary")) {
                out.put("explanation", out.remove("summary").asText());
            }
        } else if (raw.has("description")) {
            copyText(raw, out, "description", errors, true);
            if (out.has("description")) {
                out.put("explanation", out.remove("description").asText());
            }
        } else {
            errors.add("Thiếu trường bắt buộc \"explanation\" hoặc \"summary\".");
        }

        copyText(raw, out, "part", errors, false);
        if (out.has("part")) normalizePart(out, "part", errors);

        if (raw.has("level")) {
            copyText(raw, out, "level", errors, false);
        } else if (raw.has("targetScore")) {
            copyText(raw, out, "targetScore", errors, false);
            if (out.has("targetScore")) {
                out.put("level", out.remove("targetScore").asText());
            }
        } else if (raw.has("target_score")) {
            copyText(raw, out, "target_score", errors, false);
            if (out.has("target_score")) {
                out.put("level", out.remove("target_score").asText());
            }
        }

        normalizeExamples(raw, out, errors);

        if (raw.has("signalWords")) {
            normalizeStringArray(raw, out, "signalWords", errors);
        } else if (raw.has("signal_words")) {
            normalizeStringArray(raw, out, "signal_words", errors);
            if (out.has("signal_words")) {
                out.set("signalWords", out.remove("signal_words"));
            }
        }

        normalizeStringArray(raw, out, "traps", errors);
        copyText(raw, out, "signalClues", errors, false);
        copyText(raw, out, "tipsAndTricks", errors, false);
        copyText(raw, out, "commonTraps", errors, false);
        copyText(raw, out, "summaryTable", errors, false);
        copyText(raw, out, "reference", errors, false);
        copyText(raw, out, "imageUrl", errors, false);
        copyText(raw, out, "audioUrl", errors, false);
        validateUrl(out, "imageUrl", errors);
        validateUrl(out, "audioUrl", errors);

        if (raw.has("questions")) {
            normalizeJsonArrayField(raw, out, "questions", errors);
        } else if (raw.has("gradedQuestions")) {
            JsonNode questions = raw.deepCopy();
            ((ObjectNode) questions).set("questions", raw.path("gradedQuestions"));
            normalizeJsonArrayField(questions, out, "questions", errors);
        }
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
        copyText(raw, out, "audioUrl", errors, false);
        copyText(raw, out, "imageUrl", errors, false);
        if (out.has("part")) {
            normalizePart(out, "part", errors);
            if (!Set.of("PART_6", "PART_7").contains(out.path("part").asText())) {
                errors.add("Bài Reading chỉ hỗ trợ Part 6 hoặc Part 7.");
            }
        }
        if (out.has("difficulty")) normalizeDifficulty(out, "difficulty", errors);
        validateUrl(out, "audioUrl", errors);
        validateUrl(out, "imageUrl", errors);
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

    private void normalizeExamples(JsonNode raw, ObjectNode out, List<String> errors) {
        JsonNode value = raw.get("examples");
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
                    errors.add("Trường \"examples\" phải là mảng JSON hợp lệ.");
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
            errors.add("Trường \"examples\" phải là một mảng.");
            return;
        }
        ArrayNode normalized = objectMapper.createArrayNode();
        for (JsonNode item : array) {
            if (item.isObject()) {
                ObjectNode obj = objectMapper.createObjectNode();
                if (item.has("sentence")) obj.put("sentence", normalizeText(item.path("sentence").asText()));
                if (item.has("translation")) obj.put("translation", normalizeText(item.path("translation").asText()));
                if (item.has("analysis")) obj.put("analysis", normalizeText(item.path("analysis").asText()));
                normalized.add(obj);
            } else if (item.isValueNode()) {
                String text = normalizeText(item.asText());
                if (!text.isBlank()) normalized.add(text);
            }
        }
        out.set("examples", normalized);
    }

    private void normalizeJsonArrayField(JsonNode raw, ObjectNode out, String field, List<String> errors) {
        JsonNode value = raw.get(field);
        if (value == null || value.isNull() || (value.isTextual() && value.asText().isBlank())) {
            return;
        }
        JsonNode array = value;
        if (value.isTextual()) {
            try {
                array = objectMapper.readTree(value.asText().trim());
            } catch (Exception exception) {
                errors.add("Trường \"" + field + "\" phải là mảng JSON hợp lệ.");
                return;
            }
        }
        if (!array.isArray()) {
            errors.add("Trường \"" + field + "\" phải là một mảng.");
            return;
        }
        out.set(field, array);
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
        String val = out.path(field).asText().trim();
        if (val.isEmpty()) {
            out.remove(field);
            return;
        }
        if (val.startsWith("/") || val.startsWith("./") || val.startsWith("data:")) {
            return;
        }
        try {
            var uri = java.net.URI.create(val);
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
