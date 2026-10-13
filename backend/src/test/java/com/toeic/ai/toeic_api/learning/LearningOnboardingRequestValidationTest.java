package com.toeic.ai.toeic_api.learning;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;

class LearningOnboardingRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsValidOnboardingAnswers() {
        LearningOnboardingRequest request = new LearningOnboardingRequest(
                750, null, "CAREER", "INTERMEDIATE", 550, 30, List.of(1, 3, 5),
                List.of("LISTENING", "VOCABULARY"));

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void rejectsUnsupportedChoicesAndOutOfRangeValues() {
        LearningOnboardingRequest request = new LearningOnboardingRequest(
                500, null, "OTHER", "NEW", 1000, 20, List.of(8),
                List.of("SPEAKING"));

        assertThat(validator.validate(request))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("targetScoreSupported", "learningReason", "currentLevel", "recentScore",
                        "dailyStudyMinutesSupported", "studyDays[0].<list element>",
                        "interests[0].<list element>");
    }

    @Test
    void acceptsIncompleteDraftAndRejectsInvalidStep() {
        LearningOnboardingDraftRequest draft = new LearningOnboardingDraftRequest(
                750, null, null, null, null, null, List.of(), List.of(), 1);
        LearningOnboardingDraftRequest emptyDraft = new LearningOnboardingDraftRequest(
                null, null, null, null, null, null, List.of(), List.of(), 0);
        LearningOnboardingDraftRequest invalidStep = new LearningOnboardingDraftRequest(
                null, null, null, null, null, null, List.of(), List.of(), 5);

        assertThat(validator.validate(draft)).isEmpty();
        assertThat(validator.validate(emptyDraft)).isEmpty();
        assertThat(validator.validate(invalidStep))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("currentStep");
    }

    @Test
    void rejectsUnsupportedTargetScoreOnDraft() {
        LearningOnboardingDraftRequest draft = new LearningOnboardingDraftRequest(
                500, null, null, null, null, null, List.of(), List.of(), 0);

        assertThat(validator.validate(draft))
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("targetScoreSupported");
    }
}
