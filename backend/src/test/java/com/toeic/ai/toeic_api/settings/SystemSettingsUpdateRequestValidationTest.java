package com.toeic.ai.toeic_api.settings;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;

class SystemSettingsUpdateRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsACompleteSupportedConfiguration() {
        var request = new SystemSettingsUpdateRequest(
                "TOEIC AI",
                "help@example.com",
                45,
                "07:30",
                new SystemSettingNotificationsRequest(true, false, true),
                0L);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsInvalidRequiredValuesAndUnsupportedStudyDuration() {
        var request = new SystemSettingsUpdateRequest(
                " ",
                "not-an-email",
                20,
                "25:61",
                new SystemSettingNotificationsRequest(null, true, false),
                -1L);

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("systemName", "supportEmail", "reminderTime",
                        "notifications.newRegistrations", "expectedVersion",
                        "dailyStudyMinutesSupported");
    }
}
