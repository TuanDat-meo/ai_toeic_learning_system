package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

class PaymentTransactionServiceTest {
    @Test
    void confirmingAPendingTransactionActivatesItsPaidPlan() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SubscriptionService subscriptions = mock(SubscriptionService.class);
        UUID transactionId = UUID.randomUUID();
        PaymentTransaction transaction = transaction(transactionId, "SUCCESS");
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.queryForObject(anyString(), any(RowMapper.class), any(Object[].class))).thenReturn(transaction);
        PaymentTransactionService service = new PaymentTransactionService(jdbc, subscriptions, mock(VietQrPaymentService.class));

        PaymentTransaction result = service.confirm(transactionId);

        assertThat(result.status()).isEqualTo("SUCCESS");
        verify(subscriptions).activatePaidSubscription(transactionId);
    }

    @Test
    void refundingATransactionRevokesTheSubscriptionCreatedFromIt() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SubscriptionService subscriptions = mock(SubscriptionService.class);
        UUID transactionId = UUID.randomUUID();
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.queryForObject(anyString(), any(RowMapper.class), any(Object[].class)))
                .thenReturn(transaction(transactionId, "REFUNDED"));
        PaymentTransactionService service = new PaymentTransactionService(jdbc, subscriptions, mock(VietQrPaymentService.class));

        PaymentTransaction result = service.refund(transactionId);

        assertThat(result.status()).isEqualTo("REFUNDED");
        verify(subscriptions).revokePaidSubscription(transactionId);
    }

    private static PaymentTransaction transaction(UUID id, String status) {
        return new PaymentTransaction(
                id, "VQR-ORDER", "TOEIC-ORDER", UUID.randomUUID().toString(), "Student",
                "student@example.test", UUID.randomUUID().toString(), "Pro", 75_000,
                "BANK_TRANSFER", status, Instant.now(), null, Instant.now());
    }
}
