package com.toeic.ai.toeic_api.questionbank;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class QuestionBankServiceIntegrationTest {
    @Autowired
    private QuestionBankService questionBankService;

    @Test
    void createsListsUpdatesAndDeletesQuestionBankRecords() {
        QuestionBankQuestion created = questionBankService.createQuestion(request("Question bank integration test"));

        assertThat(created.id()).isNotBlank();
        assertThat(created.code()).startsWith("P5-");
        assertThat(created.options()).hasSize(2);
        assertThat(created.options()).filteredOn(QuestionBankOption::isCorrect)
                .extracting(QuestionBankOption::id).containsExactly("B");
        assertThat(questionBankService.listQuestions()).extracting(QuestionBankQuestion::id)
                .contains(created.id());

        QuestionBankQuestion updated = questionBankService.updateQuestion(
                Long.parseLong(created.id()), request("Updated question bank integration test"));

        assertThat(updated.questionText()).isEqualTo("Updated question bank integration test");
        assertThat(updated.code()).isEqualTo(created.code());
        assertThat(updated.status()).isEqualTo("DRAFT");
        assertThat(updated.difficulty()).isEqualTo("Hard");

        questionBankService.deleteQuestion(Long.parseLong(created.id()));

        assertThat(questionBankService.listQuestions()).extracting(QuestionBankQuestion::id)
                .doesNotContain(created.id());
    }

    @Test
    void bulkDeletesUnreferencedQuestionBankRecords() {
        QuestionBankQuestion first = questionBankService.createQuestion(request("Bulk delete first question"));
        QuestionBankQuestion second = questionBankService.createQuestion(request("Bulk delete second question"));

        int deletedCount = questionBankService.deleteQuestions(
                List.of(Long.parseLong(first.id()), Long.parseLong(second.id())));

        assertThat(deletedCount).isEqualTo(2);
        assertThat(questionBankService.listQuestions()).extracting(QuestionBankQuestion::id)
                .doesNotContain(first.id(), second.id());
    }

    private QuestionBankQuestionRequest request(String questionText) {
        return new QuestionBankQuestionRequest(
                null,
                "Part 5",
                questionText,
                null,
                null,
                null,
                List.of(
                        new QuestionBankOption("A", "First answer", false),
                        new QuestionBankOption("B", "Correct answer", true)),
                "B",
                "Grammar (Ngữ pháp)",
                questionText.startsWith("Updated") ? "Hard" : "Medium",
                "Integration test explanation",
                questionText.startsWith("Updated") ? "DRAFT" : "PUBLISHED");
    }
}
