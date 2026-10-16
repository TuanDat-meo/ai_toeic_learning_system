package com.toeic.ai.toeic_api.settings;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.toeic.ai.toeic_api.user.UserAccountService;

@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingsController {
    private final SystemSettingsService settingsService;
    private final UserAccountService userAccountService;

    public SystemSettingsController(SystemSettingsService settingsService, UserAccountService userAccountService) {
        this.settingsService = settingsService;
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public SystemSettings get() {
        return settingsService.getSettings();
    }

    @PutMapping
    public SystemSettings update(
            @Valid @RequestBody SystemSettingsUpdateRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        var admin = userAccountService.findManagedUser(authentication.getName());
        return settingsService.update(request, admin.id(), servletRequest.getRemoteAddr());
    }
}
