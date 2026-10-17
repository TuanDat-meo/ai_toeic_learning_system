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

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

class SubscriptionPlanAvailabilityTest {
    @Test
    void availablePlansAreOrderedByCategoryAndLimitedToFour() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class))).thenReturn(List.of());
        SubscriptionService service = new SubscriptionService(jdbc);

        service.listAvailablePlans();

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).query(sql.capture(), any(RowMapper.class));
        assertThat(sql.getValue())
                .contains("WHEN 'FREE' THEN 1", "WHEN 'PRO' THEN 2", "WHEN 'PREMIUM' THEN 3",
                        "WHEN 'PROMOTION' THEN 4", "LIMIT 4");
    }

    @Test
    void refusesToPublishAnotherPlanInAnOccupiedCategory() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject(contains("SELECT EXISTS"), eq(Boolean.class), any(Object[].class)))
                .thenReturn(true);
        SubscriptionService service = new SubscriptionService(jdbc);
        PlanRequest request = new PlanRequest(
                "PRO_SECOND", "Pro thứ hai", 999_000, 999_000, "YEARLY", 365, null, false,
                List.of(), 0, "DISABLED", "ACTIVE", "PRO", List.of(), null, null, Map.of());

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Đã có một gói Pro đang phát hành");
        verify(jdbc, never()).update(anyString(), any(Object[].class));
    }
}
