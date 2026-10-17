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
import java.util.UUID;

import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

class VietQrPaymentServiceTest {
    @Test
    void createsAnExactAmountQrWithAUniqueReferenceAndTwoMinuteExpiry() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        VietQrPaymentService service = new VietQrPaymentService(
                jdbc, "970415", "123456789", "NGUYEN VAN A", "test-sepay-token");
        Instant before = Instant.now();

        StudentCheckoutResponse response = service.createQr(pendingTransaction(75_000));

        assertThat(response.qrImageUrl())
                .contains("970415-123456789-compact2.png?amount=75000")
                .contains("addInfo=" + response.paymentContent())
                .contains("accountName=NGUYEN%20VAN%20A");
        assertThat(response.paymentContent()).startsWith("TOEIC").hasSize(24);
        assertThat(response.qrExpiresAt()).isBetween(before.plusSeconds(119), before.plusSeconds(121));
        ArgumentCaptor<Object[]> sqlArguments = ArgumentCaptor.forClass(Object[].class);
        verify(jdbc).update(anyString(), sqlArguments.capture());
        assertThat(sqlArguments.getValue()[2])
                .isInstanceOf(Timestamp.class)
                .extracting(value -> ((Timestamp) value).toInstant())
                .isEqualTo(response.qrExpiresAt());
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
