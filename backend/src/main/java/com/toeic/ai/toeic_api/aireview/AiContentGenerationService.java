package com.toeic.ai.toeic_api.aireview;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.toeic.ai.toeic_api.audit.AuditLogService;
import com.toeic.ai.toeic_api.settings.SystemSettingsService;

@Service
public class AiContentGenerationService {
    private static final List<String> ALLOWED_TYPES = List.of("QUESTION", "READING", "EXERCISE");

    private final JdbcTemplate jdbc;
    private final SystemSettingsService systemSettingsService;
    private final AiContentPublishService publishService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient geminiClient = RestClient.create("https://generativelanguage.googleapis.com");
    private final String geminiApiKey;
    private final String geminiModel;

    public AiContentGenerationService(
            JdbcTemplate jdbc,
            SystemSettingsService systemSettingsService,
            AiContentPublishService publishService,
            AuditLogService auditLogService,
            @Value("${gemini.api-key:}") String geminiApiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String geminiModel) {
        this.jdbc = jdbc;
        this.systemSettingsService = systemSettingsService;
        this.publishService = publishService;
        this.auditLogService = auditLogService;
        this.geminiApiKey = geminiApiKey == null ? "" : geminiApiKey.trim();
        this.geminiModel = (geminiModel == null || geminiModel.isBlank()) ? "gemini-2.5-flash" : geminiModel.trim();
    }

    @Transactional
    public GenerateResult generate(GenerateRequest request, UUID adminId, String ipAddress) {
        if (request == null || request.contentType() == null || request.contentType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần chọn loại nội dung AI muốn tạo.");
        }
        String contentType = request.contentType().trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại nội dung chỉ hỗ trợ QUESTION, READING hoặc EXERCISE.");
        }
        String topic = request.topic() == null ? "" : request.topic().trim();
        if (topic.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập chủ đề cần AI biên soạn.");
        }
        if (topic.length() > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chủ đề tối đa 200 ký tự.");
        }
        if (geminiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Dịch vụ AI chưa được cấu hình GEMINI_API_KEY.");
        }

        String part = normalizePart(contentType, request.part());
        String difficulty = normalizeDifficulty(request.difficulty());
        String interactionType = switch (contentType) {
            case "QUESTION" -> "GENERATE_QUESTION";
            case "READING" -> "GENERATE_READING";
            default -> "GENERATE_EXERCISE";
        };
        String prompt = buildPrompt(contentType, topic, part, difficulty);

        String rawJson = callGemini(prompt);
        JsonNode parsedPayload = parseAndValidatePayload(rawJson, contentType, topic, part, difficulty);

        UUID interactionId = jdbc.queryForObject("""
                INSERT INTO ai_interactions (user_id, type, prompt, response, model, status, completed_at)
                VALUES (?, ?, ?, ?, ?, 'SUCCESS', now())
                RETURNING id
                """, UUID.class, adminId, interactionType, prompt, parsedPayload.toString(), geminiModel);

        boolean moderationEnabled = systemSettingsService.getSettings().aiModerationEnabled();
        String validationStatus = moderationEnabled ? "PENDING" : "PASSED";

        UUID contentId = jdbc.queryForObject("""
                INSERT INTO ai_generated_content (
                    ai_interaction_id, content_type, payload_json, validation_status,
                    reviewed_by, reviewed_at
                ) VALUES (?, ?, ?::jsonb, ?, ?, ?)
                RETURNING id
                """,
                UUID.class,
                interactionId,
                contentType,
                parsedPayload.toString(),
                validationStatus,
                moderationEnabled ? null : adminId,
                moderationEnabled ? null : java.sql.Timestamp.from(Instant.now()));

        AiContentPublishService.PublishedTarget publishedTarget = null;
        if (!moderationEnabled) {
            publishedTarget = publishService.publish(contentType, parsedPayload, adminId);
            auditLogService.record(
                    adminId,
                    "AUTO_PUBLISH_AI_CONTENT",
                    "AI_GENERATED_CONTENT",
                    contentId,
                    "Tự động phát hành nội dung AI vì chế độ Kiểm duyệt AI đang tắt (" + publishedTarget.targetLabel() + ").",
                    ipAddress);
        } else {
            auditLogService.record(
                    adminId,
                    "GENERATE_AI_CONTENT",
                    "AI_GENERATED_CONTENT",
                    contentId,
                    "Tạo nội dung AI và đưa vào hàng đợi chờ duyệt.",
                    ipAddress);
        }

