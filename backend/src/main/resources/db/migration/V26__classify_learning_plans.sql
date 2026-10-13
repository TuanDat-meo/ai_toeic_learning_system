ALTER TABLE subscription_plans
    ADD COLUMN plan_category VARCHAR(20) NOT NULL DEFAULT 'PRO'
        CHECK (plan_category IN ('FREE', 'PRO', 'PREMIUM', 'PROMOTION'));

UPDATE subscription_plans
SET plan_category = CASE WHEN plan_type = 'PROMOTION' THEN 'PROMOTION' ELSE 'PRO' END;

ALTER TABLE subscription_plans
    ADD CONSTRAINT subscription_plans_category_type_check
        CHECK ((plan_category = 'PROMOTION') = (plan_type = 'PROMOTION'));

CREATE INDEX ix_subscription_plans_category_status
    ON subscription_plans(plan_category, status, created_at DESC);
