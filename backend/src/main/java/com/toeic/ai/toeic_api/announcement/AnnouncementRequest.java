package com.toeic.ai.toeic_api.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AnnouncementRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 500) String summary,
        @NotBlank @Size(max = 10000) String content,
        @NotBlank @Pattern(regexp = "SYSTEM|FEATURE_UPDATE|PROMOTION|EVENT") String type,
        @NotBlank @Pattern(regexp = "ALL|FREE_USERS|VIP_USERS") String target,
        @NotBlank @Pattern(regexp = "ACTIVE|DRAFT|ARCHIVED") String status,
        boolean isPinned,
        @Size(max = 500) String actionUrl) { }
