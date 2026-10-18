package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

class SePayWebhookControllerTest {
    @Test
    void confirmsAValidIncomingTransferThroughTheTransactionService() {
        PaymentTransactionService transactions = mock(PaymentTransactionService.class);
        Instant transferAt = Instant.parse("2026-10-18T20:00:00Z");
        when(transactions.confirmSePayPayment("TOEICREFERENCE", 75_000, transferAt)).thenReturn(true);
        SePayWebhookController controller = new SePayWebhookController(transactions, "test-token");

        var response = controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "TOEICREFERENCE", null, "2026-10-19 03:00:00"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
        verify(transactions).confirmSePayPayment(eq("TOEICREFERENCE"), eq(75_000L), eq(transferAt));
    }

    @Test
    void passesMissingTransferDateToTheServiceForManualReviewWhenNeeded() {
        PaymentTransactionService transactions = mock(PaymentTransactionService.class);
        when(transactions.confirmSePayPayment("TOEICREFERENCE", 75_000, null)).thenReturn(true);
        SePayWebhookController controller = new SePayWebhookController(transactions, "test-token");

        controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "TOEICREFERENCE", null, null));

        verify(transactions).confirmSePayPayment(eq("TOEICREFERENCE"), eq(75_000L), isNull());
    }

    @Test
    void returnsAnErrorWhenAnIncomingTransferDoesNotMatchSoSepayCanRetry() {
        PaymentTransactionService transactions = mock(PaymentTransactionService.class);
        when(transactions.confirmSePayPayment("UNKNOWNREFERENCE", 75_000, null)).thenReturn(false);
        SePayWebhookController controller = new SePayWebhookController(transactions, "test-token");

        var response = controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "UNKNOWNREFERENCE", null, null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("success", false);
    }

    @Test
    void rejectsWebhookWithAnInvalidAuthorizationHeader() {
        SePayWebhookController controller = new SePayWebhookController(mock(PaymentTransactionService.class), "test-token");

        assertThatThrownBy(() -> controller.receive(
                "Apikey wrong-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "TOEICREFERENCE", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("không hợp lệ");
    }

    @Test
    void rejectsOutgoingTransfers() {
        SePayWebhookController controller = new SePayWebhookController(mock(PaymentTransactionService.class), "test-token");

        assertThatThrownBy(() -> controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "out", 75_000L, "TOEICREFERENCE", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("không hợp lệ");
    }
}
