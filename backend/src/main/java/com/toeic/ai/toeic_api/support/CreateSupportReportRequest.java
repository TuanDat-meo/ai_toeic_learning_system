package com.toeic.ai.toeic_api.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record CreateSupportReportRequest(
        @NotBlank @Pattern(regexp = "QUESTION_ERROR|SYSTEM_BUG|UI_FEEDBACK|ACCOUNT_ISSUE|OTHER") String category,
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(min = 5, max = 5000) String description,
        @NotBlank @Pattern(regexp = "READING|LISTENING|MOCK_TEST|QUESTION_BANK|OTHER") String source,
        @Size(max = 120) String questionRef,
        Map<String, Object> questionSnapshot,
        @Size(max = 500) String relatedContent) { }
