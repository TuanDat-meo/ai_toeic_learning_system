package com.toeic.ai.toeic_api.billing;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EntitlementService {
    private static final TypeReference<Map<String, PlanEntitlement>> ENTITLEMENTS = new TypeReference<>() { };
    private static final Instant OPEN_ENDED_PERIOD = Instant.parse("9999-12-31T23:59:59Z");
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public EntitlementService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public void assertCanUse(UUID userId, String featureKey) {
        ActiveEntitlement entitlement = resolve(userId, featureKey, false);
        if (entitlement.usageFeatureKey() != null && entitlement.featureLimit() != null) {
            Period period = period(entitlement);
            Long used = jdbc.query("""
                    SELECT usage_count FROM feature_usage
                    WHERE user_subscription_id=? AND feature_key=? AND period_start=?
                    """, rs -> rs.next() ? rs.getLong(1) : null,
                    entitlement.subscriptionId(), entitlement.usageFeatureKey(), Timestamp.from(period.start()));
            if (used != null && used >= entitlement.featureLimit()) throw quotaExceeded();
        }
    }

    @Transactional(readOnly = true)
    public List<FeatureQuotaUsage> listUsage(UUID userId) {
        var activeSubscriptions = jdbc.query("""
                SELECT id, entitlements_snapshot
                FROM user_subscriptions
                WHERE user_id=? AND status IN ('ACTIVE', 'SCHEDULED') AND start_at<=now()
                  AND (end_at IS NULL OR end_at>now())
                ORDER BY start_at DESC
                LIMIT 1
                """, (rs, row) -> {
                    try {
                        return new SubscriptionEntitlements(rs.getObject("id", UUID.class),
                                mapper.readValue(rs.getString("entitlements_snapshot"), ENTITLEMENTS));
                    } catch (JsonProcessingException ex) {
                        throw new java.sql.SQLException("Snapshot quyền lợi đăng ký không hợp lệ.", ex);
                    }
                }, userId);
        if (activeSubscriptions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa có gói học đang hiệu lực.");
        }
        Map<String, PlanEntitlement> planEntitlements = activeSubscriptions.getFirst().entitlements();

        var features = jdbc.query("""
                SELECT feature_key, name, parent_feature_key
                FROM learning_feature_catalog
                WHERE lifecycle_status='AVAILABLE' AND control_type='METERED'
                ORDER BY (parent_feature_key IS NOT NULL), feature_key
                """, (rs, row) -> new CatalogFeature(
                rs.getString("feature_key"), rs.getString("name"), rs.getString("parent_feature_key")));
        List<FeatureQuotaUsage> usage = new ArrayList<>();
        Set<String> includedUsageKeys = new HashSet<>();
        for (CatalogFeature feature : features) {
            if (!isEnabled(planEntitlements, feature.key())
                    || (feature.parentFeatureKey() != null
                    && !isEnabled(planEntitlements, feature.parentFeatureKey()))) continue;
            ActiveEntitlement entitlement = resolve(userId, feature.key(), false);
            if (entitlement.usageFeatureKey() == null
                    || !includedUsageKeys.add(entitlement.usageFeatureKey())) continue;

            Period currentPeriod = period(entitlement);
            usage.add(new FeatureQuotaUsage(entitlement.usageFeatureKey(), feature.name(),
                    currentUsage(entitlement.subscriptionId(), entitlement.usageFeatureKey(), currentPeriod.start()),
                    entitlement.featureLimit(), entitlement.period(), currentPeriod.end()));
        }
        return List.copyOf(usage);
    }

    private static boolean isEnabled(Map<String, PlanEntitlement> entitlements, String featureKey) {
        PlanEntitlement entitlement = entitlements.get(featureKey);
        return entitlement != null && entitlement.enabled();
    }

    /**
     * Consume one attempt when the student starts an activity. Reuse operationId on
     * retries so a retried request cannot consume twice.
     */
    @Transactional
    public long consumeUse(UUID userId, String featureKey, UUID operationId) {
        ActiveEntitlement entitlement = resolve(userId, featureKey, true);
        if (entitlement.usageFeatureKey() == null) return 0;
        Period period = period(entitlement);
        int newOperation = jdbc.update("""
                INSERT INTO feature_usage_operations(user_subscription_id,feature_key,operation_id,period_start)
                VALUES (?,?,?,?)
                ON CONFLICT DO NOTHING
                """, entitlement.subscriptionId(), entitlement.usageFeatureKey(), operationId, Timestamp.from(period.start()));
        if (newOperation == 0) {
            return currentUsage(entitlement.subscriptionId(), entitlement.usageFeatureKey(), period.start());
        }

        var counts = jdbc.query("""
                INSERT INTO feature_usage(user_subscription_id,feature_key,period_start,period_end,usage_count)
                VALUES (?,?,?,?,1)
                ON CONFLICT(user_subscription_id,feature_key,period_start)
                DO UPDATE SET usage_count=feature_usage.usage_count+1, period_end=EXCLUDED.period_end, updated_at=now()
                WHERE (?::bigint IS NULL OR feature_usage.usage_count < ?::bigint)
                RETURNING usage_count
                """, (rs, row) -> rs.getLong(1), entitlement.subscriptionId(), entitlement.usageFeatureKey(),
                Timestamp.from(period.start()), Timestamp.from(period.end()), entitlement.featureLimit(),
                entitlement.featureLimit());
        if (counts.isEmpty()) throw quotaExceeded();
        return counts.getFirst();
    }

    private ActiveEntitlement resolve(UUID userId, String featureKey, boolean lockSubscription) {
        String query = """
                SELECT s.id, s.entitlements_snapshot, s.start_at, s.end_at
                FROM user_subscriptions s
                WHERE s.user_id=? AND s.status IN ('ACTIVE', 'SCHEDULED') AND s.start_at<=now()
                  AND (s.end_at IS NULL OR s.end_at>now())
                ORDER BY s.start_at DESC
                LIMIT 1
                """ + (lockSubscription ? " FOR UPDATE" : "");
        var subscriptions = jdbc.query(query, (rs, row) -> {
            try {
                return new ActiveEntitlement(rs.getObject("id", UUID.class),
                        mapper.readValue(rs.getString("entitlements_snapshot"), ENTITLEMENTS),
                        rs.getTimestamp("start_at").toInstant(),
                        rs.getTimestamp("end_at") == null ? null : rs.getTimestamp("end_at").toInstant(),
                        null, null, null, null);
            } catch (JsonProcessingException ex) {
                throw new java.sql.SQLException("Snapshot quyền lợi đăng ký không hợp lệ.", ex);
            }
        }, userId);
        if (subscriptions.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa có gói học đang hiệu lực.");
        ActiveEntitlement subscription = subscriptions.getFirst();

        var features = jdbc.query("""
                SELECT lifecycle_status, control_type, parent_feature_key
                FROM learning_feature_catalog WHERE feature_key=?
                """, (rs, row) -> new FeatureStatus(rs.getString("lifecycle_status"),
                        rs.getString("control_type"), rs.getString("parent_feature_key")), featureKey);
        if (features.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tính năng này chưa được đăng ký.");
        FeatureStatus feature = features.getFirst();
        requireAvailable(feature.lifecycleStatus());
        PlanEntitlement planEntitlement = requireEnabled(subscription.entitlements(), featureKey);
        FeatureStatus usageFeature = "METERED".equals(feature.controlType()) ? feature : null;
        String usageFeatureKey = usageFeature == null ? null : featureKey;

        if (feature.parentFeatureKey() != null) {
            FeatureStatus parent = jdbc.query("""
                    SELECT lifecycle_status, control_type, parent_feature_key
                    FROM learning_feature_catalog WHERE feature_key=?
                    """, (rs, row) -> new FeatureStatus(rs.getString("lifecycle_status"),
                    rs.getString("control_type"), rs.getString("parent_feature_key")), feature.parentFeatureKey())
                    .stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Nhóm tính năng cha chưa được đăng ký."));
            requireAvailable(parent.lifecycleStatus());
            PlanEntitlement parentEntitlement = requireEnabled(subscription.entitlements(), feature.parentFeatureKey());
            if (usageFeature == null && "METERED".equals(parent.controlType())) {
                usageFeature = parent;
                usageFeatureKey = feature.parentFeatureKey();
                planEntitlement = parentEntitlement;
            }
        }

        if (usageFeature != null && (planEntitlement.period() == null || planEntitlement.unit() == null)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Hạn mức của tính năng chưa được cấu hình đầy đủ.");
        }
        return new ActiveEntitlement(subscription.subscriptionId(), subscription.entitlements(),
                subscription.startAt(), subscription.endAt(),
                usageFeature == null ? null : planEntitlement.limit(),
                usageFeature == null ? null : planEntitlement.period(),
                usageFeature == null ? "TOGGLE" : usageFeature.controlType(), usageFeatureKey);
    }

    private static void requireAvailable(String status) {
        if (!"AVAILABLE".equals(status)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tính năng này chưa sẵn sàng để sử dụng.");
        }
    }

    private static PlanEntitlement requireEnabled(Map<String, PlanEntitlement> entitlements, String key) {
        PlanEntitlement entitlement = entitlements.get(key);
        if (entitlement == null || !entitlement.enabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Gói học hiện tại chưa cấp quyền cho tính năng này.");
        }
        return entitlement;
    }

    private Period period(ActiveEntitlement entitlement) {
        return new Period(entitlement.periodStart(), entitlement.periodEnd());
    }

    private long currentUsage(UUID subscriptionId, String featureKey, Instant periodStart) {
        Long used = jdbc.query("""
                SELECT usage_count FROM feature_usage
                WHERE user_subscription_id=? AND feature_key=? AND period_start=?
                """, rs -> rs.next() ? rs.getLong(1) : null, subscriptionId, featureKey, Timestamp.from(periodStart));
        return used == null ? 0 : used;
    }

    private static ResponseStatusException quotaExceeded() {
        return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đã sử dụng hết hạn mức của tính năng trong chu kỳ hiện tại.");
    }

    private record FeatureStatus(String lifecycleStatus, String controlType, String parentFeatureKey) { }
    private record CatalogFeature(String key, String name, String parentFeatureKey) { }
    private record SubscriptionEntitlements(UUID id, Map<String, PlanEntitlement> entitlements) { }

    private record ActiveEntitlement(UUID subscriptionId, Map<String, PlanEntitlement> entitlements,
            Instant startAt, Instant endAt, Long featureLimit, String period, String controlType,
            String usageFeatureKey) {
        private Instant periodStart() {
            return periodBounds().start();
        }

        private Instant periodEnd() {
            return periodBounds().end();
        }

        private Period periodBounds() {
            if (!"METERED".equals(controlType)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tính năng bật/tắt không có hạn mức sử dụng.");
            }
            if (period == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chu kỳ hạn mức chưa được cấu hình.");
            }
            Instant now = Instant.now();
            return switch (period) {
                case "DAY" -> {
                    var start = now.atZone(ZoneOffset.UTC).toLocalDate().atStartOfDay(ZoneOffset.UTC);
                    yield new Period(start.toInstant(), start.plusDays(1).toInstant());
                }
                case "WEEK" -> {
                    var start = now.atZone(ZoneOffset.UTC).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                            .toLocalDate().atStartOfDay(ZoneOffset.UTC);
                    yield new Period(start.toInstant(), start.plusWeeks(1).toInstant());
                }
                case "MONTH" -> {
                    var start = now.atZone(ZoneOffset.UTC).withDayOfMonth(1).toLocalDate().atStartOfDay(ZoneOffset.UTC);
                    yield new Period(start.toInstant(), start.plusMonths(1).toInstant());
                }
                case "PLAN_TERM" -> new Period(startAt, endAt == null ? OPEN_ENDED_PERIOD : endAt);
                default -> throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chu kỳ hạn mức không được hỗ trợ.");
            };
        }
    }

    private record Period(Instant start, Instant end) { }

    public record FeatureQuotaUsage(String featureKey, String name, long used, Long limit,
            String period, Instant periodEndsAt) { }
}
