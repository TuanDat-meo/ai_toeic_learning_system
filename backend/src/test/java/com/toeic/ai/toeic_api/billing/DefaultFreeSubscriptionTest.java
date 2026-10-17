package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

class DefaultFreeSubscriptionTest {
    @Test
    void assignsAnActiveFreePlanWithAnEntitlementSnapshot() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        SubscriptionService service = new SubscriptionService(jdbc);

        service.assignDefaultFreeSubscription(UUID.randomUUID());

        ArgumentCaptor<String> statement = ArgumentCaptor.forClass(String.class);
        verify(jdbc).update(statement.capture(), any(Object[].class));
        assertThat(statement.getValue())
                .contains("p.plan_category = 'FREE'", "p.status = 'ACTIVE'", "p.entitlements");
    }

    @Test
    void refusesRegistrationWhenNoActiveFreePlanExists() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(0);
        SubscriptionService service = new SubscriptionService(jdbc);

        assertThatThrownBy(() -> service.assignDefaultFreeSubscription(UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("chưa có gói Free đang phát hành");
    }
}
