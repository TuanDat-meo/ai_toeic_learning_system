package com.toeic.ai.toeic_api.questionbank;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record QuestionBankQuestionRequest(
        String code,
        @NotBlank String part,
        @NotBlank String questionText,
        String passage,
        String imageUrl,
        String audioUrl,
        @NotEmpty List<@Valid QuestionBankOption> options,
        @NotBlank String correctAnswer,
        @NotBlank String skill,
        @NotBlank String difficulty,
        String explanation,
        @NotBlank String status
) {
}
