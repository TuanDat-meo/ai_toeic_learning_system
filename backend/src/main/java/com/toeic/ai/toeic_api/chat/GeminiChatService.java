package com.toeic.ai.toeic_api.chat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

@Service
public class GeminiChatService {
    private static final Logger log = LoggerFactory.getLogger(GeminiChatService.class);

    private static final String SYSTEM_INSTRUCTION = """
            Bạn là Trợ lý Toàn Năng và Gia sư AI của Hệ thống TOEIC AI (TOEIC Master).
            Bạn thông thái, nhiệt tình, kiên nhẫn, thấu hiểu tâm lý người học và luôn trả lời chính xác, mạch lạc bằng tiếng Việt với định dạng Markdown rõ ràng, chuyên nghiệp.

            VỀ CÁCH VẬN HÀNH TOÀN BỘ HỆ THỐNG HỌC VIÊN:
            Bạn nắm rõ từng chức năng của ứng dụng và luôn sẵn sàng hướng dẫn người dùng từng bước chi tiết:
            1. Luyện Đọc (Reading): Luyện Part 5 (Điền từ), Part 6 (Điền đoạn), Part 7 (Đọc hiểu văn bản đơn, đôi, ba). Có bộ lọc theo năm đề ETS 2022-2024 và mức điểm mục tiêu. Tính năng đặc biệt: Nhấp đúp chuột vào bất kỳ từ nào để tra từ điển tức thì (nghĩa, phiên âm, phát âm), nút dấu cộng (+) để thêm từ vào Sổ từ vựng cá nhân, tính năng làm lại câu sai có giải thích chi tiết.
            2. Luyện Nghe (Listening & Chép chính tả): Luyện trọn bộ Part 1 đến Part 4. Có tính năng "Luyện Nghe Chép Chính Tả" (Dictation) gõ lại từng câu, chỉnh tốc độ phát âm (0.75x, 1.0x, 1.25x), phím tắt Space dừng/phát, tua lại 5s, kiểm tra đúng/sai theo màu sắc và hiển thị transcript song ngữ Anh - Việt.
            3. Từ vựng (Vocabulary): Flashcard ứng dụng thuật toán lặp lại ngắt quãng SRS (Spaced Repetition System) giúp nhớ từ lâu, Game Center 5 chế độ (Ghép thẻ, Chọn từ, Gõ nhanh, Điền khuyết, Đua top điểm số) và quản lý Sổ từ cá nhân.
            4. Ngữ pháp (Grammar): Hơn 20 chuyên đề ngữ pháp TOEIC trọng điểm từ cơ bản đến nâng cao (các thì, mệnh đề quan hệ, thể bị động, câu điều kiện, liên từ, to-V/V-ing...), lý thuyết kèm bài tập thực hành.
            5. Thi thử (Mock Tests): Đề Full Test chuẩn ETS 200 câu trong 120 phút có đồng hồ đếm ngược, tự động chấm điểm, tính tốc độ làm bài (WPM), phân tích radar điểm mạnh điểm yếu từng Part và dự đoán điểm thi thật.
            6. Trang Tổng quan (Dashboard): Theo dõi chuỗi ngày học liên tục (Streak), mục tiêu điểm số, biểu đồ thời gian học.
            7. Nâng cấp VIP & Thanh toán: Quét mã VietQR tự động kích hoạt tài khoản VIP trong 30 giây không cần chờ duyệt thủ công.
            8. Chế độ Sáng / Tối (Dark Mode): Nút chuyển đổi Mặt trăng/Mặt trời trên thanh điều hướng giúp bảo vệ mắt khi học ban đêm.

            VỀ MỌI LĨNH VỰC ĐỜI SỐNG, KINH TẾ, XÃ HỘI, HỌC TẬP NGOÀI TOEIC:
            (Người dùng hỏi bất kỳ câu hỏi nào trong đời sống, bạn hãy trả lời đầy đủ, chi tiết, hữu ích và đúng trọng tâm):
            - Ăn uống & Ẩm thực: Gợi ý món ngon khi đói bụng, món ăn nhanh tiện lợi cho sinh viên, món nước ấm bụng, đồ ăn vặt, dinh dưỡng tăng cường trí nhớ mùa thi, mẹo ăn đêm không béo và tốt cho dạ dày.
            - Kinh tế & Tài chính: Lạm phát, lãi suất, GDP, cung - cầu, suy thoái kinh tế, quy tắc quản lý tài chính 50/30/20, xây dựng quỹ khẩn cấp, sức mạnh lãi suất kép, tiết kiệm và đầu tư cá nhân cơ bản.
            - Chính trị & Pháp luật: Cơ cấu tổ chức bộ máy Nhà nước Việt Nam (Quốc hội, Chủ tịch nước, Chính phủ, Tòa án nhân dân, Viện kiểm sát), nguyên tắc Thượng tôn Pháp luật và Nhà nước pháp quyền, quyền và nghĩa vụ công dân theo Hiến pháp, hội nhập quốc tế (ASEAN, Liên Hợp Quốc, WTO).
            - Giáo dục & Đại học: Định hướng chọn ngành theo mô hình IKIGAI, bí quyết học đại học theo học chế tín chỉ, cách săn học bổng, xây dựng hồ sơ xin việc (CV), kỹ năng mềm (giao tiếp, làm việc nhóm, phản biện).
            - Đời sống, Tâm lý & Sức khỏe: Kỹ thuật hít thở 4-7-8 xoa dịu căng thẳng, vượt qua áp lực đồng trang lứa (Peer Pressure), chống kiệt sức (Burnout), xây dựng thói quen tích cực (Atomic Habits), vệ sinh giấc ngủ mùa thi, tư vấn sử dụng thuốc không kê đơn thông dụng (Paracetamol, Ibuprofen, Oresol...) kèm khuyến cáo an toàn y tế.
            - Phương pháp học tập: Pomodoro 25/5, phương pháp Feynman, Active Recall, lập sơ đồ tư duy (Mindmap), phương pháp ghi chép Cornell.
            - Thi cử & Mẹo làm bài: Kỹ năng chuẩn bị trước ngày thi, tâm lý vững vàng trong phòng thi, mẹo làm bài trắc nghiệm (loại trừ đáp án bẫy, phân bổ thời gian làm câu dễ trước câu khó sau).
            - Bóng đá & Thể thao: Premier League, Champions League, World Cup, Euro, luật việt vị, chiến thuật Gegenpressing.

            NGUYÊN TẮC TRẢ LỜI:
            - Trả lời trực tiếp, đầy đủ, chi tiết, nhiệt tình, đúng trọng tâm câu hỏi của người dùng. Tuyệt đối không trả lời sơ sài hay chung chung né tránh.
            - Trình bày đẹp mắt với các tiêu đề, gạch đầu dòng rõ ràng, dễ đọc bằng Markdown.
            """;

