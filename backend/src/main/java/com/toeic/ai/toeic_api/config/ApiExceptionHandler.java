package com.toeic.ai.toeic_api.config;

import java.util.stream.Collectors;

import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> invalidBody(MethodArgumentNotValidException exception) {
        var bindingResult = exception.getBindingResult();
        String fieldErrors = bindingResult.getFieldErrors().stream()
                .map(this::formatFieldError).distinct().collect(Collectors.joining(" "));
        String objectErrors = bindingResult.getGlobalErrors().stream()
                .map(error -> error.getDefaultMessage() == null ? "Dữ liệu chưa hợp lệ." : error.getDefaultMessage())
                .distinct().collect(Collectors.joining(" "));
        String detail = java.util.stream.Stream.of(fieldErrors, objectErrors)
                .filter(message -> !message.isBlank()).collect(Collectors.joining(" "));
        return ResponseEntity.badRequest().body(new ApiError("Dữ liệu chưa hợp lệ.", detail));
    }

    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class,
            HttpMessageNotReadableException.class})
    ResponseEntity<ApiError> badRequest(Exception exception) {
        String detail = exception instanceof IllegalArgumentException ? exception.getMessage() : "Vui lòng kiểm tra lại dữ liệu gửi lên.";
        return ResponseEntity.badRequest().body(new ApiError("Dữ liệu chưa hợp lệ.", detail));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(DataIntegrityViolationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("Không thể hoàn tất thao tác.", "Email đã tồn tại hoặc tài khoản còn liên kết dữ liệu."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiError> uploadTooLarge(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ApiError("File quá lớn.", "Kích thước file tối đa là 10 MB."));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception) {
        String detail = exception.getReason() == null ? "Yêu cầu chưa thể xử lý." : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(detail, detail));
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage() + ".";
    }

    record ApiError(String message, String detail) { }
}