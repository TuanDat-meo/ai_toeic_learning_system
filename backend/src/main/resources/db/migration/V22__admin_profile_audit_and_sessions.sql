ALTER TABLE users
    ADD COLUMN session_version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX idx_audit_logs_user_created_at
    ON audit_logs (user_id, created_at DESC);