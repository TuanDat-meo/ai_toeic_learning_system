package com.toeic.ai.toeic_api.community;

import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCommunityPostRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(min = 5, max = 10000) String content,
        @NotBlank @Pattern(regexp = "DISCUSSION|QUESTION") String postType,
        Map<String, Object> questionSnapshot) { }
