package com.toeic.ai.toeic_api.aireview;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.grammar.GrammarService;
import com.toeic.ai.toeic_api.questionbank.QuestionBankOption;
import com.toeic.ai.toeic_api.questionbank.QuestionBankQuestion;
import com.toeic.ai.toeic_api.questionbank.QuestionBankQuestionRequest;
import com.toeic.ai.toeic_api.questionbank.QuestionBankService;
import com.toeic.ai.toeic_api.reading.ReadingExerciseCard;
import com.toeic.ai.toeic_api.reading.ReadingService;

@Service
public class AiContentPublishService {
    private static final Set<String> VALID_GRAMMAR_GROUPS = Set.of(
            "parts_of_speech", "verb_tenses", "verb_structures", "passive_voice",
            "conditionals", "clauses", "sentence_structures", "comparison",
            "prepositions_conjunctions", "extended", "other");
    private static final List<String> OPTION_KEYS = List.of("A", "B", "C", "D");

    private final QuestionBankService questionBankService;
    private final ReadingService readingService;
    private final GrammarService grammarService;

    public AiContentPublishService(
            QuestionBankService questionBankService,
            ReadingService readingService,
            GrammarService grammarService) {
        this.questionBankService = questionBankService;
        this.readingService = readingService;
        this.grammarService = grammarService;
    }

    public PublishedTarget publish(String contentType, JsonNode payload, UUID adminId) {
        if (payload == null || !payload.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payload nội dung AI không hợp lệ để phát hành ra kho học tập.");
        }
        String normalizedType = contentType == null ? "" : contentType.trim().toUpperCase(Locale.ROOT);
        return switch (normalizedType) {
            case "QUESTION" -> publishQuestion(payload);
            case "READING" -> publishReading(payload, adminId);
            case "EXERCISE" -> publishExercise(payload);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Loại nội dung AI chưa hỗ trợ phát hành: " + contentType);
        };
    }

    private PublishedTarget publishQuestion(JsonNode payload) {
        String questionText = firstText(payload, "question", "questionText", "stem");
        if (questionText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể phát hành câu hỏi AI vì thiếu nội dung câu hỏi.");
        }
        Map<String, String> optionsMap = extractOptionsMap(payload);
        if (optionsMap.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể phát hành câu hỏi AI vì cần ít nhất 2 phương án trả lời.");
        }
        String correctAnswer = normalizeAnswerKey(firstText(payload, "correctAnswer", "answer", "correctOption"), optionsMap);
        List<QuestionBankOption> options = optionsMap.entrySet().stream()
                .map(entry -> new QuestionBankOption(
                        entry.getKey(),
                        entry.getValue(),
                        entry.getKey().equalsIgnoreCase(correctAnswer)))
                .toList();

        String part = normalizeQuestionBankPart(firstText(payload, "part", "section"));
        String difficulty = normalizeQuestionBankDifficulty(firstText(payload, "difficulty", "level"));
        String skill = clamp(firstNonBlank(
                firstText(payload, "skill", "topic", "title"),
                "TOEIC AI Practice"), 128);
        String passage = blankToNull(firstText(payload, "passage", "content", "text"));
        String explanation = blankToNull(firstText(payload, "explanation", "analysis", "rationale"));

        QuestionBankQuestion created = questionBankService.createQuestion(new QuestionBankQuestionRequest(
                null,
                part,
                questionText,
                passage,
                null,
                null,
                options,
                correctAnswer,
                skill,
                difficulty,
                explanation,
                "PUBLISHED"));

        String label = created.code() != null && !created.code().isBlank()
                ? "Ngân hàng câu hỏi (" + created.code() + ")"
                : "Ngân hàng câu hỏi (#" + created.id() + ")";
        return new PublishedTarget(
                "QUESTION_BANK",
                created.id(),
                label,
                "/admin/content/questions",
                "/admin/content/questions");
    }

