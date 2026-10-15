package com.toeic.ai.toeic_api.contentimport;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
    private final UserAccountService userAccountService;
    private final AuditLogService auditLogService;

    public ContentImportController(ContentImportService importService, UserAccountService userAccountService,
            AuditLogService auditLogService) {
        this.importService = importService;
        this.userAccountService = userAccountService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/preview")
    @ResponseStatus(HttpStatus.CREATED)
    ContentImportService.BatchDetails preview(@RequestParam ContentType type,
            @RequestParam("file") MultipartFile file, Authentication authentication,
            HttpServletRequest servletRequest) {
        ManagedUser actor = userAccountService.findManagedUser(authentication.getName());
        ContentImportService.BatchDetails result = importService.preview(type, file, actor.id());
        auditLogService.record(actor.id(), "PREVIEW_IMPORT", "IMPORT_BATCH", result.batch().id(),
                "Tạo bản xem trước import " + result.batch().fileName() + " (" + type + ").",
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
