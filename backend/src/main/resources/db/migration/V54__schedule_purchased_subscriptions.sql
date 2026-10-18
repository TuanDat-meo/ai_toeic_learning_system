ALTER TABLE user_subscriptions
    DROP CONSTRAINT user_subscriptions_status_check;

ALTER TABLE user_subscriptions
    ADD CONSTRAINT ck_user_subscriptions_status
        CHECK (status IN ('ACTIVE', 'SCHEDULED', 'EXPIRED', 'CANCELLED'));

CREATE INDEX ix_user_subscriptions_user_schedule
    ON user_subscriptions(user_id, status, start_at);
