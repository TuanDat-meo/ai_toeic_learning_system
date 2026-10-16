package com.toeic.ai.toeic_api.settings;

import java.time.Instant;

public record SystemSettings(
        String systemName,
        String supportEmail,
        int dailyStudyMinutes,
        String reminderTime,
        SystemSettingNotifications notifications,
        boolean aiModerationEnabled,
        long version,
        Instant updatedAt) {
}
