package com.toeic.ai.toeic_api.questionbank;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

class QuestionBankServiceTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final QuestionBankService questionBankService = new QuestionBankService(jdbc, new ObjectMapper());

    @Test
    void rejectsQuestionWhenCorrectAnswerDoesNotMatchAnOption() {
        QuestionBankQuestionRequest request = new QuestionBankQuestionRequest(
                null,
                "Part 5",
                "Choose the correct answer.",
                null,
                null,
                null,
                List.of(
                        new QuestionBankOption("A", "First answer", false),
                        new QuestionBankOption("B", "Second answer", false)),
                "C",
                "Grammar (Ngữ pháp)",
                "Medium",
                "Explanation",
                "DRAFT");

        assertThatThrownBy(() -> questionBankService.createQuestion(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
        verifyNoInteractions(jdbc);
    }
}
