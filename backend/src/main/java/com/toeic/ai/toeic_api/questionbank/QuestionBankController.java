package com.toeic.ai.toeic_api.questionbank;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/question-bank/questions")
public class QuestionBankController {
    private final QuestionBankService questionBankService;

    public QuestionBankController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    @GetMapping
    public List<QuestionBankQuestion> listQuestions() {
        return questionBankService.listQuestions();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuestionBankQuestion createQuestion(@Valid @RequestBody QuestionBankQuestionRequest request) {
        return questionBankService.createQuestion(request);
    }

    @PutMapping("/{id}")
    public QuestionBankQuestion updateQuestion(@PathVariable long id,
            @Valid @RequestBody QuestionBankQuestionRequest request) {
        return questionBankService.updateQuestion(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@PathVariable long id) {
        questionBankService.deleteQuestion(id);
    }

    @DeleteMapping
    public DeleteQuestionsResponse deleteQuestions(@RequestBody List<Long> ids) {
        return new DeleteQuestionsResponse(questionBankService.deleteQuestions(ids));
    }

    public record DeleteQuestionsResponse(int deletedCount) {
    }
}
