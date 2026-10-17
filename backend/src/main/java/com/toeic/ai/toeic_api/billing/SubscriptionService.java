package com.toeic.ai.toeic_api.billing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SubscriptionService {
    private static final TypeReference<List<String>> STRINGS = new TypeReference<>() { };
    private static final TypeReference<Map<String, PlanEntitlement>> ENTITLEMENTS = new TypeReference<>() { };
    private static final TypeReference<List<FeatureConfigField>> CONFIG_FIELDS = new TypeReference<>() { };
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public SubscriptionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<SubscriptionPlan> listPlans() {
        return jdbc.query("SELECT p.*, (SELECT count(*) FROM user_subscriptions s WHERE s.plan_id=p.id) purchase_count FROM subscription_plans p ORDER BY p.created_at DESC", this::mapPlan);
    }

    public List<SubscriptionPlan> listAvailablePlans() {
        return jdbc.query("""
                SELECT p.*, 0 AS purchase_count
                FROM subscription_plans p
                WHERE p.status='ACTIVE'
                  AND (p.plan_category <> 'PROMOTION' OR (p.offer_starts_at <= now() AND p.offer_ends_at > now()))
                ORDER BY CASE p.plan_category
                    WHEN 'FREE' THEN 1
                    WHEN 'PRO' THEN 2
                    WHEN 'PREMIUM' THEN 3
                    WHEN 'PROMOTION' THEN 4
                    ELSE 5
                END, p.created_at DESC
                LIMIT 4
                """, this::mapPlan);
    }

    public List<LearningFeature> listFeatureCatalog() {
        return jdbc.query("""
                SELECT feature_key, name, category, description, lifecycle_status, control_type,
                       allowed_units, allowed_periods, config_fields, parent_feature_key
                FROM learning_feature_catalog
                ORDER BY category, (parent_feature_key IS NOT NULL), name
                """, this::mapFeature);
    }

    public List<LearningFeature> listAvailableFeatureCatalog() {
        return jdbc.query("""
                SELECT feature_key, name, category, description, lifecycle_status, control_type,
                       allowed_units, allowed_periods, config_fields, parent_feature_key
                FROM learning_feature_catalog
                WHERE lifecycle_status='AVAILABLE'
                ORDER BY category, (parent_feature_key IS NOT NULL), name
                """, this::mapFeature);
    }

    public List<UserSubscription> listSubscriptions() {
        return jdbc.query("SELECT s.id,s.user_id,u.full_name,u.email,s.plan_id,s.plan_name,s.start_at,s.end_at,s.auto_renew,CASE WHEN s.status='ACTIVE' AND s.end_at IS NOT NULL AND s.end_at <= now() THEN 'EXPIRED' ELSE s.status END AS status,s.payment_method FROM user_subscriptions s JOIN users u ON u.id=s.user_id ORDER BY s.start_at DESC", (rs, n) -> new UserSubscription(rs.getObject("id", UUID.class), rs.getObject("user_id", UUID.class), rs.getString("full_name"), rs.getString("email"), rs.getObject("plan_id", UUID.class), rs.getString("plan_name"), rs.getTimestamp("start_at").toInstant(), rs.getTimestamp("end_at") == null ? null : rs.getTimestamp("end_at").toInstant(), rs.getBoolean("auto_renew"), rs.getString("status"), rs.getString("payment_method")));
    }

    public StudentSubscription findCurrentSubscription(UUID userId) {
        return jdbc.query("""
                SELECT id, plan_id, plan_name, start_at, end_at, auto_renew, payment_method
                FROM user_subscriptions
                WHERE user_id = ? AND status = 'ACTIVE'
                  AND (end_at IS NULL OR end_at > now())
                ORDER BY start_at DESC
                LIMIT 1
                """, (rs, row) -> new StudentSubscription(
                        rs.getObject("id", UUID.class), rs.getObject("plan_id", UUID.class), rs.getString("plan_name"),
                        rs.getTimestamp("start_at").toInstant(),
                        rs.getTimestamp("end_at") == null ? null : rs.getTimestamp("end_at").toInstant(),
                        rs.getBoolean("auto_renew"), "ACTIVE", rs.getString("payment_method")), userId)
                .stream().findFirst().orElse(null);
    }

    @Transactional
    public void assignDefaultFreeSubscription(UUID userId) {
        int inserted = jdbc.update("""
                INSERT INTO user_subscriptions(
                    id, user_id, plan_id, plan_code, plan_name, plan_features, max_ai_queries_per_day,
                    start_at, end_at, auto_renew, status, payment_method, capability_keys_snapshot,
                    ai_access_mode, entitlements_snapshot
                )
                SELECT ?, ?, p.id, p.code, p.name, p.features, p.max_ai_queries_per_day,
                       now(),
                       CASE WHEN p.billing_cycle = 'LIFETIME' THEN NULL
                            ELSE now() + make_interval(days => p.duration_days) END,
                       false, 'ACTIVE', NULL, p.capability_keys, p.ai_access_mode, p.entitlements
                FROM subscription_plans p
                WHERE p.plan_category = 'FREE' AND p.status = 'ACTIVE'
                ORDER BY p.created_at DESC
                LIMIT 1
                """, UUID.randomUUID(), userId);
        if (inserted == 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Hệ thống chưa có gói Free đang phát hành. Vui lòng liên hệ quản trị viên.");
        }
    }

    @Transactional
    public void activatePaidSubscription(UUID transactionId) {
        PaidPlanPurchase purchase = jdbc.queryForObject("""
                SELECT t.user_id, t.plan_id, p.plan_category
                FROM payment_transactions t
                JOIN subscription_plans p ON p.id = t.plan_id
                WHERE t.id = ? AND t.status = 'SUCCESS'
                FOR UPDATE OF t
                """, (rs, row) -> new PaidPlanPurchase(
                rs.getObject("user_id", UUID.class),
                rs.getObject("plan_id", UUID.class),
                rs.getString("plan_category")), transactionId);

        jdbc.update("""
                UPDATE user_subscriptions
                SET status = 'CANCELLED', auto_renew = false, updated_at = now()
                WHERE user_id = ? AND status = 'ACTIVE'
                  AND (end_at IS NULL OR end_at > now())
                  AND plan_id IN (
                      SELECT id FROM subscription_plans WHERE plan_category = ?
                  )
                """, purchase.userId(), purchase.planCategory());

        UUID subscriptionId = UUID.randomUUID();
        int inserted = jdbc.update("""
                INSERT INTO user_subscriptions(
                    id, user_id, plan_id, plan_code, plan_name, plan_features, max_ai_queries_per_day,
                    start_at, end_at, auto_renew, status, payment_method, capability_keys_snapshot,
                    ai_access_mode, entitlements_snapshot
                )
                SELECT ?, ?, p.id, p.code, p.name, p.features, p.max_ai_queries_per_day,
                       now(),
                       CASE WHEN p.billing_cycle = 'LIFETIME' THEN NULL
                            ELSE now() + make_interval(days => p.duration_days) END,
                       false, 'ACTIVE', 'BANK_TRANSFER', p.capability_keys, p.ai_access_mode, p.entitlements
                FROM subscription_plans p
                WHERE p.id = ?
                """, subscriptionId, purchase.userId(), purchase.planId());
        if (inserted == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể kích hoạt gói học sau khi xác nhận thanh toán.");
        }
        jdbc.update("""
                UPDATE payment_transactions
                SET activated_subscription_id = ?
                WHERE id = ? AND status = 'SUCCESS'
                """, subscriptionId, transactionId);
    }

    @Transactional
    public void revokePaidSubscription(UUID transactionId) {
        jdbc.update("""
                UPDATE user_subscriptions
                SET status = 'CANCELLED', auto_renew = false, updated_at = now()
                WHERE id = (
                    SELECT activated_subscription_id
                    FROM payment_transactions
                    WHERE id = ? AND status = 'REFUNDED'
                ) AND status = 'ACTIVE'
                """, transactionId);
    }

    @Transactional
    public void cancelSubscription(UUID id) {
        int updated = jdbc.update("UPDATE user_subscriptions SET status='CANCELLED', auto_renew=false, updated_at=now() WHERE id=? AND status='ACTIVE'", id);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Lượt mua không tồn tại hoặc quyền học không còn hiệu lực.");
    }

    @Transactional
    public void extendSubscription(UUID id) {
        int updated = jdbc.update("UPDATE user_subscriptions SET end_at=GREATEST(end_at, now()) + interval '30 days', status='ACTIVE', updated_at=now() WHERE id=? AND status IN ('ACTIVE','EXPIRED') AND end_at IS NOT NULL", id);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể cộng thêm thời hạn cho lượt mua trọn đời hoặc lượt mua không hợp lệ.");
    }

    @Transactional
    public SubscriptionPlan create(PlanRequest request) {
        return create(request, false);
    }

    @Transactional
    public SubscriptionPlan createReplacingActive(PlanRequest request) {
        return create(request, true);
    }

    private SubscriptionPlan create(PlanRequest request, boolean replaceActive) {
        assertNoOtherActivePlan(request, null, replaceActive);
        validate(request);
        Map<String, PlanEntitlement> entitlements = normalizedEntitlements(request);
        LegacyAiSettings ai = legacyAiSettings(entitlements);
        try {
            UUID id = UUID.randomUUID();
            jdbc.update("""
                    INSERT INTO subscription_plans(
                        id,code,name,original_price,promotional_price,billing_cycle,duration_days,badge_tag,is_popular,
                        features,max_ai_queries_per_day,ai_access_mode,status,plan_type,plan_category,
                        capability_keys,offer_starts_at,offer_ends_at,entitlements
                    ) VALUES (?,?,?,?,?,?,?,?,?,?::jsonb,?,?,?,?,?,?::jsonb,?,? ,?::jsonb)
                    """, id, request.code().trim().toUpperCase(), request.name().trim(), request.originalPrice(),
                    request.promotionalPrice(), request.billingCycle(), request.durationDays(), blankToNull(request.badgeTag()),
                    request.isPopular(), json(request.features()), ai.limit(), ai.mode(), request.status(),
                    "PROMOTION".equals(request.planCategory()) ? "PROMOTION" : "STANDARD", request.planCategory(),
                    json(legacyCapabilityKeys(entitlements)), utc(request.offerStartsAt()), utc(request.offerEndsAt()),
                    json(entitlements));
            assignFreePlanToStudentsWithoutActiveSubscription(id, request);
            return find(id);
        } catch (DuplicateKeyException ex) {
            if ("ACTIVE".equals(request.status())) {
                throw activeCategoryConflict(request.planCategory());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã gói học đã tồn tại.");
        }
    }

    @Transactional
    public SubscriptionPlan update(UUID id, PlanRequest request) {
        return update(id, request, false);
    }

    @Transactional
    public SubscriptionPlan updateReplacingActive(UUID id, PlanRequest request) {
        return update(id, request, true);
    }

    private SubscriptionPlan update(UUID id, PlanRequest request, boolean replaceActive) {
        assertNoOtherActivePlan(request, id, replaceActive);
        validate(request);
        Map<String, PlanEntitlement> entitlements = normalizedEntitlements(request);
        LegacyAiSettings ai = legacyAiSettings(entitlements);
        try {
            int changed = jdbc.update("""
                    UPDATE subscription_plans SET code=?,name=?,original_price=?,promotional_price=?,billing_cycle=?,
                        duration_days=?,badge_tag=?,is_popular=?,features=?::jsonb,max_ai_queries_per_day=?,
                        ai_access_mode=?,status=?,plan_type=?,plan_category=?,capability_keys=?::jsonb,
                        offer_starts_at=?,offer_ends_at=?,entitlements=?::jsonb,updated_at=now()
                    WHERE id=?
                    """, request.code().trim().toUpperCase(), request.name().trim(), request.originalPrice(),
                    request.promotionalPrice(), request.billingCycle(), request.durationDays(), blankToNull(request.badgeTag()),
                    request.isPopular(), json(request.features()), ai.limit(), ai.mode(), request.status(),
                    "PROMOTION".equals(request.planCategory()) ? "PROMOTION" : "STANDARD", request.planCategory(),
                    json(legacyCapabilityKeys(entitlements)), utc(request.offerStartsAt()), utc(request.offerEndsAt()),
                    json(entitlements), id);
            if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói học.");
            assignFreePlanToStudentsWithoutActiveSubscription(id, request);
            return find(id);
        } catch (DuplicateKeyException ex) {
            if ("ACTIVE".equals(request.status())) {
                throw activeCategoryConflict(request.planCategory());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã gói học đã tồn tại.");
        }
    }

    private void assertNoOtherActivePlan(PlanRequest request, UUID currentPlanId, boolean replaceActive) {
        if (!"ACTIVE".equals(request.status())) return;
        boolean anotherActivePlanExists = Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM subscription_plans
                    WHERE plan_category = ?
                      AND status = 'ACTIVE'
                      AND (?::uuid IS NULL OR id <> ?)
                )
                """, Boolean.class, request.planCategory(), currentPlanId, currentPlanId));
        if (!anotherActivePlanExists) return;
        if (!replaceActive) throw activeCategoryConflict(request.planCategory());
        jdbc.update("""
                UPDATE subscription_plans
                SET status = 'DRAFT', updated_at = now()
                WHERE plan_category = ?
                  AND status = 'ACTIVE'
                  AND (?::uuid IS NULL OR id <> ?)
                """, request.planCategory(), currentPlanId, currentPlanId);
    }

    private void assignFreePlanToStudentsWithoutActiveSubscription(UUID planId, PlanRequest request) {
        if (!"FREE".equals(request.planCategory()) || !"ACTIVE".equals(request.status())) return;

        jdbc.update("""
                INSERT INTO user_subscriptions(
                    id, user_id, plan_id, plan_code, plan_name, plan_features, max_ai_queries_per_day,
                    start_at, end_at, auto_renew, status, payment_method, capability_keys_snapshot,
                    ai_access_mode, entitlements_snapshot
                )
                SELECT gen_random_uuid(), u.id, p.id, p.code, p.name, p.features, p.max_ai_queries_per_day,
                       now(),
                       CASE WHEN p.billing_cycle = 'LIFETIME' THEN NULL
                            ELSE now() + make_interval(days => p.duration_days) END,
                       false, 'ACTIVE', NULL, p.capability_keys, p.ai_access_mode, p.entitlements
                FROM users u
                CROSS JOIN subscription_plans p
                WHERE u.role = 'STUDENT'
                  AND p.id = ?
                  AND p.plan_category = 'FREE'
                  AND p.status = 'ACTIVE'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM user_subscriptions s
                      WHERE s.user_id = u.id AND s.status = 'ACTIVE'
                        AND (s.end_at IS NULL OR s.end_at > now())
                  )
                """, planId);
    }

    private ResponseStatusException activeCategoryConflict(String category) {
        String categoryName = switch (category) {
            case "FREE" -> "Free";
            case "PRO" -> "Pro";
            case "PREMIUM" -> "Premium";
            case "PROMOTION" -> "Ưu đãi";
            default -> category;
        };
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "Đã có một gói " + categoryName + " đang phát hành. Hãy chuyển gói hiện tại sang bản nháp hoặc lưu trữ trước.");
    }

    @Transactional
    public void delete(UUID id) {
        try {
            if (jdbc.update("DELETE FROM subscription_plans WHERE id=?", id) == 0) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói học.");
            }
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Gói học đã có lượt mua; hãy lưu trữ gói thay vì xóa.");
        }
    }

    private SubscriptionPlan find(UUID id) {
        return jdbc.queryForObject("SELECT p.*, (SELECT count(*) FROM user_subscriptions s WHERE s.plan_id=p.id) purchase_count FROM subscription_plans p WHERE p.id=?", this::mapPlan, id);
    }

    private SubscriptionPlan mapPlan(ResultSet rs, int row) throws SQLException {
        try {
            return new SubscriptionPlan(
                    rs.getObject("id", UUID.class), rs.getString("code"), rs.getString("name"),
                    rs.getLong("original_price"), rs.getLong("promotional_price"), rs.getString("billing_cycle"),
                    rs.getInt("duration_days"), rs.getString("badge_tag"), rs.getBoolean("is_popular"),
                    mapper.readValue(rs.getString("features"), STRINGS), rs.getInt("max_ai_queries_per_day"),
                    rs.getString("ai_access_mode"), rs.getString("status"), rs.getLong("purchase_count"),
                    rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant(),
                    rs.getString("plan_category"), mapper.readValue(rs.getString("capability_keys"), STRINGS),
                    instant(rs, "offer_starts_at"), instant(rs, "offer_ends_at"),
                    mapper.readValue(rs.getString("entitlements"), ENTITLEMENTS));
        } catch (JsonProcessingException ex) {
            throw new SQLException("Quyền lợi gói không hợp lệ.", ex);
        }
    }

    private LearningFeature mapFeature(ResultSet rs, int row) throws SQLException {
        try {
            return new LearningFeature(rs.getString("feature_key"), rs.getString("name"), rs.getString("category"),
                    rs.getString("description"), rs.getString("lifecycle_status"), rs.getString("control_type"),
                    mapper.readValue(rs.getString("allowed_units"), STRINGS),
                    mapper.readValue(rs.getString("allowed_periods"), STRINGS),
                    mapper.readValue(rs.getString("config_fields"), CONFIG_FIELDS),
                    rs.getString("parent_feature_key"));
        } catch (JsonProcessingException ex) {
            throw new SQLException("Metadata danh mục tính năng không hợp lệ.", ex);
        }
    }

    private void validate(PlanRequest request) {
        if (request.promotionalPrice() > request.originalPrice()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá ưu đãi không được cao hơn giá gốc.");
        }
        if ("LIFETIME".equals(request.billingCycle()) && request.durationDays() != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói trọn đời phải có thời hạn 0 ngày.");
        }
        if (!"LIFETIME".equals(request.billingCycle()) && request.durationDays() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời hạn gói phải từ 1 ngày trở lên.");
        }
        if ("PROMOTION".equals(request.planCategory())
                && (request.offerStartsAt() == null || request.offerEndsAt() == null
                    || !request.offerStartsAt().isBefore(request.offerEndsAt()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói ưu đãi cần có thời điểm phát hành bắt đầu và kết thúc hợp lệ.");
        }
        if (!"PROMOTION".equals(request.planCategory())
                && (request.offerStartsAt() != null || request.offerEndsAt() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ gói ưu đãi mới có thời gian phát hành riêng.");
        }
        Map<String, LearningFeature> catalog = featureCatalogByKey();
        for (var entry : normalizedEntitlements(request).entrySet()) {
            LearningFeature feature = catalog.get(entry.getKey());
            if (feature == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tính năng không tồn tại trong danh mục: " + entry.getKey());
            }
            validateEntitlement(feature, entry.getValue());
        }
    }

    private Map<String, PlanEntitlement> normalizedEntitlements(PlanRequest request) {
        if (request.entitlements() != null) return request.entitlements();
        Map<String, PlanEntitlement> legacy = new java.util.LinkedHashMap<>();
        for (String key : request.capabilityKeys()) {
            legacy.put(key, new PlanEntitlement(true, null, null, null, Map.of()));
        }
        PlanEntitlement ai = switch (request.aiAccessMode()) {
            case "LIMITED" -> new PlanEntitlement(true, (long) request.maxAiQueriesPerDay(), "requests", "DAY", Map.of());
            case "UNLIMITED" -> new PlanEntitlement(true, null, "requests", "DAY", Map.of());
            default -> new PlanEntitlement(false, null, "requests", "DAY", Map.of());
        };
        legacy.put("AI_ASSISTANT", ai);
        return legacy;
    }

    private void validateEntitlement(LearningFeature feature, PlanEntitlement entitlement) {
        if ("METERED".equals(feature.controlType())) {
            if (entitlement.enabled() && (entitlement.limit() != null && entitlement.limit() < 1)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn mức của " + feature.name() + " phải lớn hơn 0 hoặc để trống để không giới hạn.");
            }
            if (entitlement.unit() != null && !feature.allowedUnits().contains(entitlement.unit())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn vị hạn mức không hợp lệ cho " + feature.name() + ".");
            }
            if (entitlement.period() != null && !feature.allowedPeriods().contains(entitlement.period())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chu kỳ hạn mức không hợp lệ cho " + feature.name() + ".");
            }
            if (entitlement.enabled() && (entitlement.unit() == null || entitlement.period() == null)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng cấu hình đơn vị và chu kỳ cho " + feature.name() + ".");
            }
        } else if (entitlement.limit() != null || entitlement.unit() != null || entitlement.period() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, feature.name() + " chỉ hỗ trợ bật hoặc tắt.");
        }

        Map<String, Object> config = entitlement.config() == null ? Map.of() : entitlement.config();
        Map<String, FeatureConfigField> fields = feature.configFields().stream()
                .collect(java.util.stream.Collectors.toMap(FeatureConfigField::key, field -> field));
        for (String key : config.keySet()) {
            if (!fields.containsKey(key)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tham số " + key + " không được hỗ trợ bởi " + feature.name() + ".");
            }
        }
        for (FeatureConfigField field : fields.values()) {
            Object value = config.get(field.key());
            if (value == null) {
                if (entitlement.enabled() && field.required()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu tham số " + field.label() + " của " + feature.name() + ".");
                }
                continue;
            }
            boolean valid = switch (field.type()) {
                case "STRING" -> value instanceof String;
                case "INTEGER" -> value instanceof Number number && number.doubleValue() % 1 == 0;
                case "NUMBER" -> value instanceof Number;
                case "BOOLEAN" -> value instanceof Boolean;
                case "SELECT" -> value instanceof String selected && field.options().contains(selected);
                default -> false;
            };
            if (!valid) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị tham số " + field.label() + " không hợp lệ.");
        }
    }

    private Map<String, LearningFeature> featureCatalogByKey() {
        return listFeatureCatalog().stream().collect(java.util.stream.Collectors.toMap(LearningFeature::key, feature -> feature));
    }

    private List<String> legacyCapabilityKeys(Map<String, PlanEntitlement> entitlements) {
        Map<String, LearningFeature> catalog = featureCatalogByKey();
        List<String> keys = new ArrayList<>();
        entitlements.forEach((key, entitlement) -> {
            LearningFeature feature = catalog.get(key);
            if (entitlement.enabled() && feature != null && !"AI".equalsIgnoreCase(feature.category())) keys.add(key);
        });
        return keys;
    }

    private LegacyAiSettings legacyAiSettings(Map<String, PlanEntitlement> entitlements) {
        PlanEntitlement ai = entitlements.get("AI_ASSISTANT");
        if (ai == null || !ai.enabled()) return new LegacyAiSettings("DISABLED", 0);
        if (ai.limit() == null) return new LegacyAiSettings("UNLIMITED", 0);
        if (!"DAY".equals(ai.period()) || !"requests".equals(ai.unit())) return new LegacyAiSettings("UNLIMITED", 0);
        return new LegacyAiSettings("LIMITED", Math.toIntExact(ai.limit()));
    }

    private String json(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Dữ liệu quyền lợi không hợp lệ.", ex);
        }
    }

    private static Instant instant(ResultSet rs, String column) throws SQLException {
        var value = rs.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }

    private static java.time.OffsetDateTime utc(Instant instant) {
        return instant == null ? null : instant.atOffset(java.time.ZoneOffset.UTC);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private record LegacyAiSettings(String mode, int limit) { }

    private record PaidPlanPurchase(UUID userId, UUID planId, String planCategory) { }
}
