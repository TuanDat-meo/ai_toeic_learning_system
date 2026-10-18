package com.toeic.ai.toeic_api.chat;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

@Service
public class GeminiChatService {
    private static final String SYSTEM_INSTRUCTION = """
            Bạn là gia sư TOEIC thân thiện, kiên nhẫn và chính xác. Trả lời chủ yếu bằng tiếng Việt,
            giải thích câu hỏi TOEIC từng bước, làm rõ ngữ pháp, từ vựng và lý do chọn đáp án.
            Nếu người học gửi câu hỏi chưa đủ ngữ cảnh, hãy hỏi lại. Không bịa đáp án khi không chắc.
            Khuyến khích người học tự hiểu cách làm thay vì chỉ đưa đáp án.
            """;

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiChatService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-3.8-flash}") String model) {
        this.restClient = RestClient.create("https://generativelanguage.googleapis.com");
        this.apiKey = apiKey;
        this.model = model;
    }

    public AiChatResponse reply(List<AiChatTurn> messages) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ AI chưa được cấu hình GEMINI_API_KEY.");
        }
        if (!"user".equals(messages.getLast().role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn cuối cùng phải là câu hỏi của học viên.");
        }

        var contents = messages.stream()
                .map(turn -> Map.of("role", turn.role(), "parts", List.of(Map.of("text", turn.content()))))
                .toList();
        var request = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.5, "maxOutputTokens", 1024));

        try {
            JsonNode response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
            StringBuilder textBuilder = new StringBuilder();
            if (response != null) {
                for (JsonNode part : response.path("candidates").path(0).path("content").path("parts")) {
                    if (!part.path("thought").asBoolean(false)) {
                        String partText = part.path("text").asText("");
                        if (!partText.isBlank()) textBuilder.append(partText);
                    }
                }
            }
            String text = textBuilder.toString().trim();
            if (text == null || text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini không trả về nội dung. Vui lòng thử lại.");
            }
            return new AiChatResponse(text.trim());
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            if (status == 400 || status == 401 || status == 403) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Gemini từ chối yêu cầu. Hãy kiểm tra GEMINI_API_KEY và quyền truy cập Gemini API.");
            }
            if (status == 404) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Không tìm thấy model Gemini đã cấu hình. Hãy kiểm tra GEMINI_MODEL.");
            }
            if (status == 429) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Gemini đang quá tải hoặc đã hết hạn mức API. Vui lòng thử lại sau.");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gemini trả về lỗi HTTP " + status + ". Vui lòng thử lại sau.");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể kết nối Gemini lúc này. Vui lòng thử lại sau.");
        }
    }
}
