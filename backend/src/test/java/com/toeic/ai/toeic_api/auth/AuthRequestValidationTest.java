package com.toeic.ai.toeic_api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.Test;

class AuthRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsInvalidSignupForgotAndResetRequests() {
        Set<ConstraintViolation<AuthController.RegisterRequest>> signupViolations = validator.validate(
                new AuthController.RegisterRequest(" ", "not-an-email", "short"));
        assertThat(signupViolations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("fullName", "email", "password");

        Set<ConstraintViolation<AuthController.ForgotPasswordRequest>> forgotViolations = validator.validate(
                new AuthController.ForgotPasswordRequest("not-an-email"));
        assertThat(forgotViolations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("email");

        Set<ConstraintViolation<AuthController.ResetPasswordRequest>> resetViolations = validator.validate(
                new AuthController.ResetPasswordRequest("", "short"));
        assertThat(resetViolations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("token", "password");
    }

    @Test
    void acceptsValidAuthRequests() {
        assertThat(validator.validate(new AuthController.RegisterRequest("Nguyen Van A", "a@example.com", "password123")))
                .isEmpty();
        assertThat(validator.validate(new AuthController.ForgotPasswordRequest("a@example.com"))).isEmpty();
        assertThat(validator.validate(new AuthController.ResetPasswordRequest("secure-token", "password123")))
                .isEmpty();
    }

    @Test
    void validatesProfileAndPasswordChangeRequests() {
        Set<ConstraintViolation<AuthController.UpdateProfileRequest>> profileViolations = validator.validate(
                new AuthController.UpdateProfileRequest(" ", "not-an-email"));
        assertThat(profileViolations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("fullName", "email");

        Set<ConstraintViolation<AuthController.ChangePasswordRequest>> passwordViolations = validator.validate(
                new AuthController.ChangePasswordRequest("", "short"));
        assertThat(passwordViolations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("currentPassword", "newPassword");

        assertThat(validator.validate(new AuthController.UpdateProfileRequest("Admin User", "admin@example.com")))
                .isEmpty();
        assertThat(validator.validate(new AuthController.ChangePasswordRequest("current123", "newpassword123")))
                .isEmpty();
    }
}