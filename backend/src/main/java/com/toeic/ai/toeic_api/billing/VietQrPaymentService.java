package com.toeic.ai.toeic_api.billing;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VietQrPaymentService {
    private static final Duration PAYMENT_LIFETIME = Duration.ofMinutes(30);

    private final JdbcTemplate jdbc;
    private final String bankCode;
    private final String accountNumber;
    private final String accountName;
    private final String sepayWebhookToken;

    public VietQrPaymentService(
            JdbcTemplate jdbc,
            @Value("${app.payment.vietqr.bank-code:}") String bankCode,
            @Value("${app.payment.vietqr.account-number:}") String accountNumber,
            @Value("${app.payment.vietqr.account-name:}") String accountName,
            @Value("${app.payment.sepay.webhook-token:}") String sepayWebhookToken) {
        this.jdbc = jdbc;
        this.bankCode = bankCode.trim();
        this.accountNumber = accountNumber.trim();
        this.accountName = accountName.trim();
        this.sepayWebhookToken = sepayWebhookToken.trim();
    }

    public StudentCheckoutResponse createQr(PaymentTransaction transaction) {
        requireConfigured();

        List<Instant> creationTimes = jdbc.query("""
                SELECT created_at
                FROM payment_transactions
                WHERE id = ? AND status = 'PENDING'
                  AND created_at > now() - INTERVAL '30 minutes'
                FOR UPDATE
                """, (rs, row) -> rs.getTimestamp("created_at").toInstant(), transaction.id());
        if (creationTimes.isEmpty()) {
            jdbc.update("""
                    UPDATE payment_transactions
                    SET status = 'EXPIRED',
                        note = CONCAT_WS(E'\\n', NULLIF(note, ''), 'Hóa đơn hết hạn sau 30 phút, chưa ghi nhận thanh toán.'),
                        updated_at = now()
                    WHERE id = ? AND status = 'PENDING'
                      AND created_at <= now() - INTERVAL '30 minutes'
                    """, transaction.id());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Hóa đơn đã hết hạn hoặc vừa được xử lý. Vui lòng tạo đơn đăng ký mới.");
        }

        Instant expiresAt = creationTimes.getFirst().plus(PAYMENT_LIFETIME);
        List<String> references = jdbc.query("""
                SELECT qr_reference
                FROM payment_qr_sessions
                WHERE transaction_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """, (rs, row) -> rs.getString("qr_reference"), transaction.id());
        String reference;
        if (references.isEmpty()) {
            reference = "TOEIC" + UUID.randomUUID().toString().replace("-", "").substring(0, 19);
            int inserted = jdbc.update("""
                    INSERT INTO payment_qr_sessions(transaction_id, qr_reference, expires_at)
                    VALUES (?, ?, ?)
                    """, transaction.id(), reference, Timestamp.from(expiresAt));
            if (inserted == 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể tạo mã thanh toán. Vui lòng thử lại.");
            }
        } else {
            reference = references.getFirst();
            jdbc.update("""
                    UPDATE payment_qr_sessions
                    SET expires_at = ?
                    WHERE transaction_id = ?
                    """, Timestamp.from(expiresAt), transaction.id());
        }

        String qrImageUrl = "https://img.vietqr.io/image/"
                + encodePath(bankCode) + "-" + encodePath(accountNumber) + "-compact2.png"
                + "?amount=" + transaction.amount()
                + "&addInfo=" + encodeQuery(reference)
                + "&accountName=" + encodeQuery(accountName);

        return new StudentCheckoutResponse(
                transaction.id().toString(), transaction.orderCode(), transaction.planName(),
                transaction.amount(), transaction.status(), bankCode, accountNumber, accountName,
                reference, qrImageUrl, expiresAt);
    }

    public void requireConfigured() {
        if (bankCode.isBlank() || accountNumber.isBlank() || accountName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Thanh toán VietQR chưa được cấu hình tài khoản nhận. Vui lòng liên hệ quản trị viên.");
        }
        if (sepayWebhookToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Thanh toán VietQR chưa được cấu hình webhook SePay. Vui lòng liên hệ quản trị viên.");
        }
        if (!bankCode.matches("[A-Za-z0-9]+") || !accountNumber.matches("[0-9]{6,20}")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Cấu hình ngân hàng VietQR không hợp lệ. Vui lòng liên hệ quản trị viên.");
        }
    }

    private static String encodePath(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String encodeQuery(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
