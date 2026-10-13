package com.toeic.ai.toeic_api.support;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateSupportReportRequest(
        @NotBlank @Pattern(regexp = "PENDING|IN_PROGRESS|RESOLVED|REJECTED") String status,
        @Size(max = 5000) String adminReply,
        Map<String, Object> correction) { }
