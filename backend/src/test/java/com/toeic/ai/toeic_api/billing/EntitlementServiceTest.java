package com.toeic.ai.toeic_api.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.web.server.ResponseStatusException;

class EntitlementServiceTest {
    @Test
    void listsCurrentUsageForEnabledMeteredFeatures() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID subscriptionId = UUID.randomUUID();
        String snapshot = """
                {"LISTENING":{"enabled":true,"limit":10,"unit":"sessions","period":"DAY","config":{}},
                 "READING":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}},
                 "READING_PRACTICE":{"enabled":true,"limit":5,"unit":"sessions","period":"WEEK","config":{}}}
                """;

        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            RowMapper<?> mapper = invocation.getArgument(1);
            ResultSet row = mock(ResultSet.class);
            if (sql.contains("FROM user_subscriptions")) {
                when(row.getObject("id", UUID.class)).thenReturn(subscriptionId);
                when(row.getString("entitlements_snapshot")).thenReturn(snapshot);
                when(row.getTimestamp("start_at")).thenReturn(Timestamp.from(Instant.now().minusSeconds(60)));
                when(row.getTimestamp("end_at")).thenReturn(null);
            } else {
                String key = invocation.getArgument(2);
                when(row.getString("lifecycle_status")).thenReturn("AVAILABLE");
                when(row.getString("control_type")).thenReturn(
                        "READING".equals(key) ? "TOGGLE" : "METERED");
                when(row.getString("parent_feature_key")).thenReturn(
                        "READING_PRACTICE".equals(key) ? "READING" : null);
            }
            return List.of(mapper.mapRow(row, 0));
        });
        when(jdbc.query(anyString(), any(RowMapper.class))).thenAnswer(invocation -> {
            RowMapper<?> mapper = invocation.getArgument(1);
            ResultSet listening = mock(ResultSet.class);
            when(listening.getString("feature_key")).thenReturn("LISTENING");
            when(listening.getString("name")).thenReturn("Listening");
            when(listening.getString("parent_feature_key")).thenReturn(null);
            ResultSet reading = mock(ResultSet.class);
            when(reading.getString("feature_key")).thenReturn("READING_PRACTICE");
            when(reading.getString("name")).thenReturn("Luyện Reading");
            when(reading.getString("parent_feature_key")).thenReturn("READING");
            return List.of(mapper.mapRow(listening, 0), mapper.mapRow(reading, 1));
        });
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), any(Object[].class))).thenReturn(2L);

        List<EntitlementService.FeatureQuotaUsage> usage =
                new EntitlementService(jdbc).listUsage(UUID.randomUUID());

        assertThat(usage).extracting(EntitlementService.FeatureQuotaUsage::featureKey)
                .containsExactly("LISTENING", "READING_PRACTICE");
        assertThat(usage).extracting(EntitlementService.FeatureQuotaUsage::used)
                .containsExactly(2L, 2L);
        assertThat(usage).extracting(EntitlementService.FeatureQuotaUsage::limit)
                .containsExactly(10L, 5L);
    }

    @Test
    void refusesFeaturesThatAreNotAvailableEvenWhenThePlanEntitlesThem() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID subscriptionId = UUID.randomUUID();
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            RowMapper<?> mapper = invocation.getArgument(1);
            ResultSet row = mock(ResultSet.class);
            if (sql.contains("FROM user_subscriptions")) {
                when(row.getObject("id", UUID.class)).thenReturn(subscriptionId);
                when(row.getString("entitlements_snapshot"))
                        .thenReturn("{\"FEATURE\":{\"enabled\":true,\"limit\":5,\"unit\":\"uses\",\"period\":\"DAY\",\"config\":{}}}");
                when(row.getTimestamp("start_at")).thenReturn(Timestamp.from(Instant.now().minusSeconds(60)));
                when(row.getTimestamp("end_at")).thenReturn(null);
            } else {
                when(row.getString("lifecycle_status")).thenReturn("IN_DEVELOPMENT");
                when(row.getString("control_type")).thenReturn("METERED");
            }
            return List.of(mapper.mapRow(row, 0));
        });
        EntitlementService service = new EntitlementService(jdbc);

        assertThatThrownBy(() -> service.assertCanUse(UUID.randomUUID(), "FEATURE"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("chưa sẵn sàng");
    }

    @Test
    void childFeatureRequiresItsParentEntitlement() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID subscriptionId = UUID.randomUUID();
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            String requestedKey = sql.contains("FROM learning_feature_catalog")
                    ? invocation.getArgument(2).toString() : "";
            RowMapper<?> mapper = invocation.getArgument(1);
            ResultSet row = mock(ResultSet.class);
            if (sql.contains("FROM user_subscriptions")) {
                when(row.getObject("id", UUID.class)).thenReturn(subscriptionId);
                when(row.getString("entitlements_snapshot"))
                        .thenReturn("{\"CHILD\":{\"enabled\":true,\"limit\":null,\"unit\":null,\"period\":null,\"config\":{}}}");
                when(row.getTimestamp("start_at")).thenReturn(Timestamp.from(Instant.now().minusSeconds(60)));
                when(row.getTimestamp("end_at")).thenReturn(null);
            } else {
                when(row.getString("lifecycle_status")).thenReturn("AVAILABLE");
                when(row.getString("control_type")).thenReturn("CHILD".equals(requestedKey) ? "TOGGLE" : "METERED");
                when(row.getString("parent_feature_key")).thenReturn("CHILD".equals(requestedKey) ? "PARENT" : null);
            }
            return List.of(mapper.mapRow(row, 0));
        });
        EntitlementService service = new EntitlementService(jdbc);

        assertThatThrownBy(() -> service.assertCanUse(UUID.randomUUID(), "CHILD"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("chưa cấp quyền");
    }

    @Test
    void childToggleConsumesItsMeteredParentQuota() throws Exception {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID subscriptionId = UUID.randomUUID();
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            RowMapper<?> mapper = invocation.getArgument(1);
            ResultSet row = mock(ResultSet.class);
            if (sql.contains("FROM user_subscriptions")) {
                when(row.getObject("id", UUID.class)).thenReturn(subscriptionId);
                when(row.getString("entitlements_snapshot")).thenReturn("""
                        {"PARENT":{"enabled":true,"limit":1,"unit":"sessions","period":"DAY","config":{}},
                         "CHILD":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}}}
                        """);
                when(row.getTimestamp("start_at")).thenReturn(Timestamp.from(Instant.now().minusSeconds(60)));
                when(row.getTimestamp("end_at")).thenReturn(null);
            } else if (sql.contains("INSERT INTO feature_usage")) {
                when(row.getLong(1)).thenReturn(1L);
            } else {
                String requestedKey = invocation.getArgument(2).toString();
                when(row.getString("lifecycle_status")).thenReturn("AVAILABLE");
                when(row.getString("control_type")).thenReturn("CHILD".equals(requestedKey) ? "TOGGLE" : "METERED");
                when(row.getString("parent_feature_key")).thenReturn("CHILD".equals(requestedKey) ? "PARENT" : null);
            }
            return List.of(mapper.mapRow(row, 0));
        });
        when(jdbc.update(contains("INSERT INTO feature_usage_operations"), any(Object[].class))).thenReturn(1);
        EntitlementService service = new EntitlementService(jdbc);

        assertThat(service.consumeUse(UUID.randomUUID(), "CHILD", UUID.randomUUID())).isEqualTo(1);
    }
}
