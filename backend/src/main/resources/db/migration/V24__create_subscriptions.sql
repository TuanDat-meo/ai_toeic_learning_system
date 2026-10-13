CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    original_price BIGINT NOT NULL CHECK (original_price >= 0),
    promotional_price BIGINT NOT NULL CHECK (promotional_price >= 0 AND promotional_price <= original_price),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY','QUARTERLY','YEARLY','LIFETIME')),
    duration_days INTEGER NOT NULL CHECK (duration_days >= 0),
    badge_tag VARCHAR(100),
    is_popular BOOLEAN NOT NULL DEFAULT false,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_ai_queries_per_day INTEGER NOT NULL CHECK (max_ai_queries_per_day >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','DRAFT','ARCHIVED')),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CHECK ((billing_cycle = 'LIFETIME' AND duration_days = 0) OR (billing_cycle <> 'LIFETIME' AND duration_days > 0))
);

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    plan_code VARCHAR(80) NOT NULL,
    plan_name VARCHAR(160) NOT NULL,
    plan_features JSONB NOT NULL,
    max_ai_queries_per_day INTEGER NOT NULL CHECK (max_ai_queries_per_day >= 0),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED')),
    payment_method VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (end_at IS NULL OR end_at > start_at)
);

CREATE INDEX ix_user_subscriptions_user ON user_subscriptions(user_id, start_at DESC);
CREATE INDEX ix_user_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX ix_user_subscriptions_status_end ON user_subscriptions(status, end_at);
