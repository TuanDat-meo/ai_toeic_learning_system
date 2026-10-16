package com.toeic.ai.toeic_api.settings;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SystemSettingsUpdateRequest(
        @NotBlank @Size(max = 80) String systemName,
        @NotBlank @Email @Size(max = 254) String supportEmail,
        @NotNull @Min(15) @Max(90) Integer dailyStudyMinutes,
        @NotBlank @Pattern(regexp = "^(?:[01][0-9]|2[0-3]):[0-5][0-9]$") String reminderTime,
        @NotNull @Valid SystemSettingNotificationsRequest notifications,
        @NotNull Boolean aiModerationEnabled,
        @NotNull @Min(0) Long expectedVersion) {

    @AssertTrue(message = "Thời lượng học phải là một trong các mức 15, 30, 45, 60 hoặc 90 phút.")
    public boolean isDailyStudyMinutesSupported() {
        return dailyStudyMinutes == null || java.util.List.of(15, 30, 45, 60, 90).contains(dailyStudyMinutes);
    }
}
