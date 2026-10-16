package com.toeic.ai.toeic_api.settings;

public record SystemSettingNotifications(
        boolean newRegistrations,
        boolean supportRequests,
        boolean contentReports) {
}
