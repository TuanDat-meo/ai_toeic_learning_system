package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.mockito.ArgumentCaptor;

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

    @Test
    void confirmsAWebhookDeliveredLateWhenTransferWasBeforeTheInvoiceDeadline() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SubscriptionService subscriptions = mock(SubscriptionService.class);
        UUID transactionId = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-10-18T20:00:00Z");
        when(jdbc.query(anyString(), any(RowMapper.class), eq("payment TOEICREFERENCE")))
                .thenReturn(List.of(new PaymentTransactionService.SePayPaymentMatch(
                        transactionId, 75_000, "EXPIRED", createdAt)));
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        PaymentTransactionService service = new PaymentTransactionService(
                jdbc, subscriptions, mock(VietQrPaymentService.class));

        boolean matched = service.confirmSePayPayment(
                "payment TOEICREFERENCE", 75_000, createdAt.plusSeconds(29 * 60L));

        assertThat(matched).isTrue();
        verify(subscriptions).activatePaidSubscription(transactionId);
    }

    @Test
    void routesLateOrUnverifiableTransfersToManualReviewWithoutActivatingThePlan() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SubscriptionService subscriptions = mock(SubscriptionService.class);
        UUID transactionId = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-10-18T20:00:00Z");
        when(jdbc.query(anyString(), any(RowMapper.class), eq("payment TOEICREFERENCE")))
                .thenReturn(List.of(new PaymentTransactionService.SePayPaymentMatch(
                        transactionId, 75_000, "EXPIRED", createdAt)));
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        PaymentTransactionService service = new PaymentTransactionService(
                jdbc, subscriptions, mock(VietQrPaymentService.class));

        boolean matched = service.confirmSePayPayment("payment TOEICREFERENCE", 75_000, null);

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(sql.capture(), any(Object[].class));
        assertThat(matched).isTrue();
        assertThat(sql.getValue()).contains("REVIEW_REQUIRED");
        verify(subscriptions, never()).activatePaidSubscription(transactionId);
    }

    @Test
    void routesTransfersWithAnIncorrectAmountToManualReview() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SubscriptionService subscriptions = mock(SubscriptionService.class);
        UUID transactionId = UUID.randomUUID();
        Instant createdAt = Instant.now();
        when(jdbc.query(anyString(), any(RowMapper.class), eq("payment TOEICREFERENCE")))
                .thenReturn(List.of(new PaymentTransactionService.SePayPaymentMatch(
                        transactionId, 75_000, "PENDING", createdAt)));
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        PaymentTransactionService service = new PaymentTransactionService(
                jdbc, subscriptions, mock(VietQrPaymentService.class));

        boolean matched = service.confirmSePayPayment("payment TOEICREFERENCE", 70_000, createdAt.plusSeconds(60));

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(sql.capture(), any(Object[].class));
        assertThat(matched).isTrue();
        assertThat(sql.getValue()).contains("REVIEW_REQUIRED");
        verify(subscriptions, never()).activatePaidSubscription(transactionId);
    }

    @Test
    void refusesWebhookDescriptionsMatchingMoreThanOnePaymentReference() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID firstId = UUID.randomUUID();
        Instant createdAt = Instant.now();
        when(jdbc.query(anyString(), any(RowMapper.class), eq("two references")))
                .thenReturn(List.of(
                        new PaymentTransactionService.SePayPaymentMatch(firstId, 75_000, "PENDING", createdAt),
                        new PaymentTransactionService.SePayPaymentMatch(UUID.randomUUID(), 75_000, "PENDING", createdAt)));
        PaymentTransactionService service = new PaymentTransactionService(
                jdbc, mock(SubscriptionService.class), mock(VietQrPaymentService.class));

        boolean matched = service.confirmSePayPayment("two references", 75_000, Instant.now());

        assertThat(matched).isFalse();
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void expiresOnlyUnpaidVietQrOrdersWithAnExistingQrSession() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString())).thenReturn(1);
        PaymentTransactionService service = new PaymentTransactionService(
                jdbc, mock(SubscriptionService.class), mock(VietQrPaymentService.class));

        service.expireUnpaidStudentOrders();

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(sql.capture());
        assertThat(sql.getValue())
                .contains("status = 'PENDING'")
                .contains("payment_method = 'BANK_TRANSFER'")
                .contains("INTERVAL '30 minutes'")
                .contains("FROM payment_qr_sessions");
    }

    private static PaymentTransaction transaction(UUID id, String status) {
        return new PaymentTransaction(
                id, "VQR-ORDER", "TOEIC-ORDER", UUID.randomUUID().toString(), "Student",
                "student@example.test", UUID.randomUUID().toString(), "Pro", 75_000,
                "BANK_TRANSFER", status, Instant.now(), null, Instant.now());
    }
}
