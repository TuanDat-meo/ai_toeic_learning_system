package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class SePayWebhookControllerTest {
    @Test
    void confirmsAValidIncomingTransferThroughTheTransactionService() {
        PaymentTransactionService transactions = mock(PaymentTransactionService.class);
        when(transactions.confirmSePayPayment("TOEICREFERENCE", 75_000)).thenReturn(true);
        SePayWebhookController controller = new SePayWebhookController(transactions, "test-token");

        var response = controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "TOEICREFERENCE", null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
        verify(transactions).confirmSePayPayment(eq("TOEICREFERENCE"), eq(75_000L));
    }

    @Test
    void returnsAnErrorWhenAnIncomingTransferDoesNotMatchSoSepayCanRetry() {
        PaymentTransactionService transactions = mock(PaymentTransactionService.class);
        when(transactions.confirmSePayPayment("UNKNOWNREFERENCE", 75_000)).thenReturn(false);
        SePayWebhookController controller = new SePayWebhookController(transactions, "test-token");

        var response = controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "UNKNOWNREFERENCE", null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("success", false);
    }

    @Test
    void rejectsWebhookWithAnInvalidAuthorizationHeader() {
        SePayWebhookController controller = new SePayWebhookController(mock(PaymentTransactionService.class), "test-token");

        assertThatThrownBy(() -> controller.receive(
                "Apikey wrong-token",
                new SePayWebhookRequest(123L, "in", 75_000L, "TOEICREFERENCE", null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("không hợp lệ");
    }

    @Test
    void rejectsOutgoingTransfers() {
        SePayWebhookController controller = new SePayWebhookController(mock(PaymentTransactionService.class), "test-token");

        assertThatThrownBy(() -> controller.receive(
                "Apikey test-token",
                new SePayWebhookRequest(123L, "out", 75_000L, "TOEICREFERENCE", null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("không hợp lệ");
    }
}