        Instant now = Instant.now();
        Object payloadObject = objectMapper.convertValue(parsedPayload, Object.class);
        AiReviewService.ReviewItem item = new AiReviewService.ReviewItem(
                contentId,
                contentType,
                payloadObject,
                moderationEnabled ? AiReviewStatus.PENDING : AiReviewStatus.APPROVED,
                interactionType,
                geminiModel,
                now,
                moderationEnabled ? null : now,
                null,
                null,
                null,
                publishedTarget);

        String message = moderationEnabled
                ? "AI đã tạo nội dung mới và đưa vào hàng đợi Chờ duyệt (chưa hiển thị cho học viên)."
                : "Chế độ Kiểm duyệt AI đang tắt — nội dung đã được phát hành ngay tới " + publishedTarget.targetLabel() + ".";

        return new GenerateResult(item, moderationEnabled, publishedTarget, message);
    }

    private String buildPrompt(String contentType, String topic, String part, String difficulty) {
        return switch (contentType) {
            case "QUESTION" -> """
                    Bạn là chuyên gia biên soạn đề thi TOEIC ETS chuẩn quốc tế.
                    Hãy tạo 1 câu hỏi trắc nghiệm TOEIC chất lượng cao theo yêu cầu sau:
                    - Chủ đề: %s
                    - Phần thi: %s
                    - Mục tiêu điểm / Độ khó: %s

                    Trả về DUY NHẤT một JSON object hợp lệ (không markdown, không giải thích ngoài JSON) đúng cấu trúc:
                    {
                      "title": "Tiêu đề ngắn tiếng Việt về điểm kiến thức",
                      "part": "%s",
                      "difficulty": "%s",
                      "skill": "Kỹ năng TOEIC (vd: Từ loại / Giới từ / Thì động từ / Đọc hiểu)",
                      "passage": "Đoạn văn ngắn nếu là Part 6/7, hoặc chuỗi rỗng nếu Part 5",
                      "question": "Câu hỏi tiếng Anh có chỗ trống _______ (nếu Part 5/6) hoặc câu hỏi đọc hiểu (nếu Part 7)",
                      "options": {
                        "A": "Phương án A",
                        "B": "Phương án B",
                        "C": "Phương án C",
                        "D": "Phương án D"
                      },
                      "correctAnswer": "A",
                      "explanation": "Giải thích chi tiết bằng tiếng Việt vì sao đáp án đúng và các đáp án khác sai"
                    }
                    """.formatted(topic, part, difficulty, part, difficulty);

            case "READING" -> """
                    Bạn là chuyên gia biên soạn bài đọc TOEIC Reading (Part 6 / Part 7).
                    Hãy tạo 1 bài đọc TOEIC hoàn chỉnh theo yêu cầu:
                    - Chủ đề: %s
                    - Phần thi: %s
                    - Mục tiêu điểm / Độ khó: %s

                    Trả về DUY NHẤT một JSON object hợp lệ (không markdown) đúng cấu trúc:
                    {
                      "title": "Tiêu đề tiếng Việt ngắn gọn cho bài đọc",
                      "part": "%s",
                      "difficulty": "%s",
                      "tag": "Thể loại (vd: Email nội bộ / Thông báo / Quảng cáo)",
                      "summary": "1 câu tóm tắt ngắn mục tiêu bài đọc bằng tiếng Việt",
                      "passage": "Đoạn văn tiếng Anh TOEIC chân thực dài 80-140 từ (email, thông báo hoặc bản tin doanh nghiệp)",
                      "passageTextVi": "Bản dịch tiếng Việt tự nhiên của đoạn văn",
                      "question": "Câu hỏi đọc hiểu chính bằng tiếng Anh",
                      "options": {
                        "A": "Phương án A",
                        "B": "Phương án B",
                        "C": "Phương án C",
                        "D": "Phương án D"
                      },
                      "correctAnswer": "B",
                      "explanation": "Giải thích chi tiết bằng tiếng Việt chỉ rõ dẫn chứng trong đoạn văn"
                    }
                    """.formatted(topic, part, difficulty, part, difficulty);

            default -> """
                    Bạn là chuyên gia giảng dạy ngữ pháp TOEIC.
                    Hãy tạo 1 bài tập luyện ngữ pháp TOEIC có lý thuyết ngắn + 1 câu hỏi thực hành chuẩn TOEIC theo yêu cầu:
                    - Chủ đề: %s
                    - Phần thi: %s
                    - Mục tiêu điểm / Độ khó: %s

                    Trả về DUY NHẤT một JSON object hợp lệ (không markdown) đúng cấu trúc:
                    {
                      "title": "Tên chủ điểm tiếng Việt (tối đa 80 ký tự)",
                      "englishTitle": "English grammar topic title (max 80 chars)",
                      "part": "%s",
                      "difficulty": "%s",
                      "grammarGroup": "Một trong: parts_of_speech, verb_tenses, verb_structures, passive_voice, conditionals, clauses, sentence_structures, comparison, prepositions_conjunctions, other",
                      "formula": "Công thức / cấu trúc cốt lõi ngắn gọn dễ nhớ",
                      "summary": "1 câu tóm tắt trọng tâm cần nhớ khi làm TOEIC",
                      "signalWords": ["Dấu hiệu 1", "Dấu hiệu 2"],
                      "traps": ["Bẫy thường gặp 1"],
                      "question": "Câu hỏi thực hành TOEIC tiếng Anh có chỗ trống _______",
                      "options": {
                        "A": "Phương án A",
                        "B": "Phương án B",
                        "C": "Phương án C",
                        "D": "Phương án D"
                      },
                      "correctAnswer": "C",
                      "explanation": "Giải thích chi tiết bằng tiếng Việt áp dụng công thức ở trên"
                    }
                    """.formatted(topic, part, difficulty, part, difficulty);
        };
    }

    private String callGemini(String prompt) {
        var body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text",
                        "Bạn là hệ thống biên soạn nội dung TOEIC chuyên nghiệp. Luôn trả về duy nhất JSON hợp lệ, chính xác ngữ pháp và đáp án không mâu thuẫn."))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 2048,
                        "responseMimeType", "application/json"));
        try {
            String responseBody = geminiClient.post()
                    .uri("/v1beta/models/{model}:generateContent", geminiModel)
                    .header("x-goog-api-key", geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode response = responseBody == null || responseBody.isBlank()
                    ? null
                    : objectMapper.readTree(responseBody);
            String text = response == null
                    ? ""
                    : response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            if (text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini không trả về nội dung. Vui lòng thử lại.");
            }
            return stripCodeFences(text);
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            if (status == 429) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Gemini đang quá tải hoặc hết hạn mức API. Vui lòng thử lại sau.");
            }
            if (status == 401 || status == 403) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Gemini từ chối yêu cầu. Hãy kiểm tra GEMINI_API_KEY.");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gemini trả về lỗi HTTP " + status + ". Vui lòng thử lại.");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không thể kết nối Gemini lúc này. Vui lòng thử lại sau.");
        } catch (java.io.IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Không thể đọc phản hồi JSON từ Gemini.");
        }
    }

    private JsonNode parseAndValidatePayload(String rawJson, String contentType, String topic, String part, String difficulty) {
        try {
            JsonNode parsed = objectMapper.readTree(rawJson);
            if (!parsed.isObject()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI trả về dữ liệu không đúng cấu trúc JSON object.");
            }
            ObjectNode obj = (ObjectNode) parsed;
            if (!obj.hasNonNull("part") || obj.path("part").asText("").isBlank()) {
                obj.put("part", part);
            }
            if (!obj.hasNonNull("difficulty") || obj.path("difficulty").asText("").isBlank()) {
                obj.put("difficulty", difficulty);
            }
            if (!obj.hasNonNull("title") || obj.path("title").asText("").isBlank()) {
                obj.put("title", topic);
            }
            if (obj.path("question").asText("").isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI tạo thiếu nội dung câu hỏi. Vui lòng thử lại.");
            }
            if (obj.path("options").isMissingNode() || obj.path("options").isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI tạo thiếu các phương án trả lời. Vui lòng thử lại.");
            }
            if ("READING".equals(contentType) && obj.path("passage").asText("").isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI tạo thiếu đoạn văn bài đọc. Vui lòng thử lại.");
            }
            return obj;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI trả về JSON không hợp lệ. Vui lòng thử lại.");
        }
    }

    private String stripCodeFences(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
        }
        return trimmed.trim();
    }

    private String normalizePart(String contentType, String rawPart) {
        if (rawPart != null && !rawPart.isBlank()) {
            return rawPart.trim();
        }
        return switch (contentType) {
            case "READING" -> "Part 7";
            case "EXERCISE" -> "Part 5";
            default -> "Part 5";
        };
    }

    private String normalizeDifficulty(String raw) {
        if (raw == null || raw.isBlank()) {
            return "650-750";
        }
        return raw.trim();
    }

    public record GenerateRequest(
            String contentType,
            String topic,
            String part,
            String difficulty
    ) { }

    public record GenerateResult(
            AiReviewService.ReviewItem item,
            boolean moderationRequired,
            AiContentPublishService.PublishedTarget publishedTarget,
            String message
    ) { }
}
