ALTER TABLE subscription_plans
    ADD COLUMN ai_access_mode VARCHAR(20) NOT NULL DEFAULT 'DISABLED'
        CHECK (ai_access_mode IN ('DISABLED', 'LIMITED', 'UNLIMITED'));

UPDATE subscription_plans
SET ai_access_mode = CASE
    WHEN max_ai_queries_per_day = 0 THEN 'DISABLED'
    ELSE 'LIMITED'
END;

ALTER TABLE subscription_plans
    ADD CONSTRAINT ck_subscription_plans_ai_access_limit
        CHECK (
            (ai_access_mode = 'LIMITED' AND max_ai_queries_per_day >= 1)
            OR (ai_access_mode <> 'LIMITED' AND max_ai_queries_per_day = 0)
        );

ALTER TABLE user_subscriptions
    ADD COLUMN ai_access_mode VARCHAR(20) NOT NULL DEFAULT 'DISABLED'
        CHECK (ai_access_mode IN ('DISABLED', 'LIMITED', 'UNLIMITED'));

UPDATE user_subscriptions
SET ai_access_mode = CASE
    WHEN max_ai_queries_per_day = 0 THEN 'DISABLED'
    ELSE 'LIMITED'
END;

ALTER TABLE user_subscriptions
    ADD CONSTRAINT ck_user_subscriptions_ai_access_limit
        CHECK (
            (ai_access_mode = 'LIMITED' AND max_ai_queries_per_day >= 1)
            OR (ai_access_mode <> 'LIMITED' AND max_ai_queries_per_day = 0)
        );
