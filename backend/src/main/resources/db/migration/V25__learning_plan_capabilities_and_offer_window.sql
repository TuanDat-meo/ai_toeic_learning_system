ALTER TABLE subscription_plans
    ADD COLUMN plan_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD'
        CHECK (plan_type IN ('STANDARD', 'PROMOTION')),
    ADD COLUMN capability_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN offer_starts_at TIMESTAMPTZ,
    ADD COLUMN offer_ends_at TIMESTAMPTZ,
    ADD CONSTRAINT subscription_plans_offer_window_check
        CHECK (offer_starts_at IS NULL OR offer_ends_at IS NULL OR offer_starts_at < offer_ends_at),
    ADD CONSTRAINT subscription_plans_offer_window_pair_check
        CHECK ((offer_starts_at IS NULL) = (offer_ends_at IS NULL)),
    ADD CONSTRAINT subscription_plans_promotion_window_required_check
        CHECK (plan_type <> 'PROMOTION' OR (offer_starts_at IS NOT NULL AND offer_ends_at IS NOT NULL));

ALTER TABLE user_subscriptions
    ADD COLUMN capability_keys_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX ix_subscription_plans_public_issuance
    ON subscription_plans(status, plan_type, offer_starts_at, offer_ends_at);
