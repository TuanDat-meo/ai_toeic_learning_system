package com.toeic.ai.toeic_api.support;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
public class SupportReportController {
    private final SupportReportService reports;
    private final UserAccountService users;

    public SupportReportController(SupportReportService reports, UserAccountService users) {
        this.reports = reports;
        this.users = users;
    }

    @PostMapping("/api/support-reports")
    @ResponseStatus(HttpStatus.CREATED)
    public SupportReport create(@Valid @RequestBody CreateSupportReportRequest body, Authentication authentication) {
        return reports.create(users.findManagedUser(authentication.getName()).id(), body);
    }

    @GetMapping("/api/support-reports/mine")
    public List<SupportReport> mine(Authentication authentication) {
        return reports.listForUser(users.findManagedUser(authentication.getName()).id());
    }

    @GetMapping("/api/admin/support/reports")
    public List<SupportReport> list() {
        return reports.listForAdmin();
    }

    @PatchMapping("/api/admin/support/reports/{id}")
    public SupportReport update(@PathVariable UUID id,
            @Valid @RequestBody UpdateSupportReportRequest body,
            Authentication authentication) {
        return reports.update(id, users.findManagedUser(authentication.getName()).id(), body);
    }

    @DeleteMapping("/api/admin/support/reports/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        reports.delete(id);
    }

    @GetMapping("/api/question-corrections/{questionRef}")
    public Map<String, Object> correction(@PathVariable String questionRef) {
        return reports.findQuestionCorrection(questionRef);
    }
}
