package com.toeic.ai.toeic_api.billing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
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
    private static final TypeReference<List<String>> FEATURES_TYPE = new TypeReference<>() { };
    private static final java.util.Set<String> CAPABILITY_KEYS = java.util.Set.of("VOCABULARY", "GRAMMAR", "LISTENING", "READING", "MOCK_TEST");
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public SubscriptionService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<SubscriptionPlan> listPlans() {
        return jdbc.query("SELECT p.*, (SELECT count(*) FROM user_subscriptions s WHERE s.plan_id=p.id) purchase_count FROM subscription_plans p ORDER BY p.created_at DESC", this::mapPlan);
    }

    public List<SubscriptionPlan> listAvailablePlans() {
        return jdbc.query("SELECT p.*, 0 AS purchase_count FROM subscription_plans p WHERE p.status='ACTIVE' AND (p.plan_category <> 'PROMOTION' OR (p.offer_starts_at <= now() AND p.offer_ends_at > now())) ORDER BY p.is_popular DESC, p.created_at DESC", this::mapPlan);
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
                        rs.getObject("id", UUID.class),
                        rs.getObject("plan_id", UUID.class),
                        rs.getString("plan_name"),
                        rs.getTimestamp("start_at").toInstant(),
                        rs.getTimestamp("end_at") == null ? null : rs.getTimestamp("end_at").toInstant(),
                        rs.getBoolean("auto_renew"),
                        "ACTIVE",
                        rs.getString("payment_method")), userId)
                .stream()
                .findFirst()
                .orElse(null);
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
        validate(request);
        try {
            UUID id = UUID.randomUUID();
            jdbc.update("INSERT INTO subscription_plans(id,code,name,original_price,promotional_price,billing_cycle,duration_days,badge_tag,is_popular,features,max_ai_queries_per_day,status,plan_type,plan_category,capability_keys,offer_starts_at,offer_ends_at) VALUES (?,?,?,?,?,?,?,?,?,?::jsonb,?,?,?,?,?::jsonb,?,?)", id, request.code().trim().toUpperCase(), request.name().trim(), request.originalPrice(), request.promotionalPrice(), request.billingCycle(), request.durationDays(), blankToNull(request.badgeTag()), request.isPopular(), json(request.features()), request.maxAiQueriesPerDay(), request.status(), "PROMOTION".equals(request.planCategory()) ? "PROMOTION" : "STANDARD", request.planCategory(), json(request.capabilityKeys()), utc(request.offerStartsAt()), utc(request.offerEndsAt()));
            return find(id);
        } catch (DuplicateKeyException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã gói học đã tồn tại."); }
    }

    @Transactional
    public SubscriptionPlan update(UUID id, PlanRequest request) {
        validate(request);
        try {
            int changed = jdbc.update("UPDATE subscription_plans SET code=?,name=?,original_price=?,promotional_price=?,billing_cycle=?,duration_days=?,badge_tag=?,is_popular=?,features=?::jsonb,max_ai_queries_per_day=?,status=?,plan_type=?,plan_category=?,capability_keys=?::jsonb,offer_starts_at=?,offer_ends_at=?,updated_at=now() WHERE id=?", request.code().trim().toUpperCase(), request.name().trim(), request.originalPrice(), request.promotionalPrice(), request.billingCycle(), request.durationDays(), blankToNull(request.badgeTag()), request.isPopular(), json(request.features()), request.maxAiQueriesPerDay(), request.status(), "PROMOTION".equals(request.planCategory()) ? "PROMOTION" : "STANDARD", request.planCategory(), json(request.capabilityKeys()), utc(request.offerStartsAt()), utc(request.offerEndsAt()), id);
            if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói học.");
            return find(id);
        } catch (DuplicateKeyException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã gói học đã tồn tại."); }
    }

    @Transactional
    public void delete(UUID id) {
        try {
            if (jdbc.update("DELETE FROM subscription_plans WHERE id=?", id) == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói học.");
        } catch (org.springframework.dao.DataIntegrityViolationException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Gói học đã có lượt mua; hãy lưu trữ gói thay vì xóa."); }
    }

    private SubscriptionPlan find(UUID id) { return jdbc.queryForObject("SELECT p.*, (SELECT count(*) FROM user_subscriptions s WHERE s.plan_id=p.id) purchase_count FROM subscription_plans p WHERE p.id=?", this::mapPlan, id); }
    private SubscriptionPlan mapPlan(ResultSet rs, int row) throws SQLException {
        try {
            return new SubscriptionPlan(rs.getObject("id", UUID.class), rs.getString("code"), rs.getString("name"), rs.getLong("original_price"), rs.getLong("promotional_price"), rs.getString("billing_cycle"), rs.getInt("duration_days"), rs.getString("badge_tag"), rs.getBoolean("is_popular"), mapper.readValue(rs.getString("features"), FEATURES_TYPE), rs.getInt("max_ai_queries_per_day"), rs.getString("status"), rs.getLong("purchase_count"), rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant(), rs.getString("plan_category"), mapper.readValue(rs.getString("capability_keys"), FEATURES_TYPE), rs.getTimestamp("offer_starts_at") == null ? null : rs.getTimestamp("offer_starts_at").toInstant(), rs.getTimestamp("offer_ends_at") == null ? null : rs.getTimestamp("offer_ends_at").toInstant());
        } catch (JsonProcessingException ex) { throw new SQLException("Quyền lợi gói không hợp lệ.", ex); }
    }
    private String json(List<String> features) { try { return mapper.writeValueAsString(features); } catch (JsonProcessingException ex) { throw new IllegalArgumentException("Danh sách quyền lợi không hợp lệ."); } }
    private static java.time.OffsetDateTime utc(java.time.Instant instant) { return instant == null ? null : instant.atOffset(java.time.ZoneOffset.UTC); }
    private void validate(PlanRequest request) {
        if (request.promotionalPrice() > request.originalPrice()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá ưu đãi không được cao hơn giá gốc.");
        if ("LIFETIME".equals(request.billingCycle()) && request.durationDays() != 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói trọn đời phải có thời hạn 0 ngày.");
        if (!"LIFETIME".equals(request.billingCycle()) && request.durationDays() < 1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời hạn gói phải từ 1 ngày trở lên.");
        if (!CAPABILITY_KEYS.containsAll(request.capabilityKeys())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói chứa quyền học không có trong danh mục học viên.");
        if ("PROMOTION".equals(request.planCategory()) && (request.offerStartsAt() == null || request.offerEndsAt() == null || !request.offerStartsAt().isBefore(request.offerEndsAt()))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói ưu đãi cần có thời điểm phát hành bắt đầu và kết thúc hợp lệ.");
        if (!"PROMOTION".equals(request.planCategory()) && (request.offerStartsAt() != null || request.offerEndsAt() != null)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ gói ưu đãi mới có thời gian phát hành riêng.");
    }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
