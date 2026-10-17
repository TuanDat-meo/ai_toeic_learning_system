package com.toeic.ai.toeic_api.billing;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/webhooks/sepay")
public class SePayWebhookController {
    private static final Logger log = LoggerFactory.getLogger(SePayWebhookController.class);

    private final PaymentTransactionService transactions;
    private final String webhookToken;

    public SePayWebhookController(
            PaymentTransactionService transactions,
            @Value("${app.payment.sepay.webhook-token:}") String webhookToken) {
        this.transactions = transactions;
        this.webhookToken = webhookToken;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> receive(
            @RequestHeader(name = "Authorization", required = false) String authorization,
            @RequestBody SePayWebhookRequest event) {
        log.info("SePay webhook received (eventId={}, transferType={}, amount={})",
                event == null ? null : event.id(),
                event == null ? null : event.transferType(),
                event == null ? null : event.transferAmount());
        if (webhookToken.isBlank()) {
            log.error("SePay webhook rejected because its token is not configured");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Webhook SePay chưa được cấu hình.");
        }
        String expected = "Apikey " + webhookToken;
        if (authorization == null || !MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8), authorization.getBytes(StandardCharsets.UTF_8))) {
            log.warn("SePay webhook rejected due to invalid Authorization (eventId={})",
                    event == null ? null : event.id());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Webhook SePay không hợp lệ.");
        }
        if (event == null || !"in".equalsIgnoreCase(event.transferType())
                || event.transferAmount() == null || event.transferAmount() <= 0) {
            log.warn("SePay webhook rejected due to invalid transfer data (eventId={})",
                    event == null ? null : event.id());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin giao dịch SePay không hợp lệ.");
        }

        String description = String.join(" ",
                event.content() == null ? "" : event.content(),
                event.code() == null ? "" : event.code()).trim();
        if (description.isEmpty()) {
            log.warn("SePay webhook rejected because transfer description is empty (eventId={})", event.id());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giao dịch SePay không có nội dung chuyển khoản.");
        }
        boolean matched = transactions.confirmSePayPayment(description, event.transferAmount());
        if (!matched) {
            log.warn("SePay transfer could not be matched to a pending order (eventId={}, amount={})",
                    event.id(), event.transferAmount());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy đơn chờ thanh toán khớp nội dung và số tiền."));
        }
        log.info("SePay transfer matched and confirmed (eventId={}, amount={})",
                event.id(), event.transferAmount());
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xác nhận giao dịch."));
    }
}
