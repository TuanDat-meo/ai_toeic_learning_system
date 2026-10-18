package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

class SubscriptionSchedulingTest {
    @Test
    void schedulesPaidPlanAfterCurrentPaidPlanEnds() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID userId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Timestamp startAt = Timestamp.from(Instant.now().plusSeconds(86400));
        when(jdbc.queryForObject(contains("SELECT EXISTS"), eq(Boolean.class), any(Object[].class)))
                .thenReturn(false);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(jdbc.queryForObject(anyString(), any(RowMapper.class), any(Object[].class)))
                .thenAnswer(invocation -> {
                    String sql = invocation.getArgument(0);
                    ResultSet resultSet = mock(ResultSet.class);
                    if (sql.contains("activated_subscription_id")) {
                        when(resultSet.getObject("user_id", UUID.class)).thenReturn(userId);
                        when(resultSet.getObject("plan_id", UUID.class)).thenReturn(planId);
                    } else {
                        when(resultSet.getTimestamp("start_at")).thenReturn(startAt);
                        when(resultSet.getBoolean("scheduled")).thenReturn(true);
                    }
                    return ((RowMapper<?>) invocation.getArgument(1)).mapRow(resultSet, 0);
                });

        new SubscriptionService(jdbc).activatePaidSubscription(UUID.randomUUID());

        ArgumentCaptor<Object[]> values = ArgumentCaptor.forClass(Object[].class);
        verify(jdbc).update(contains("INSERT INTO user_subscriptions"), values.capture());
        assertThat(values.getValue()[2]).isEqualTo(startAt);
        assertThat(values.getValue()[4]).isEqualTo("SCHEDULED");
        verify(jdbc, never()).update(contains("SET status = 'CANCELLED'"), any(Object[].class));
    }

    @Test
    void blocksCheckoutWhenStudentAlreadyHasLifetimePlan() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID userId = UUID.randomUUID();
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenReturn(List.of(userId));
        when(jdbc.queryForObject(contains("SELECT EXISTS"), eq(Boolean.class), any(Object[].class)))
                .thenReturn(true);

        assertThatThrownBy(() -> new PaymentTransactionService(jdbc, null, null).createStudentOrder(userId, UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("gói trọn đời");
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }
}
