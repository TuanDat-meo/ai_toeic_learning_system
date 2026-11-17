INSERT INTO subscription_plans (
    code,
    name,
    original_price,
    promotional_price,
    billing_cycle,
    duration_days,
    badge_tag,
    is_popular,
    features,
    max_ai_queries_per_day,
    ai_access_mode,
    status,
    plan_type,
    plan_category,
    capability_keys,
    offer_starts_at,
    offer_ends_at,
    entitlements,
    created_at,
    updated_at
) VALUES
    (
        'FREE',
        'Gói miễn phí',
        0,
        0,
        'LIFETIME',
        0,
        'Miễn phí',
        false,
        '[]'::jsonb,
        0,
        'DISABLED',
        'ACTIVE',
        'STANDARD',
        'FREE',
        '[]'::jsonb,
        NULL,
        NULL,
        '{"VOCABULARY":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}},"GRAMMAR":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}},"LISTENING":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}},"READING":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}},"MOCK_TEST":{"enabled":true,"limit":null,"unit":null,"period":null,"config":{}}}'::jsonb,
        now(),
        now()
    ),
    (
        'PRO',
        'Gói Pro',
        199000,
        199000,
        'MONTHLY',
        30,
        'Phổ biến',
        true,
        '["VOCABULARY","GRAMMAR","LISTENING","READING","MOCK_TEST"]'::jsonb,
        30,
        'LIMITED',
        'ACTIVE',
        'STANDARD',
        'PRO',
        '["VOCABULARY","GRAMMAR","LISTENING","READING","MOCK_TEST","AI_ASSISTANT"]'::jsonb,
        NULL,
        NULL,
        '{}'::jsonb,
        now(),
        now()
    ),
    (
        'PREMIUM',
        'Gói Premium',
        499000,
        499000,
        'MONTHLY',
        30,
        'Nâng cao',
        false,
        '["VOCABULARY","GRAMMAR","LISTENING","READING","MOCK_TEST","AI_ASSISTANT"]'::jsonb,
        200,
        'UNLIMITED',
        'ACTIVE',
        'STANDARD',
        'PREMIUM',
        '["VOCABULARY","GRAMMAR","LISTENING","READING","MOCK_TEST","AI_ASSISTANT"]'::jsonb,
        NULL,
        NULL,
        '{}'::jsonb,
        now(),
        now()
    )
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    original_price = EXCLUDED.original_price,
    promotional_price = EXCLUDED.promotional_price,
    billing_cycle = EXCLUDED.billing_cycle,
    duration_days = EXCLUDED.duration_days,
    badge_tag = EXCLUDED.badge_tag,
    is_popular = EXCLUDED.is_popular,
    features = EXCLUDED.features,
    max_ai_queries_per_day = EXCLUDED.max_ai_queries_per_day,
    ai_access_mode = EXCLUDED.ai_access_mode,
    status = EXCLUDED.status,
    plan_type = EXCLUDED.plan_type,
    plan_category = EXCLUDED.plan_category,
    capability_keys = EXCLUDED.capability_keys,
    offer_starts_at = EXCLUDED.offer_starts_at,
    offer_ends_at = EXCLUDED.offer_ends_at,
    updated_at = now();

UPDATE subscription_plans p
SET entitlements = COALESCE((
        SELECT jsonb_object_agg(
            capability.key,
            jsonb_build_object(
                'enabled', true,
                'limit', NULL,
                'unit', NULL,
                'period', NULL,
                'config', '{}'::jsonb
            )
        )
        FROM jsonb_array_elements_text(p.capability_keys) AS capability(key)
    ), '{}'::jsonb)
    || CASE p.ai_access_mode
        WHEN 'DISABLED' THEN jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', false,
            'limit', NULL,
            'unit', 'requests',
            'period', 'DAY',
            'config', '{}'::jsonb))
        WHEN 'LIMITED' THEN jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true,
            'limit', p.max_ai_queries_per_day,
            'unit', 'requests',
            'period', 'DAY',
            'config', '{}'::jsonb))
        ELSE jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true,
            'limit', NULL,
            'unit', 'requests',
            'period', 'DAY',
            'config', '{}'::jsonb))
    END,
    updated_at = now()
WHERE p.status = 'ACTIVE'
  AND p.plan_category IN ('FREE', 'PRO', 'PREMIUM');
