CREATE TABLE learning_feature_catalog (
    feature_key VARCHAR(80) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    lifecycle_status VARCHAR(24) NOT NULL
        CHECK (lifecycle_status IN ('AVAILABLE', 'IN_DEVELOPMENT', 'PLANNED', 'DISABLED')),
    control_type VARCHAR(20) NOT NULL
        CHECK (control_type IN ('TOGGLE', 'METERED')),
    allowed_units JSONB NOT NULL DEFAULT '[]'::jsonb,
    allowed_periods JSONB NOT NULL DEFAULT '[]'::jsonb,
    config_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO learning_feature_catalog (
    feature_key, name, category, description, lifecycle_status, control_type,
    allowed_units, allowed_periods, config_fields
) VALUES
    ('VOCABULARY', 'Từ vựng', 'Học tập', 'Học từ theo chủ đề và ôn tập định kỳ.', 'IN_DEVELOPMENT', 'TOGGLE', '[]', '[]', '[]'),
    ('GRAMMAR', 'Ngữ pháp', 'Học tập', 'Củng cố cấu trúc thường gặp trong TOEIC.', 'IN_DEVELOPMENT', 'TOGGLE', '[]', '[]', '[]'),
    ('LISTENING', 'Listening', 'Học tập', 'Luyện nghe theo từng dạng bài.', 'IN_DEVELOPMENT', 'TOGGLE', '[]', '[]', '[]'),
    ('READING', 'Reading', 'Học tập', 'Rèn kỹ năng đọc hiểu và quản lý thời gian.', 'IN_DEVELOPMENT', 'TOGGLE', '[]', '[]', '[]'),
    ('MOCK_TEST', 'Thi thử', 'Học tập', 'Làm bài kiểm tra và xem kết quả tổng hợp.', 'IN_DEVELOPMENT', 'TOGGLE', '[]', '[]', '[]'),
    ('AI_ASSISTANT', 'Trợ lý AI', 'AI', 'Tính năng AI chưa được kết nối với nghiệp vụ thực tế.', 'IN_DEVELOPMENT', 'METERED',
     '["requests"]'::jsonb, '["DAY","WEEK","MONTH","PLAN_TERM"]'::jsonb, '[]'::jsonb);

ALTER TABLE subscription_plans
    ADD COLUMN entitlements JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE user_subscriptions
    ADD COLUMN entitlements_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE subscription_plans p
SET entitlements =
    COALESCE((
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
            'enabled', false, 'limit', NULL, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
        WHEN 'LIMITED' THEN jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true, 'limit', p.max_ai_queries_per_day, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
        ELSE jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true, 'limit', NULL, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
    END;

UPDATE user_subscriptions s
SET entitlements_snapshot =
    COALESCE((
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
        FROM jsonb_array_elements_text(s.capability_keys_snapshot) AS capability(key)
    ), '{}'::jsonb)
    || CASE s.ai_access_mode
        WHEN 'DISABLED' THEN jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', false, 'limit', NULL, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
        WHEN 'LIMITED' THEN jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true, 'limit', s.max_ai_queries_per_day, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
        ELSE jsonb_build_object('AI_ASSISTANT', jsonb_build_object(
            'enabled', true, 'limit', NULL, 'unit', 'requests', 'period', 'DAY', 'config', '{}'::jsonb))
    END;

CREATE FUNCTION snapshot_subscription_entitlements() RETURNS trigger AS $$
BEGIN
    IF NEW.entitlements_snapshot = '{}'::jsonb THEN
        SELECT entitlements INTO NEW.entitlements_snapshot
        FROM subscription_plans WHERE id = NEW.plan_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_snapshot_subscription_entitlements
    BEFORE INSERT ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION snapshot_subscription_entitlements();

CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE RESTRICT,
    feature_key VARCHAR(80) NOT NULL REFERENCES learning_feature_catalog(feature_key) ON DELETE RESTRICT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    usage_count BIGINT NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_subscription_id, feature_key, period_start),
    CHECK (period_end > period_start)
);

CREATE TABLE feature_usage_operations (
    user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE RESTRICT,
    feature_key VARCHAR(80) NOT NULL REFERENCES learning_feature_catalog(feature_key) ON DELETE RESTRICT,
    operation_id UUID NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_subscription_id, feature_key, operation_id)
);

CREATE INDEX ix_feature_usage_subscription_key_period
    ON feature_usage(user_subscription_id, feature_key, period_start, period_end);
