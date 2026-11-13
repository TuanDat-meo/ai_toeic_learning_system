package com.toeic.ai.toeic_api.reading;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toeic.ai.toeic_api.contentimport.ContentImportUploadService;
import com.toeic.ai.toeic_api.contentimport.ContentType;
import com.toeic.ai.toeic_api.contentimport.DocumentContentRecognizer;
import com.toeic.ai.toeic_api.contentimport.ImportFileParser;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class ReadingController {

    private final ReadingService readingService;
    private final UserAccountService userAccountService;
    private final ImportFileParser importFileParser;
    private final ContentImportUploadService uploadService;
    private final DocumentContentRecognizer recognizer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReadingController(ReadingService readingService, UserAccountService userAccountService) {
        this(readingService, userAccountService, null, null, null);
    }

    @Autowired
    public ReadingController(
            ReadingService readingService,
            UserAccountService userAccountService,
            @Autowired(required = false) ImportFileParser importFileParser,
            @Autowired(required = false) ContentImportUploadService uploadService,
            @Autowired(required = false) DocumentContentRecognizer recognizer) {
        this.readingService = readingService;
        this.userAccountService = userAccountService;
        this.importFileParser = importFileParser;
        this.uploadService = uploadService;
        this.recognizer = recognizer;
    }

    @GetMapping("/api/reading/cards")
    public List<ReadingExerciseCard> listCards(@RequestParam(required = false) String category, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.listCards(category, userId);
    }

    @GetMapping("/api/admin/reading/cards")
    public List<ReadingExerciseCard> listAdminCards(
            @RequestParam(required = false) String category, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.listAdminCards(category, userId);
    }

    @GetMapping("/api/reading/cards/{cardId}")
    public ReadingExerciseCard getCard(@PathVariable String cardId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.getCard(cardId, userId);
    }

    @GetMapping("/api/admin/reading/cards/{cardId}")
    public ReadingExerciseCard getAdminCard(@PathVariable String cardId, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        return readingService.getAdminCard(cardId, userId);
    }

    @PostMapping("/api/reading/cards/{cardId}/progress")
    @ResponseStatus(HttpStatus.OK)
    public void saveProgress(@PathVariable String cardId, @RequestBody Map<String, Object> body, Authentication authentication) {
        UUID userId = extractUserId(authentication);
        int studied = body.get("studiedQuestions") instanceof Number n ? n.intValue() : 0;
        int correct = body.get("correctAnswers") instanceof Number n ? n.intValue() : 0;
        int wrong = body.get("wrongAnswers") instanceof Number n ? n.intValue() : 0;
        Boolean bookmarked = body.get("bookmarked") instanceof Boolean b ? b : null;
        readingService.saveProgress(userId, cardId, studied, correct, wrong, bookmarked);
    }

    @PostMapping("/api/admin/reading/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public ReadingExerciseCard createAdminCard(@RequestBody Map<String, Object> body, Authentication authentication) {
        return readingService.createCard(body, extractUserId(authentication));
    }

    @PutMapping("/api/admin/reading/cards/{cardId}")
    public ReadingExerciseCard updateAdminCard(@PathVariable String cardId, @RequestBody Map<String, Object> body,
            Authentication authentication) {
        return readingService.updateCard(cardId, body, extractUserId(authentication));
    }

    @DeleteMapping("/api/admin/reading/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAdminCard(@PathVariable String cardId) {
        readingService.deleteCard(cardId);
    }

    @PostMapping("/api/admin/reading/parse-file")
    public Map<String, Object> parseReadingFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chọn file có dữ liệu trước khi bóc tách.");
        }
        String filename = file.getOriginalFilename();
        String ext = filename != null && filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT)
                : "";
        JsonNode rawCard;
        if (Set.of("json", "csv", "xlsx", "xls").contains(ext) && importFileParser != null) {
            var rows = importFileParser.parse(file, ContentType.READING);
            if (rows.isEmpty()) {
                throw new IllegalArgumentException("File không chứa dữ liệu bài đọc hợp lệ.");
            }
            rawCard = rows.getFirst().data();
        } else if (uploadService != null && recognizer != null) {
            var extraction = uploadService.extract(ContentType.READING, file);
            List<Map<String, Object>> recognized = recognizer.recognize(ContentType.READING, extraction.text());
            if (recognized.isEmpty()) {
                throw new IllegalArgumentException("Không thể bóc tách nội dung Reading từ tài liệu.");
            }
            rawCard = objectMapper.valueToTree(recognized.getFirst());
        } else {
            throw new IllegalArgumentException("Chưa hỗ trợ đọc định dạng file này.");
        }
        return readingService.normalizeCardForPreview(rawCard);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        try {
            return userAccountService.findManagedUser(authentication.getName()).id();
        } catch (Exception e) {
            return null;
        }
    }
}
