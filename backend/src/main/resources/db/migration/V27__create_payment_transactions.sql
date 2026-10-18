CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(120) NOT NULL UNIQUE,
    order_code VARCHAR(120) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    plan_name VARCHAR(160) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(40) NOT NULL
        CHECK (payment_method IN ('MOMO', 'VNPAY', 'BANK_TRANSFER', 'CREDIT_CARD')),
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED')),
    paid_at TIMESTAMPTZ,
    note VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_payment_transactions_created_at
    ON payment_transactions(created_at DESC);

CREATE INDEX ix_payment_transactions_status_created_at
    ON payment_transactions(status, created_at DESC);
