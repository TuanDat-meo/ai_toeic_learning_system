package com.toeic.ai.toeic_api.settings;

import jakarta.validation.constraints.NotNull;

public record SystemSettingNotificationsRequest(
        @NotNull Boolean newRegistrations,
        @NotNull Boolean supportRequests,
        @NotNull Boolean contentReports) { }