    // Fast In-Memory Cache (LRU up to 500 entries)
    private final Map<String, String> responseCache = Collections.synchronizedMap(
            new LinkedHashMap<>(500, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
                    return size() > 500;
                }
            }
    );

    private final RestClient geminiRestClient;
    private final RestClient ollamaRestClient;
    private final String apiKey;
    private final String configuredModel;
    private final String ollamaBaseUrl;
    private final String ollamaModel;
    private final tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();

    public GeminiChatService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String configuredModel,
            @Value("${grammar.ai.ollama.base-url:http://ollama:11434}") String ollamaBaseUrl,
            @Value("${grammar.ai.ollama.model:qwen2.5:3b}") String ollamaModel) {

        // Generous connection timeouts for external AI
        SimpleClientHttpRequestFactory geminiFactory = new SimpleClientHttpRequestFactory();
        geminiFactory.setConnectTimeout(Duration.ofSeconds(4));
        geminiFactory.setReadTimeout(Duration.ofSeconds(10));

        SimpleClientHttpRequestFactory ollamaFactory = new SimpleClientHttpRequestFactory();
        ollamaFactory.setConnectTimeout(Duration.ofSeconds(3));
        ollamaFactory.setReadTimeout(Duration.ofSeconds(10));

        this.geminiRestClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(geminiFactory)
                .build();

        this.ollamaRestClient = RestClient.builder()
                .baseUrl(ollamaBaseUrl.isBlank() ? "http://ollama:11434" : ollamaBaseUrl)
                .requestFactory(ollamaFactory)
                .build();

        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.configuredModel = configuredModel != null && !configuredModel.isBlank() ? configuredModel : "gemini-3.5-flash";
        this.ollamaBaseUrl = ollamaBaseUrl;
        this.ollamaModel = ollamaModel;
    }

    public AiChatResponse reply(List<AiChatTurn> messages) {
        if (messages == null || messages.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách tin nhắn không được để trống.");
        }
        if (!"user".equals(messages.getLast().role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn cuối cùng phải là câu hỏi của học viên.");
        }

        String lastPrompt = messages.stream()
                .filter(turn -> "user".equals(turn.role()))
                .reduce((first, second) -> second)
                .map(AiChatTurn::content)
                .orElse(messages.isEmpty() ? "" : messages.getLast().content());
        String normalizedKey = BuiltInAssistantEngine.normalize(lastPrompt);
        boolean immediate = BuiltInAssistantEngine.canHandleImmediately(lastPrompt);
        log.info("CHAT AI: prompt='{}', norm='{}', immediate={}", lastPrompt, normalizedKey, immediate);

        // Tier 0: Fast In-Memory Cache (< 1ms)
        String cached = responseCache.get(normalizedKey);
        if (cached != null && !cached.isBlank()) {
            log.info("CHAT AI: Cache hit for '{}'", normalizedKey);
            return new AiChatResponse(cached);
        }

        // Tier 1: Instant Fast-Path for Platform Guides, Quick Starters, and Known FAQs (< 5ms)
        if (immediate) {
            String builtInReply = BuiltInAssistantEngine.generateReply(lastPrompt);
            responseCache.put(normalizedKey, builtInReply);
            log.info("CHAT AI: Immediate reply served for '{}'", normalizedKey);
            return new AiChatResponse(builtInReply);
        }

        // Tier 2: Difficult / Custom Open-ended Questions
        // Generous budget (max 9500ms) to allow Gemini / Ollama to generate full, rich answers
        try {
            CompletableFuture<String> externalFuture = CompletableFuture.supplyAsync(() -> queryExternalAi(messages, lastPrompt));
            String result = externalFuture.get(9500, TimeUnit.MILLISECONDS);
            if (result != null && !result.isBlank()) {
                responseCache.put(normalizedKey, result);
                return new AiChatResponse(result);
            }
        } catch (TimeoutException e) {
            log.info("External AI request timed out at 9.5s for prompt '{}'. Falling back to Smart BuiltIn Engine.", lastPrompt);
        } catch (Exception e) {
            log.warn("External AI call failed: {}. Falling back to Smart BuiltIn Engine.", e.getMessage());
        }

        // Tier 3: Instant High-Quality Smart Engine Fallback (< 5ms)
        String fallbackReply = BuiltInAssistantEngine.generateReply(lastPrompt);
        responseCache.put(normalizedKey, fallbackReply);
        return new AiChatResponse(fallbackReply);
    }

    private String queryExternalAi(List<AiChatTurn> messages, String lastPrompt) {
        // Option A: Google Gemini API (Only if API key is present)
        if (isValidGeminiApiKey(apiKey)) {
            List<String> modelsToTry = getCandidateModels();
            for (String model : modelsToTry) {
                try {
                    String reply = callGemini(messages, model);
                    if (reply != null && !reply.isBlank()) {
                        return reply.trim();
                    }
                } catch (Exception e) {
                    log.warn("Gemini model {} failed: {}", model, e.getMessage());
                }
            }
        }

        // Option B: Local Ollama
        try {
            String ollamaReply = callOllama(messages);
            if (ollamaReply != null && !ollamaReply.isBlank()) {
                return ollamaReply.trim();
            }
        } catch (Exception e) {
            log.warn("Ollama call failed: {}", e.getMessage());
        }

        return null;
    }

    private boolean isValidGeminiApiKey(String key) {
        return key != null && !key.isBlank() && (key.startsWith("AIzaSy") || key.startsWith("AQ.") || key.length() >= 25);
    }

    private List<String> getCandidateModels() {
        if (configuredModel != null && !configuredModel.isBlank() && !configuredModel.contains("2.5-flash") && !configuredModel.contains("1.5-flash")) {
            return List.of(configuredModel, "gemini-3.5-flash", "gemini-3.5-flash-lite");
        }
        return List.of("gemini-3.5-flash", "gemini-3.5-flash-lite");
    }

    private String callGemini(List<AiChatTurn> messages, String model) {
        List<Map<String, Object>> sanitizedContents = new java.util.ArrayList<>();
        String expectedRole = "user";
        for (AiChatTurn turn : messages) {
            String role = turn.role();
            String text = turn.content() != null ? turn.content().trim() : "";
            if (text.isEmpty()) continue;

            if (role.equals(expectedRole)) {
                sanitizedContents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
                expectedRole = "user".equals(role) ? "model" : "user";
            } else if ("user".equals(role) && !sanitizedContents.isEmpty()) {
                int lastIdx = sanitizedContents.size() - 1;
                Map<String, Object> lastTurn = sanitizedContents.get(lastIdx);
                if ("user".equals(lastTurn.get("role"))) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, String>> parts = (List<Map<String, String>>) lastTurn.get("parts");
                    String mergedText = parts.get(0).get("text") + "\n\n" + text;
                    sanitizedContents.set(lastIdx, Map.of("role", "user", "parts", List.of(Map.of("text", mergedText))));
                }
            }
        }
        if (sanitizedContents.isEmpty() || !"user".equals(sanitizedContents.get(sanitizedContents.size() - 1).get("role"))) {
            return null;
        }

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.6);
        generationConfig.put("maxOutputTokens", 2500);
        generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 256));

        var request = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))),
                "contents", sanitizedContents,
                "generationConfig", generationConfig);

        byte[] rawBytes = geminiRestClient.post()
                .uri("/v1beta/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(byte[].class);

        if (rawBytes != null && rawBytes.length > 0) {
            try {
                String rawJson = new String(rawBytes, StandardCharsets.UTF_8);
                JsonNode response = objectMapper.readTree(rawJson);
                StringBuilder textBuilder = new StringBuilder();
                for (JsonNode part : response.path("candidates").path(0).path("content").path("parts")) {
                    if (!part.path("thought").asBoolean(false)) {
                        String partText = Objects.requireNonNullElse(part.path("text").asString(), "");
                        if (!partText.isBlank()) {
                            textBuilder.append(partText);
                        }
                    }
                }
                String result = textBuilder.toString().trim();
                if (!result.isBlank()) {
                    return result;
                }
            } catch (Exception e) {
                log.warn("Error parsing Gemini JSON response: {}", e.getMessage());
            }
        }
        return null;
    }

    private String callOllama(List<AiChatTurn> messages) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(SYSTEM_INSTRUCTION).append("\n\n");
        for (AiChatTurn turn : messages) {
            if ("user".equals(turn.role())) {
                promptBuilder.append("User: ").append(turn.content()).append("\n");
            } else {
                promptBuilder.append("Assistant: ").append(turn.content()).append("\n");
            }
        }
        promptBuilder.append("Assistant:");

        var request = Map.of(
                "model", ollamaModel != null && !ollamaModel.isBlank() ? ollamaModel : "qwen2.5:3b",
                "prompt", promptBuilder.toString(),
                "stream", false,
                "options", Map.of("num_predict", 200));

        byte[] rawBytes = ollamaRestClient.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(byte[].class);

        if (rawBytes != null && rawBytes.length > 0) {
            try {
                String rawOllama = new String(rawBytes, StandardCharsets.UTF_8);
                JsonNode response = objectMapper.readTree(rawOllama);
                if (response.has("response")) {
                    return response.path("response").asString();
                }
            } catch (Exception ignored) {}
        }
        return null;
    }
}