    private PublishedTarget publishReading(JsonNode payload, UUID adminId) {
        String title = clamp(firstNonBlank(
                firstText(payload, "title", "topic", "heading"),
                "Bài đọc TOEIC AI"), 160);
        String rawPart = firstText(payload, "part", "category", "section");
        String category = normalizeReadingCategory(rawPart, payload);
        String passageText = firstText(payload, "passage", "passageText", "content", "text");
        String passageTextVi = firstText(payload, "passageTextVi", "translation", "bilingual");
        String subtitle = clamp(firstNonBlank(
                firstText(payload, "summary", "subtitle"),
                "Bài đọc luyện tập TOEIC được AI biên soạn và Admin đã kiểm duyệt."), 240);
        String tag = clamp(firstNonBlank(
                firstText(payload, "tag", "topic"),
                "AI Verified"), 64);

        List<Map<String, Object>> sampleQuestions = extractReadingQuestions(payload);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", title);
        body.put("category", category);
        body.put("subtitle", subtitle);
        body.put("tag", tag);
        body.put("status", "published");
        body.put("passageText", passageText);
        if (!passageTextVi.isBlank()) {
            body.put("passageTextVi", passageTextVi);
        }
        body.put("sampleQuestions", sampleQuestions);
        body.put("totalQuestions", Math.max(1, sampleQuestions.size()));

        ReadingExerciseCard created = readingService.createCard(body, adminId);
        return new PublishedTarget(
                "READING_CARD",
                created.id(),
                "Bài đọc Reading: " + created.title(),
                "/reading",
                "/admin/content/reading");
    }

    private PublishedTarget publishExercise(JsonNode payload) {
        String titleVi = clamp(firstNonBlank(
                firstText(payload, "title", "titleVi", "topic", "heading"),
                "Bài tập ngữ pháp TOEIC AI"), 120);
        String titleEn = clamp(firstNonBlank(
                firstText(payload, "englishTitle", "titleEn"),
                titleVi), 120);
        String summary = clamp(firstNonBlank(
                firstText(payload, "summary", "explanation", "analysis"),
                "Chuyên đề bài tập TOEIC được AI biên soạn và Admin đã kiểm duyệt."), 1000);
        String formula = clamp(firstNonBlank(
                firstText(payload, "formula", "structure"),
                "Cấu trúc trọng tâm TOEIC Part 5 & Part 6"), 5000);
        String part = normalizeGrammarPart(firstText(payload, "part", "section"));
        String difficulty = normalizeGrammarDifficulty(firstText(payload, "difficulty", "level"));
        String targetScore = normalizeGrammarTargetScore(firstText(payload, "targetScore", "difficulty", "level"));
        String grammarGroup = normalizeGrammarGroup(firstText(payload, "grammarGroup", "category"));

        List<Map<String, Object>> questions = extractGrammarQuestions(payload, part);
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể phát hành bài tập AI vì cần ít nhất 1 câu hỏi đầy đủ đáp án A, B, C, D và giải thích.");
        }

        List<String> signalWords = readStringList(payload.path("signalWords"));
        List<String> traps = readStringList(payload.path("traps"));
        List<Map<String, Object>> examples = extractGrammarExamples(payload);

        GrammarService.GrammarTopic created = grammarService.createTopic(new GrammarService.CreateGrammarTopicRequest(
                null,
                titleVi,
                titleEn,
                titleVi,
                titleEn,
                part,
                targetScore,
                "PUBLISHED",
                summary,
                formula,
                null,
                null,
                grammarGroup,
                null,
                List.of(part),
                difficulty,
                Map.of(),
                Map.of(),
                null,
                signalWords,
                traps,
                examples,
                questions,
                null));

