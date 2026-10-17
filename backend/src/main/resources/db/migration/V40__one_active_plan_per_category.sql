CREATE UNIQUE INDEX IF NOT EXISTS ux_subscription_plans_one_active_category
    ON subscription_plans(plan_category)
    WHERE status = 'ACTIVE';
