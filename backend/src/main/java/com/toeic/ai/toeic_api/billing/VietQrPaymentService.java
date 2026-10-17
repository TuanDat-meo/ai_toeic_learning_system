package com.toeic.ai.toeic_api.billing;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VietQrPaymentService {
    private static final long QR_LIFETIME_SECONDS = 120;

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

        String reference = "TOEIC" + UUID.randomUUID().toString().replace("-", "").substring(0, 19);
        Instant expiresAt = Instant.now().plusSeconds(QR_LIFETIME_SECONDS);
        int inserted = jdbc.update("""
                INSERT INTO payment_qr_sessions(transaction_id, qr_reference, expires_at)
                SELECT ?, ?, ?
                WHERE EXISTS (
                    SELECT 1 FROM payment_transactions
                    WHERE id = ? AND status = 'PENDING'
                )
                """, transaction.id(), reference, Timestamp.from(expiresAt), transaction.id());
        if (inserted == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Đơn thanh toán vừa được xử lý. Hãy làm mới trạng thái giao dịch.");
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