        return new PublishedTarget(
                "GRAMMAR_TOPIC",
                created.id(),
                "Bài tập Ngữ pháp: " + created.title(),
                "/grammar",
                "/admin/content/grammar");
    }

    private List<Map<String, Object>> extractReadingQuestions(JsonNode payload) {
        List<Map<String, Object>> result = new ArrayList<>();
        JsonNode array = payload.has("sampleQuestions") ? payload.path("sampleQuestions") : payload.path("questions");
        if (array.isArray() && !array.isEmpty()) {
            int idx = 1;
            for (JsonNode qNode : array) {
                Map<String, Object> mapped = toReadingQuestionMap(qNode, idx++);
                if (mapped != null) {
                    result.add(mapped);
                }
            }
        }
        if (result.isEmpty()) {
            Map<String, Object> single = toReadingQuestionMap(payload, 1);
            if (single != null) {
                result.add(single);
            }
        }
        return result;
    }

    private Map<String, Object> toReadingQuestionMap(JsonNode node, int number) {
        String question = firstText(node, "question", "questionText", "stem");
        Map<String, String> optionsMap = extractOptionsMap(node);
        if (question.isBlank() || optionsMap.size() < 2) {
            return null;
        }
        List<String> optionTexts = new ArrayList<>();
        List<String> keys = new ArrayList<>();
        for (String key : OPTION_KEYS) {
            if (optionsMap.containsKey(key)) {
                keys.add(key);
                optionTexts.add(optionsMap.get(key));
            }
        }
        String correctKey = normalizeAnswerKey(firstText(node, "correctAnswer", "answer", "correctOption"), optionsMap);
        int correctIndex = Math.max(0, keys.indexOf(correctKey));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("questionNum", String.valueOf(number));
        map.put("question", question);
        map.put("options", optionTexts);
        map.put("correctIndex", correctIndex);
        map.put("explanation", firstNonBlank(firstText(node, "explanation", "analysis", "rationale"), "Đáp án đúng là " + correctKey + "."));
        String bilingual = firstText(node, "bilingual", "translation", "questionTranslation");
        if (!bilingual.isBlank()) {
            map.put("bilingual", bilingual);
        }
        return map;
    }

    private List<Map<String, Object>> extractGrammarQuestions(JsonNode payload, String defaultPart) {
        List<Map<String, Object>> result = new ArrayList<>();
        JsonNode array = payload.path("questions");
        if (array.isArray() && !array.isEmpty()) {
            for (JsonNode qNode : array) {
                Map<String, Object> mapped = toGrammarQuestionMap(qNode, defaultPart);
                if (mapped != null) {
                    result.add(mapped);
                }
            }
        }
        if (result.isEmpty()) {
            Map<String, Object> single = toGrammarQuestionMap(payload, defaultPart);
            if (single != null) {
                result.add(single);
            }
        }
        return result;
    }

    private Map<String, Object> toGrammarQuestionMap(JsonNode node, String defaultPart) {
        String questionText = firstText(node, "question", "questionText", "stem");
        Map<String, String> optionsMap = extractOptionsMap(node);
        if (questionText.isBlank() || OPTION_KEYS.stream().anyMatch(k -> !optionsMap.containsKey(k) || optionsMap.get(k).isBlank())) {
            return null;
        }
        String correctAnswer = normalizeAnswerKey(firstText(node, "correctAnswer", "answer", "correctOption"), optionsMap);
        String explanation = firstNonBlank(
                firstText(node, "explanation", "analysis", "rationale"),
                "Đáp án đúng là " + correctAnswer + ".");
        String part = normalizeGrammarPart(firstNonBlank(firstText(node, "part"), defaultPart));

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", "ai-q-" + UUID.randomUUID().toString().substring(0, 8));
        map.put("questionText", questionText);
        map.put("options", optionsMap);
        map.put("correctAnswer", correctAnswer);
        map.put("explanation", explanation);
        map.put("part", part);
        return map;
    }

    private List<Map<String, Object>> extractGrammarExamples(JsonNode payload) {
        List<Map<String, Object>> out = new ArrayList<>();
        JsonNode examples = payload.path("examples");
        if (examples.isArray()) {
            for (JsonNode ex : examples) {
                String sentence = firstText(ex, "sentence", "en");
                String translation = firstText(ex, "translation", "vi");
                if (!sentence.isBlank() && !translation.isBlank()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("sentence", clamp(sentence, 1000));
                    item.put("translation", clamp(translation, 1000));
                    String analysis = firstText(ex, "analysis", "explanation");
                    if (!analysis.isBlank()) {
                        item.put("analysis", clamp(analysis, 2000));
                    }
                    out.add(item);
                }
            }
        }
        return out;
    }

    private Map<String, String> extractOptionsMap(JsonNode node) {
        Map<String, String> map = new LinkedHashMap<>();
        JsonNode raw = node.has("options") ? node.path("options") : node.path("choices");
        if (raw.isObject()) {
            for (String key : OPTION_KEYS) {
                String val = raw.path(key).asText("").trim();
                if (val.isBlank()) {
                    val = raw.path(key.toLowerCase(Locale.ROOT)).asText("").trim();
                }
                if (!val.isBlank()) {
                    map.put(key, val);
                }
            }
        } else if (raw.isArray()) {
            for (int i = 0; i < raw.size() && i < OPTION_KEYS.size(); i++) {
                JsonNode opt = raw.get(i);
                String key = OPTION_KEYS.get(i);
                String text;
                if (opt.isTextual()) {
                    text = opt.asText("").trim();
                } else if (opt.isObject()) {
                    String explicitKey = firstText(opt, "id", "label", "key").toUpperCase(Locale.ROOT);
                    if (OPTION_KEYS.contains(explicitKey)) {
                        key = explicitKey;
                    }
                    text = firstText(opt, "text", "content", "value");
                } else {
                    text = "";
                }
                if (!text.isBlank()) {
                    map.put(key, text);
                }
            }
        }
        return map;
    }

    private String normalizeAnswerKey(String rawAnswer, Map<String, String> optionsMap) {
        String cleaned = rawAnswer == null ? "" : rawAnswer.trim().toUpperCase(Locale.ROOT);
        if (optionsMap.containsKey(cleaned)) {
            return cleaned;
        }
        if (cleaned.length() >= 1) {
            String firstChar = cleaned.substring(0, 1);
            if (optionsMap.containsKey(firstChar)) {
                return firstChar;
            }
        }
        for (Map.Entry<String, String> entry : optionsMap.entrySet()) {
            if (entry.getValue().equalsIgnoreCase(rawAnswer == null ? "" : rawAnswer.trim())) {
                return entry.getKey();
            }
        }
        return optionsMap.keySet().stream().findFirst().orElse("A");
    }

    private String normalizeQuestionBankPart(String raw) {
        String norm = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT).replace(" ", "_");
        if (Set.of("PART_1", "PART_2", "PART_3", "PART_4", "PART_5", "PART_6", "PART_7", "GRAMMAR", "VOCABULARY").contains(norm)) {
            return norm;
        }
        if (norm.contains("5")) return "PART_5";
        if (norm.contains("6")) return "PART_6";
        if (norm.contains("7")) return "PART_7";
        if (norm.contains("GRAMMAR")) return "GRAMMAR";
        if (norm.contains("VOCAB")) return "VOCABULARY";
        return "PART_5";
    }

    private String normalizeQuestionBankDifficulty(String raw) {
        String norm = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (Set.of("450-550", "550-650", "650-750", "750-850", "850-900+").contains(norm)) {
            return norm;
        }
        if (norm.contains("EASY") || norm.contains("CƠ BẢN") || norm.contains("450")) return "450-550";
        if (norm.contains("550")) return "550-650";
        if (norm.contains("HARD") || norm.contains("NÂNG CAO") || norm.contains("750")) return "750-850";
        if (norm.contains("850") || norm.contains("900")) return "850-900+";
        return "650-750";
    }

    private String normalizeReadingCategory(String raw, JsonNode payload) {
        String norm = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT).replace(" ", "").replace("_", "");
        if (norm.contains("part5")) return "part5";
        if (norm.contains("part6")) return "part6";
        if (norm.contains("part7")) return "part7";
        if (norm.contains("grammar")) return "grammar";
        String passage = firstText(payload, "passage", "passageText", "content", "text");
        return passage.length() > 160 ? "part7" : "part6";
    }

    private String normalizeGrammarPart(String raw) {
        String norm = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (norm.contains("6")) return "Part 6";
        if (norm.contains("7")) return "Part 7";
        return "Part 5";
    }

    private String normalizeGrammarDifficulty(String raw) {
        String norm = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (norm.contains("EASY") || norm.contains("450") || norm.contains("550")) return "EASY";
        if (norm.contains("HARD") || norm.contains("750") || norm.contains("850") || norm.contains("900")) return "HARD";
        return "MEDIUM";
    }

    private String normalizeGrammarTargetScore(String raw) {
        String norm = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (norm.contains("350") || norm.contains("450") || norm.contains("EASY")) return "350_500";
        if (norm.contains("750") || norm.contains("850") || norm.contains("900") || norm.contains("HARD")) return "750_PLUS";
        return "500_750";
    }

    private String normalizeGrammarGroup(String raw) {
        String norm = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        return VALID_GRAMMAR_GROUPS.contains(norm) ? norm : "other";
    }

    private List<String> readStringList(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                String text = item.asText("").trim();
                if (!text.isBlank()) {
                    out.add(text);
                }
            }
        }
        return out;
    }

    private String firstText(JsonNode node, String... fields) {
        if (node == null || node.isNull()) return "";
        for (String field : fields) {
            JsonNode value = node.path(field);
            if (value.isTextual()) {
                String trimmed = value.asText("").trim();
                if (!trimmed.isBlank()) {
                    return trimmed;
                }
            }
        }
        return "";
    }

    private String firstNonBlank(String primary, String fallback) {
        return primary != null && !primary.isBlank() ? primary.trim() : fallback;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String clamp(String value, int maxLen) {
        if (value == null) return "";
        String trimmed = value.trim();
        return trimmed.length() <= maxLen ? trimmed : trimmed.substring(0, maxLen).trim();
    }

    public record PublishedTarget(
            String targetType,
            String targetId,
            String targetLabel,
            String userUrl,
            String adminUrl
    ) { }
}
