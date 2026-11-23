package com.toeic.ai.toeic_api.chat;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
            Bạn thông thái, nhiệt tình, kiên nhẫn và luôn trả lời chính xác, mạch lạc bằng tiếng Việt với định dạng Markdown rõ ràng.

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

            VỀ CÁC LĨNH VỰC KHÁC NGOÀI HỌC TẬP (Người dùng hỏi gì bạn hãy trả lời chính xác, đúng trọng tâm câu hỏi đó):
            - Sức khỏe & Thuốc men: Tư vấn lối sống lành mạnh, dinh dưỡng, giấc ngủ mùa thi, giải thích tác dụng và lưu ý của các nhóm thuốc thông dụng (Paracetamol hạ sốt giảm đau, Ibuprofen giảm đau kháng viêm, Oresol bù điện giải, Vitamin C...) kèm lưu ý y tế an toàn luôn tham khảo ý kiến bác sĩ/dược sĩ.
            - Học tập trên trường & Phương pháp học: Kỹ thuật Pomodoro, phương pháp Feynman, Active Recall, cách cân bằng giữa học tín chỉ đại học và luyện thi TOEIC, quản lý thời gian.
            - Bóng đá & Thể thao: Các giải đấu lớn (Premier League, Champions League, World Cup, Euro), các câu lạc bộ (Real Madrid, Man United, Arsenal, Man City, Barca...), chiến thuật bóng đá (Gegenpressing, kiểm soát bóng), giải thích luật bóng đá (luật việt vị, VAR...).
            - Tài chính & Kinh tế: Quản lý chi tiêu cá nhân 50/30/20, quỹ khẩn cấp, lãi suất kép, lạm phát, cung - cầu, tiết kiệm và đầu tư cơ bản.
            - Xã hội, văn hóa, công nghệ & Đời sống hàng ngày.

            NGUYÊN TẮC TRẢ LỜI:
            - Trả lời trực tiếp, chính xác, nhiệt tình, đúng trọng tâm câu hỏi của người dùng.
            - Trình bày đẹp mắt với các tiêu đề, gạch đầu dòng rõ ràng, dễ đọc bằng Markdown.
            """;

    private final RestClient geminiRestClient;
    private final RestClient ollamaRestClient;
    private final String apiKey;
    private final String configuredModel;
    private final String ollamaBaseUrl;
    private final String ollamaModel;

    public GeminiChatService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-3.5-flash}") String configuredModel,
            @Value("${grammar.ai.ollama.base-url:http://ollama:11434}") String ollamaBaseUrl,
            @Value("${grammar.ai.ollama.model:qwen2.5:3b}") String ollamaModel) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(6));
        requestFactory.setReadTimeout(Duration.ofSeconds(12));

        this.geminiRestClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(requestFactory)
                .build();

        this.ollamaRestClient = RestClient.builder()
                .baseUrl(ollamaBaseUrl.isBlank() ? "http://ollama:11434" : ollamaBaseUrl)
                .requestFactory(requestFactory)
                .build();

        this.apiKey = apiKey;
        this.configuredModel = configuredModel;
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

        String lastPrompt = messages.getLast().content();

        // Tier 1: Try Google Gemini API
        if (apiKey != null && !apiKey.isBlank()) {
            List<String> modelsToTry = getCandidateModels();
            for (String model : modelsToTry) {
                try {
                    String reply = callGemini(messages, model);
                    if (reply != null && !reply.isBlank()) {
                        return new AiChatResponse(reply.trim());
                    }
                } catch (Exception e) {
                    log.warn("Gemini model {} failed: {}. Trying next option...", model, e.getMessage());
                }
            }
        }

        // Tier 2: Try Local Ollama (toeic-ollama container)
        try {
            String ollamaReply = callOllama(messages);
            if (ollamaReply != null && !ollamaReply.isBlank()) {
                return new AiChatResponse(ollamaReply.trim());
            }
        } catch (Exception e) {
            log.warn("Ollama fallback failed: {}. Falling back to BuiltInAssistantEngine...", e.getMessage());
        }

        // Tier 3: Built-in Smart Assistant Engine (100% reliable guarantee)
        String builtInReply = BuiltInAssistantEngine.generateReply(lastPrompt);
        return new AiChatResponse(builtInReply.trim());
    }

    private List<String> getCandidateModels() {
        if ("gemini-3.5-flash".equalsIgnoreCase(configuredModel)) {
            return List.of("gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash");
        }
        return List.of(configuredModel, "gemini-3.5-flash", "gemini-3.5-flash-lite");
    }

    private final tools.jackson.databind.ObjectMapper objectMapper = new tools.jackson.databind.ObjectMapper();

    private String callGemini(List<AiChatTurn> messages, String model) {
        var contents = messages.stream()
                .map(turn -> Map.of("role", turn.role(), "parts", List.of(Map.of("text", turn.content()))))
                .toList();

        var request = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.6, "maxOutputTokens", 1200));

        String rawJson = geminiRestClient.post()
                .uri("/v1beta/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(String.class);

        if (rawJson != null && !rawJson.isBlank()) {
            try {
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
                "stream", false);

        String rawOllama = ollamaRestClient.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(String.class);

        if (rawOllama != null && !rawOllama.isBlank()) {
            try {
                JsonNode response = objectMapper.readTree(rawOllama);
                if (response.has("response")) {
                    return response.path("response").asString();
                }
            } catch (Exception ignored) {}
        }
        return null;
    }
}
