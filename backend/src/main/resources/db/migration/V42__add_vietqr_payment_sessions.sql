CREATE TABLE payment_qr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    qr_reference VARCHAR(25) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_payment_qr_sessions_transaction
    ON payment_qr_sessions(transaction_id, created_at DESC);

ALTER TABLE payment_transactions
    ADD COLUMN activated_subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL;
