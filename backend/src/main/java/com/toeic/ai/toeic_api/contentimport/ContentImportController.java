package com.toeic.ai.toeic_api.contentimport;

import java.util.Map;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.toeic.ai.toeic_api.audit.AuditLogService;
import com.toeic.ai.toeic_api.user.ManagedUser;
import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/admin/data/import")
public class ContentImportController {
    private final ContentImportService importService;
    private final ContentImportUploadService uploadService;
    private final UserAccountService userAccountService;
    private final AuditLogService auditLogService;

    public ContentImportController(ContentImportService importService, ContentImportUploadService uploadService,
            UserAccountService userAccountService, AuditLogService auditLogService) {
        this.importService = importService;
        this.uploadService = uploadService;
        this.userAccountService = userAccountService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/preview")
    @ResponseStatus(HttpStatus.CREATED)
    ContentImportService.BatchDetails preview(@RequestParam ContentType type,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "vocabularySetId", required = false) String vocabularySetId,
            @RequestParam(value = "vocabularySetName", required = false) String vocabularySetName,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.preview(
                type, file, actor.id(), vocabularySetId, vocabularySetName);
        auditLogService.record(actor.id(), "PREVIEW_IMPORT", "IMPORT_BATCH", result.batch().id(),
                "Tạo bản xem trước import " + result.batch().fileName() + " (" + type + ").",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PostMapping("/parse-text-preview")
    @ResponseStatus(HttpStatus.CREATED)
    ContentImportService.BatchDetails parseTextPreview(@RequestParam ContentType type,
            @RequestBody Map<String, String> payload, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        String text = payload.getOrDefault("text", "");
        String fileName = payload.getOrDefault("fileName", "extracted-document.json");
        ContentImportService.BatchDetails result = importService.previewExtractedText(
                type, fileName, text, actor.id(), payload.get("vocabularySetId"), payload.get("vocabularySetName"));
        auditLogService.record(actor.id(), "PREVIEW_IMPORT_TEXT", "IMPORT_BATCH", result.batch().id(),
                "Tạo bản xem trước từ văn bản trích xuất " + fileName + " (" + type + ") gồm " + result.batch().totalRecords() + " mục.",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PostMapping("/extract")
    @ResponseStatus(HttpStatus.OK)
    ContentImportUploadService.DocumentExtraction extract(@RequestParam ContentType type,
            @RequestParam("file") MultipartFile file, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportUploadService.DocumentExtraction result = uploadService.extract(type, file);
        auditLogService.record(actor.id(), "EXTRACT_IMPORT_DOCUMENT", "CONTENT_IMPORT_FILE", null,
                "Trích xuất tài liệu " + result.fileName() + " (" + type + "), S3 key: " + result.storageKey() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PostMapping("/assets")
    @ResponseStatus(HttpStatus.CREATED)
    ContentImportUploadService.MediaAsset uploadAsset(@RequestParam ContentType type,
            @RequestParam("file") MultipartFile file, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportUploadService.MediaAsset result = uploadService.uploadMedia(type, file);
        auditLogService.record(actor.id(), "UPLOAD_IMPORT_ASSET", "CONTENT_IMPORT_FILE", null,
                "Tải media " + result.fileName() + " (" + type + ") lên Object Storage, S3 key: "
                        + result.storageKey() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @GetMapping("/batches")
    List<ContentImportService.BatchSummary> listBatches(
            @RequestParam(defaultValue = "20") int limit) {
        return importService.listBatches(limit);
    }

    @GetMapping("/batches/{batchId}")
    ContentImportService.BatchDetails getBatch(@PathVariable UUID batchId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "100") int limit) {
        return importService.getBatch(batchId, offset, limit);
    }

    @PostMapping("/batches/{batchId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    ContentImportService.BatchDetails addVocabularyItem(@PathVariable UUID batchId,
            @RequestBody Map<String, Object> data, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.addVocabularyPreviewItem(batchId, data);
        auditLogService.record(actor.id(), "ADD_IMPORT_PREVIEW_ITEM", "IMPORT_BATCH", batchId,
                "Thêm từ vựng vào bản xem trước import " + result.batch().fileName() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PutMapping("/batches/{batchId}/items/{itemId}")
    ContentImportService.BatchDetails updateVocabularyItem(@PathVariable UUID batchId, @PathVariable UUID itemId,
            @RequestBody Map<String, Object> data, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.updateVocabularyPreviewItem(batchId, itemId, data);
        auditLogService.record(actor.id(), "UPDATE_IMPORT_PREVIEW_ITEM", "IMPORT_ITEM", itemId,
                "Cập nhật từ vựng trong bản xem trước import " + result.batch().fileName() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PostMapping("/batches/{batchId}/revalidate")
    ContentImportService.BatchDetails revalidateBatch(@PathVariable UUID batchId, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.revalidateBatch(batchId);
        auditLogService.record(actor.id(), "REVALIDATE_IMPORT", "IMPORT_BATCH", batchId,
                "Kiểm tra lại lô import " + result.batch().fileName() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PutMapping("/batches/{batchId}/items/{itemId}/duplicate-resolution")
    ContentImportService.BatchDetails resolveVocabularyDuplicate(@PathVariable UUID batchId,
            @PathVariable UUID itemId, @RequestBody Map<String, String> payload,
            Authentication authentication, HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        String resolution = payload.getOrDefault("resolution", "");
        ContentImportService.BatchDetails result =
                importService.resolveVocabularyDuplicate(batchId, itemId, resolution);
        auditLogService.record(actor.id(), "RESOLVE_IMPORT_DUPLICATE", "IMPORT_ITEM", itemId,
                "Chọn xử lý từ trùng: " + resolution + " trong lô import " + result.batch().fileName() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @DeleteMapping("/batches/{batchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBatch(@PathVariable UUID batchId, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        importService.deleteBatch(batchId);
        auditLogService.record(actor.id(), "DELETE_IMPORT_BATCH", "IMPORT_BATCH", batchId,
                "Xóa lô import chưa publish: " + batchId + ".",
                servletRequest.getRemoteAddr());
    }

    @DeleteMapping("/batches/{batchId}/items/{itemId}")
    ContentImportService.BatchDetails deleteVocabularyItem(@PathVariable UUID batchId, @PathVariable UUID itemId,
            Authentication authentication, HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.deleteVocabularyPreviewItem(batchId, itemId);
        auditLogService.record(actor.id(), "DELETE_IMPORT_PREVIEW_ITEM", "IMPORT_ITEM", itemId,
                "Xóa từ vựng khỏi bản xem trước import " + result.batch().fileName() + ".",
                servletRequest.getRemoteAddr());
        return result;
    }

    @PostMapping("/batches/{batchId}/publish")
    ContentImportService.BatchSummary publish(@PathVariable UUID batchId, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchSummary result = importService.publish(batchId, actor.id());
        auditLogService.record(actor.id(), "PUBLISH_IMPORT", "IMPORT_BATCH", batchId,
                "Publish lô import " + result.fileName() + ": " + result.publishedCount() + " dòng.",
                servletRequest.getRemoteAddr());
        return result;
    }

    @GetMapping("/published")
    List<ContentImportService.PublishedContent> listPublished(
            @RequestParam(required = false) ContentType type,
            @RequestParam(defaultValue = "50") int limit) {
        return importService.listPublished(type, limit);
    }
}
