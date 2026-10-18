package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

class VietQrPaymentServiceTest {
    @Test
    void createsAnExactAmountQrWithAStableReferenceAndThirtyMinuteExpiry() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        PaymentTransaction transaction = pendingTransaction(75_000);
        String reference = "TOEIC1234567890123456789";
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class)))
                .thenReturn(List.of(transaction.createdAt()), List.of(reference));
        VietQrPaymentService service = new VietQrPaymentService(
                jdbc, "970415", "123456789", "NGUYEN VAN A", "test-sepay-token");

        StudentCheckoutResponse response = service.createQr(transaction);

        assertThat(response.qrImageUrl())
                .contains("970415-123456789-compact2.png?amount=75000")
                .contains("addInfo=" + response.paymentContent())
                .contains("accountName=NGUYEN%20VAN%20A");
        assertThat(response.paymentContent()).isEqualTo(reference);
        assertThat(response.expiresAt()).isEqualTo(transaction.createdAt().plus(30, ChronoUnit.MINUTES));
        verify(jdbc).update(anyString(), any(Timestamp.class), any(UUID.class));
    }

    @Test
    void refusesToCreateQrUntilReceivingAccountIsConfigured() {
        VietQrPaymentService service = new VietQrPaymentService(mock(JdbcTemplate.class), "", "", "", "");

        assertThatThrownBy(() -> service.createQr(pendingTransaction(75_000)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("chưa được cấu hình tài khoản nhận");
    }

    @Test
    void refusesToCreateQrUntilSepayWebhookIsConfigured() {
        VietQrPaymentService service = new VietQrPaymentService(
                mock(JdbcTemplate.class), "970415", "123456789", "NGUYEN VAN A", "");

        assertThatThrownBy(() -> service.createQr(pendingTransaction(75_000)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("chưa được cấu hình webhook SePay");
    }

    private static PaymentTransaction pendingTransaction(long amount) {
        return new PaymentTransaction(
                UUID.randomUUID(), "VQR-ORDER", "TOEIC-ORDER", UUID.randomUUID().toString(),
                "Học viên", "student@example.test", UUID.randomUUID().toString(),
                "Gói Pro", amount, "BANK_TRANSFER", "PENDING", null, null, Instant.now());
    }
}
