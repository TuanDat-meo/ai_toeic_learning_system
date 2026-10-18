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
CROSS JOIN LATERAL (
    SELECT plan.*
    FROM subscription_plans plan
    WHERE plan.plan_category = 'FREE' AND plan.status = 'ACTIVE'
    ORDER BY plan.created_at DESC
    LIMIT 1
) p
WHERE u.role = 'STUDENT'
  AND NOT EXISTS (
      SELECT 1
      FROM user_subscriptions s
      WHERE s.user_id = u.id
        AND s.status = 'ACTIVE'
        AND (s.end_at IS NULL OR s.end_at > now())
  );
